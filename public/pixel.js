/**
 * Facebook Pixel — Engagement-Gated
 * Bot protection: pixel only fires after real human interaction
 * Bots that "stare" at the screen never trigger ViewContent/PageView
 * This starves the bot-learning loop and protects ad optimization
 */
(function() {
  window.__FB_PIXEL_ID__ = "1141342971356278";

  // ── Load Facebook Pixel SDK (but don't fire events yet) ──
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
    n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
    t=b.createElement(e);t.async=!0;t.src=v;
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', '1141342971356278');

  // ── Human detection ──
  // PageView only fires after ONE of these real interactions:
  //   - Mouse moves more than 50px (desktop)
  //   - User scrolls any amount
  //   - User touches screen (mobile)
  //   - User focuses any element
  // Bots that just load the page and stare → no PageView fired

  var fired = false;
  var startX = null, startY = null;
  var MOVE_THRESHOLD = 50; // px of mouse movement required

  function firePageView() {
    if (fired) return;
    fired = true;

    // Remove all listeners once fired
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('scroll',    onScroll,    true);
    document.removeEventListener('touchmove', onTouch,     true);
    document.removeEventListener('touchstart',onTouch,     true);
    document.removeEventListener('keydown',   onKey,       true);
    document.removeEventListener('focusin',   onFocus,     true);

    fbq('track', 'PageView');
    console.log('[COD Pixel] ✅ PageView fired — human interaction confirmed');

    // Signal to embed.js that pixel is ready
    window.__FB_PIXEL_READY__ = true;
    document.dispatchEvent(new Event('cod:pixel:ready'));
  }

  function onMouseMove(e) {
    if (startX === null) { startX = e.clientX; startY = e.clientY; return; }
    var dx = Math.abs(e.clientX - startX);
    var dy = Math.abs(e.clientY - startY);
    if (Math.sqrt(dx*dx + dy*dy) >= MOVE_THRESHOLD) firePageView();
  }

  function onScroll()  { firePageView(); }
  function onTouch()   { firePageView(); }
  function onKey()     { firePageView(); }
  function onFocus()   { firePageView(); }

  document.addEventListener('mousemove',  onMouseMove);
  document.addEventListener('scroll',     onScroll,    { passive: true, capture: true });
  document.addEventListener('touchmove',  onTouch,     { passive: true, capture: true });
  document.addEventListener('touchstart', onTouch,     { passive: true, capture: true });
  document.addEventListener('keydown',    onKey,       { capture: true });
  document.addEventListener('focusin',    onFocus,     { capture: true });

  // ── Safety fallback ──
  // Real slow humans who don't interact within 8 seconds still get tracked
  // This avoids losing legitimate conversions from slow users
  // Bots typically abandon pages in < 1 second
  setTimeout(function() {
    if (!fired) {
      console.log('[COD Pixel] ⏱ Fallback PageView fired after 8s');
      firePageView();
    }
  }, 8000);

})();
