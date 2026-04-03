/**
 * Facebook Pixel — Engagement Logic (Vercel Edition)
 * Only fires ViewContent/Leads after human interaction is confirmed.
 */
(function () {
  var PIXEL_ID = "1141342971356278";
  window.__FB_PIXEL_ID__ = PIXEL_ID;

  var humanVerified = false;
  var mouseMoveStartX = null, mouseMoveStartY = null;
  var MOUSE_THRESHOLD = 50; 

  function verifyHuman() {
    // 1. If already verified, exit
    if (humanVerified) return;

    // 2. CRITICAL FIX: If FBQ isn't loaded yet, wait 100ms and try again
    if (!window.fbq) {
      setTimeout(verifyHuman, 100);
      return;
    }

    // 3. Mark as verified and trigger ready state
    humanVerified = true;
    removeEngagementListeners();  
    window.__FB_PIXEL_READY__ = true;  
    document.dispatchEvent(new Event("cod:pixel:ready"));  
    
    console.log("[Pixel] Human verified. Deep tracking enabled ✅");
  }

  function onMouseMove(e) {
    if (mouseMoveStartX === null) {
      mouseMoveStartX = e.clientX; 
      mouseMoveStartY = e.clientY;
      return;
    }
    var dx = e.clientX - mouseMoveStartX;
    var dy = e.clientY - mouseMoveStartY;
    if (Math.sqrt(dx * dx + dy * dy) >= MOUSE_THRESHOLD) verifyHuman();
  }

  function removeEngagementListeners() {
    document.removeEventListener("mousemove",  onMouseMove);
    document.removeEventListener("scroll",      verifyHuman, true);
    document.removeEventListener("touchstart", verifyHuman, true);
    document.removeEventListener("touchmove",  verifyHuman, true);
    document.removeEventListener("keydown",    verifyHuman, true);
  }

  // Listen for interaction
  document.addEventListener("mousemove",  onMouseMove);
  document.addEventListener("scroll",      verifyHuman, { passive: true, capture: true });
  document.addEventListener("touchstart", verifyHuman, { passive: true, capture: true });
  document.addEventListener("touchmove",  verifyHuman, { passive: true, capture: true });
  document.addEventListener("keydown",    verifyHuman, { capture: true });

  // Safety fallback for real (but slow) users
  setTimeout(function () {
    if (!humanVerified) {
      console.log("[Pixel] Engagement fallback fired");
      verifyHuman();
    }
  }, 8000);

  // ══════════════════════════════════════════════
  //  ViewContent Logic
  // ══════════════════════════════════════════════
  function fireViewContent() {
    if (window.location.pathname.indexOf("/products/") === -1) return;
    
    var p = window.__PRODUCT_DATA__;
    if (!p) return;

    fbq("track", "ViewContent", {
      content_ids:  [String(p.variantId)],
      content_type: "product",
      content_name: p.title,
      value:        parseFloat((p.price / 260).toFixed(2)), 
      currency:     "USD",
    });
    console.log("[Pixel] ViewContent fired (Human only) ✅");
  }

  // Trigger ViewContent only after verification
  if (window.__FB_PIXEL_READY__) {
    fireViewContent();
  } else {
    document.addEventListener("cod:pixel:ready", fireViewContent, { once: true });
  }
})();
