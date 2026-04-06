/**
 * POST /api/capi
 * Universal Meta Conversions API Endpoint for Upper-Funnel Events
 */
const crypto = require("crypto");

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const h = (str) => crypto.createHash("sha256").update(str).digest("hex");

module.exports = async function handler(req, res) {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const PIXEL_ID = process.env.FB_PIXEL_ID;
  const CAPI_TOKEN = process.env.FB_CAPI_TOKEN;

  if (!PIXEL_ID || !CAPI_TOKEN) {
    console.log("[CAPI] Missing credentials.");
    return res.status(500).json({ error: "CAPI not configured" });
  }

  const { event_name, event_id, event_source_url, fbp, fbc, custom_data, user_data = {} } = req.body;

  // Extract IP and UA
  const forwardedIps = req.headers["x-forwarded-for"];
  const clientIp = forwardedIps ? forwardedIps.split(",")[0].trim() : (req.socket?.remoteAddress || "");
  const userAgent = req.headers["user-agent"] || "";

  // 2026 Best Practice: Securely hash specific fields, pass others unhashed
  const userDataPayload = {
    client_ip_address: clientIp,
    client_user_agent: userAgent,
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
    ...(user_data.external_id ? { external_id: [h(user_data.external_id)] } : {}),
    ...(user_data.phone ? { ph: [h(user_data.phone.replace(/\s/g, ""))] } : {}),
    ...(user_data.email ? { em: [h(user_data.email.toLowerCase().trim())] } : {}),
    country: [h("dz")],
  };

  if (user_data.first_name) userDataPayload.fn = [h(user_data.first_name.toLowerCase().trim())];
  if (user_data.last_name) userDataPayload.ln = [h(user_data.last_name.toLowerCase().trim())];
  if (user_data.city) userDataPayload.ct = [h(user_data.city.toLowerCase().trim())];
  if (user_data.state) userDataPayload.st = [h(user_data.state.toLowerCase().trim())];

  const eventData = {
    data: [{
      event_name: event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: event_id,
      action_source: "website",
      event_source_url: event_source_url,
      user_data: userDataPayload,
      custom_data: custom_data || {},
    }],
    ...(process.env.FB_TEST_EVENT_CODE ? { test_event_code: process.env.FB_TEST_EVENT_CODE } : {}),
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();
    if (response.ok) {
      console.log(`[CAPI] ✅ ${event_name} sent — events_received: ${result.events_received}`);
      return res.status(200).json({ success: true });
    } else {
      console.error(`[CAPI] ❌ ${event_name} error:`, result);
      return res.status(400).json({ error: result });
    }
  } catch (err) {
    console.error(`[CAPI] ❌ Request failed:`, err.message);
    return res.status(500).json({ error: err.message });
  }
};
