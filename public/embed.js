/**
 * COD Lead Form System — Algeria
 * Premium Redesign v6 (Bilingual FR/AR, Split Names, 2026 FB EMQ Standards)
 */
(function () {
  "use strict";

  const currentScript = document.currentScript || (function () { const s = document.getElementsByTagName("script"); return s[s.length - 1]; })();
  const BASE_URL = currentScript.src ? currentScript.src.split("/embed.js")[0] : "";

  const CONFIG = {
    variantId: currentScript.dataset.variantId || (typeof variantId !== "undefined" ? variantId : null),
    price: parseFloat(currentScript.dataset.price) || (typeof productPrice !== "undefined" ? productPrice : 2500),
    productTitle: currentScript.dataset.productTitle || "Votre Produit",
    currency: currentScript.dataset.currency || "DZD",
    apiBase: BASE_URL || "https://leadform-ebth.vercel.app",
    defaultWilaya: "Alger",
  };

  if (window.__COD_CONFIG__) Object.assign(CONFIG, window.__COD_CONFIG__);

  // Generate a persistent cross-session External ID for better FB Matching
  function getExternalId() {
    let extId = localStorage.getItem("_cod_ext_id");
    if (!extId) {
      extId = "ext_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("_cod_ext_id", extId);
    }
    return extId;
  }

  function initFacebookPixel() {
    const pixelId = window.__FB_PIXEL_ID__ || currentScript.dataset.fbPixelId;
    if (!pixelId) return;
    try {
      const preconnect = document.createElement("link"); preconnect.rel = "preconnect";
      preconnect.href = "https://connect.facebook.net"; document.head.appendChild(preconnect);
    } catch(e) {}

    if (typeof fbq !== "function") {
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
      fbq("init", pixelId);
    }
  }
  initFacebookPixel();

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
  let state = { qty: 1, maxQty: 99, wilaya: CONFIG.defaultWilaya, commune: "", variantTitle: "Par défaut", deliveryType: "home", shippingCost: SHIPPING[CONFIG.defaultWilaya]?.home ?? 400, submitting: false, submitted: false };

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cairo:wght@500;700&display=swap');
      #cod-form-root { all: initial; display: block; width: 100%; max-width: 520px; margin: 0 auto; box-sizing: border-box; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; background: #ffffff; border-radius: 20px; border: 1px solid #E5E7EB; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08); overflow: hidden; }
      #cod-form-root * { box-sizing: border-box; }
      .cod-header { padding: 28px 24px 20px; text-align: center; background: #ffffff; border-bottom: 1px solid #F3F4F6; }
      .cod-trust-badges { display: flex; justify-content: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
      .cod-trust-badge { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #059669; background: #ECFDF5; padding: 6px 10px; border-radius: 8px; font-family: 'Plus Jakarta Sans', 'Cairo', sans-serif;}
      .cod-title { font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 6px 0; letter-spacing: -0.5px; }
      .cod-subtitle { font-size: 14px; color: #6B7280; margin: 0; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .cod-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
      .cod-field-group { display: flex; flex-direction: column; gap: 8px; }
      .cod-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .cod-label { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #374151; width: 100%; }
      .cod-label .fr { font-weight: 700; }
      .cod-label .ar { font-weight: 700; font-family: 'Cairo', sans-serif; direction: rtl; color: #4B5563;}
      .cod-optional { font-size: 11px; font-weight: 500; color: #9CA3AF; margin-left: 4px; }
      .cod-input, .cod-select { width: 100%; height: 52px; padding: 0 16px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; font-size: 15px; font-family: inherit; font-weight: 500; color: #111827; outline: none; transition: all 0.2s ease; appearance: none; -webkit-appearance: none; }
      .cod-select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; background-size: 16px; cursor: pointer; padding-right: 40px; }
      .cod-input:hover, .cod-select:hover { border-color: #D1D5DB; }
      .cod-input:focus, .cod-select:focus { border-color: #FF5A1F; background: #FFFFFF; box-shadow: 0 0 0 4px rgba(255,90,31,0.1); }
      .cod-input.cod-error, .cod-select.cod-error { border-color: #EF4444; background: #FEF2F2; }
      .cod-error-msg { font-size: 12px; color: #EF4444; font-weight: 600; display: none; margin-top: -4px; text-align: left;}
      .cod-error-msg.visible { display: block; }
      .cod-delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .cod-delivery-option { position: relative; cursor: pointer; }
      .cod-delivery-option input { position: absolute; opacity: 0; pointer-events: none; }
      .cod-delivery-card { display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 16px; border: 2px solid #E5E7EB; border-radius: 16px; background: #ffffff; transition: all 0.2s ease; height: 100%; text-align: center;}
      .cod-del-top { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; font-weight: 700; color: #111827; }
      .cod-del-icon { color: #6B7280; display: flex; }
      .cod-delivery-price { font-size: 13px; color: #6B7280; font-weight: 600; }
      .cod-delivery-option input:checked + .cod-delivery-card { border-color: #FF5A1F; background: #FFF9F7; }
      .cod-delivery-option input:checked + .cod-delivery-card .cod-del-icon { color: #FF5A1F; }
      .cod-delivery-option input:checked + .cod-delivery-card .cod-delivery-price { color: #FF5A1F; }
      .cod-summary-section { background: #F9FAFB; border-radius: 16px; padding: 20px; border: 1px solid #E5E7EB; }
      .cod-qty-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px dashed #D1D5DB; }
      .cod-qty-wrapper { display: flex; align-items: center; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden; height: 40px; }
      .cod-qty-btn { width: 40px; height: 100%; background: none; border: none; cursor: pointer; font-size: 18px; color: #4B5563; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
      .cod-qty-btn:hover:not(:disabled) { background: #F3F4F6; color: #111827; }
      .cod-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      .cod-qty-input { width: 40px; text-align: center; border: none; background: none; font-size: 15px; font-weight: 700; color: #111827; font-family: inherit; pointer-events: none; }
      .cod-price-line { display: flex; justify-content: space-between; font-size: 14px; color: #4B5563; margin-bottom: 12px; align-items: center;}
      .cod-price-val { font-weight: 600; color: #111827; }
      .cod-price-line.total { margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 18px; }
      .cod-price-line.total .cod-price-key span { color: #111827; font-weight: 800; }
      .cod-price-line.total .cod-price-val { color: #FF5A1F; font-weight: 800; }
      .cod-submit-btn { width: 100%; height: 64px; background: #FF5A1F; color: #fff; border: none; border-radius: 14px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s ease; box-shadow: 0 8px 20px -6px rgba(255,90,31,0.4); }
      .cod-submit-btn:hover:not(:disabled) { transform: translateY(-2px); background: #F0490E; box-shadow: 0 12px 24px -6px rgba(255,90,31,0.5); }
      .cod-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
      .cod-submit-btn .fr { font-size: 16px; font-weight: 800; font-family: 'Plus Jakarta Sans', sans-serif;}
      .cod-submit-btn .ar { font-size: 15px; font-weight: 700; font-family: 'Cairo', sans-serif;}
      .cod-submit-btn.loading .cod-btn-text { display: none; }
      .cod-submit-btn.loading .cod-spinner { display: block; }
      .cod-spinner { display: none; width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: codSpin 0.8s linear infinite; }
      @keyframes codSpin { to { transform: rotate(360deg); } }
      .cod-footer { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: -4px; padding-bottom: 24px; font-size: 12px; color: #6B7280; font-weight: 500; text-align: center; }
      .cod-terms-text { font-size: 11px; color: #9CA3AF; text-align: center; margin-top: -8px; font-weight: 500; }
      .cod-urgency { font-size: 13px; color: #EF4444; font-weight: 700; text-align: center; padding: 8px 12px; background: #FEF2F2; border-radius: 8px; border: 1px dashed #F87171; animation: codPulse 2s infinite; }
      @keyframes codPulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
      .cod-success { display: none; flex-direction: column; align-items: center; text-align: center; padding: 40px 24px; background: #fff; }
      .cod-success.visible { display: flex; animation: slideIn 0.4s ease forwards; }
      @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .cod-success-icon { width: 72px; height: 72px; background: #D1FAE5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
      .cod-success-title { font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 8px; }
      .cod-success-desc { font-size: 15px; color: #6B7280; line-height: 1.5; margin-bottom: 24px; }
      
      .cod-sticky-wrapper { position: fixed; bottom: -100px; left: 0; width: 100%; padding: 12px 20px; background: #ffffff; box-shadow: 0 -10px 30px rgba(0,0,0,0.1); z-index: 99999; display: flex; justify-content: center; transition: bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1); border-top: 1px solid #E5E7EB; }
      .cod-sticky-wrapper.visible { bottom: 0; }
      .cod-sticky-trigger { width: 100%; max-width: 400px; height: 56px; background: #FF5A1F; color: #fff; border: none; border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 4px 15px -4px rgba(255,90,31,0.4); cursor: pointer; transition: transform 0.2s ease; }
      .cod-sticky-trigger:active { transform: scale(0.98); }
      .cod-sticky-texts { display: flex; flex-direction: column; align-items: center; line-height: 1.1; }
      .cod-sticky-texts .fr { font-size: 15px; font-weight: 800; font-family: 'Plus Jakarta Sans', sans-serif;}
      .cod-sticky-texts .ar { font-size: 14px; font-weight: 700; font-family: 'Cairo', sans-serif;}
      
      @media (max-width: 480px) {
        #cod-form-root { border-radius: 16px; border-left: none; border-right: none; border-top: 1px solid #E5E7EB; }
        .cod-row { grid-template-columns: 1fr; gap: 12px; }
        .cod-delivery-grid { grid-template-columns: 1fr; }
        .cod-sticky-wrapper { padding: 12px 16px; padding-bottom: max(12px, env(safe-area-inset-bottom)); }
      }
    `;
    document.head.appendChild(style);
  }

  function buildHTML() {
    return `
      <div class="cod-header">
        <div class="cod-trust-badges">
          <div class="cod-trust-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Paiement à la livraison | الدفع عند الاستلام
          </div>
        </div>
        <h2 class="cod-title">Finaliser ma commande</h2>
        <p class="cod-subtitle">${CONFIG.productTitle}</p>
      </div>

      <div class="cod-body" id="cod-body">
        <div class="cod-field-group" id="cod-variant-group" style="display:none;">
          <label class="cod-label"><span class="fr">Option / Variante *</span><span class="ar">النوع / الخيار *</span></label>
          <select id="cod-variant-select" class="cod-select"></select>
        </div>

        <div class="cod-row">
          <div class="cod-field-group">
            <label class="cod-label"><span class="fr">Prénom *</span><span class="ar">الاسم *</span></label>
            <input id="cod-prenom" class="cod-input" type="text" placeholder="Ex: Ahmed" autocomplete="given-name" />
            <span class="cod-error-msg" id="cod-prenom-err">Le prénom est requis</span>
          </div>
          <div class="cod-field-group">
            <label class="cod-label"><span class="fr">Nom *</span><span class="ar">اللقب *</span></label>
            <input id="cod-nom" class="cod-input" type="text" placeholder="Ex: Benali" autocomplete="family-name" />
            <span class="cod-error-msg" id="cod-nom-err">Le nom est requis</span>
          </div>
        </div>

        <div class="cod-field-group">
          <label class="cod-label"><span class="fr">Numéro de Téléphone *</span><span class="ar">رقم الهاتف *</span></label>
          <input id="cod-phone" class="cod-input" type="tel" placeholder="05 XX XX XX XX" autocomplete="tel" maxlength="14" dir="ltr" />
          <span class="cod-error-msg" id="cod-phone-err">Numéro invalide (ex: 0551 23 45 67)</span>
        </div>

        <div class="cod-field-group">
          <label class="cod-label"><span class="fr">Email <span class="cod-optional">(Facultatif)</span></span><span class="ar">البريد الإلكتروني</span></label>
          <input id="cod-email" class="cod-input" type="email" placeholder="exemple@email.com" autocomplete="email" dir="ltr" />
        </div>

        <div class="cod-row">
          <div class="cod-field-group">
            <label class="cod-label"><span class="fr">Wilaya *</span><span class="ar">الولاية *</span></label>
            <select id="cod-wilaya" class="cod-select"></select>
            <span class="cod-error-msg" id="cod-wilaya-err">Sélectionnez une wilaya</span>
          </div>
          <div class="cod-field-group">
            <label class="cod-label"><span class="fr">Commune *</span><span class="ar">البلدية *</span></label>
            <select id="cod-commune" class="cod-select"><option value="">Sélectionner</option></select>
            <span class="cod-error-msg" id="cod-commune-err">Sélectionnez une commune</span>
          </div>
        </div>

        <div class="cod-field-group">
          <label class="cod-label"><span class="fr">Mode de Livraison *</span><span class="ar">طريقة التوصيل *</span></label>
          <div class="cod-delivery-grid">
            <label class="cod-delivery-option">
              <input type="radio" name="cod-delivery" value="home" checked />
              <div class="cod-delivery-card">
                <div class="cod-del-top">
                  <div class="cod-del-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>
                  <div style="display:flex;flex-direction:column;font-size:13px;"><span class="fr">Domicile</span><span class="ar" style="font-family:'Cairo';">المنزل</span></div>
                </div>
                <div class="cod-delivery-price" id="cod-home-price">— DZD</div>
              </div>
            </label>
            <label class="cod-delivery-option">
              <input type="radio" name="cod-delivery" value="stopdesk" />
              <div class="cod-delivery-card">
                <div class="cod-del-top">
                  <div class="cod-del-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></div>
                  <div style="display:flex;flex-direction:column;font-size:13px;"><span class="fr">StopDesk</span><span class="ar" style="font-family:'Cairo';">مكتب التوصيل</span></div>
                </div>
                <div class="cod-delivery-price" id="cod-stopdesk-price">— DZD</div>
              </div>
            </label>
          </div>
        </div>

        <div class="cod-field-group">
          <label class="cod-label"><span class="fr">Adresse détaillée <span class="cod-optional">(Facultatif)</span></span><span class="ar">العنوان</span></label>
          <input id="cod-address" class="cod-input" type="text" placeholder="Nom de la rue, numéro..." />
        </div>

        <div class="cod-summary-section">
          <div class="cod-qty-row">
            <div class="cod-label" style="width:auto; gap:10px;"><span class="fr">Quantité</span><span class="ar">الكمية</span></div>
            <div class="cod-qty-wrapper">
              <button class="cod-qty-btn" id="cod-qty-minus" type="button">−</button>
              <input class="cod-qty-input" id="cod-qty" type="text" value="1" readonly />
              <button class="cod-qty-btn" id="cod-qty-plus" type="button">+</button>
            </div>
          </div>
          <div class="cod-price-line">
            <div class="cod-label" style="width:auto;gap:10px;"><span class="fr">Sous-total</span><span class="ar">المجموع الفرعي</span></div>
            <span class="cod-price-val" id="cod-product-total">—</span>
          </div>
          <div class="cod-price-line">
            <div class="cod-label" style="width:auto;gap:10px;"><span class="fr">Livraison</span><span class="ar">التوصيل</span></div>
            <span class="cod-price-val" id="cod-shipping-total">—</span>
          </div>
          <div class="cod-price-line total">
            <div class="cod-price-key cod-label" style="width:auto;gap:10px;"><span class="fr">Total à Payer</span><span class="ar">الإجمالي</span></div>
            <span class="cod-price-val" id="cod-grand-total">—</span>
          </div>
        </div>

        <div id="cod-urgency-msg" class="cod-urgency" style="display:none;"></div>

        <div style="position:absolute;left:-9999px;opacity:0;pointer-events:none;" aria-hidden="true"><input type="text" name="website" id="cod-honeypot" tabindex="-1" autocomplete="off" /></div>

        <button class="cod-submit-btn" id="cod-submit" type="button">
          <div class="cod-btn-text" style="display:flex; flex-direction:column; align-items:center;">
            <span class="fr">Confirmer ma commande</span>
            <span class="ar">تأكيد الطلب</span>
          </div>
          <div class="cod-spinner"></div>
        </button>

        <div class="cod-terms-text">En passant commande, vous acceptez nos conditions générales.</div>
      </div>

      <div class="cod-footer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        <span>Vos données sont sécurisées. Paiement à la réception.</span>
      </div>

      <div class="cod-success" id="cod-success">
        <div class="cod-success-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
        <div class="cod-success-title">Commande Réussie !</div>
        <div class="cod-success-desc">Merci pour votre confiance. Notre équipe vous appellera dans moins de 24h pour confirmer l'expédition.</div>
      </div>
    `;
  }

  function getProductData() {
    return { content_ids: [String(CONFIG.variantId || "")], content_type: "product", content_name: CONFIG.productTitle, value: parseFloat((CONFIG.price / 260).toFixed(2)), currency: "USD", num_items: state.qty };
  }

  function getFBCookies() {
    const cookies = document.cookie.split(";").reduce((acc, c) => {
      const idx = c.indexOf("="); if (idx > -1) acc[c.slice(0, idx).trim()] = c.slice(idx + 1).trim(); return acc;
    }, {});
    let fbc = cookies["_fbc"] || null;
    try { const fbclid = new URLSearchParams(window.location.search).get("fbclid"); if (fbclid) fbc = "fb.1." + Date.now() + "." + fbclid; } catch(e) {}
    return { fbp: cookies["_fbp"] || null, fbc };
  }

  var _sessionIds = {};
  function getSessionEventId(eventName) {
    if (!_sessionIds[eventName]) _sessionIds[eventName] = eventName.toLowerCase() + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    return _sessionIds[eventName];
  }

  function sendCAPIEvent(eventName, eventId, customData, userData = {}) {
    const { fbp, fbc } = getFBCookies();
    let currentUrl = window.location.href;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) currentUrl = canonical.href;

    userData.external_id = getExternalId();

    fetch(`${CONFIG.apiBase}/api/capi`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_name: eventName, event_id: eventId, event_source_url: currentUrl, fbp, fbc, custom_data, user_data: userData })
    }).catch(e => console.error(`[CAPI] Error`, e));
  }

  var leadFired = false;
  function fireLead() {
    if (leadFired || typeof fbq !== "function") return;
    leadFired = true;
    var eid = getSessionEventId("Lead"); var pData = getProductData();
    fbq("track", "Lead", pData, { eventID: eid });
    sendCAPIEvent("Lead", eid, pData);
  }

  var initiateCheckoutFired = false;
  function fireInitiateCheckout() {
    if (initiateCheckoutFired || typeof fbq !== "function") return;
    var pEl = document.getElementById("cod-prenom");
    var nEl = document.getElementById("cod-nom");
    if ((pEl && pEl.value.trim().length >= 2) || (nEl && nEl.value.trim().length >= 2)) {
      initiateCheckoutFired = true;
      var eid = getSessionEventId("InitiateCheckout"); var pData = getProductData();
      
      var emailEl = document.getElementById("cod-email");
      var phoneEl = document.getElementById("cod-phone");
      var userData = {
        first_name: pEl ? pEl.value.trim() : null,
        last_name: nEl ? nEl.value.trim() : null,
        phone: (phoneEl && phoneEl.value.length > 5) ? phoneEl.value.replace(/\s/g, "") : null,
        email: emailEl ? emailEl.value.trim() : null
      };

      fbq("track", "InitiateCheckout", pData, { eventID: eid });
      sendCAPIEvent("InitiateCheckout", eid, pData, userData);
    }
  }

  function fireConversionEvents(orderId, total, variantId, eventId, email, phone) {
    const valueUSD = parseFloat((total / 260).toFixed(2));
    const contentId = String(variantId || CONFIG.variantId || "");
    try {
      if (typeof fbq === "function") {
        let adv = {}; if(email) adv.em=email.toLowerCase(); if(phone) adv.ph=phone.replace(/\s/g,"");
        fbq("track", "Purchase", { value: valueUSD, currency: "USD", content_ids: [contentId], content_type: "product", num_items: state.qty, order_id: orderId }, { eventID: eventId });
      }
    } catch(e) {}
  }

  async function fetchShopifyVariants() { /* Existing logic untouched */
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
        select.innerHTML = SHOPIFY_VARIANTS.map(v => `<option value="${v.id}" ${!v.available ? "disabled" : ""}>${v.title} — ${(v.price/100).toLocaleString("fr-DZ")} ${CONFIG.currency}${!v.available ? " (Rupture)" : ""}</option>`).join("");
        group.style.display = "flex";
        let cur = new URLSearchParams(window.location.search).get("variant") || CONFIG.variantId;
        let vObj = SHOPIFY_VARIANTS.find(v => v.id == cur);
        if (!vObj || !vObj.available) cur = (SHOPIFY_VARIANTS.find(v => v.available) || SHOPIFY_VARIANTS[0]).id;
        select.value = cur; updateFormVariant(cur);
        select.addEventListener("change", (e) => { updateFormVariant(e.target.value); });
      } else updateFormVariant(SHOPIFY_VARIANTS[0].id);
    } catch(e) {}
  }

  function updateFormVariant(idStr) {
    const v = SHOPIFY_VARIANTS.find(v => v.id === parseInt(idStr));
    if (v) { CONFIG.variantId = v.id; CONFIG.price = v.price / 100; state.variantTitle = v.title; calcAndRender(); }
  }

  async function loadCommunes() {
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/communes`);
      if(resp.ok) {
        const data = await resp.json();
        data.forEach(c => { const w = c.wilaya_name_ascii; if(!COMMUNES_BY_WILAYA[w]) COMMUNES_BY_WILAYA[w]=[]; COMMUNES_BY_WILAYA[w].push(c.commune_name_ascii); });
      }
    } catch(e) {}
    const sel = document.getElementById("cod-wilaya");
    if(sel) sel.innerHTML = Object.keys(SHIPPING).sort().map(w => `<option value="${w}"${w===CONFIG.defaultWilaya?" selected":""}>${w}</option>`).join("");
    populateCommunes(state.wilaya);
  }

  function populateCommunes(wilaya) {
    const sel = document.getElementById("cod-commune");
    if (!sel) return;
    const list = (COMMUNES_BY_WILAYA[wilaya]||[]).slice().sort();
    sel.innerHTML = `<option value="">Sélectionner</option>` + list.map(c=>`<option value="${c}">${c}</option>`).join("");
  }

  function calcAndRender() {
    const pt = CONFIG.price * state.qty; const sh = SHIPPING[state.wilaya]?.[state.deliveryType] ?? 400; state.shippingCost = sh;
    const fmt = n => n.toLocaleString("fr-DZ") + " " + CONFIG.currency;
    if(document.getElementById("cod-product-total")) document.getElementById("cod-product-total").textContent = fmt(pt);
    if(document.getElementById("cod-shipping-total")) document.getElementById("cod-shipping-total").textContent = fmt(sh);
    if(document.getElementById("cod-grand-total")) document.getElementById("cod-grand-total").textContent = fmt(pt + sh);
    const w = SHIPPING[state.wilaya] || {stopdesk:400,home:550};
    if(document.getElementById("cod-home-price")) document.getElementById("cod-home-price").textContent = fmt(w.home);
    if(document.getElementById("cod-stopdesk-price")) document.getElementById("cod-stopdesk-price").textContent = fmt(w.stopdesk);
  }

  function validate() {
    let valid = true;
    const p = document.getElementById("cod-prenom"), n = document.getElementById("cod-nom"), ph = document.getElementById("cod-phone"), w = document.getElementById("cod-wilaya"), c = document.getElementById("cod-commune");
    if (!p?.value.trim()||p.value.trim().length<2) { setError("cod-prenom","cod-prenom-err",true); valid=false; } else setError("cod-prenom","cod-prenom-err",false);
    if (!n?.value.trim()||n.value.trim().length<2) { setError("cod-nom","cod-nom-err",true); valid=false; } else setError("cod-nom","cod-nom-err",false);
    if (!ph?.value.replace(/\s/g,"")||!/^0[5-7]\d{8}$/.test(ph.value.replace(/\s/g,""))) { setError("cod-phone","cod-phone-err",true); valid=false; } else setError("cod-phone","cod-phone-err",false);
    if (!w?.value) { setError("cod-wilaya","cod-wilaya-err",true); valid=false; } else setError("cod-wilaya","cod-wilaya-err",false);
    if (!c?.value) { setError("cod-commune","cod-commune-err",true); valid=false; } else setError("cod-commune","cod-commune-err",false);
    if (!valid) { const err = document.querySelector('#cod-form-root .cod-error'); if(err) { err.scrollIntoView({ behavior: 'smooth', block: 'center' }); err.focus({preventScroll:true}); } }
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
    if(btn) btn.classList.add("loading");
    
    const prenom = document.getElementById("cod-prenom").value.trim();
    const nom = document.getElementById("cod-nom").value.trim();
    const { fbp, fbc } = getFBCookies();

    const payload = {
      variant_id: CONFIG.variantId, quantity: state.qty,
      first_name: prenom, last_name: nom,
      phone: document.getElementById("cod-phone").value.replace(/\s/g,""),
      email: document.getElementById("cod-email")?.value.trim().toLowerCase() || null,
      wilaya: state.wilaya, commune: document.getElementById("cod-commune").value,
      address: document.getElementById("cod-address")?.value.trim() || "",
      delivery_type: state.deliveryType, shipping_cost: state.shippingCost,
      product_price: CONFIG.price, currency: CONFIG.currency,
      external_id: getExternalId(), fbp, fbc,
      event_id: generateEventId(), event_source_url: window.location.href
    };
    
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/create-order`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const data = await resp.json();
      if (!resp.ok) throw new Error();
      state.submitted = true;
      document.getElementById("cod-body").style.display="none";
      document.querySelector(".cod-footer").style.display="none";
      const s = document.getElementById("cod-success"); s.classList.add("visible");
      setTimeout(()=> s.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      if(document.getElementById("cod-sticky-bar")) document.getElementById("cod-sticky-bar").classList.remove("visible");
      fireConversionEvents(data.order_id, payload.product_price*payload.quantity+payload.shipping_cost, payload.variant_id, payload.event_id, payload.email, payload.phone);
    } catch(err) {
      if(btn) { btn.classList.remove("loading"); btn.querySelector(".cod-btn-text").innerHTML = "Erreur — Réessayer"; }
      state.submitting=false;
    }
  }

  function generateEventId() { return "cod_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9); }
  function formatPhone(i){ let v=i.value.replace(/\D/g,"").slice(0,10), f=""; for(let j=0;j<v.length;j++){ if(j===2||j===4||j===6||j===8) f+=" "; f+=v[j]; } i.value=f; }

  function bindEvents() {
    const ws=document.getElementById("cod-wilaya"); if(ws) ws.addEventListener("change",e=>{ state.wilaya=e.target.value; populateCommunes(state.wilaya); calcAndRender(); });
    document.querySelectorAll("input[name='cod-delivery']").forEach(r=>r.addEventListener("change",e=>{ state.deliveryType=e.target.value; calcAndRender(); }));
    const m=document.getElementById("cod-qty-minus"), p=document.getElementById("cod-qty-plus");
    if(m) m.addEventListener("click",()=>{ if(state.qty>1){ state.qty--; document.getElementById("cod-qty").value=state.qty; calcAndRender(); m.disabled=state.qty<=1; p.disabled=false; }});
    if(p) p.addEventListener("click",()=>{ if(state.qty<99){ state.qty++; document.getElementById("cod-qty").value=state.qty; calcAndRender(); p.disabled=state.qty>=99; m.disabled=false; }});
    const pi=document.getElementById("cod-phone"); if(pi) pi.addEventListener("input",()=>formatPhone(pi));
    const btn=document.getElementById("cod-submit"); if(btn) btn.addEventListener("click",handleSubmit);
    
    // Pixel Handlers
    ["cod-prenom","cod-nom","cod-phone","cod-wilaya","cod-commune","cod-address"].forEach(id=>{
      const el = document.getElementById(id); if (el) {
        el.addEventListener("focus", fireLead, { once: true });
        el.addEventListener("input", ()=>{ el.classList.remove("cod-error"); const e=document.getElementById(id+"-err"); if(e) e.classList.remove("visible"); });
      }
    });
    
    const prenom = document.getElementById("cod-prenom");
    const nom = document.getElementById("cod-nom");
    if(prenom) prenom.addEventListener("blur", fireInitiateCheckout);
    if(nom) nom.addEventListener("blur", fireInitiateCheckout);
  }

  var atcFired = false;
  function initStickyBar() {
    const sb = document.createElement("div"); sb.id = "cod-sticky-bar"; sb.className = "cod-sticky-wrapper";
    sb.innerHTML = `<button class="cod-sticky-trigger" type="button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        <div class="cod-sticky-texts"><span class="fr">Commander Maintenant</span><span class="ar">اطلب الآن</span></div>
      </button>`;
    document.body.appendChild(sb);

    sb.querySelector(".cod-sticky-trigger").addEventListener("click", () => {
      if (!atcFired && typeof fbq === "function") {
        atcFired = true; var eid = getSessionEventId("AddToCart"); var pData = getProductData();
        fbq("track", "AddToCart", pData, { eventID: eid }); sendCAPIEvent("AddToCart", eid, pData);
      }
      const r = document.getElementById("cod-form-root");
      if(r) { r.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(() => document.getElementById("cod-prenom")?.focus(), 600); }
    });

    const rootEl = document.getElementById("cod-form-root");
    if (rootEl && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver((es) => { if(!state.submitted) es.forEach(e => e.isIntersecting ? sb.classList.remove("visible") : sb.classList.add("visible")); }, { threshold: 0.1 });
      obs.observe(rootEl);
    } else setTimeout(() => { if (!state.submitted) sb.classList.add("visible"); }, 2000);
  }

  function init() {
    injectStyles();
    let mount=document.getElementById("cod-form-mount")||document.querySelector("[data-cod-form]");
    if(!mount) { const bb=document.querySelector('[name="add"]')||document.querySelector(".product-form__submit")||document.querySelector(".btn-addtocart"); if(bb){ mount=document.createElement("div"); bb.parentNode.insertBefore(mount,bb.nextSibling); } else{ mount=document.createElement("div"); document.body.appendChild(mount); } }
    const root=document.createElement("div"); root.id="cod-form-root"; root.innerHTML=buildHTML(); mount.appendChild(root);
    calcAndRender(); loadCommunes(); fetchShopifyVariants(); bindEvents(); initStickyBar();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
