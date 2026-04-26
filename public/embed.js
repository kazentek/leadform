/**
 * COD Lead Form System — Algeria
 * Premium Redesign v6 (Bilingual FR/AR, Nom+Prénom split, Improved CAPI matching)
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
     🚀 1. INSTANT FACEBOOK PIXEL INITIALIZATION
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
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
        n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];
        t=b.createElement(e);t.async=!0;t.src=v;
        s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
      }(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
      
      fbq("init", pixelId);
      console.log("[COD Pixel] ⚡ Pixel init confirmed:", pixelId);
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
    qty: 1, maxQty: 99,
    wilaya: CONFIG.defaultWilaya,
    commune: "",
    variantTitle: "Par défaut",
    deliveryType: "home",
    shippingCost: SHIPPING[CONFIG.defaultWilaya]?.home ?? 400,
    submitting: false, submitted: false,
  };

  /* ── CSS ── */
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');

      #cod-form-root {
        all: initial; display: block; width: 100%; max-width: 520px; margin: 0 auto;
        box-sizing: border-box; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased; background: #ffffff;
        border-radius: 20px; border: 1px solid #E5E7EB;
        box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); overflow: hidden;
      }
      #cod-form-root * { box-sizing: border-box; }
      .cod-header { padding: 28px 24px 20px; text-align: center; background: #ffffff; border-bottom: 1px solid #F3F4F6; }
      .cod-trust-badges { display: flex; justify-content: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
      .cod-trust-badge { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #059669; background: #ECFDF5; padding: 6px 10px; border-radius: 8px; }
      .cod-title { font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 6px 0; letter-spacing: -0.5px; }
      .cod-subtitle { font-size: 14px; color: #6B7280; margin: 0; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .cod-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
      .cod-field-group { display: flex; flex-direction: column; gap: 8px; }
      .cod-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      
      /* Bilingual label — FR left, AR right */
      .cod-label {
        display: flex; justify-content: space-between; align-items: center;
        font-size: 13px; font-weight: 700; color: #374151;
      }
      .cod-label-ar {
        font-family: 'Noto Sans Arabic', Arial, sans-serif;
        font-size: 13px; font-weight: 600; color: #6B7280;
        direction: rtl; letter-spacing: 0;
      }
      
      .cod-optional { font-size: 11px; font-weight: 500; color: #9CA3AF; margin-left: 4px; }
      .cod-optional-ar { font-family: 'Noto Sans Arabic', Arial, sans-serif; font-size: 11px; font-weight: 400; color: #9CA3AF; }
      .cod-input, .cod-select { width: 100%; height: 52px; padding: 0 16px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; font-size: 15px; font-family: inherit; font-weight: 500; color: #111827; outline: none; transition: all 0.2s ease; appearance: none; -webkit-appearance: none; }
      .cod-select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; background-size: 16px; cursor: pointer; padding-right: 40px; }
      .cod-input:hover, .cod-select:hover { border-color: #D1D5DB; }
      .cod-input:focus, .cod-select:focus { border-color: #FF5A1F; background: #FFFFFF; box-shadow: 0 0 0 4px rgba(255,90,31,0.1); }
      .cod-input::placeholder { color: #9CA3AF; font-weight: 400; }
      .cod-input.cod-error, .cod-select.cod-error { border-color: #EF4444; background: #FEF2F2; }
      .cod-error-msg { font-size: 12px; color: #EF4444; font-weight: 600; display: none; margin-top: -4px; }
      .cod-error-msg.visible { display: block; }
      .cod-delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .cod-delivery-option { position: relative; cursor: pointer; }
      .cod-delivery-option input { position: absolute; opacity: 0; pointer-events: none; }
      .cod-delivery-card { display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 16px; border: 2px solid #E5E7EB; border-radius: 16px; background: #ffffff; transition: all 0.2s ease; height: 100%; }
      .cod-del-top { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #111827; }
      .cod-del-icon { color: #6B7280; display: flex; }
      .cod-delivery-price { font-size: 13px; color: #6B7280; font-weight: 600; }
      .cod-delivery-option input:checked + .cod-delivery-card { border-color: #FF5A1F; background: #FFF9F7; }
      .cod-delivery-option input:checked + .cod-delivery-card .cod-del-icon { color: #FF5A1F; }
      .cod-delivery-option input:checked + .cod-delivery-card .cod-delivery-price { color: #FF5A1F; }
      .cod-summary-section { background: #F9FAFB; border-radius: 16px; padding: 20px; border: 1px solid #E5E7EB; }
      .cod-qty-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px dashed #D1D5DB; }
      .cod-qty-label { font-weight: 700; color: #374151; font-size: 14px; }
      .cod-qty-wrapper { display: flex; align-items: center; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden; height: 40px; }
      .cod-qty-btn { width: 40px; height: 100%; background: none; border: none; cursor: pointer; font-size: 18px; color: #4B5563; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
      .cod-qty-btn:hover:not(:disabled) { background: #F3F4F6; color: #111827; }
      .cod-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      .cod-qty-input { width: 40px; text-align: center; border: none; background: none; font-size: 15px; font-weight: 700; color: #111827; font-family: inherit; pointer-events: none; }
      .cod-price-line { display: flex; justify-content: space-between; font-size: 14px; color: #4B5563; margin-bottom: 12px; }
      .cod-price-line:last-child { margin-bottom: 0; }
      .cod-price-val { font-weight: 600; color: #111827; }
      .cod-price-line.total { margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 18px; }
      .cod-price-line.total .cod-price-key { color: #111827; font-weight: 800; }
      .cod-price-line.total .cod-price-val { color: #FF5A1F; font-weight: 800; }
      .cod-submit-btn { width: 100%; height: 60px; background: #FF5A1F; color: #fff; border: none; border-radius: 14px; font-family: inherit; font-size: 17px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s ease; box-shadow: 0 8px 20px -6px rgba(255,90,31,0.4); }
      .cod-submit-btn:hover:not(:disabled) { transform: translateY(-2px); background: #F0490E; box-shadow: 0 12px 24px -6px rgba(255,90,31,0.5); }
      .cod-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
      .cod-submit-btn.loading .cod-btn-text { display: none; }
      .cod-btn-text { display: flex; flex-direction: column; align-items: center; gap: 2px; }
      .cod-submit-fr { font-size: 17px; font-weight: 800; line-height: 1.2; }
      .cod-submit-ar { font-family: 'Noto Sans Arabic', Arial, sans-serif; font-size: 12px; font-weight: 600; opacity: 0.88; direction: rtl; line-height: 1.3; }
      .cod-submit-btn.loading .cod-spinner { display: block; }
      .cod-spinner { display: none; width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: codSpin 0.8s linear infinite; }
      @keyframes codSpin { to { transform: rotate(360deg); } }
      .cod-footer { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: -4px; padding-bottom: 24px; font-size: 12px; color: #6B7280; font-weight: 500; text-align: center; }
      .cod-footer svg { color: #059669; flex-shrink: 0; }
      .cod-terms-text { font-size: 11px; color: #9CA3AF; text-align: center; margin-top: -8px; font-weight: 500; }
      .cod-urgency { font-size: 13px; color: #EF4444; font-weight: 700; text-align: center; padding: 8px 12px; background: #FEF2F2; border-radius: 8px; border: 1px dashed #F87171; animation: codPulse 2s infinite; }
      @keyframes codPulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
      .cod-success { display: none; flex-direction: column; align-items: center; text-align: center; padding: 40px 24px; background: #fff; }
      .cod-success.visible { display: flex; animation: slideIn 0.4s ease forwards; }
      @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .cod-success-icon { width: 72px; height: 72px; background: #D1FAE5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
      .cod-success-title { font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 8px; }
      .cod-success-desc { font-size: 15px; color: #6B7280; line-height: 1.5; margin-bottom: 24px; }
      .cod-receipt-card { background: #F9FAFB; border: 1px dashed #D1D5DB; border-radius: 16px; padding: 20px; width: 100%; max-width: 360px; text-align: left; }
      .cod-receipt-title { font-size: 13px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; border-bottom: 1px solid #E5E7EB; padding-bottom: 10px; text-align: center; }
      .cod-receipt-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
      .cod-receipt-label { color: #6B7280; }
      .cod-receipt-val { color: #111827; font-weight: 600; text-align: right; max-width: 60%; word-break: break-word; }
      .cod-receipt-total { display: flex; justify-content: space-between; border-top: 1px solid #E5E7EB; margin-top: 12px; padding-top: 12px; font-size: 16px; font-weight: 800; color: #111827; }
      .cod-receipt-total .cod-receipt-val { color: #FF5A1F; }
      
      /* Sticky Button Styles */
      .cod-sticky-wrapper { position: fixed; bottom: -100px; left: 0; width: 100%; padding: 12px 20px; background: transparent; z-index: 99999; display: flex; justify-content: center; transition: bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1); font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
      .cod-sticky-wrapper.visible { bottom: 0; }
      .cod-sticky-trigger {
        width: 100%; max-width: 400px; min-height: 60px;
        background: rgba(255, 90, 31, 0.60);
        backdrop-filter: blur(7px) saturate(1.3);
        -webkit-backdrop-filter: blur(5px) saturate(1.3);
        color: #fff; border: none; border-radius: 14px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 2px; box-shadow: 0 4px 20px -4px rgba(255,90,31,0.35), 0 1px 0 rgba(255,255,255,0.15) inset;
        cursor: pointer; transition: transform 0.2s ease, background 0.2s ease; font-family: inherit;
        padding: 10px 20px;
      }
      .cod-sticky-trigger:hover { background: rgba(255, 90, 31, 0.92); }
      .cod-sticky-trigger:active { transform: scale(0.98); }
      .cod-sticky-fr { font-size: 16px; font-weight: 800; line-height: 1.2; }
      .cod-sticky-ar { font-family: 'Noto Sans Arabic', Arial, sans-serif; font-size: 13px; font-weight: 600; line-height: 1.3; opacity: 0.92; direction: rtl; }
      
      /* Post-order email capture */
      .cod-email-capture { margin-top: 20px; width: 100%; max-width: 360px; background: #F9FAFB; border: 1px dashed #D1D5DB; border-radius: 16px; padding: 18px 20px; text-align: center; animation: slideIn 0.4s ease forwards; }
      .cod-email-capture-label { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 4px; }
      .cod-email-capture-sub { font-size: 12px; color: #9CA3AF; font-weight: 500; margin-bottom: 14px; }
      .cod-email-capture-row { display: flex; gap: 8px; }
      .cod-email-capture-input { flex: 1; height: 44px; padding: 0 14px; background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; font-size: 14px; font-family: inherit; color: #111827; outline: none; transition: border-color 0.2s; }
      .cod-email-capture-input:focus { border-color: #FF5A1F; box-shadow: 0 0 0 3px rgba(255,90,31,0.08); }
      .cod-email-capture-input.cod-error { border-color: #EF4444; background: #FEF2F2; }
      .cod-email-capture-btn { height: 44px; padding: 0 16px; background: #111827; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; white-space: nowrap; transition: background 0.2s; flex-shrink: 0; }
      .cod-email-capture-btn:hover:not(:disabled) { background: #1F2937; }
      .cod-email-capture-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .cod-email-capture-done { display: none; align-items: center; justify-content: center; gap: 8px; font-size: 13px; font-weight: 700; color: #059669; padding: 8px 0; }
      .cod-email-capture-done.visible { display: flex; }
      .cod-email-capture-done svg { flex-shrink: 0; }

      @media (max-width: 480px) {
        #cod-form-root { border-radius: 16px; border-left: none; border-right: none; border-top: 1px solid #E5E7EB; }
        .cod-row { grid-template-columns: 1fr; gap: 12px; }
        .cod-delivery-grid { grid-template-columns: 1fr; }
        .cod-header { padding: 24px 20px 16px; }
        .cod-body { padding: 20px; gap: 16px; }
        .cod-sticky-wrapper { padding: 10px 16px; padding-bottom: max(10px, env(safe-area-inset-bottom)); }
        .cod-email-capture-row { flex-direction: column; }
        .cod-email-capture-btn { width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── HTML ── */
  function buildHTML() {
    return `
      <div class="cod-header">
        <div class="cod-trust-badges">
          <div class="cod-trust-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Paiement à la livraison
          </div>
          <div class="cod-trust-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            Livraison 24-72h
          </div>
        </div>
        <h2 class="cod-title">Finaliser ma commande</h2>
        <p class="cod-subtitle">${CONFIG.productTitle}</p>
      </div>

      <div class="cod-body" id="cod-body">

        <div class="cod-field-group" id="cod-variant-group" style="display:none;">
          <label class="cod-label">
            <span>Option / Variante *</span>
            <span class="cod-label-ar">الخيار / الإصدار</span>
          </label>
          <select id="cod-variant-select" class="cod-select"></select>
        </div>

        <!-- Nom Complet — single field -->
        <div class="cod-field-group">
          <label class="cod-label">
            <span>Nom Complet *</span>
            <span class="cod-label-ar">الاسم الكامل</span>
          </label>
          <input id="cod-fullname" class="cod-input" type="text" placeholder="Ex: Ahmed Benali" autocomplete="name" />
          <span class="cod-error-msg" id="cod-fullname-err">Entrez votre nom complet</span>
        </div>

        <div class="cod-field-group">
          <label class="cod-label">
            <span>Numéro de Téléphone *</span>
            <span class="cod-label-ar">رقم الهاتف</span>
          </label>
          <input id="cod-phone" class="cod-input" type="tel" placeholder="05 XX XX XX XX" autocomplete="tel" maxlength="14" dir="ltr" />
          <span class="cod-error-msg" id="cod-phone-err">Numéro invalide (ex: 0551 23 45 67)</span>
        </div>

        <div class="cod-row">
          <div class="cod-field-group">
            <label class="cod-label">
              <span>Wilaya *</span>
              <span class="cod-label-ar">الولاية</span>
            </label>
            <select id="cod-wilaya" class="cod-select"></select>
            <span class="cod-error-msg" id="cod-wilaya-err">Sélectionnez une wilaya</span>
          </div>
          <div class="cod-field-group">
            <label class="cod-label">
              <span>Commune *</span>
              <span class="cod-label-ar">البلدية</span>
            </label>
            <select id="cod-commune" class="cod-select"><option value="">Sélectionner</option></select>
            <span class="cod-error-msg" id="cod-commune-err">Sélectionnez une commune</span>
          </div>
        </div>

        <div class="cod-field-group">
          <label class="cod-label">
            <span>Mode de Livraison *</span>
            <span class="cod-label-ar">طريقة التوصيل</span>
          </label>
          <div class="cod-delivery-grid">
            <label class="cod-delivery-option">
              <input type="radio" name="cod-delivery" value="home" checked />
              <div class="cod-delivery-card">
                <div class="cod-del-top">
                  <div class="cod-del-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
                  Domicile
                </div>
                <div class="cod-delivery-price" id="cod-home-price">— DZD</div>
              </div>
            </label>
            <label class="cod-delivery-option">
              <input type="radio" name="cod-delivery" value="stopdesk" />
              <div class="cod-delivery-card">
                <div class="cod-del-top">
                  <div class="cod-del-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></div>
                  Bureau StopDesk
                </div>
                <div class="cod-delivery-price" id="cod-stopdesk-price">— DZD</div>
              </div>
            </label>
          </div>
        </div>


        <div class="cod-summary-section">
          <div class="cod-qty-row">
            <span class="cod-qty-label">Quantité / الكمية</span>
            <div class="cod-qty-wrapper">
              <button class="cod-qty-btn" id="cod-qty-minus" type="button">−</button>
              <input class="cod-qty-input" id="cod-qty" type="text" value="1" readonly />
              <button class="cod-qty-btn" id="cod-qty-plus" type="button">+</button>
            </div>
          </div>
          <div class="cod-price-line">
            <span class="cod-price-key">Sous-total Produit</span>
            <span class="cod-price-val" id="cod-product-total">—</span>
          </div>
          <div class="cod-price-line">
            <span class="cod-price-key">Frais de Livraison</span>
            <span class="cod-price-val" id="cod-shipping-total">—</span>
          </div>
          <div class="cod-price-line total">
            <span class="cod-price-key">Total à Payer</span>
            <span class="cod-price-val" id="cod-grand-total">—</span>
          </div>
        </div>

        <div id="cod-urgency-msg" class="cod-urgency" style="display:none;"></div>

        <!-- Honeypot — hidden from humans, bots fill it -->
        <div style="position:absolute;left:-9999px;opacity:0;pointer-events:none;" aria-hidden="true">
          <input type="text" name="website" id="cod-honeypot" tabindex="-1" autocomplete="off" />
        </div>

        <button class="cod-submit-btn" id="cod-submit" type="button">
          <span class="cod-btn-text">
            <span class="cod-submit-fr">Confirmer ma commande</span>
            <span class="cod-submit-ar" id="cod-submit-ar"></span>
          </span>
          <div class="cod-spinner"></div>
        </button>

        <div class="cod-terms-text">En passant commande, vous acceptez nos conditions générales de vente.</div>
      </div>

      <div class="cod-footer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        <span>Vos données sont sécurisées. Paiement à la réception.</span>
      </div>

      <div class="cod-success" id="cod-success">
        <div class="cod-success-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="cod-success-title">Commande Réussie !</div>
        <div class="cod-success-desc">Merci pour votre confiance. Notre équipe vous appellera dans moins de 24h pour confirmer l'expédition.</div>
        <div class="cod-receipt-card">
          <div class="cod-receipt-title">Reçu de commande</div>
          <div class="cod-receipt-row">
            <span class="cod-receipt-label">Numéro</span>
            <span class="cod-receipt-val" id="succ-order-id">#COD-000000</span>
          </div>
          <div class="cod-receipt-row">
            <span class="cod-receipt-label">Variante</span>
            <span class="cod-receipt-val" id="succ-variant">—</span>
          </div>
          <div class="cod-receipt-row">
            <span class="cod-receipt-label">Quantité</span>
            <span class="cod-receipt-val" id="succ-qty">1</span>
          </div>
          <div class="cod-receipt-row">
            <span class="cod-receipt-label">Livraison</span>
            <span class="cod-receipt-val" id="succ-del-type">Domicile</span>
          </div>
          <div class="cod-receipt-row">
            <span class="cod-receipt-label">Destination</span>
            <span class="cod-receipt-val" id="succ-location">—</span>
          </div>
          <div class="cod-receipt-total">
            <span class="cod-receipt-label">Total</span>
            <span class="cod-receipt-val" id="succ-total">—</span>
          </div>
        </div>

        <!-- Post-order optional email capture -->
        <div class="cod-email-capture" id="cod-email-capture">
          <div class="cod-email-capture-label">📬 Recevoir des mises à jour ?</div>
          <div class="cod-email-capture-sub">Suivez votre commande par email — facultatif</div>
          <div class="cod-email-capture-row">
            <input id="cod-post-email" class="cod-email-capture-input" type="email" placeholder="exemple@email.com" dir="ltr" autocomplete="email" />
            <button id="cod-post-email-btn" class="cod-email-capture-btn" type="button">Confirmer</button>
          </div>
          <div class="cod-email-capture-done" id="cod-email-capture-done">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Email enregistré, merci !
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

  function sendCAPIEvent(eventName, eventId, customData, userData) {
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
        user_data: userData || {}
      })
    }).catch(e => console.error(`[CAPI] Frontend Error for ${eventName}`, e));
  }

  function fireLead() {
    if (leadFired) return;
    if (typeof fbq !== "function") return;
    leadFired = true;
    
    var eid = getSessionEventId("Lead");
    var productData = getProductData();
    
    fbq("track", "Lead", productData, { eventID: eid });
    sendCAPIEvent("Lead", eid, productData);
    
    console.log("[COD Pixel] Lead fired Browser + CAPI ✅ | eventID:", eid);
  }

  function fireInitiateCheckout() {
    if (initiateCheckoutFired) return;
    if (typeof fbq !== "function") return;
    
    var fullnameEl  = document.getElementById("cod-fullname");
    var phoneEl     = document.getElementById("cod-phone");

    // Require fullname (2+ chars) AND valid phone
    var fullnameOk = fullnameEl && fullnameEl.value.trim().length >= 2;
    var rawPhone   = normalizePhoneDigits(phoneEl ? phoneEl.value : "");
    var phoneOk    = /^0[5-7]\d{8}$/.test(rawPhone);

    if (!fullnameOk || !phoneOk) return;
    initiateCheckoutFired = true;
    
    var eid = getSessionEventId("InitiateCheckout");
    var productData = getProductData();
    
    // Build user_data from fullname + phone
    var userData = {};
    var fullname = fullnameEl.value.trim();
    var parts = fullname.split(/\s+/);
    if (parts[0]) userData.fn = parts[0];
    if (parts.length > 1) userData.ln = parts.slice(1).join(" ");
    userData.phone = rawPhone;

    fbq("track", "InitiateCheckout", productData, { eventID: eid });
    sendCAPIEvent("InitiateCheckout", eid, productData, userData);
    
    console.log("[COD Pixel] InitiateCheckout fired Browser + CAPI ✅ | eventID:", eid);
  }

  /* ─────────────────────────────────────────────
     DATA CAPTURE FOR CAPI & OTHER PIXELS
  ───────────────────────────────────────────── */
  function getFBCookies() {
    const cookies = document.cookie.split(";").reduce((acc, c) => {
      const idx = c.indexOf("=");
      if (idx > -1) acc[c.slice(0, idx).trim()] = c.slice(idx + 1).trim();
      return acc;
    }, {});

    const fbp = cookies["_fbp"] || null;
    let fbc = null;
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get("fbclid");
      if (fbclid) {
        fbc = "fb.1." + Date.now() + "." + fbclid;
      }
    } catch(e) {}

    if (!fbc) fbc = cookies["_fbc"] || null;
    
    return { fbp, fbc };
  }

  function generateEventId() {
    return "cod_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  }

  var _sessionIds = {};
  function getSessionEventId(eventName) {
    if (!_sessionIds[eventName]) {
      _sessionIds[eventName] = eventName.toLowerCase() + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    }
    return _sessionIds[eventName];
  }

  /* ─────────────────────────────────────────────
     PURCHASE CONVERSION EVENTS (Fired on Submit)
  ───────────────────────────────────────────── */
  function fireConversionEvents(orderId, total, variantId, eventId, email, phone) {
    const valueUSD  = parseFloat((total / 260).toFixed(2));
    const valueDZD  = parseFloat(total);
    const contentId = String(variantId || CONFIG.variantId || "");

    try {
      if (typeof fbq === "function") {
        let advancedMatching = {};
        if (email) advancedMatching.em = email.toLowerCase().trim();
        if (phone) advancedMatching.ph = phone.replace(/\s/g, "");

        fbq("track", "Purchase", {
          value: valueUSD,
          currency: "USD",
          content_ids: [contentId],
          content_type: "product",
          content_name: CONFIG.productTitle,
          num_items: state.qty,
          order_id: orderId,
        }, { eventID: eventId });
        console.log("[COD Pixel] Purchase fired ✅ ($" + valueUSD + ")");
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
            quantity: state.qty,
          }],
        });
      }
    } catch(e) { }

    try {
      if (typeof ttq !== "undefined" && typeof ttq.track === "function") {
        ttq.track("PlaceAnOrder", {
          value: valueUSD, currency: "USD",
          content_id: contentId, content_type: "product",
          content_name: CONFIG.productTitle,
          quantity: state.qty, order_id: orderId,
        });
      }
    } catch(e) { }

    try {
      if (typeof snaptr === "function") {
        snaptr("track", "PURCHASE", {
          price: valueUSD, currency: "USD",
          transaction_id: orderId, item_ids: [contentId],
          number_items: state.qty,
        });
      }
    } catch(e) { }

    try {
      if (window.Shopify && window.Shopify.analytics && typeof window.Shopify.analytics.publish === "function") {
        window.Shopify.analytics.publish("checkout_completed", {
          order_id: orderId, total_price: valueDZD, currency: "DZD",
        });
      }
    } catch(e) { }

    try {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: orderId, value: valueUSD, currency: "USD",
            items: [{
              item_id: contentId, item_name: CONFIG.productTitle,
              price: parseFloat((CONFIG.price / 260).toFixed(2)),
              quantity: state.qty,
            }],
          },
        });
      }
    } catch(e) { }
  }

  /* ── VARIANTS ── */
  async function fetchShopifyVariants() {
    const match = window.location.pathname.match(/\/products\/([^/?#]+)/);
    if (!match) return;
    try {
      const res = await fetch(`/products/${match[1]}.js`);
      const productData = await res.json();
      if (!productData?.variants?.length) return;
      SHOPIFY_VARIANTS = productData.variants;

      if (SHOPIFY_VARIANTS.length > 1 || SHOPIFY_VARIANTS[0].title !== "Default Title") {
        const select = document.getElementById("cod-variant-select");
        const group = document.getElementById("cod-variant-group");
        
        select.innerHTML = SHOPIFY_VARIANTS.map(v =>
          `<option value="${v.id}" ${!v.available ? "disabled" : ""}>${v.title} — ${(v.price/100).toLocaleString("fr-DZ")} ${CONFIG.currency}${!v.available ? " (Rupture)" : ""}</option>`
        ).join("");
        
        group.style.display = "flex";
        
        const urlParams = new URLSearchParams(window.location.search);
        let currentId = urlParams.get("variant") || CONFIG.variantId;
        
        let vObj = SHOPIFY_VARIANTS.find(v => v.id == currentId);
        if (!vObj || !vObj.available) {
          const firstAvail = SHOPIFY_VARIANTS.find(v => v.available);
          currentId = firstAvail ? firstAvail.id : SHOPIFY_VARIANTS[0].id;
        }

        select.value = currentId;
        updateFormVariant(currentId);
        
        select.addEventListener("change", (e) => {
          updateFormVariant(e.target.value);
          const url = new URL(window.location.href);
          url.searchParams.set("variant", e.target.value);
          window.history.replaceState({}, "", url);
        });
        
        let lastUrl = new URLSearchParams(window.location.search).get("variant");
        setInterval(() => {
          const cur = new URLSearchParams(window.location.search).get("variant");
          if (cur && cur !== lastUrl) { lastUrl = cur; if (select.value !== cur) { select.value = cur; updateFormVariant(cur); } }
        }, 400);
      } else {
        updateFormVariant(SHOPIFY_VARIANTS[0].id);
      }
    } catch(e) { console.log("[COD] Could not fetch variants:", e); }
  }

  function updateFormVariant(variantIdStr) {
    const v = SHOPIFY_VARIANTS.find(v => v.id === parseInt(variantIdStr));
    if (v) { 
      CONFIG.variantId = v.id; 
      CONFIG.price = v.price / 100; 
      state.variantTitle = v.title; 
      calcAndRender(); 
      fetchStock(); 
      
      const btn = document.getElementById("cod-submit");
      if (btn) {
        const txt = btn.querySelector(".cod-btn-text");
        if (!v.available) {
          btn.disabled = true;
          const frSpan = btn.querySelector(".cod-submit-fr");
          if (frSpan) frSpan.textContent = "Rupture de stock";
          else if (txt) txt.textContent = "Rupture de stock";
        } else {
          btn.disabled = false;
          const frSpan = btn.querySelector(".cod-submit-fr");
          if (frSpan) frSpan.textContent = "Confirmer ma commande";
          else if (txt) txt.textContent = "Confirmer ma commande";
        }
      }
    }
  }

  /* ── COMMUNES ── */
  async function loadCommunes() {
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/communes`);
      if (!resp.ok) throw new Error("fetch failed");
      const data = await resp.json();
      data.forEach(c => {
        const w = c.wilaya_name_ascii;
        if (!COMMUNES_BY_WILAYA[w]) COMMUNES_BY_WILAYA[w] = [];
        COMMUNES_BY_WILAYA[w].push(c.commune_name_ascii);
      });
    } catch(e) { Object.keys(SHIPPING).forEach(w => { COMMUNES_BY_WILAYA[w] = [w + " Centre"]; }); }
    populateWilayas();
    populateCommunes(state.wilaya);
  }

  function populateWilayas() {
    const sel = document.getElementById("cod-wilaya");
    if (!sel) return;
    sel.innerHTML = Object.keys(SHIPPING).sort().map(w => `<option value="${w}"${w===CONFIG.defaultWilaya?" selected":""}>${w}</option>`).join("");
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
    const urgencyEl = document.getElementById("cod-urgency-msg");
    if (urgencyEl) urgencyEl.style.display = "none";

    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/stock?variant_id=${CONFIG.variantId}`);
      if (!resp.ok) return;
      const { inventory } = await resp.json();
      
      if (typeof inventory === "number" && inventory > 0) { 
        state.maxQty = inventory; 
        updateQtyBtns(); 
        
        if (inventory === 1 && urgencyEl) {
          urgencyEl.textContent = "🔥 Plus qu'1 seul article disponible !";
          urgencyEl.style.display = "block";
        } else if (inventory === 2 && urgencyEl) {
          urgencyEl.textContent = "🔥 Plus que 2 articles disponibles !";
          urgencyEl.style.display = "block";
        }
      }
    } catch(_) {}
  }

  function calcAndRender() {
    const pt = CONFIG.price * state.qty;
    const sh = SHIPPING[state.wilaya]?.[state.deliveryType] ?? 400;
    state.shippingCost = sh;
    const fmt = n => n.toLocaleString("fr-DZ") + " " + CONFIG.currency;
    setEl("cod-product-total", fmt(pt));
    setEl("cod-shipping-total", fmt(sh));
    setEl("cod-grand-total", fmt(pt + sh));
    const w = SHIPPING[state.wilaya] || {stopdesk:400,home:550};
    setEl("cod-home-price", fmt(w.home));
    setEl("cod-stopdesk-price", fmt(w.stopdesk));
  }

  function setEl(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

  function validate() {
    let valid = true;
    const fullname  = document.getElementById("cod-fullname");
    const phone     = document.getElementById("cod-phone");
    const wilaya    = document.getElementById("cod-wilaya");
    const commune   = document.getElementById("cod-commune");
    
    if (SHOPIFY_VARIANTS.length > 0) {
      const v = SHOPIFY_VARIANTS.find(v => v.id === CONFIG.variantId);
      if (v && !v.available) return false;
    }

    if (!fullname?.value.trim() || fullname.value.trim().length < 2) {
      setError("cod-fullname", "cod-fullname-err", true); valid = false;
    } else { setError("cod-fullname", "cod-fullname-err", false); }
    
    const rp = normalizePhoneDigits(phone?.value || "");
    if (!rp || !/^0[5-7]\d{8}$/.test(rp)) {
      setError("cod-phone", "cod-phone-err", true); valid = false;
    } else { setError("cod-phone", "cod-phone-err", false); }

    if (!wilaya?.value) {
      setError("cod-wilaya", "cod-wilaya-err", true); valid = false;
    } else { setError("cod-wilaya", "cod-wilaya-err", false); }

    if (!commune?.value) {
      setError("cod-commune", "cod-commune-err", true); valid = false;
    } else { setError("cod-commune", "cod-commune-err", false); }
    
    if (!valid) {
      const firstError = document.querySelector('#cod-form-root .cod-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus({ preventScroll: true });
      }
    }

    return valid;
  }

  function setError(iid, eid, show) {
    const i=document.getElementById(iid), e=document.getElementById(eid);
    if(i) show?i.classList.add("cod-error"):i.classList.remove("cod-error");
    if(e) show?e.classList.add("visible"):e.classList.remove("visible");
  }

  async function handleSubmit() {
    if (state.submitting||state.submitted) return;
    if (!validate()) return;
    state.submitting = true;
    const btn = document.getElementById("cod-submit");
    if(btn) { btn.classList.add("loading"); btn.disabled=true; }
    
    const fullnameVal  = document.getElementById("cod-fullname")?.value.trim() || "";
    const nameParts    = fullnameVal.trim().split(/\s+/);
    const firstNameVal = nameParts[0] || fullnameVal;
    const lastNameVal  = nameParts.slice(1).join(" ") || ".";
    const phone        = normalizePhoneDigits(document.getElementById("cod-phone")?.value || "");
    const communeVal   = document.getElementById("cod-commune")?.value;
    const eventId      = generateEventId();
    const { fbp, fbc } = getFBCookies();

    const payload = {
      variant_id:    CONFIG.variantId,
      quantity:      state.qty,
      first_name:    firstNameVal,
      last_name:     lastNameVal,
      customer_name: fullnameVal,
      phone,
      wilaya: state.wilaya, commune: communeVal,
      address: `${communeVal}, ${state.wilaya}`,
      delivery_type: state.deliveryType,
      shipping_cost: state.shippingCost,
      product_price: CONFIG.price,
      total: (CONFIG.price * state.qty) + state.shippingCost,
      currency: CONFIG.currency,
      event_id: eventId,
      fbp, fbc,
      event_source_url: window.location.href,
      product_title: CONFIG.productTitle || "",
      website: document.getElementById("cod-honeypot")?.value || "",
      client_user_agent: navigator.userAgent || "",
    };
    
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/create-order`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error||"Order failed");
      state.submitted = true;
      showSuccess(data.order_id||data.order?.name||"#COD-"+Date.now().toString().slice(-6), payload);
      hideStickyBarForever();
    } catch(err) {
      if(btn) {
        btn.classList.remove("loading"); btn.disabled=false;
        const t=btn.querySelector(".cod-btn-text");
        if(t) {
          const frSpan = btn.querySelector(".cod-submit-fr");
          if (frSpan) {
            frSpan.textContent = "Erreur — Réessayer";
            setTimeout(() => { frSpan.textContent = "Confirmer ma commande"; }, 3000);
          } else {
            t.textContent = "Erreur — Réessayer";
            setTimeout(() => { t.textContent = "Confirmer ma commande"; }, 3000);
          }
        }
      }
      state.submitting=false;
    }
  }

  /* ─────────────────────────────────────────────
     POST-ORDER EMAIL CAPTURE
  ───────────────────────────────────────────── */
  function initEmailCapture(orderId, phone) {
    const btn   = document.getElementById("cod-post-email-btn");
    const input = document.getElementById("cod-post-email");
    if (!btn || !input) return;

    btn.addEventListener("click", async function () {
      const email = input.value.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        input.classList.add("cod-error");
        input.focus();
        setTimeout(() => input.classList.remove("cod-error"), 2000);
        return;
      }

      btn.disabled = true;
      btn.textContent = "...";

      try {
        await fetch(`${CONFIG.apiBase}/api/update-customer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, order_name: orderId, phone }),
        });
      } catch(_) {}

      // Show done state regardless of API result — UX stays positive
      const row  = document.querySelector(".cod-email-capture-row");
      const done = document.getElementById("cod-email-capture-done");
      if (row)  row.style.display  = "none";
      if (done) done.classList.add("visible");

      console.log("[COD] Post-order email captured ✅");
    });

    // Also submit on Enter key
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") btn.click();
    });
  }

  function showSuccess(orderId, payload) {
    const body    = document.getElementById("cod-body");
    const footer  = document.querySelector(".cod-footer");
    const success = document.getElementById("cod-success");
    if(body) body.style.display="none";
    if(footer) footer.style.display="none";

    setEl("succ-order-id", orderId);
    setEl("succ-variant", state.variantTitle !== "Default Title" ? state.variantTitle : "Standard");
    setEl("succ-qty", state.qty + "x");
    setEl("succ-del-type", state.deliveryType === "home" ? "Domicile" : "StopDesk");
    setEl("succ-location", `${payload.commune}, ${payload.wilaya}`);
    setEl("succ-total", payload.total.toLocaleString("fr-DZ") + " " + CONFIG.currency);

    if(success) {
      success.classList.add("visible");
      setTimeout(() => { success.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
    }

    initEmailCapture(orderId, payload.phone);
    fireConversionEvents(orderId, payload.total, CONFIG.variantId, payload.event_id, null, payload.phone);
  }

  function normalizePhoneDigits(raw) {
    // Strip everything except digits
    let digits = raw.replace(/\D/g, "");
    // +213XXXXXXXXX or 213XXXXXXXXX (12 digits) → 0XXXXXXXXX
    if (digits.startsWith("213") && digits.length === 12) digits = "0" + digits.slice(3);
    // 00213XXXXXXXXX (14 digits) → 0XXXXXXXXX
    if (digits.startsWith("00213") && digits.length === 14) digits = "0" + digits.slice(5);
    // Clamp to 10 digits max
    return digits.slice(0, 10);
  }

  function formatPhone(input) {
    const digits = normalizePhoneDigits(input.value);
    let f = "";
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 4 || i === 6 || i === 8) f += " ";
      f += digits[i];
    }
    input.value = f;
  }

  function bindEvents() {
    const ws=document.getElementById("cod-wilaya");
    if(ws) ws.addEventListener("change",e=>{ state.wilaya=e.target.value; populateCommunes(state.wilaya); calcAndRender(); });
    document.querySelectorAll("input[name='cod-delivery']").forEach(r=>r.addEventListener("change",e=>{ state.deliveryType=e.target.value; calcAndRender(); }));
    const minus=document.getElementById("cod-qty-minus"), plus=document.getElementById("cod-qty-plus");
    if(minus) minus.addEventListener("click",()=>{ if(state.qty>1){ state.qty--; document.getElementById("cod-qty").value=state.qty; calcAndRender(); updateQtyBtns(); }});
    if(plus) plus.addEventListener("click",()=>{ if(state.qty<state.maxQty){ state.qty++; document.getElementById("cod-qty").value=state.qty; calcAndRender(); updateQtyBtns(); }});
    const pi=document.getElementById("cod-phone");
    if(pi) pi.addEventListener("input",()=>formatPhone(pi));
    const btn=document.getElementById("cod-submit");
    if(btn) btn.addEventListener("click",handleSubmit);

    // Clear errors on input for all fields
    ["cod-fullname","cod-phone","cod-wilaya","cod-commune"].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.addEventListener("input",()=>{ el.classList.remove("cod-error"); const e=document.getElementById(id+"-err"); if(e) e.classList.remove("visible"); });
    });

    // Lead: fire on first focus of any field
    ["cod-fullname","cod-phone","cod-wilaya","cod-commune"].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("focus", fireLead, { once: true });
    });

    // InitiateCheckout: fire as soon as fullname has 2+ chars AND phone is valid
    var fullnameEl = document.getElementById("cod-fullname");
    var phoneEl    = document.getElementById("cod-phone");
    
    if (fullnameEl) {
      fullnameEl.addEventListener("input", fireInitiateCheckout);
      fullnameEl.addEventListener("blur", fireInitiateCheckout);
    }
    if (phoneEl) {
      phoneEl.addEventListener("blur", fireInitiateCheckout);
    }
  }

  function updateQtyBtns() {
    const m=document.getElementById("cod-qty-minus"), p=document.getElementById("cod-qty-plus");
    if(m) m.disabled=state.qty<=1;
    if(p) p.disabled=state.qty>=state.maxQty;
  }

  /* ─────────────────────────────────────────────
     TIME-BASED CTA HELPERS (Algeria UTC+1)
  ───────────────────────────────────────────── */
  function getAlgeriaHour() {
    const now = new Date();
    return { hour: (now.getUTCHours() + 1) % 24, minute: now.getUTCMinutes() };
  }

  function isDaytime() {
    const { hour, minute } = getAlgeriaHour();
    const total = hour * 60 + minute;
    return total >= 7 * 60 && total < 16 * 60 + 50; // 07:00 – 16:49
  }

  function getCTALines() {
    if (isDaytime()) {
      return {
        fr: "Commander Maintenant",
        ar: "كوموندي دكا، تتكونفارما ليوم، ونبعثوهالك ليوم ☀️"
      };
    } else {
      return {
        fr: "Commander Maintenant",
        ar: "كوموندي دكا، تتكونفارما الصبح، ونبعثوهالك الصبح 🌙"
      };
    }
  }

  function updateAllCTAs() {
    const cta = getCTALines();
    // Sticky is already rendered correctly at initStickyBar() time — do NOT touch it here
    // Only update the inline submit button Arabic line
    const submitAr = document.getElementById("cod-submit-ar");
    if (submitAr) submitAr.textContent = cta.ar;
  }

  /* ─────────────────────────────────────────────
     4. STICKY ACTION BUTTON (Bilingual FR/AR)
  ───────────────────────────────────────────── */
  var atcFired = false;

  function initStickyBar() {
    const stickyBar = document.createElement("div");
    stickyBar.id = "cod-sticky-bar";
    stickyBar.className = "cod-sticky-wrapper";
    const _cta = getCTALines();
    stickyBar.innerHTML = `
      <button class="cod-sticky-trigger" type="button">
        <span class="cod-sticky-fr">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>${_cta.fr}
        </span>
        <span class="cod-sticky-ar">${_cta.ar}</span>
      </button>
    `;
    document.body.appendChild(stickyBar);

    const triggerBtn = stickyBar.querySelector(".cod-sticky-trigger");
    triggerBtn.addEventListener("click", () => {
      
      // Fire AddToCart pixel + CAPI
      if (!atcFired && typeof fbq === "function") {
        atcFired = true;
        var eid = getSessionEventId("AddToCart");
        var productData = getProductData();
        
        fbq("track", "AddToCart", productData, { eventID: eid });
        sendCAPIEvent("AddToCart", eid, productData);
        
        console.log("[COD Pixel] AddToCart fired Browser + CAPI ✅");
      }

      // Scroll to form and focus first name
      const root = document.getElementById("cod-form-root");
      if (root) {
        root.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          const firstInput = document.getElementById("cod-fullname");
          if (firstInput) firstInput.focus({ preventScroll: true });
        }, 600);
      }
    });

    // IntersectionObserver: show sticky when form is out of view
    const rootEl = document.getElementById("cod-form-root");
    if (rootEl && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (state.submitted) return; 
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            stickyBar.classList.remove("visible");
          } else {
            stickyBar.classList.add("visible");
          }
        });
      }, { threshold: 0.1 });
      observer.observe(rootEl);
    } else {
      setTimeout(() => { if (!state.submitted) stickyBar.classList.add("visible"); }, 2000);
    }
  }

  function hideStickyBarForever() {
    const stickyBar = document.getElementById("cod-sticky-bar");
    if (stickyBar) stickyBar.classList.remove("visible");
  }

  /* ─────────────────────────────────────────────
     5. BUILD THE UI
  ───────────────────────────────────────────── */
  function init() {
    injectStyles();
    let mount=document.getElementById("cod-form-mount")||document.querySelector("[data-cod-form]");
    if(!mount) {
      const bb=document.querySelector('[name="add"]')||document.querySelector(".product-form__submit")||document.querySelector(".btn-addtocart");
      if(bb){ mount=document.createElement("div"); bb.parentNode.insertBefore(mount,bb.nextSibling); }
      else{ mount=document.createElement("div"); document.body.appendChild(mount); }
    }
    const root=document.createElement("div");
    root.id="cod-form-root";
    root.innerHTML=buildHTML();
    mount.appendChild(root);
    
    calcAndRender(); updateQtyBtns();
    loadCommunes();
    fetchShopifyVariants().then(()=>{ fetchStock(); });
    bindEvents();
    initStickyBar();
    updateAllCTAs();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
