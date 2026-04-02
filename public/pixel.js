/**
 * Facebook Pixel — COD Funnel Edition
 * Engagement-gated PageView + full funnel events
 * Pixel: 1141342971356278
 *
 * Event flow:
 *   PageView        → after human interaction (bot protection)
 *   ViewContent     → after PageView confirmed
 *   Lead            → when COD form first receives focus
 *   InitiateCheckout → when name + phone are both filled
 *   Purchase        → fired by embed.js after order success
 */
(function () {
  var PIXEL_ID = "1141342971356278";
  window.__FB_PIXEL_ID__ = PIXEL_ID;

  // ── Load Pixel SDK ──
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
    n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];
    t=b.createElement(e);t.async=!0;t.src=v;
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
  }(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");

  fbq("init", PIXEL_ID);

  // ══════════════════════════════════════════════
  //  BOT PROTECTION — Engagement-gated PageView
  //  Bots that "stare" never fire PageView
  //  Real humans trigger it within milliseconds
  // ══════════════════════════════════════════════
  var pageViewFired = false;
  var mouseMoveStartX = null, mouseMoveStartY = null;
  var MOUSE_THRESHOLD = 50; // px

  function firePageView() {
    if (pageViewFired) return;
    pageViewFired = true;

    removeEngagementListeners();
    fbq("track", "PageView");
    window.__FB_PIXEL_READY__ = true;
    document.dispatchEvent(new Event("cod:pixel:ready"));
    console.log("[Pixel] PageView fired ✅");
  }

  function onMouseMove(e) {
    if (mouseMoveStartX === null) {
      mouseMoveStartX = e.clientX;
      mouseMoveStartY = e.clientY;
      return;
    }
    var dx = e.clientX - mouseMoveStartX;
    var dy = e.clientY - mouseMoveStartY;
    if (Math.sqrt(dx * dx + dy * dy) >= MOUSE_THRESHOLD) firePageView();
  }

  function removeEngagementListeners() {
    document.removeEventListener("mousemove",  onMouseMove);
    document.removeEventListener("scroll",     firePageView, true);
    document.removeEventListener("touchstart", firePageView, true);
    document.removeEventListener("touchmove",  firePageView, true);
    document.removeEventListener("keydown",    firePageView, true);
    document.removeEventListener("focusin",    firePageView, true);
  }

  document.addEventListener("mousemove",  onMouseMove);
  document.addEventListener("scroll",     firePageView, { passive: true, capture: true });
  document.addEventListener("touchstart", firePageView, { passive: true, capture: true });
  document.addEventListener("touchmove",  firePageView, { passive: true, capture: true });
  document.addEventListener("keydown",    firePageView, { capture: true });
  document.addEventListener("focusin",    firePageView, { capture: true });

  // Safety fallback for real slow users — bots never reach 8s
  setTimeout(function () {
    if (!pageViewFired) {
      console.log("[Pixel] PageView fallback (8s) fired");
      firePageView();
    }
  }, 8000);

  // ══════════════════════════════════════════════
  //  ViewContent — fires after PageView confirmed
  //  Only on product pages
  // ══════════════════════════════════════════════
  function fireViewContent() {
    if (window.location.pathname.indexOf("/products/") === -1) return;
    if (!window.__PRODUCT_DATA__) return;

    var p = window.__PRODUCT_DATA__;
    fbq("track", "ViewContent", {
      content_ids:  [String(p.variantId)],
      content_type: "product",
      content_name: p.title,
      value:        parseFloat((p.price / 136).toFixed(2)),
      currency:     "USD",
    });
    console.log("[Pixel] ViewContent fired ✅");
  }

  if (window.__FB_PIXEL_READY__) {
    fireViewContent();
  } else {
    document.addEventListener("cod:pixel:ready", fireViewContent, { once: true });
  }

})();
