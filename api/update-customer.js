/**
 * POST /api/update-customer
 * Patches a Shopify customer's email after a successful COD order.
 * Called from the post-order email capture widget in embed.js.
 * CommonJS — Vercel Node.js runtime
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
        client_id:     process.env.SHOP_CLIENT_ID,
        client_secret: process.env.SHOP_CLIENT_SECRET,
        grant_type:    "client_credentials",
      }),
    }
  );
  if (!resp.ok) throw new Error(`Token error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  cachedToken    = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 86400) * 1000;
  return cachedToken;
}

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function fireCAPIEnrichment(email, phone, eventSourceUrl) {
  const PIXEL_ID   = process.env.FB_PIXEL_ID;
  const CAPI_TOKEN = process.env.FB_CAPI_TOKEN;
  if (!PIXEL_ID || !CAPI_TOKEN) return;

  const h = (str) => crypto.createHash("sha256").update(str).digest("hex");

  const userData = {
    em:          [h(email.toLowerCase().trim())],
    ph:          [h(phone.replace(/\s/g, ""))],
    external_id: [h(phone.replace(/\s/g, ""))],
    country:     [h("dz")],
  };

  const eventData = {
    data: [{
      event_name:       "Lead",
      event_time:       Math.floor(Date.now() / 1000),
      event_id:         "email_capture_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      action_source:    "website",
      event_source_url: eventSourceUrl || `https://${process.env.SHOP_DOMAIN}`,
      user_data:        userData,
      custom_data:      { lead_type: "post_order_email" },
    }],
    ...(process.env.FB_TEST_EVENT_CODE ? { test_event_code: process.env.FB_TEST_EVENT_CODE } : {}),
  };

  try {
    const resp = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(eventData) }
    );
    const result = await resp.json();
    if (resp.ok) {
      console.log(`[CAPI] ✅ Post-order Lead (email enrichment) sent — events_received: ${result.events_received}`);
    } else {
      console.error("[CAPI] ❌ Enrichment error:", result);
    }
  } catch (err) {
    console.error("[CAPI] ❌ Enrichment request failed:", err.message);
  }
}

module.exports = async function handler(req, res) {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { SHOP_DOMAIN } = process.env;
  if (!SHOP_DOMAIN) return res.status(500).json({ error: "Server misconfigured" });

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { email, order_name, phone } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!order_name && !phone) {
    return res.status(400).json({ error: "order_name or phone required" });
  }

  let token;
  try {
    token = await getAccessToken();
  } catch (err) {
    return res.status(500).json({ error: "Auth failed: " + err.message });
  }

  const apiBase = `https://${SHOP_DOMAIN}/admin/api/2026-01`;
  const headers = { "Content-Type": "application/json", "X-Shopify-Access-Token": token };

  let customerId = null;

  // Strategy 1: look up by order name → get customer id from order
  if (order_name) {
    try {
      const orderResp = await fetch(
        `${apiBase}/orders.json?name=${encodeURIComponent(order_name)}&fields=id,customer&limit=1`,
        { headers }
      );
      if (orderResp.ok) {
        const { orders } = await orderResp.json();
        customerId = orders?.[0]?.customer?.id || null;
      }
    } catch (e) {
      console.warn("[update-customer] Order lookup failed:", e.message);
    }
  }

  // Strategy 2: fallback — look up by phone
  if (!customerId && phone) {
    try {
      const cleanPhone  = phone.replace(/\s/g, "");
      const shopifyPhone = cleanPhone.startsWith("0") ? "+213" + cleanPhone.slice(1) : cleanPhone;
      const searchResp  = await fetch(
        `${apiBase}/customers/search.json?query=phone:${encodeURIComponent(shopifyPhone)}&limit=1&fields=id`,
        { headers }
      );
      if (searchResp.ok) {
        customerId = (await searchResp.json()).customers?.[0]?.id || null;
      }
    } catch (e) {
      console.warn("[update-customer] Phone lookup failed:", e.message);
    }
  }

  if (!customerId) {
    console.warn("[update-customer] Customer not found for order:", order_name);
    // Still return 200 — client UX should not fail visibly
    return res.status(200).json({ success: false, reason: "customer_not_found" });
  }

  // Patch email onto customer
  try {
    const patchResp = await fetch(`${apiBase}/customers/${customerId}.json`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ customer: { id: customerId, email: email.toLowerCase().trim() } }),
    });

    if (!patchResp.ok) {
      const err = await patchResp.json();
      console.error("[update-customer] Patch failed:", JSON.stringify(err));
      // Return 200 anyway — not a client-facing error
      return res.status(200).json({ success: false, reason: "patch_failed" });
    }

    console.log(`[update-customer] ✅ Email patched for customer ${customerId} — ${email}`);

    // Fire CAPI Lead enrichment event (non-blocking)
    const eventSourceUrl = req.headers["referer"] || `https://${SHOP_DOMAIN}`;
    fireCAPIEnrichment(email, phone || "", eventSourceUrl).catch(() => {});

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("[update-customer] Error:", err.message);
    return res.status(200).json({ success: false, reason: err.message });
  }
};
