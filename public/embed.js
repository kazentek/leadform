/**
 * COD Lead Form System — Algeria
 * Premium Redesign v8 (Bilingual, Split Names, Early-Trigger Tracking, Expanded Format)
 */
(function () {
  "use strict";

  const currentScript = document.currentScript || (function () {
    const s = document.getElementsByTagName("script");
    return s[s.length - 1];
  })();

  const BASE_URL = currentScript.src ? currentScript.src.split("/embed.js")[0] : "";

  const CONFIG = {
    variantId: currentScript.dataset.variantId || (typeof variantId !== "undefined" ? variantId : null),
    price: parseFloat(currentScript.dataset.price) || (typeof productPrice !== "undefined" ? productPrice : 2500),
    productTitle: currentScript.dataset.productTitle || "Votre Produit",
    currency: currentScript.dataset.currency || "DZD",
    apiBase: BASE_URL || "https://leadform-ebth.vercel.app",
    defaultWilaya: "Alger",
  };

  if (window.__COD_CONFIG__) {
    Object.assign(CONFIG, window.__COD_CONFIG__);
  }

  /* ─────────────────────────────────────────────
     1. INSTANT FACEBOOK PIXEL INITIALIZATION
  ───────────────────────────────────────────── */
  function initFacebookPixel() {
    const pixelId = window.__FB_PIXEL_ID__ || currentScript.dataset.fbPixelId;
    if (!pixelId) return;

    try {
      const preconnect = document.createElement("link");
      preconnect.rel = "preconnect"; 
      preconnect.href = "https://connect.facebook.net";
      document.head.appendChild(preconnect);
    } catch(e) {}

    if (typeof fbq !== "function") {
      !function(f,b,e,v,n,t,s){
        if(f.fbq)return;
        n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];
        t=b.createElement(e);t.async=!0;t.src=v;
        s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s);
      }(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
      
      fbq("init", pixelId);
    }
  }
  
  initFacebookPixel();

  /* ─────────────────────────────────────────────
     2. FORM CONFIG & DATA
  ───────────────────────────────────────────── */
  const SHIPPING = {
    Adrar: { stopdesk: 700, home: 1450 }, Chlef: { stopdesk: 400, home: 750 }, Laghouat: { stopdesk: 550, home: 950 },
    "Oum El Bouaghi": { stopdesk: 400, home: 750 }, Batna: { stopdesk: 400, home: 800 }, "Béjaïa": { stopdesk: 400, home: 750 },
    Biskra: { stopdesk: 500, home: 950 }, "Béchar": { stopdesk: 600, home: 1150 }, Blida: { stopdesk: 350, home: 550 },
    Bouira: { stopdesk: 400, home: 700 }, Tamanrasset: { stopdesk: 950, home: 1750 }, "Tébessa": { stopdesk: 400, home: 850 },
    Tlemcen: { stopdesk: 400, home: 800 }, Tiaret: { stopdesk: 400, home: 850 }, "Tizi Ouzou": { stopdesk: 350, home: 700 },
    Alger: { stopdesk: 300, home: 450 }, Djelfa: { stopdesk: 550, home: 950 }, Jijel: { stopdesk: 400, home: 800 },
    "Sétif": { stopdesk: 400, home: 750 }, "Saïda": { stopdesk: 400, home: 850 }, Skikda: { stopdesk: 400, home: 800 },
    "Sidi Bel Abbès": { stopdesk: 400, home: 750 }, Annaba: { stopdesk: 400, home: 750 }, Guelma: { stopdesk: 400, home: 850 },
    Constantine: { stopdesk: 400, home: 750 }, "Médéa": { stopdesk: 400, home: 700 }, Mostaganem: { stopdesk: 400, home: 750 },
    "M'Sila": { stopdesk: 400, home: 800 }, Mascara: { stopdesk: 400, home: 750 }, Ouargla: { stopdesk: 550, home: 1050 },
    Oran: { stopdesk: 400, home: 750 }, "El Bayadh": { stopdesk: 600, home: 1150 }, Illizi: { stopdesk: 1000, home: 1850 },
    "Bordj Bou Arreridj": { stopdesk: 400, home: 750 }, "Boumerdès": { stopdesk: 300, home: 550 }, "El Tarf": { stopdesk: 400, home: 850 },
    Tindouf: { stopdesk: 700, home: 1350 }, Tissemsilt: { stopdesk: 400, home: 800 }, "El Oued": { stopdesk: 550, home: 1100 },
    Khenchela: { stopdesk: 400, home: 850 }, "Souk Ahras": { stopdesk: 400, home: 850 }, Tipaza: { stopdesk: 350, home: 550 },
    Mila: { stopdesk: 400, home: 800 }, "Aïn Defla": { stopdesk: 400, home: 750 }, "Naâma": { stopdesk: 600, home: 1150 },
    "Aïn Témouchent": { stopdesk: 400, home: 750 }, "Ghardaïa": { stopdesk: 550, home: 1000 }, Relizane: { stopdesk: 400, home: 800 },
    "Ouled Djellal": { stopdesk: 550, home: 950 }, "El Menia": { stopdesk: 550, home: 1100 }, "El Meghaier": { stopdesk: 600, home: 1050 },
    Touggourt: { stopdesk: 550, home: 1050 }, "Béni Abbès": { stopdesk: 750, home: 1150 }, Timimoun: { stopdesk: 700, home: 1450 },
    "In Salah": { stopdesk: 900, home: 1650 },
  };
  
  let COMMUNES_BY_WILAYA = {};
  let SHOPIFY_VARIANTS = [];

  let state = {
    qty: 1, 
    maxQty: 99, 
    wilaya: CONFIG.defaultWilaya, 
    commune: "", 
    variantTitle: "Par défaut", 
    deliveryType: "home", 
    shippingCost: SHIPPING[CONFIG.defaultWilaya]?.home ?? 400, 
    submitting: false, 
    submitted: false 
  };

  /* ── CSS ── */
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

      #cod-form-root {
        all: initial; 
        display: block; 
        width: 100%; 
        max-width: 520px; 
        margin: 0 auto;
        box-sizing: border-box; 
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased; 
        background: #ffffff;
        border-radius: 20px; 
        border: 1px solid #E5E7EB;
        box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); 
        overflow: hidden;
      }
      
      #cod-form-root * { 
        box-sizing: border-box; 
      }
      
      .ar-text { 
        font-family: 'Cairo', sans-serif; 
      }
      
      .cod-header { 
        padding: 28px 24px 20px; 
        text-align: center; 
        background: #ffffff; 
        border-bottom: 1px solid #F3F4F6; 
      }
      
      .cod-trust-badges { 
        display: flex; 
        justify-content: center; 
        gap: 12px; 
        margin-bottom: 16px; 
        flex-wrap: wrap; 
      }
      
      .cod-trust-badge { 
        display: flex; 
        align-items: center; 
        gap: 6px; 
        font-size: 11px; 
        font-weight: 700; 
        color: #059669; 
        background: #ECFDF5; 
        padding: 6px 10px; 
        border-radius: 8px; 
      }
      
      .cod-title-wrapper { 
        display: flex; 
        flex-direction: column; 
        gap: 4px; 
        align-items: center; 
      }
      
      .cod-title { 
        font-size: 22px; 
        font-weight: 800; 
        color: #111827; 
        margin: 0; 
        letter-spacing: -0.5px; 
      }
      
      .cod-title-ar { 
        font-size: 20px; 
        font-weight: 700; 
        color: #111827; 
        margin: 0; 
      }
      
      .cod-subtitle { 
        font-size: 14px; 
        color: #6B7280; 
        margin: 8px 0 0 0; 
        font-weight: 500; 
        white-space: nowrap; 
        overflow: hidden; 
        text-overflow: ellipsis; 
      }
      
      .cod-body { 
        padding: 24px; 
        display: flex; 
        flex-direction: column; 
        gap: 20px; 
      }
      
      .cod-row { 
        display: grid; 
        grid-template-columns: 1fr 1fr; 
        gap: 16px; 
      }
      
      .cod-field-group { 
        display: flex; 
        flex-direction: column; 
        gap: 8px; 
      }
      
      .cod-label-bilingual { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        width: 100%; 
      }
      
      .cod-label-fr { 
        font-size: 13px; 
        font-weight: 700; 
        color: #374151; 
      }
      
      .cod-label-ar { 
        font-size: 14px; 
        font-weight: 700; 
        color: #6B7280; 
      }
      
      .cod-optional { 
        font-size: 11px; 
        font-weight: 500; 
        color: #9CA3AF; 
        margin-left: 4px; 
      }
      
      .cod-input, .cod-select { 
        width: 100%; 
        height: 52px; 
        padding: 0 16px; 
        background: #F9FAFB; 
        border: 1px solid #E5E7EB; 
        border-radius: 12px; 
        font-size: 15px; 
        font-family: inherit; 
        font-weight: 500; 
        color: #111827; 
        outline: none; 
        transition: all 0.2s ease; 
        appearance: none; 
        -webkit-appearance: none; 
      }
      
      .cod-select { 
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); 
        background-repeat: no-repeat; 
        background-position: right 16px center; 
        background-size: 16px; 
        cursor: pointer; 
        padding-right: 40px; 
      }
      
      .cod-input:hover, .cod-select:hover { 
        border-color: #D1D5DB; 
      }
      
      .cod-input:focus, .cod-select:focus { 
        border-color: #FF5A1F; 
        background: #FFFFFF; 
        box-shadow: 0 0 0 4px rgba(255,90,31,0.1); 
      }
      
      .cod-input::placeholder { 
        color: #9CA3AF; 
        font-weight: 400; 
      }
      
      .cod-input.cod-error, .cod-select.cod-error { 
        border-color: #EF4444; 
        background: #FEF2F2; 
      }
      
      .cod-error-msg { 
        font-size: 12px; 
        color: #EF4444; 
        font-weight: 600; 
        display: none; 
        margin-top: -4px; 
        text-align: left; 
      }
      
      .cod-error-msg.visible { 
        display: flex; 
        justify-content: space-between; 
      }
      
      .cod-delivery-grid { 
        display: grid; 
        grid-template-columns: 1fr 1fr; 
        gap: 12px; 
      }
      
      .cod-delivery-option { 
        position: relative; 
        cursor: pointer; 
      }
      
      .cod-delivery-option input { 
        position: absolute; 
        opacity: 0; 
        pointer-events: none; 
      }
      
      .cod-delivery-card { 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        gap: 4px; 
        padding: 14px; 
        border: 2px solid #E5E7EB; 
        border-radius: 16px; 
        background: #ffffff; 
        transition: all 0.2s ease; 
        height: 100%; 
        text-align: center; 
      }
      
      .cod-del-top { 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        gap: 4px; 
        font-size: 14px; 
        font-weight: 700; 
        color: #111827; 
      }
      
      .cod-del-icon { 
        color: #6B7280; 
        margin-bottom: 4px; 
      }
      
      .cod-delivery-price { 
        font-size: 13px; 
        color: #6B7280; 
        font-weight: 600; 
      }
      
      .cod-delivery-option input:checked + .cod-delivery-card { 
        border-color: #FF5A1F; 
        background: #FFF9F7; 
      }
      
      .cod-delivery-option input:checked + .cod-delivery-card .cod-del-icon, 
      .cod-delivery-option input:checked + .cod-delivery-card .cod-delivery-price { 
        color: #FF5A1F; 
      }
      
      .cod-summary-section { 
        background: #F9FAFB; 
        border-radius: 16px; 
        padding: 20px; 
        border: 1px solid #E5E7EB; 
      }
      
      .cod-qty-row { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 20px; 
        padding-bottom: 20px; 
        border-bottom: 1px dashed #D1D5DB; 
      }
      
      .cod-qty-wrapper { 
        display: flex; 
        align-items: center; 
        background: #FFFFFF; 
        border: 1px solid #E5E7EB; 
        border-radius: 10px; 
        overflow: hidden; 
        height: 40px; 
      }
      
      .cod-qty-btn { 
        width: 40px; 
        height: 100%; 
        background: none; 
        border: none; 
        cursor: pointer; 
        font-size: 18px; 
        color: #4B5563; 
        transition: 0.2s; 
      }
      
      .cod-qty-btn:hover:not(:disabled) { 
        background: #F3F4F6; 
        color: #111827; 
      }
      
      .cod-qty-input { 
        width: 40px; 
        text-align: center; 
        border: none; 
        background: none; 
        font-size: 15px; 
        font-weight: 700; 
        color: #111827; 
        font-family: inherit; 
        pointer-events: none; 
      }
      
      .cod-price-line { 
        display: flex; 
        justify-content: space-between; 
        font-size: 14px; 
        color: #4B5563; 
        margin-bottom: 12px; 
        align-items: center; 
      }
      
      .cod-price-val { 
        font-weight: 600; 
        color: #111827; 
      }
      
      .cod-price-line.total { 
        margin-top: 16px; 
        padding-top: 16px; 
        border-top: 1px solid #E5E7EB; 
        font-size: 18px; 
      }
      
      .cod-price-line.total .cod-price-key { 
        color: #111827; 
        font-weight: 800; 
      }
      
      .cod-price-line.total .cod-price-val { 
        color: #FF5A1F; 
        font-weight: 800; 
      }
      
      .cod-submit-btn { 
        width: 100%; 
        height: 64px; 
        background: #FF5A1F; 
        color: #fff; 
        border: none; 
        border-radius: 14px; 
        cursor: pointer; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        transition: all 0.2s ease; 
        box-shadow: 0 8px 20px -6px rgba(255,90,31,0.4); 
      }
      
      .cod-submit-btn:hover:not(:disabled) { 
        transform: translateY(-2px); 
        background: #F0490E; 
        box-shadow: 0 12px 24px -6px rgba(255,90,31,0.5); 
      }
      
      .cod-submit-btn:disabled { 
        opacity: 0.7; 
        cursor: not-allowed; 
        transform: none; 
        box-shadow: none; 
      }
      
      .cod-btn-fr { 
        font-family: 'Plus Jakarta Sans', sans-serif; 
        font-size: 17px; 
        font-weight: 800; 
      }
      
      .cod-btn-ar { 
        font-family: 'Cairo', sans-serif; 
        font-size: 15px; 
        font-weight: 700; 
        margin-top: -2px; 
      }
      
      .cod-submit-btn.loading .cod-btn-fr, 
      .cod-submit-btn.loading .cod-btn-ar { 
        display: none; 
      }
      
      .cod-submit-btn.loading .cod-spinner { 
        display: block; 
      }
      
      .cod-spinner { 
        display: none; 
        width: 24px; 
        height: 24px; 
        border: 3px solid rgba(255,255,255,0.3); 
        border-top-color: #fff; 
        border-radius: 50%; 
        animation: codSpin 0.8s linear infinite; 
      }
      
      @keyframes codSpin { 
        to { transform: rotate(360deg); } 
      }
      
      .cod-footer { 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 6px; 
        margin-top: -4px; 
        padding-bottom: 24px; 
        font-size: 12px; 
        color: #6B7280; 
        font-weight: 500; 
        text-align: center; 
      }
      
      .cod-footer svg { 
        color: #059669; 
        flex-shrink: 0; 
      }
      
      .cod-success { 
        display: none; 
        flex-direction: column; 
        align-items: center; 
        text-align: center; 
        padding: 40px 24px; 
        background: #fff; 
      }
      
      .cod-success.visible { 
        display: flex; 
        animation: slideIn 0.4s ease forwards; 
      }
      
      @keyframes slideIn { 
        from { opacity: 0; transform: translateY(10px); } 
        to { opacity: 1; transform: translateY(0); } 
      }
      
      .cod-success-icon { 
        width: 72px; 
        height: 72px; 
        background: #D1FAE5; 
        color: #059669; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        margin-bottom: 20px; 
      }
      
      .cod-success-title { 
        font-size: 24px; 
        font-weight: 800; 
        color: #111827; 
        margin-bottom: 8px; 
      }
      
      .cod-success-desc { 
        font-size: 15px; 
        color: #6B7280; 
        line-height: 1.5; 
        margin-bottom: 24px; 
      }
      
      .cod-receipt-card { 
        background: #F9FAFB; 
        border: 1px dashed #D1D5DB; 
        border-radius: 16px; 
        padding: 20px; 
        width: 100%; 
        max-width: 360px; 
        text-align: left; 
      }
      
      .cod-receipt-row { 
        display: flex; 
        justify-content: space-between; 
        margin-bottom: 10px; 
        font-size: 14px; 
      }
      
      .cod-receipt-label { 
        color: #6B7280; 
      }
      
      .cod-receipt-val { 
        color: #111827; 
        font-weight: 600; 
        text-align: right; 
        max-width: 60%; 
        word-break: break-word; 
      }
      
      /* Sticky Button Styles */
      .cod-sticky-wrapper { 
        position: fixed; 
        bottom: -120px; 
        left: 0; 
        width: 100%; 
        padding: 12px 20px; 
        background: #ffffff; 
        box-shadow: 0 -10px 30px rgba(0,0,0,0.1); 
        z-index: 99999; 
        display: flex; 
        justify-content: center; 
        transition: bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
        border-top: 1px solid #E5E7EB; 
      }
      
      .cod-sticky-wrapper.visible { 
        bottom: 0; 
      }
      
      .cod-sticky-trigger { 
        width: 100%; 
        max-width: 400px; 
        height: 60px; 
        background: #FF5A1F; 
        color: #fff; 
        border: none; 
        border-radius: 14px; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        box-shadow: 0 4px 15px -4px rgba(255,90,31,0.4); 
        cursor: pointer; 
        transition: transform 0.2s ease; 
      }
      
      .cod-sticky-trigger:active { 
        transform: scale(0.98); 
      }
      
      @media (max-width: 480px) {
        #cod-form-root { 
          border-radius: 16px; 
          border-left: none; 
          border-right: none; 
          border-top: 1px solid #E5E7EB; 
        }
        .cod-row { 
          grid-template-columns: 1fr; 
          gap: 12px; 
        }
        .cod-header { 
          padding: 24px 20px 16px; 
        }
        .cod-body { 
          padding: 20px; 
          gap: 16px; 
        }
        .cod-sticky-wrapper { 
          padding: 12px 16px; 
          padding-bottom: max(12px, env(safe-area-inset-bottom)); 
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── HTML ── */
  function buildHTML() {
    return `
      <div class="cod-header">
        <div class="cod-trust-badges">
          <div class="cod-trust-badge ar-text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            الدفع عند الاستلام
          </div>
          <div class="cod-trust-badge ar-text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            توصيل 24-72 ساعة
          </div>
        </div>
        <div class="cod-title-wrapper">
          <h2 class="cod-title">Finaliser ma commande</h2>
          <h2 class="cod-title-ar ar-text">إتمام الطلب</h2>
        </div>
        <p class="cod-subtitle">${CONFIG.productTitle}</p>
      </div>

      <div class="cod-body" id="cod-body">

        <div class="cod-field-group" id="cod-variant-group" style="display:none;">
          <div class="cod-label-bilingual">
            <span class="cod-label-fr">Option / Variante *</span>
            <span class="cod-label-ar ar-text">الخيار / النوع *</span>
          </div>
          <select id="cod-variant-select" class="cod-select"></select>
        </div>

        <div class="cod-row">
          <div class="cod-field-group">
            <div class="cod-label-bilingual">
              <span class="cod-label-fr">Prénom *</span>
              <span class="cod-label-ar ar-text">الاسم *</span>
            </div>
            <input id="cod-firstname" class="cod-input" type="text" placeholder="Ex: Ahmed" autocomplete="given-name" />
            <span class="cod-error-msg" id="cod-firstname-err">
              <span>Prénom requis</span> 
              <span class="ar-text">يرجى إدخال الاسم</span>
            </span>
          </div>
          <div class="cod-field-group">
            <div class="cod-label-bilingual">
              <span class="cod-label-fr">Nom *</span>
              <span class="cod-label-ar ar-text">اللقب *</span>
            </div>
            <input id="cod-lastname" class="cod-input" type="text" placeholder="Ex: Benali" autocomplete="family-name" />
            <span class="cod-error-msg" id="cod-lastname-err">
              <span>Nom requis</span> 
              <span class="ar-text">يرجى إدخال اللقب</span>
            </span>
          </div>
        </div>

        <div class="cod-field-group">
          <div class="cod-label-bilingual">
            <span class="cod-label-fr">Téléphone *</span>
            <span class="cod-label-ar ar-text">رقم الهاتف *</span>
          </div>
          <input id="cod-phone" class="cod-input" type="tel" placeholder="05 XX XX XX XX" autocomplete="tel" maxlength="14" dir="ltr" />
          <span class="cod-error-msg" id="cod-phone-err">
            <span>Numéro invalide</span> 
            <span class="ar-text">رقم غير صالح</span>
          </span>
        </div>

        <div class="cod-field-group">
          <div class="cod-label-bilingual">
            <span class="cod-label-fr">Email <span class="cod-optional">(Facultatif)</span></span>
            <span class="cod-label-ar ar-text">البريد الإلكتروني <span class="cod-optional">(اختياري)</span></span>
          </div>
          <input id="cod-email" class="cod-input" type="email" placeholder="exemple@email.com" autocomplete="email" dir="ltr" />
          <span class="cod-error-msg" id="cod-email-err">Email invalide</span>
        </div>

        <div class="cod-row">
          <div class="cod-field-group">
            <div class="cod-label-bilingual">
              <span class="cod-label-fr">Wilaya *</span>
              <span class="cod-label-ar ar-text">الولاية *</span>
            </div>
            <select id="cod-wilaya" class="cod-select"></select>
            <span class="cod-error-msg" id="cod-wilaya-err">Sélectionnez une wilaya</span>
          </div>
          <div class="cod-field-group">
            <div class="cod-label-bilingual">
              <span class="cod-label-fr">Commune *</span>
              <span class="cod-label-ar ar-text">البلدية *</span>
            </div>
            <select id="cod-commune" class="cod-select"><option value="">Sélectionner</option></select>
            <span class="cod-error-msg" id="cod-commune-err">Sélectionnez une commune</span>
          </div>
        </div>

        <div class="cod-field-group">
          <div class="cod-label-bilingual">
            <span class="cod-label-fr">Livraison *</span>
            <span class="cod-label-ar ar-text">طريقة التوصيل *</span>
          </div>
          <div class="cod-delivery-grid">
            <label class="cod-delivery-option">
              <input type="radio" name="cod-delivery" value="home" checked />
              <div class="cod-delivery-card">
                <div class="cod-del-top">
                  <div class="cod-del-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </div>
                  Domicile / للمنزل
                </div>
                <div class="cod-delivery-price" id="cod-home-price">— DZD</div>
              </div>
            </label>
            <label class="cod-delivery-option">
              <input type="radio" name="cod-delivery" value="stopdesk" />
              <div class="cod-delivery-card">
                <div class="cod-del-top">
                  <div class="cod-del-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  </div>
                  StopDesk / للمكتب
                </div>
                <div class="cod-delivery-price" id="cod-stopdesk-price">— DZD</div>
              </div>
            </label>
          </div>
        </div>

        <div class="cod-summary-section">
          <div class="cod-qty-row">
            <div class="cod-label-bilingual" style="width: auto; gap: 8px;">
              <span class="cod-label-fr">Quantité</span>
              <span class="cod-label-ar ar-text">الكمية</span>
            </div>
            <div class="cod-qty-wrapper">
              <button class="cod-qty-btn" id="cod-qty-minus" type="button">−</button>
              <input class="cod-qty-input" id="cod-qty" type="text" value="1" readonly />
              <button class="cod-qty-btn" id="cod-qty-plus" type="button">+</button>
            </div>
          </div>
          
          <div class="cod-price-line">
            <div class="cod-label-bilingual">
              <span class="cod-label-fr">Produit</span>
              <span class="cod-label-ar ar-text">المنتج</span>
            </div>
            <span class="cod-price-val" id="cod-product-total">—</span>
          </div>
          
          <div class="cod-price-line">
            <div class="cod-label-bilingual">
              <span class="cod-label-fr">Livraison</span>
              <span class="cod-label-ar ar-text">التوصيل</span>
            </div>
            <span class="cod-price-val" id="cod-shipping-total">—</span>
          </div>
          
          <div class="cod-price-line total">
            <div class="cod-label-bilingual">
              <span class="cod-price-key">Total à Payer</span>
              <span class="cod-price-key ar-text">الإجمالي للدفع</span>
            </div>
            <span class="cod-price-val" id="cod-grand-total">—</span>
          </div>
        </div>

        <div style="position:absolute;left:-9999px;opacity:0;" aria-hidden="true">
          <input type="text" id="cod-honeypot" tabindex="-1" />
        </div>

        <button class="cod-submit-btn" id="cod-submit" type="button">
          <span class="cod-btn-fr">Confirmer ma commande</span>
          <span class="cod-btn-ar ar-text">تأكيد طلبي</span>
          <div class="cod-spinner"></div>
        </button>
      </div>

      <div class="cod-footer ar-text">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        <span>بياناتك آمنة. الدفع بعد استلام المنتج.</span>
      </div>

      <div class="cod-success" id="cod-success">
        <div class="cod-success-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="cod-success-title">Commande Réussie !</div>
        <div class="cod-success-title ar-text" style="font-size:20px; margin-bottom:16px;">تم تسجيل طلبك بنجاح</div>
        <div class="cod-success-desc">Merci pour votre confiance. Notre équipe vous appellera dans moins de 24h pour confirmer l'expédition.</div>
        
        <div class="cod-receipt-card">
          <div class="cod-receipt-row">
            <span class="cod-receipt-label">Numéro</span>
            <span class="cod-receipt-val" id="succ-order-id"></span>
          </div>
          <div class="cod-receipt-row">
            <span class="cod-receipt-label">Total</span>
            <span class="cod-receipt-val" style="color:#FF5A1F;font-weight:800;" id="succ-total"></span>
          </div>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────
     MID-FUNNEL EVENT TRACKING (Pixel + CAPI)
  ───────────────────────────────────────────── */
  var leadFired = false; 
  var initiateCheckoutFired = false;

  function getProductData() {
    return {
      content_ids: [String(CONFIG.variantId || "")], 
      content_type: "product",
      content_name: CONFIG.productTitle, 
      value: parseFloat((CONFIG.price / 260).toFixed(2)),
      currency: "USD", 
      num_items: state.qty,
    };
  }

  function sendCAPIEvent(eventName, eventId, customData, userData = {}) {
    const { fbp, fbc } = getFBCookies();
    
    let currentUrl = window.location.href;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) {
      currentUrl = canonical.href;
    }

    fetch(`${CONFIG.apiBase}/api/capi`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        event_name: eventName, 
        event_id: eventId, 
        event_source_url: currentUrl, 
        fbp: fbp, 
        fbc: fbc, 
        custom_data: customData, 
        user_data: userData 
      })
    }).catch(e => {});
  }

  function getDynamicUserData() {
    return {
      first_name: document.getElementById("cod-firstname")?.value.trim() || null,
      last_name: document.getElementById("cod-lastname")?.value.trim() || null,
      phone: document.getElementById("cod-phone")?.value.replace(/\s/g, "") || null,
      email: document.getElementById("cod-email")?.value.trim() || null,
      wilaya: document.getElementById("cod-wilaya")?.value || null,
      commune: document.getElementById("cod-commune")?.value || null,
    };
  }

  function fireLead() {
    if (leadFired || typeof fbq !== "function") return;
    leadFired = true;
    
    var eid = getSessionEventId("Lead");
    var pData = getProductData();
    
    fbq("track", "Lead", pData, { eventID: eid });
    sendCAPIEvent("Lead", eid, pData, getDynamicUserData());
  }

  // EARLY TRIGGER FOR INITIATE CHECKOUT
  function fireInitiateCheckout() {
    if (initiateCheckoutFired || typeof fbq !== "function") return;
    
    var fn = document.getElementById("cod-firstname")?.value.trim() || "";
    var ln = document.getElementById("cod-lastname")?.value.trim() || "";
    var ph = document.getElementById("cod-phone")?.value.replace(/\s/g, "") || "";
    
    // Trigger if they typed at least 2 chars of name OR 4 numbers of phone
    if (fn.length >= 2 || ln.length >= 2 || ph.length >= 4) {
      initiateCheckoutFired = true;
      var eid = getSessionEventId("InitiateCheckout");
      var pData = getProductData();
      
      fbq("track", "InitiateCheckout", pData, { eventID: eid });
      sendCAPIEvent("InitiateCheckout", eid, pData, getDynamicUserData());
    }
  }

  function getFBCookies() {
    const cookies = document.cookie.split(";").reduce((acc, c) => {
      const idx = c.indexOf("=");
      if (idx > -1) {
        acc[c.slice(0, idx).trim()] = c.slice(idx + 1).trim(); 
      }
      return acc;
    }, {});
    
    const fbp = cookies["_fbp"] || null; 
    let fbc = null;
    
    try { 
      const fbclid = new URLSearchParams(window.location.search).get("fbclid"); 
      if (fbclid) {
        fbc = "fb.1." + Date.now() + "." + fbclid; 
      }
    } catch(e) {}
    
    if (!fbc) {
      fbc = cookies["_fbc"] || null;
    }
    
    return { fbp, fbc };
  }

  var _sessionIds = {};
  function getSessionEventId(eventName) {
    if (!_sessionIds[eventName]) {
      _sessionIds[eventName] = eventName.toLowerCase() + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    }
    return _sessionIds[eventName];
  }

  function fireConversionEvents(orderId, total, variantId, eventId, email, phone, firstName, lastName) {
    const valueUSD  = parseFloat((total / 260).toFixed(2));
    const contentId = String(variantId || CONFIG.variantId || "");

    try {
      if (typeof fbq === "function") {
        let advancedMatching = {};
        if (email) advancedMatching.em = email.toLowerCase().trim();
        if (phone) advancedMatching.ph = phone.replace(/\s/g, "");
        if (firstName) advancedMatching.fn = firstName.toLowerCase().trim();
        if (lastName) advancedMatching.ln = lastName.toLowerCase().trim();
        
        fbq("track", "Purchase", {
          value: valueUSD, 
          currency: "USD", 
          content_ids: [contentId],
          content_type: "product", 
          content_name: CONFIG.productTitle, 
          num_items: state.qty, 
          order_id: orderId,
        }, { eventID: eventId });
      }
    } catch(e) { }

    try { 
      if (typeof gtag === "function") {
        gtag("event", "purchase", { 
          transaction_id: orderId, 
          value: valueUSD, 
          currency: "USD", 
          items: [{ 
            item_id: contentId, 
            item_name: CONFIG.productTitle, 
            price: parseFloat((CONFIG.price / 260).toFixed(2)), 
            quantity: state.qty 
          }] 
        }); 
      }
    } catch(e) { }
    
    try { 
      if (typeof ttq !== "undefined" && typeof ttq.track === "function") {
        ttq.track("PlaceAnOrder", { 
          value: valueUSD, 
          currency: "USD", 
          content_id: contentId, 
          content_type: "product", 
          content_name: CONFIG.productTitle, 
          quantity: state.qty, 
          order_id: orderId 
        }); 
      }
    } catch(e) { }
  }

  /* ── VARIANTS & COMMUNES ── */
  async function fetchShopifyVariants() {
    const match = window.location.pathname.match(/\/products\/([^/?#]+)/);
    if (!match) return;
    
    try {
      const res = await fetch(`/products/${match[1]}.js`);
      const data = await res.json();
      
      if (!data?.variants?.length) return;
      
      SHOPIFY_VARIANTS = data.variants;

      if (SHOPIFY_VARIANTS.length > 1 || SHOPIFY_VARIANTS[0].title !== "Default Title") {
        const select = document.getElementById("cod-variant-select");
        const group = document.getElementById("cod-variant-group");
        
        select.innerHTML = SHOPIFY_VARIANTS.map(v => 
          `<option value="${v.id}" ${!v.available ? "disabled" : ""}>${v.title} — ${(v.price/100).toLocaleString("fr-DZ")} ${CONFIG.currency}${!v.available ? " (Rupture)" : ""}</option>`
        ).join("");
        
        group.style.display = "flex";
        
        let currentId = new URLSearchParams(window.location.search).get("variant") || CONFIG.variantId;
        let vObj = SHOPIFY_VARIANTS.find(v => v.id == currentId);
        
        if (!vObj || !vObj.available) {
          currentId = (SHOPIFY_VARIANTS.find(v => v.available) || SHOPIFY_VARIANTS[0]).id;
        }
        
        select.value = currentId; 
        updateFormVariant(currentId);
        
        select.addEventListener("change", (e) => { 
          updateFormVariant(e.target.value); 
        });
        
      } else {
        updateFormVariant(SHOPIFY_VARIANTS[0].id);
      }
    } catch(e) {}
  }

  function updateFormVariant(variantIdStr) {
    const v = SHOPIFY_VARIANTS.find(v => v.id === parseInt(variantIdStr));
    if (v) { 
      CONFIG.variantId = v.id; 
      CONFIG.price = v.price / 100; 
      state.variantTitle = v.title; 
      calcAndRender(); 
      fetchStock(); 
    }
  }

  async function loadCommunes() {
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/communes`);
      const data = await resp.json();
      data.forEach(c => { 
        const w = c.wilaya_name_ascii; 
        if (!COMMUNES_BY_WILAYA[w]) COMMUNES_BY_WILAYA[w] = []; 
        COMMUNES_BY_WILAYA[w].push(c.commune_name_ascii); 
      });
    } catch(e) { 
      Object.keys(SHIPPING).forEach(w => { 
        COMMUNES_BY_WILAYA[w] = [w + " Centre"]; 
      }); 
    }
    
    const selW = document.getElementById("cod-wilaya");
    if (selW) {
      selW.innerHTML = Object.keys(SHIPPING).sort().map(w => 
        `<option value="${w}"${w===CONFIG.defaultWilaya?" selected":""}>${w}</option>`
      ).join("");
    }
    populateCommunes(state.wilaya);
  }

  function populateCommunes(wilaya) {
    const sel = document.getElementById("cod-commune");
    if (!sel) return;
    
    const list = (COMMUNES_BY_WILAYA[wilaya]||[]).slice().sort();
    sel.innerHTML = `<option value="">Sélectionner</option>` + list.map(c=>`<option value="${c}">${c}</option>`).join("");
    state.commune = "";
  }

  async function fetchStock() {
    if (!CONFIG.variantId) return;
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/stock?variant_id=${CONFIG.variantId}`);
      if (!resp.ok) return;
      const { inventory } = await resp.json();
      if (typeof inventory === "number" && inventory > 0) { 
        state.maxQty = inventory; 
        updateQtyBtns(); 
      }
    } catch(_) {}
  }

  function calcAndRender() {
    const pt = CONFIG.price * state.qty; 
    const sh = SHIPPING[state.wilaya]?.[state.deliveryType] ?? 400; 
    state.shippingCost = sh;
    
    const fmt = n => n.toLocaleString("fr-DZ") + " " + CONFIG.currency;
    
    document.getElementById("cod-product-total").textContent = fmt(pt);
    document.getElementById("cod-shipping-total").textContent = fmt(sh);
    document.getElementById("cod-grand-total").textContent = fmt(pt + sh);
    
    const w = SHIPPING[state.wilaya] || {stopdesk:400,home:550};
    document.getElementById("cod-home-price").textContent = fmt(w.home);
    document.getElementById("cod-stopdesk-price").textContent = fmt(w.stopdesk);
  }

  function validate() {
    let valid = true;
    
    const fn = document.getElementById("cod-firstname"); 
    const ln = document.getElementById("cod-lastname");
    const ph = document.getElementById("cod-phone"); 
    const em = document.getElementById("cod-email");
    const wi = document.getElementById("cod-wilaya"); 
    const co = document.getElementById("cod-commune");

    if (!fn?.value.trim() || fn.value.trim().length < 2) { 
      setError("cod-firstname", "cod-firstname-err", true); 
      valid = false; 
    } else {
      setError("cod-firstname", "cod-firstname-err", false);
    }
    
    if (!ln?.value.trim() || ln.value.trim().length < 2) { 
      setError("cod-lastname", "cod-lastname-err", true); 
      valid = false; 
    } else {
      setError("cod-lastname", "cod-lastname-err", false);
    }
    
    const rp = ph?.value.replace(/\s/g,"");
    if (!rp || !/^0[5-7]\d{8}$/.test(rp)) { 
      setError("cod-phone", "cod-phone-err", true); 
      valid = false; 
    } else {
      setError("cod-phone", "cod-phone-err", false);
    }
    
    const ev = em?.value.trim();
    if (ev && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev)) { 
      setError("cod-email", "cod-email-err", true); 
      valid = false; 
    } else {
      setError("cod-email", "cod-email-err", false);
    }
    
    if (!wi?.value) { 
      setError("cod-wilaya", "cod-wilaya-err", true); 
      valid = false; 
    } else {
      setError("cod-wilaya", "cod-wilaya-err", false);
    }
    
    if (!co?.value) { 
      setError("cod-commune", "cod-commune-err", true); 
      valid = false; 
    } else {
      setError("cod-commune", "cod-commune-err", false);
    }

    if (!valid) {
      const fe = document.querySelector('#cod-form-root .cod-error');
      if (fe) { 
        fe.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        fe.focus({ preventScroll: true }); 
      }
    }
    return valid;
  }

  function setError(iid, eid, show) {
    const i = document.getElementById(iid);
    const e = document.getElementById(eid);
    
    if(i) {
      show ? i.classList.add("cod-error") : i.classList.remove("cod-error");
    }
    if(e) {
      show ? e.classList.add("visible") : e.classList.remove("visible");
    }
  }

  async function handleSubmit() {
    if (state.submitting || state.submitted) return;
    if (!validate()) return;
    
    state.submitting = true;
    const btn = document.getElementById("cod-submit");
    if(btn) { 
      btn.classList.add("loading"); 
      btn.disabled = true; 
    }
    
    const first_name = document.getElementById("cod-firstname")?.value.trim();
    const last_name = document.getElementById("cod-lastname")?.value.trim();
    const phone = document.getElementById("cod-phone")?.value.replace(/\s/g,"");
    const email = document.getElementById("cod-email")?.value.trim().toLowerCase() || null;
    const address = document.getElementById("cod-address")?.value.trim();
    const communeVal = document.getElementById("cod-commune")?.value;
    const eventId = generateEventId();
    const { fbp, fbc } = getFBCookies();

    const payload = {
      variant_id: CONFIG.variantId, 
      quantity: state.qty,
      first_name: first_name, 
      last_name: last_name, 
      phone: phone, 
      email: email,
      wilaya: state.wilaya, 
      commune: communeVal,
      address: address || `${communeVal}, ${state.wilaya}`,
      delivery_type: state.deliveryType, 
      shipping_cost: state.shippingCost,
      product_price: CONFIG.price, 
      total: (CONFIG.price * state.qty) + state.shippingCost,
      currency: CONFIG.currency, 
      event_id: eventId, 
      fbp: fbp, 
      fbc: fbc,
      event_source_url: window.location.href,
      client_user_agent: navigator.userAgent || "",
    };
    
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/create-order`, {
        method: "POST", 
        headers: {"Content-Type":"application/json"}, 
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      
      if (!resp.ok) {
        throw new Error(data.error || "Order failed");
      }
      
      state.submitted = true;
      showSuccess(data.order_id || data.order?.name || "#COD-"+Date.now().toString().slice(-6), payload);
      hideStickyBarForever(); 
      
    } catch(err) {
      if(btn) {
        btn.classList.remove("loading"); 
        btn.disabled = false;
        const fr = btn.querySelector(".cod-btn-fr");
        if(fr) { 
          fr.textContent = "Erreur — Réessayer"; 
          setTimeout(() => { 
            if(fr) fr.textContent = "Confirmer ma commande"; 
          }, 3000); 
        }
      }
      state.submitting = false;
    }
  }

  function showSuccess(orderId, payload) {
    document.getElementById("cod-body").style.display = "none";
    document.querySelector(".cod-footer").style.display = "none";
    
    document.getElementById("succ-order-id").textContent = orderId;
    document.getElementById("succ-total").textContent = payload.total.toLocaleString("fr-DZ") + " " + CONFIG.currency;
    
    const success = document.getElementById("cod-success");
    if(success) { 
      success.classList.add("visible"); 
      setTimeout(() => {
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50); 
    }
    
    fireConversionEvents(orderId, payload.total, CONFIG.variantId, payload.event_id, payload.email, payload.phone, payload.first_name, payload.last_name);
  }

  function formatPhone(input) {
    let v = input.value.replace(/\D/g,"").slice(0,10);
    let f = "";
    for(let i=0; i<v.length; i++){ 
      if(i===2 || i===4 || i===6 || i===8) {
        f += " "; 
      }
      f += v[i]; 
    }
    input.value = f;
  }

  function bindEvents() {
    const ws = document.getElementById("cod-wilaya");
    if(ws) {
      ws.addEventListener("change", e => { 
        state.wilaya = e.target.value; 
        populateCommunes(state.wilaya); 
        calcAndRender(); 
      });
    }
    
    document.querySelectorAll("input[name='cod-delivery']").forEach(r => {
      r.addEventListener("change", e => { 
        state.deliveryType = e.target.value; 
        calcAndRender(); 
      });
    });
    
    const btnMinus = document.getElementById("cod-qty-minus");
    if (btnMinus) {
      btnMinus.addEventListener("click", () => { 
        if(state.qty > 1) { 
          state.qty--; 
          document.getElementById("cod-qty").value = state.qty; 
          calcAndRender(); 
          updateQtyBtns(); 
        }
      });
    }

    const btnPlus = document.getElementById("cod-qty-plus");
    if (btnPlus) {
      btnPlus.addEventListener("click", () => { 
        if(state.qty < state.maxQty) { 
          state.qty++; 
          document.getElementById("cod-qty").value = state.qty; 
          calcAndRender(); 
          updateQtyBtns(); 
        }
      });
    }
    
    const pi = document.getElementById("cod-phone"); 
    if(pi) {
      pi.addEventListener("input", () => formatPhone(pi));
    }
    
    const submitBtn = document.getElementById("cod-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", handleSubmit);
    }
    
    ["cod-firstname", "cod-lastname", "cod-phone", "cod-wilaya", "cod-commune", "cod-email"].forEach(id => {
      const el = document.getElementById(id);
      if(el) {
        el.addEventListener("input", () => { 
          el.classList.remove("cod-error"); 
          const e = document.getElementById(id+"-err"); 
          if(e) e.classList.remove("visible"); 
        });
      }
    });

    // EARLY TRACKING BINDS
    ["cod-firstname", "cod-lastname", "cod-phone", "cod-email"].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("focus", fireLead, { once: true });
        el.addEventListener("blur", fireInitiateCheckout); // Fires when they click out of a field
      }
    });
  }

  function updateQtyBtns() {
    const m = document.getElementById("cod-qty-minus");
    const p = document.getElementById("cod-qty-plus");
    if(m) m.disabled = state.qty <= 1; 
    if(p) p.disabled = state.qty >= state.maxQty;
  }

  /* ─────────────────────────────────────────────
     4. STICKY ACTION BUTTON LOGIC
  ───────────────────────────────────────────── */
  var atcFired = false;
  
  function initStickyBar() {
    const stickyBar = document.createElement("div"); 
    stickyBar.id = "cod-sticky-bar"; 
    stickyBar.className = "cod-sticky-wrapper";
    
    stickyBar.innerHTML = `
      <button class="cod-sticky-trigger" type="button">
        <span class="cod-btn-fr">Commander Maintenant</span>
        <span class="cod-btn-ar ar-text" style="font-size:14px; margin-top:-2px;">اطلب الآن</span>
      </button>
    `;
    
    document.body.appendChild(stickyBar);

    stickyBar.querySelector(".cod-sticky-trigger").addEventListener("click", () => {
      if (!atcFired && typeof fbq === "function") {
        atcFired = true;
        var eid = getSessionEventId("AddToCart"); 
        var pData = getProductData();
        fbq("track", "AddToCart", pData, { eventID: eid });
        sendCAPIEvent("AddToCart", eid, pData, getDynamicUserData());
      }
      
      const root = document.getElementById("cod-form-root");
      if (root) { 
        root.scrollIntoView({ behavior: "smooth", block: "start" }); 
        setTimeout(() => {
          const fn = document.getElementById("cod-firstname");
          if (fn) fn.focus({ preventScroll: true });
        }, 600); 
      }
    });

    const rootEl = document.getElementById("cod-form-root");
    if (rootEl && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (state.submitted) return; 
        entries.forEach(e => { 
          if (e.isIntersecting) {
            stickyBar.classList.remove("visible"); 
          } else {
            stickyBar.classList.add("visible"); 
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(rootEl);
    } else {
      setTimeout(() => { 
        if (!state.submitted) stickyBar.classList.add("visible"); 
      }, 2000);
    }
  }

  function hideStickyBarForever() { 
    const bar = document.getElementById("cod-sticky-bar");
    if (bar) bar.classList.remove("visible"); 
  }

  /* ─────────────────────────────────────────────
     5. BUILD UI
  ───────────────────────────────────────────── */
  function init() {
    injectStyles();
    
    let mount = document.getElementById("cod-form-mount") || document.querySelector("[data-cod-form]");
    if(!mount) {
      const bb = document.querySelector('[name="add"]') || document.querySelector(".product-form__submit") || document.querySelector(".btn-addtocart");
      if(bb) { 
        mount = document.createElement("div"); 
        bb.parentNode.insertBefore(mount, bb.nextSibling); 
      } else { 
        mount = document.createElement("div"); 
        document.body.appendChild(mount); 
      }
    }
    
    const root = document.createElement("div"); 
    root.id = "cod-form-root"; 
    root.innerHTML = buildHTML();
    mount.appendChild(root);
    
    calcAndRender(); 
    updateQtyBtns(); 
    loadCommunes();
    fetchShopifyVariants().then(() => fetchStock());
    bindEvents(); 
    initStickyBar();
  }

  if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
