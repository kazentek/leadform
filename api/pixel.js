/**
 * GET /api/pixel.js
 * Serves the Facebook Pixel init script dynamically.
 * theme.liquid loads this once — fires PageView + ViewContent.
 * Pixel ID comes from FB_PIXEL_ID env variable.
 */

module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");

  const PIXEL_ID = process.env.FB_PIXEL_ID;

  if (!PIXEL_ID) {
    // No pixel configured — return empty script
    return res.status(200).send("/* COD Pixel: FB_PIXEL_ID not configured */");
  }

  const script = `
(function() {
  // Expose pixel ID to embed.js for Purchase event deduplication
  window.__FB_PIXEL_ID__ = "${PIXEL_ID}";

  // Initialize Facebook Pixel
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
    n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
    t=b.createElement(e);t.async=!0;t.src=v;
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', '${PIXEL_ID}');
  fbq('track', 'PageView');
  console.log('[COD Pixel] PageView fired — pixel: ${PIXEL_ID}');
})();
`.trim();

  return res.status(200).send(script);
};
