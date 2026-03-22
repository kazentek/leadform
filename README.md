# 🚀 COD Lead Form System — Setup Guide

## What's Included

```
cod-system/
├── embed.js                  ← Frontend script (goes to /public/embed.js)
├── vercel.json               ← Vercel deployment config
├── api/
│   ├── create-order.js       ← POST /api/create-order
│   ├── stock.js              ← GET /api/stock?variant_id=XXX
│   └── communes.js           ← GET /api/communes
└── data/
    └── shipping-prices.json  ← Reference pricing table (all 48 wilayas)
```

---

## 1. Deploy to Vercel

### Prerequisites
- Vercel account (free tier works)
- Shopify store with a **Private App** or **Custom App** access token

### Steps

```bash
# 1. Clone / create project
mkdir cod-form && cd cod-form
cp -r /path/to/cod-system/* .

# 2. Copy embed.js to public folder
mkdir public
cp embed.js public/embed.js

# 3. Install Vercel CLI
npm i -g vercel

# 4. Deploy
vercel
```

### Set Environment Variables
In your Vercel dashboard → Project Settings → Environment Variables:

| Variable       | Value                          | Example                          |
|----------------|--------------------------------|----------------------------------|
| `SHOP_DOMAIN`  | Your Shopify domain            | `my-store.myshopify.com`         |
| `SHOP_TOKEN`   | Shopify Admin API access token | `shpat_xxxxxxxxxxxxxxxxxx`       |

Or via CLI:
```bash
vercel env add SHOP_DOMAIN
vercel env add SHOP_TOKEN
vercel --prod
```

---

## 2. Shopify Private App Setup

1. Go to **Admin → Settings → Apps → Develop apps**
2. Create a new app (e.g. "COD Form")
3. Under **API credentials**, configure Admin API access:
   - `write_orders` ✅
   - `read_products` ✅ (for stock)
   - `read_inventory` ✅
4. Install the app and copy the **Admin API access token** (`shpat_...`)

---

## 3. Add Algeria Communes Data

Replace the sample data in `api/communes.js` with your full dataset.

**Option A — Inline JSON** (recommended for small datasets):
```js
// At top of api/communes.js
const communes = require("../../data/algeria-communes.json");
```
Place your full `algeria-communes.json` in `/data/`.

**Option B — Import** (Node ESM):
```js
import communes from "../../data/algeria-communes.json" assert { type: "json" };
```

The JSON format expected:
```json
[
  {
    "id": 22,
    "commune_name_ascii": "Timekten",
    "wilaya_code": "01",
    "wilaya_name_ascii": "Adrar"
  },
  ...
]
```

---

## 4. Embed on Shopify

### Option A — Theme Code (recommended)

In your Shopify theme, edit `sections/product-template.liquid` or your product page template.

Add this right after the Add-to-Cart button block:

```html
<!-- COD Lead Form -->
<div id="cod-form-mount"></div>
<script>
  var variantId = {{ product.selected_or_first_available_variant.id }};
  var productPrice = {{ product.selected_or_first_available_variant.price | divided_by: 100.0 }};
</script>
<script
  src="https://YOUR-APP.vercel.app/embed.js"
  data-product-title="{{ product.title | escape }}"
  data-currency="DZD"
></script>
```

> Replace `YOUR-APP.vercel.app` with your actual Vercel URL.

### Option B — Shopify Script Tags (via API)

```bash
curl -X POST \
  "https://YOUR-STORE.myshopify.com/admin/api/2024-01/script_tags.json" \
  -H "X-Shopify-Access-Token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "script_tag": {
      "event": "onload",
      "src": "https://YOUR-APP.vercel.app/embed.js"
    }
  }'
```

### Option C — Custom data attributes (override any setting)

```html
<script
  src="https://YOUR-APP.vercel.app/embed.js"
  data-variant-id="12345678901"
  data-price="3500"
  data-product-title="Montre Élégante Premium"
  data-currency="DZD"
></script>
```

---

## 5. Customize Shipping Prices

Edit the `SHIPPING` object in `embed.js` (or load from your API):

```js
const SHIPPING = {
  "Alger":  { stopdesk: 200, home: 350 },
  "Oran":   { stopdesk: 250, home: 400 },
  // ... all 48 wilayas
};
```

The full reference is in `data/shipping-prices.json`.

---

## 6. API Endpoints Reference

### `POST /api/create-order`

**Request body:**
```json
{
  "variant_id": "12345678901",
  "quantity": 2,
  "customer_name": "Ahmed Benali",
  "phone": "0551234567",
  "wilaya": "Alger",
  "commune": "Bab El Oued",
  "address": "Rue des Martyrs, Bt 3",
  "delivery_type": "home",
  "shipping_cost": 350,
  "product_price": 2500,
  "total": 5350,
  "currency": "DZD"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "#1234",
  "order_number": 1234,
  "order": {
    "id": 4567890123456,
    "name": "#1234",
    "total_price": "5350.00",
    "financial_status": "pending"
  }
}
```

---

### `GET /api/stock?variant_id=XXXX`

**Response:**
```json
{
  "variant_id": 12345678901,
  "inventory": 14,
  "available": true,
  "sku": "SKU-001",
  "title": "Default Title"
}
```

---

### `GET /api/communes`

Returns array of all Algerian communes (cached 24h).

---

## 7. Testing

Test the order creation without a real Shopify store:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "variant_id": "12345678901",
    "quantity": 1,
    "customer_name": "Test Client",
    "phone": "0551234567",
    "wilaya": "Alger",
    "commune": "Alger Centre",
    "delivery_type": "home",
    "shipping_cost": 350,
    "product_price": 2500,
    "total": 2850,
    "currency": "DZD"
  }'
```

---

## 8. Conversion Tips

- **Pre-select Alger** (most orders) — already the default
- **Set urgency timer** — starts at 15 minutes, resets to maintain tension
- **Adjust fake orders counter** — set `ordersToday` base in state to match your real order volume
- **A/B test button copy** — change `"✔ Confirmer ma commande"` to test
- **Trust badges** — customize the badge text for your product niche

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | Check Vercel `vercel.json` headers config |
| Orders not creating | Verify `SHOP_TOKEN` has `write_orders` scope |
| Communes not loading | Check `/api/communes` response in browser DevTools |
| Stock always 99 | Ensure product has inventory tracking enabled in Shopify |
| Form not appearing | Add `<div id="cod-form-mount"></div>` to your theme |

---

## Security Notes

- `SHOP_TOKEN` is server-side only — never exposed to the browser
- Phone validation runs both client-side and server-side
- Orders are created with `financial_status: "pending"` — no payment charged
- Add rate limiting to `/api/create-order` in production (e.g. Vercel Edge Config or Upstash)
