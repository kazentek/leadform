/**
 * POST /api/create-order
 * CommonJS — works with Vercel Node.js runtime out of the box
 */

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 300000) {
    return cachedToken;
  }
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
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Token error ${resp.status}: ${err}`);
  }
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

module.exports = async function handler(req, res) {
  setCORS(res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { SHOP_DOMAIN } = process.env;
  if (!SHOP_DOMAIN) {
    return res.status(500).json({ error: "Server misconfigured: missing SHOP_DOMAIN" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const {
    variant_id, quantity, customer_name, phone,
    wilaya, commune, address, delivery_type,
    shipping_cost, product_price, total, currency,
  } = body;

  const cur = currency || "DZD";

  if (!variant_id || !quantity || !customer_name || !phone || !wilaya || !commune) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!/^0[5-7]\d{8}$/.test(phone.replace(/\s/g, ""))) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  let token;
  try {
    token = await getAccessToken();
  } catch (err) {
    console.error("Token fetch failed:", err.message);
    return res.status(500).json({ error: "Auth failed: " + err.message });
  }

  const firstName = customer_name.split(" ")[0] || customer_name;
  const lastName = customer_name.split(" ").slice(1).join(" ") || ".";
  const cleanPhone = phone.replace(/\s/g, "");
  const addr = address || `${commune}, ${wilaya}`;

  const shopifyOrder = {
    order: {
      line_items: [{ variant_id: Number(variant_id), quantity: Number(quantity), price: String(product_price) }],
      customer: { first_name: firstName, last_name: lastName, phone: cleanPhone },
      shipping_address: { first_name: firstName, last_name: lastName, phone: cleanPhone, address1: addr, city: commune, province: wilaya, country: "DZ", country_code: "DZ", zip: "" },
      billing_address: { first_name: firstName, last_name: lastName, phone: cleanPhone, address1: addr, city: commune, province: wilaya, country: "DZ", country_code: "DZ", zip: "" },
      financial_status: "pending",
      send_receipt: false,
      send_fulfillment_receipt: false,
      note: `COD | ${wilaya} | ${commune} | ${delivery_type === "home" ? "Domicile" : "Stop Desk"} | Shipping: ${shipping_cost} ${cur}`,
      tags: `COD, ${delivery_type === "home" ? "home-delivery" : "stop-desk"}, ${wilaya}`,
      shipping_lines: [{ title: delivery_type === "home" ? "Livraison à Domicile" : "Stop Desk", price: String(shipping_cost), code: delivery_type === "home" ? "HOME" : "STOPDESK" }],
      note_attributes: [
        { name: "wilaya", value: wilaya },
        { name: "commune", value: commune },
        { name: "delivery_type", value: delivery_type },
        { name: "shipping_cost", value: String(shipping_cost) },
        { name: "source", value: "COD Lead Form" },
      ],
      currency: cur,
      suppress_notifications: true,
    },
  };

  try {
    const shopResp = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2024-01/orders.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
        body: JSON.stringify(shopifyOrder),
      }
    );

    const shopData = await shopResp.json();

    if (!shopResp.ok) {
      console.error("Shopify error:", JSON.stringify(shopData));
      return res.status(502).json({ error: "Order creation failed", details: shopData.errors || shopData });
    }

    const order = shopData.order;
    return res.status(200).json({
      success: true,
      order_id: order.name,
      order_number: order.order_number,
      order: { id: order.id, name: order.name, total_price: order.total_price, financial_status: order.financial_status },
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
};
