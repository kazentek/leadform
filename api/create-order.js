/**
 * POST /api/create-order
 * Creates Shopify COD order + fires Facebook Conversions API
 */

const crypto = require("crypto");

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 300000) return cachedToken;
  const resp = await fetch(
    `https://${process.env.SHOP_DOMAIN}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOP_CLIENT_ID,
        client_secret: process.env.SHOP_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    }
  );
  if (!resp.ok) throw new Error(`Token error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 86400) * 1000;
  return cachedToken;
}

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

/* ─────────────────────────────────────────────
FACEBOOK CONVERSIONS API
───────────────────────────────────────────── */
async function fireFacebookCAPI(payload, orderId, eventId) {
  const PIXEL_ID = process.env.FB_PIXEL_ID;
  const CAPI_TOKEN = process.env.FB_CAPI_TOKEN;

  if (!PIXEL_ID || !CAPI_TOKEN) return;

  const valueUSD = parseFloat((payload.total / 260).toFixed(2));
  const h = (str) => crypto.createHash("sha256").update(str).digest("hex");

  const userData = {
    client_ip_address: payload.client_ip_address,
    client_user_agent: payload.client_user_agent,
    ph: [h(payload.phone.replace(/\s/g, ""))],
    fn: [h((payload.first_name || "").toLowerCase().trim())],
    ln: [h((payload.last_name || "").toLowerCase().trim())],
    country: [h("dz")],
    ct: [h((payload.commune || "").toLowerCase().trim())],
    st: [h((payload.wilaya || "").toLowerCase().trim())],
    // 2026 Best Practice: Pass the browser's persistent external_id to tie the funnel together
    external_id: [h(payload.external_id || payload.phone.replace(/\s/g, ""))], 
    ...(payload.email ? { em: [h(payload.email.toLowerCase().trim())] } : {}),
    ...(payload.fbp ? { fbp: payload.fbp } : {}),
    ...(payload.fbc ? { fbc: payload.fbc } : {}),
  };

  const eventData = {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "website",
      event_source_url: payload.event_source_url || `https://${process.env.SHOP_DOMAIN}/products`,
      user_data: userData,
      custom_data: {
        value: valueUSD,
        currency: "USD",
        order_id: orderId,
        content_ids: [String(payload.variant_id)],
        content_type: "product",
        num_items: Number(payload.quantity),
        delivery_category: "home_delivery",
      },
    }],
    ...(process.env.FB_TEST_EVENT_CODE ? { test_event_code: process.env.FB_TEST_EVENT_CODE } : {}),
  };

  return new Promise((resolve) => {
    const https = require("https");
    const body = JSON.stringify(eventData);
    const options = {
      hostname: "graph.facebook.com", port: 443,
      path: `/v19.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) console.log(`[CAPI] ✅ Purchase sent — events_received: ${result.events_received}`);
        } catch(e) {}
        resolve();
      });
    });
    req.on("error", () => resolve());
    req.setTimeout(8000, () => { req.destroy(); resolve(); });
    req.write(body);
    req.end();
  });
}

/* ─────────────────────────────────────────────
MAIN HANDLER
───────────────────────────────────────────── */
module.exports = async function handler(req, res) {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { SHOP_DOMAIN } = process.env;
  if (!SHOP_DOMAIN) return res.status(500).json({ error: "Server misconfigured" });

  let body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const clientIp = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || (req.socket?.remoteAddress || "");
  const userAgent = req.headers["user-agent"] || "";

  const {
    variant_id, quantity, first_name, last_name, phone, email, 
    wilaya, commune, address, delivery_type, shipping_cost, product_price, currency = "DZD",
    event_id, fbp, fbc, event_source_url, external_id
  } = body;

  if (!variant_id || !quantity || !first_name || !last_name || !phone || !wilaya || !commune) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const cleanPhone = phone.replace(/\s/g, "");
  let shopifyPhone = cleanPhone;
  if (cleanPhone.startsWith("0")) shopifyPhone = "+213" + cleanPhone.slice(1);
  const finalEventId = event_id || `cod_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  let token = await getAccessToken();
  const addr = address || `${commune}, ${wilaya}`;
  const apiBase = `https://${SHOP_DOMAIN}/admin/api/2026-01`;
  const headers = { "Content-Type": "application/json", "X-Shopify-Access-Token": token };

  let customerId = null;
  try {
    const createResp = await fetch(`${apiBase}/customers.json`, {
      method: "POST", headers,
      body: JSON.stringify({
        customer: {
          first_name: first_name, last_name: last_name, phone: shopifyPhone,
          ...(email ? { email: email.toLowerCase().trim() } : {}),
          verified_email: false, accepts_marketing: false,
        },
      }),
    });
    if (createResp.ok) customerId = (await createResp.json()).customer?.id || null;
  } catch (e) {}

  const orderPayload = {
    order: {
      ...(email ? { email: email.toLowerCase().trim() } : {}),
      line_items: [{ variant_id: Number(variant_id), quantity: Number(quantity), price: String(product_price) }],
      shipping_address: { first_name, last_name, phone: shopifyPhone, address1: addr, city: commune, province: wilaya, country: "DZ", country_code: "DZ" },
      billing_address: { first_name, last_name, phone: shopifyPhone, address1: addr, city: commune, province: wilaya, country: "DZ", country_code: "DZ" },
      financial_status: "pending",
      send_receipt: false, send_fulfillment_receipt: false,
      note: `Téléphone local: ${cleanPhone} | COD | ${wilaya} | ${commune} | ${delivery_type === "home" ? "Domicile" : "Stop Desk"} | Shipping: ${shipping_cost} ${currency}`,
      tags: `COD, ${delivery_type === "home" ? "home-delivery" : "stop-desk"}, ${wilaya}`,
      shipping_lines: [{
        title: delivery_type === "home" ? "Livraison à Domicile" : "Stop Desk",
        price: String(shipping_cost), code: delivery_type === "home" ? "HOME" : "STOPDESK",
      }],
      note_attributes: [
        { name: "Téléphone local", value: cleanPhone }, { name: "wilaya", value: wilaya },
        { name: "commune", value: commune }, { name: "delivery_type", value: delivery_type },
        { name: "shipping_cost", value: String(shipping_cost) }, { name: "event_id", value: finalEventId }
      ],
      currency, suppress_notifications: true,
      ...(customerId ? { customer: { id: customerId } } : {}),
    },
  };

  try {
    const orderResp = await fetch(`${apiBase}/orders.json`, { method: "POST", headers, body: JSON.stringify(orderPayload) });
    const orderData = await orderResp.json();

    if (!orderResp.ok) return res.status(502).json({ error: "Order failed" });

    const order = orderData.order;
    const capiPayload = {
      ...body, phone: cleanPhone, email: email,
      total: (Number(product_price) * Number(quantity)) + Number(shipping_cost),
      client_ip_address: clientIp, client_user_agent: userAgent,
    };
    
    await fireFacebookCAPI(capiPayload, order.name, finalEventId);

    return res.status(200).json({ success: true, order_id: order.name, order_number: order.order_number });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
