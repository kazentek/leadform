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

  // Securely hash user data per Meta's Best Practices
  const userDataPayload = {
    client_ip_address: clientIp,
    client_user_agent: userAgent,
    country: [h("dz")],
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };

  if (user_data.phone) {
    const cleanPhone = user_data.phone.replace(/\s/g, "");
    userDataPayload.ph = [h(cleanPhone)];
    userDataPayload.external_id = [h(cleanPhone)]; // Major EMQ boost
  }
  
  if (user_data.email) {
    userDataPayload.em = [h(user_data.email.toLowerCase().trim())];
  }

  // Explicit First / Last Name split
  if (user_data.first_name) {
    userDataPayload.fn = [h(user_data.first_name.toLowerCase().trim())];
  }
  if (user_data.last_name) {
    userDataPayload.ln = [h(user_data.last_name.toLowerCase().trim())];
  }

  // Mid-funnel location mapping 
  if (user_data.wilaya) {
    userDataPayload.st = [h(user_data.wilaya.toLowerCase().replace(/\s/g, ""))];
  }
  if (user_data.commune) {
    userDataPayload.ct = [h(user_data.commune.toLowerCase().replace(/\s/g, ""))];
  }

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
