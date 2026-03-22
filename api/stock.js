/**
 * GET /api/stock?variant_id=XXXX
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
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

module.exports = async function handler(req, res) {
  setCORS(res);

  if (req.method === "OPTIONS") return res.status(200).end();

  const { SHOP_DOMAIN } = process.env;
  if (!SHOP_DOMAIN) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const { variant_id } = req.query;
  if (!variant_id) {
    return res.status(400).json({ error: "variant_id is required" });
  }

  let token;
  try {
    token = await getAccessToken();
  } catch (err) {
    console.error("Token fetch failed:", err.message);
    return res.status(500).json({ error: "Auth failed: " + err.message });
  }

  try {
    const varResp = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2024-01/variants/${variant_id}.json`,
      {
        headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
      }
    );

    if (!varResp.ok) {
      return res.status(varResp.status).json({ error: "Variant not found" });
    }

    const { variant } = await varResp.json();
    const inventory = variant.inventory_management === "shopify"
      ? (variant.inventory_quantity != null ? variant.inventory_quantity : 99)
      : 99;

    return res.status(200).json({ variant_id: variant.id, inventory, available: inventory > 0, sku: variant.sku || null });
  } catch (err) {
    console.error("Stock error:", err);
    return res.status(500).json({ error: "Internal server error: " + err.message });
  }
};
