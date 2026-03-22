/**
 * POST /api/create-order
 * Creates a Shopify COD order via Admin API
 *
 * Body:
 *   variant_id, quantity, customer_name, phone,
 *   wilaya, commune, address, delivery_type,
 *   shipping_cost, product_price, total, currency
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const {
    SHOP_DOMAIN,
    SHOP_TOKEN,
  } = process.env;

  if (!SHOP_DOMAIN || !SHOP_TOKEN) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const {
    variant_id,
    quantity,
    customer_name,
    phone,
    wilaya,
    commune,
    address,
    delivery_type,
    shipping_cost,
    product_price,
    total,
    currency = "DZD",
  } = body;

  /* ── Input validation ── */
  if (!variant_id || !quantity || !customer_name || !phone || !wilaya || !commune) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!/^0[5-7]\d{8}$/.test(phone.replace(/\s/g, ""))) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  /* ── Build Shopify order payload ── */
  const shopifyOrder = {
    order: {
      line_items: [
        {
          variant_id: Number(variant_id),
          quantity: Number(quantity),
          price: String(product_price),
        },
      ],
      customer: {
        first_name: customer_name.split(" ")[0] || customer_name,
        last_name: customer_name.split(" ").slice(1).join(" ") || ".",
        phone: phone.replace(/\s/g, ""),
      },
      shipping_address: {
        first_name: customer_name.split(" ")[0] || customer_name,
        last_name: customer_name.split(" ").slice(1).join(" ") || ".",
        phone: phone.replace(/\s/g, ""),
        address1: address || `${commune}, ${wilaya}`,
        city: commune,
        province: wilaya,
        country: "DZ",
        country_code: "DZ",
        zip: "",
      },
      billing_address: {
        first_name: customer_name.split(" ")[0] || customer_name,
        last_name: customer_name.split(" ").slice(1).join(" ") || ".",
        phone: phone.replace(/\s/g, ""),
        address1: address || `${commune}, ${wilaya}`,
        city: commune,
        province: wilaya,
        country: "DZ",
        country_code: "DZ",
        zip: "",
      },
      financial_status: "pending",
      fulfillment_status: null,
      send_receipt: false,
      send_fulfillment_receipt: false,
      note: `COD Order | Wilaya: ${wilaya} | Commune: ${commune} | Delivery: ${delivery_type === "home" ? "Domicile" : "Stop Desk"} | Shipping: ${shipping_cost} ${currency}`,
      tags: `COD, ${delivery_type === "home" ? "home-delivery" : "stop-desk"}, ${wilaya}`,
      shipping_lines: [
        {
          title: delivery_type === "home" ? "Livraison à Domicile" : "Stop Desk",
          price: String(shipping_cost),
          code: delivery_type === "home" ? "HOME" : "STOPDESK",
        },
      ],
      // Custom attributes for internal tracking
      note_attributes: [
        { name: "wilaya", value: wilaya },
        { name: "commune", value: commune },
        { name: "delivery_type", value: delivery_type },
        { name: "shipping_cost", value: String(shipping_cost) },
        { name: "source", value: "COD Lead Form" },
      ],
      currency,
      // Suppress Shopify emails to customer
      suppress_notifications: true,
    },
  };

  try {
    const shopResp = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2024-01/orders.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOP_TOKEN,
        },
        body: JSON.stringify(shopifyOrder),
      }
    );

    const shopData = await shopResp.json();

    if (!shopResp.ok) {
      console.error("Shopify error:", shopData);
      return res.status(502).json({
        error: "Order creation failed",
        details: shopData.errors || shopData,
      });
    }

    const order = shopData.order;

    return res.status(200).json({
      success: true,
      order_id: order.name,
      order_number: order.order_number,
      order: {
        id: order.id,
        name: order.name,
        total_price: order.total_price,
        financial_status: order.financial_status,
      },
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
