/**
 * GET /api/stock?variant_id=XXXX
 * Returns real-time inventory level from Shopify
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { SHOP_DOMAIN, SHOP_TOKEN } = process.env;

  if (!SHOP_DOMAIN || !SHOP_TOKEN) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const { variant_id } = req.query;

  if (!variant_id) {
    return res.status(400).json({ error: "variant_id is required" });
  }

  try {
    // Fetch variant to get inventory_item_id and inventory_quantity
    const varResp = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2024-01/variants/${variant_id}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": SHOP_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    if (!varResp.ok) {
      return res.status(varResp.status).json({ error: "Variant not found" });
    }

    const { variant } = await varResp.json();

    // Use inventory_quantity directly (fastest, no extra call)
    const inventory =
      variant.inventory_management === "shopify"
        ? variant.inventory_quantity ?? 99
        : 99; // unlimited if not tracked

    return res.status(200).json({
      variant_id: variant.id,
      inventory,
      available: inventory > 0,
      sku: variant.sku || null,
      title: variant.title || null,
    });
  } catch (err) {
    console.error("Stock fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
