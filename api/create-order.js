/**
 * POST /api/create-order
 * Creates Shopify COD order + fires Facebook Conversions API
 * CommonJS — Vercel Node.js runtime
 */

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
   Fires server-side Purchase event to Facebook
   Deduped with browser pixel via event_id
───────────────────────────────────────────── */
async function fireFacebookCAPI(payload, orderId, eventId) {
  const PIXEL_ID    = process.env.FB_PIXEL_ID;
  const CAPI_TOKEN  = process.env.FB_CAPI_TOKEN;

  if (!PIXEL_ID || !CAPI_TOKEN) {
    console.log("[CAPI] Skipped — FB_PIXEL_ID or FB_CAPI_TOKEN not set");
    return;
  }

  // DZD → USD for Facebook value reporting
  const valueUSD = parseFloat((payload.total / 136).toFixed(2));

  // Hash phone for user matching (Facebook requires SHA-256)
  const crypto = require("crypto");
  const hashedPhone = crypto
    .createHash("sha256")
    .update(payload.phone.replace(/\s/g, ""))
    .digest("hex");

  const eventData = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId, // Same ID as browser pixel → Facebook deduplicates
        action_source: "website",
        event_source_url: `https://${process.env.SHOP_DOMAIN}/products`,
        user_data: {
          ph: [hashedPhone], // Hashed phone for user matching
          country: ["dz"],   // Algeria
          ct: [             // City (hashed)
            crypto.createHash("sha256")
              .update(payload.commune.toLowerCase().replace(/\s/g, ""))
              .digest("hex")
          ],
          st: [             // State/Province (hashed)
            crypto.createHash("sha256")
              .update(payload.wilaya.toLowerCase().replace(/\s/g, ""))
              .digest("hex")
          ],
        },
        custom_data: {
          value: valueUSD,
          currency: "USD",
          order_id: orderId,
          content_ids: [String(payload.variant_id)],
          content_type: "product",
          num_items: payload.quantity,
          delivery_category: "home_delivery",
        },
      },
    ],
    // test_event_code: "TEST12345", // Uncomment to test in Events Manager
  };

  try {
    const resp = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      }
    );
    const result = await resp.json();
    if (resp.ok) {
      console.log(`[CAPI] ✅ Purchase event sent — events_received: ${result.events_received}`);
    } else {
      console.error("[CAPI] ❌ Error:", JSON.stringify(result));
    }
  } catch (err) {
    console.error("[CAPI] ❌ Network error:", err.message);
  }
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

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const {
    variant_id, quantity, customer_name, phone,
    wilaya, commune, address, delivery_type,
    shipping_cost, product_price, currency = "DZD",
    event_id, // Browser pixel sends this for deduplication
    fbp, fbc, // Facebook browser cookies for better matching
  } = body;

  if (!variant_id || !quantity || !customer_name || !phone || !wilaya || !commune) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const cleanPhone = phone.replace(/\s/g, "");
  if (!/^0[5-7]\d{8}$/.test(cleanPhone)) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  // Generate event_id if not provided by browser
  const finalEventId = event_id || `cod_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  let token;
  try {
    token = await getAccessToken();
  } catch (err) {
    return res.status(500).json({ error: "Auth failed: " + err.message });
  }

  const firstName = customer_name.split(" ")[0] || customer_name;
  const lastName  = customer_name.split(" ").slice(1).join(" ") || ".";
  const addr      = address || `${commune}, ${wilaya}`;
  const apiBase   = `https://${SHOP_DOMAIN}/admin/api/2024-01`;
  const headers   = { "Content-Type": "application/json", "X-Shopify-Access-Token": token };

  // ── Find or create customer ──
  let customerId = null;
  try {
    const createResp = await fetch(`${apiBase}/customers.json`, {
      method: "POST", headers,
      body: JSON.stringify({
        customer: {
          first_name: firstName, last_name: lastName,
          phone: cleanPhone, verified_email: false, accepts_marketing: false,
        },
      }),
    });
    if (createResp.ok) {
      customerId = (await createResp.json()).customer?.id || null;
    } else {
      const searchResp = await fetch(
        `${apiBase}/customers/search.json?query=phone:${encodeURIComponent(cleanPhone)}&limit=1&fields=id`,
        { headers }
      );
      if (searchResp.ok) {
        customerId = (await searchResp.json()).customers?.[0]?.id || null;
      }
    }
  } catch (e) {
    console.warn("[order] Customer step failed:", e.message);
  }

  // ── Build order ──
  const orderPayload = {
    order: {
      line_items: [{ variant_id: Number(variant_id), quantity: Number(quantity), price: String(product_price) }],
      shipping_address: { first_name: firstName, last_name: lastName, phone: cleanPhone, address1: addr, city: commune, province: wilaya, country: "DZ", country_code: "DZ", zip: "" },
      billing_address:  { first_name: firstName, last_name: lastName, phone: cleanPhone, address1: addr, city: commune, province: wilaya, country: "DZ", country_code: "DZ", zip: "" },
      financial_status: "pending",
      send_receipt: false, send_fulfillment_receipt: false,
      note: `COD | ${wilaya} | ${commune} | ${delivery_type === "home" ? "Domicile" : "Stop Desk"} | Shipping: ${shipping_cost} ${currency}`,
      tags: `COD, ${delivery_type === "home" ? "home-delivery" : "stop-desk"}, ${wilaya}`,
      shipping_lines: [{
        title: delivery_type === "home" ? "Livraison à Domicile" : "Stop Desk",
        price: String(shipping_cost),
        code: delivery_type === "home" ? "HOME" : "STOPDESK",
      }],
      note_attributes: [
        { name: "wilaya",        value: wilaya },
        { name: "commune",       value: commune },
        { name: "delivery_type", value: delivery_type },
        { name: "shipping_cost", value: String(shipping_cost) },
        { name: "event_id",      value: finalEventId },
        { name: "source",        value: "COD Lead Form" },
      ],
      currency,
      suppress_notifications: true,
      ...(customerId ? { customer: { id: customerId } } : {}),
    },
  };

  try {
    const orderResp = await fetch(`${apiBase}/orders.json`, {
      method: "POST", headers,
      body: JSON.stringify(orderPayload),
    });
    const orderData = await orderResp.json();

    if (!orderResp.ok) {
      console.error("[order] Shopify error:", JSON.stringify(orderData));
      return res.status(502).json({ error: "Order creation failed", details: orderData.errors });
    }

    const order = orderData.order;
    console.log(`[order] ✅ Created: ${order.name} — ${customer_name} — ${wilaya}`);

    // ── Fire CAPI in background (don't await — don't block response) ──
    const capiPayload = {
      ...body,
      phone: cleanPhone,
      total: (Number(product_price) * Number(quantity)) + Number(shipping_cost),
      fbp: fbp || null,
      fbc: fbc || null,
    };
    fireFacebookCAPI(capiPayload, order.name, finalEventId).catch(e =>
      console.error("[CAPI] Background fire failed:", e.message)
    );

    return res.status(200).json({
      success: true,
      order_id: order.name,
      order_number: order.order_number,
      order: {
        id: order.id, name: order.name,
        total_price: order.total_price,
        financial_status: order.financial_status,
      },
    });
  } catch (err) {
    console.error("[order] Error:", err.message);
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
};
