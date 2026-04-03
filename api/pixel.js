/**
 * GET /api/pixel.js
 * Human-verified ViewContent + Standard PageView + CAPI syncing.
 */
module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");

  const PIXEL_ID = process.env.FB_PIXEL_ID;
  if (!PIXEL_ID) return res.status(200).send("/* FB_PIXEL_ID not configured */");

  const script = `
(function() {
  var PIXEL_ID = "${PIXEL_ID}";
  window.__FB_PIXEL_ID__ = PIXEL_ID;

  // 1. Universal CAPI Sender
  function getFBCookies() {
    var cookies = document.cookie.split(";").reduce(function(acc, c) {
      var idx = c.indexOf("=");
      if (idx > -1) acc[c.slice(0, idx).trim()] = c.slice(idx + 1).trim();
      return acc;
    }, {});
    
    var fbp = cookies["_fbp"] || null;
    var fbc = cookies["_fbc"] || null;
    try {
      var fbclid = new URLSearchParams(window.location.search).get("fbclid");
      if (fbclid) fbc = "fb.1." + Date.now() + "." + fbclid;
    } catch(e) {}
    return { fbp: fbp, fbc: fbc };
  }

  window.__sendServerEvent = function(eventName, eventId, customData) {
    var c = getFBCookies();
    fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        fbp: c.fbp,
        fbc: c.fbc,
        custom_data: customData || {}
      })
    }).catch(function(){});
  };

  // 2. Fire STANDARD PageView immediately (Fixes 0 Landing Page Views)
  var pvEventId = "pv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  if (window.fbq) {
    fbq("track", "PageView", {}, { eventID: pvEventId });
  }
  window.__sendServerEvent("PageView", pvEventId, {});

  // 3. Human Verification for ViewContent
  var humanVerified = false;
  var startX = null, startY = null;

  function verifyHuman() {
    if (humanVerified) return;
    if (!window.fbq) { setTimeout(verifyHuman, 100); return; }
    humanVerified = true;
    
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("scroll", verifyHuman, true);
    document.removeEventListener("touchstart", verifyHuman, true);

    window.__FB_PIXEL_READY__ = true;
    document.dispatchEvent(new Event("cod:pixel:ready"));
    
    fireViewContent();
  }

  function onMouseMove(e) {
    if (startX === null) { startX = e.clientX; startY = e.clientY; return; }
    var dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.sqrt(dx*dx + dy*dy) >= 50) verifyHuman();
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("scroll", verifyHuman, { passive: true, capture: true });
  document.addEventListener("touchstart", verifyHuman, { passive: true, capture: true });
  setTimeout(verifyHuman, 8000); // 8s Fallback

  function fireViewContent() {
    if (window.location.pathname.indexOf("/products/") === -1) return;
    var p = window.__PRODUCT_DATA__;
    if (!p || !window.fbq) return;

    var vcEventId = "vc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    var customData = {
      content_ids: [String(p.variantId)],
      content_type: "product",
      content_name: p.title,
      value: parseFloat((p.price / 260).toFixed(2)),
      currency: "USD",
    };

    fbq("track", "ViewContent", customData, { eventID: vcEventId });
    window.__sendServerEvent("ViewContent", vcEventId, customData);
    console.log("[Pixel] ViewContent fired Browser + CAPI ✅");
  }
})();
`.trim();

  return res.status(200).send(script);
};
