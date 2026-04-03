/**
 * GET /api/pixel.js
 * Served by Vercel to theme.liquid via:
 *   <script src="https://leadform-ebth.vercel.app/pixel.js" defer></script>
 *
 * Responsibilities:
 *   1. Expose __FB_PIXEL_ID__ for embed.js deduplication
 *   2. Gate ViewContent behind real human interaction
 *   3. Signal __FB_PIXEL_READY__ for embed.js Lead/InitiateCheckout
 *
 * Does NOT fire PageView — that is done inline in theme.liquid
 */
module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");

  const PIXEL_ID = process.env.FB_PIXEL_ID;

  if (!PIXEL_ID) {
    return res.status(200).send("/* COD Pixel: FB_PIXEL_ID not configured */");
  }

  const script = `
(function() {
  var PIXEL_ID = "${PIXEL_ID}";
  window.__FB_PIXEL_ID__ = PIXEL_ID;

  var humanVerified   = false;
  var startX = null, startY = null;
  var THRESHOLD = 50;

  function verifyHuman() {
    if (humanVerified) return;
    if (!window.fbq) { setTimeout(verifyHuman, 100); return; }
    humanVerified = true;
    removeListeners();
    window.__FB_PIXEL_READY__ = true;
    document.dispatchEvent(new Event("cod:pixel:ready"));
    console.log("[Pixel] Human verified ✅");
    fireViewContent();
  }

  function onMouseMove(e) {
    if (startX === null) { startX = e.clientX; startY = e.clientY; return; }
    var dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.sqrt(dx*dx + dy*dy) >= THRESHOLD) verifyHuman();
  }

  function removeListeners() {
    document.removeEventListener("mousemove",  onMouseMove);
    document.removeEventListener("scroll",     verifyHuman, true);
    document.removeEventListener("touchstart", verifyHuman, true);
    document.removeEventListener("touchmove",  verifyHuman, true);
    document.removeEventListener("keydown",    verifyHuman, true);
    document.removeEventListener("focusin",    verifyHuman, true);
  }

  document.addEventListener("mousemove",  onMouseMove);
  document.addEventListener("scroll",     verifyHuman, { passive: true, capture: true });
  document.addEventListener("touchstart", verifyHuman, { passive: true, capture: true });
  document.addEventListener("touchmove",  verifyHuman, { passive: true, capture: true });
  document.addEventListener("keydown",    verifyHuman, { capture: true });
  document.addEventListener("focusin",    verifyHuman, { capture: true });

  // Safety fallback — real slow users still tracked after 8s
  // Bots abandon pages in < 1s so never reach this
  setTimeout(function() {
    if (!humanVerified) {
      console.log("[Pixel] Fallback verifyHuman (8s)");
      verifyHuman();
    }
  }, 8000);

  function fireViewContent() {
    if (window.location.pathname.indexOf("/products/") === -1) return;
    var p = window.__PRODUCT_DATA__;
    if (!p || !window.fbq) return;
    fbq("track", "ViewContent", {
      content_ids:  [String(p.variantId)],
      content_type: "product",
      content_name: p.title,
      value:        parseFloat((p.price / 136).toFixed(2)),
      currency:     "USD",
    });
    console.log("[Pixel] ViewContent fired ✅");
  }
})();
`.trim();

  return res.status(200).send(script);
};
