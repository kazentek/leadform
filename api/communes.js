/**
 * GET /api/communes
 * Returns Algeria communes dataset (served from this API to avoid CORS issues)
 * The full JSON file is imported from /data/algeria-communes.json
 *
 * Add your full algeria-communes.json to /data/ folder.
 * A reduced sample is included here for demonstration.
 */

// ── Full dataset should be imported from a JSON file in production ──
// import communes from "../../data/algeria-communes.json";
// For demo purposes, a representative sample is inlined:

const communes = [
  // WILAYA 01 - ADRAR
  { id: 1, commune_name_ascii: "Adrar", wilaya_code: "01", wilaya_name_ascii: "Adrar" },
  { id: 2, commune_name_ascii: "Reggane", wilaya_code: "01", wilaya_name_ascii: "Adrar" },
  { id: 3, commune_name_ascii: "Aoulef", wilaya_code: "01", wilaya_name_ascii: "Adrar" },
  { id: 4, commune_name_ascii: "Timimoun", wilaya_code: "01", wilaya_name_ascii: "Adrar" },
  { id: 5, commune_name_ascii: "Bouda", wilaya_code: "01", wilaya_name_ascii: "Adrar" },
  { id: 6, commune_name_ascii: "Timekten", wilaya_code: "01", wilaya_name_ascii: "Adrar" },
  // WILAYA 16 - ALGER
  { id: 100, commune_name_ascii: "Alger Centre", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 101, commune_name_ascii: "Bab El Oued", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 102, commune_name_ascii: "Hussein Dey", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 103, commune_name_ascii: "El Harrach", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 104, commune_name_ascii: "Kouba", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 105, commune_name_ascii: "Bir Mourad Rais", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 106, commune_name_ascii: "Birkhadem", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 107, commune_name_ascii: "Dar El Beida", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 108, commune_name_ascii: "Bab Ezzouar", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 109, commune_name_ascii: "Hydra", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 110, commune_name_ascii: "Cheraga", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  { id: 111, commune_name_ascii: "Dely Ibrahim", wilaya_code: "16", wilaya_name_ascii: "Alger" },
  // WILAYA 31 - ORAN
  { id: 200, commune_name_ascii: "Oran", wilaya_code: "31", wilaya_name_ascii: "Oran" },
  { id: 201, commune_name_ascii: "Es Senia", wilaya_code: "31", wilaya_name_ascii: "Oran" },
  { id: 202, commune_name_ascii: "Bir El Djir", wilaya_code: "31", wilaya_name_ascii: "Oran" },
  { id: 203, commune_name_ascii: "Arzew", wilaya_code: "31", wilaya_name_ascii: "Oran" },
  { id: 204, commune_name_ascii: "Bethioua", wilaya_code: "31", wilaya_name_ascii: "Oran" },
  // WILAYA 25 - CONSTANTINE
  { id: 300, commune_name_ascii: "Constantine", wilaya_code: "25", wilaya_name_ascii: "Constantine" },
  { id: 301, commune_name_ascii: "El Khroub", wilaya_code: "25", wilaya_name_ascii: "Constantine" },
  { id: 302, commune_name_ascii: "Ain Smara", wilaya_code: "25", wilaya_name_ascii: "Constantine" },
  { id: 303, commune_name_ascii: "Hamma Bouziane", wilaya_code: "25", wilaya_name_ascii: "Constantine" },
  // WILAYA 19 - SETIF
  { id: 400, commune_name_ascii: "Setif", wilaya_code: "19", wilaya_name_ascii: "Setif" },
  { id: 401, commune_name_ascii: "El Eulma", wilaya_code: "19", wilaya_name_ascii: "Setif" },
  { id: 402, commune_name_ascii: "Ain Oulmene", wilaya_code: "19", wilaya_name_ascii: "Setif" },
  { id: 403, commune_name_ascii: "Bougaa", wilaya_code: "19", wilaya_name_ascii: "Setif" },
  // Add remaining wilayas with communes from your algeria-communes.json file
  // The format matches exactly what the embed.js expects
];

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  // Cache for 24h — communes don't change
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");

  if (req.method === "OPTIONS") return res.status(200).end();

  return res.status(200).json(communes);
}
