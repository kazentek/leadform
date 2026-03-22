/**
 * COD Lead Form System — Algeria
 * Premium Redesign v4 (With Variant Sync, Order Receipt & Conversion Events)
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
    apiBase: BASE_URL || "https://your-app.vercel.app",
    defaultWilaya: "Alger",
  };

  if (window.__COD_CONFIG__) {
    Object.assign(CONFIG, window.__COD_CONFIG__);
  }

  const SHIPPING = {
    Adrar: { stopdesk: 700, home: 1450 },
    Chlef: { stopdesk: 400, home: 750 },
    Laghouat: { stopdesk: 550, home: 950 },
    "Oum El Bouaghi": { stopdesk: 400, home: 750 },
    Batna: { stopdesk: 400, home: 800 },
    Bejaia: { stopdesk: 400, home: 750 },
    Biskra: { stopdesk: 500, home: 950 },
    Bechar: { stopdesk: 600, home: 1150 },
    Blida: { stopdesk: 350, home: 550 },
    Bouira: { stopdesk: 400, home: 700 },
    Tamanrasset: { stopdesk: 950, home: 1750 },
    Tebessa: { stopdesk: 400, home: 850 },
    Tlemcen: { stopdesk: 400, home: 800 },
    Tiaret: { stopdesk: 400, home: 850 },
    "Tizi Ouzou": { stopdesk: 350, home: 700 },
    Alger: { stopdesk: 300, home: 450 },
    Djelfa: { stopdesk: 550, home: 950 },
    Jijel: { stopdesk: 400, home: 800 },
    Setif: { stopdesk: 400, home: 750 },
    Saida: { stopdesk: 400, home: 850 },
    Skikda: { stopdesk: 400, home: 800 },
    "Sidi Bel Abbes": { stopdesk: 400, home: 750 },
    Annaba: { stopdesk: 400, home: 750 },
    Guelma: { stopdesk: 400, home: 850 },
    Constantine: { stopdesk: 400, home: 750 },
    Medea: { stopdesk: 400, home: 700 },
    Mostaganem: { stopdesk: 400, home: 750 },
    "M'Sila": { stopdesk: 400, home: 800 },
    Mascara: { stopdesk: 400, home: 750 },
    Ouargla: { stopdesk: 550, home: 1050 },
    Oran: { stopdesk: 400, home: 750 },
    "El Bayadh": { stopdesk: 600, home: 1150 },
    Illizi: { stopdesk: 1000, home: 1850 },
    "Bordj Bou Arreridj": { stopdesk: 400, home: 750 },
    Boumerdes: { stopdesk: 300, home: 550 },
    "El Tarf": { stopdesk: 400, home: 850 },
    Tindouf: { stopdesk: 700, home: 1350 },
    Tissemsilt: { stopdesk: 400, home: 800 },
    "El Oued": { stopdesk: 550, home: 1100 },
    Khenchela: { stopdesk: 400, home: 850 },
    "Souk Ahras": { stopdesk: 400, home: 850 },
    Tipaza: { stopdesk: 350, home: 550 },
    Mila: { stopdesk: 400, home: 800 },
    "Ain Defla": { stopdesk: 400, home: 750 },
    Naama: { stopdesk: 600, home: 1150 },
    "Ain Temouchent": { stopdesk: 400, home: 750 },
    Ghardaia: { stopdesk: 550, home: 1000 },
    Relizane: { stopdesk: 400, home: 800 },
    "Ouled Djellal": { stopdesk: 550, home: 950 },
    "El Meniaa": { stopdesk: 550, home: 1100 },
    "El M'Ghair": { stopdesk: 600, home: 1050 },
    Touggourt: { stopdesk: 550, home: 1050 },
    "Beni Abbes": { stopdesk: 750, home: 1150 },
    Timimoun: { stopdesk: 700, home: 1450 },
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
    viewerCount: Math.floor(Math.random() * 18) + 7,
    ordersToday: Math.floor(Math.random() * 60) + 40,
    timerSecs: 900,
  };

  /* ── CSS ── */
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

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
      .cod-urgency { display: flex; justify-content: space-between; align-items: center; background: #F9FAFB; padding: 12px 24px; border-bottom: 1px solid #F3F4F6; font-size: 12px; font-weight: 600; color: #4B5563; }
      .cod-live-group { display: flex; align-items: center; gap: 8px; }
      .cod-pulse { width: 8px; height: 8px; background: #EF4444; border-radius: 50%; box-shadow: 0 0 0 0 rgba(239,68,68,0.4); animation: pulseLive 2s infinite; }
      @keyframes pulseLive { 0% { transform:scale(0.95); box-shadow:0 0 0 0 rgba(239,68,68,0.7); } 70% { transform:scale(1); box-shadow:0 0 0 6px rgba(239,68,68,0); } 100% { transform:scale(0.95); box-shadow:0 0 0 0 rgba(239,68,68,0); } }
      .cod-timer { color: #DC2626; background: #FEF2F2; padding: 4px 8px; border-radius: 6px; font-variant-numeric: tabular-nums; }
      .cod-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
      .cod-field-group { display: flex; flex-direction: column; gap: 8px; }
      .cod-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .cod-label { font-size: 13px; font-weight: 700; color: #374151; }
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
      .cod-submit-btn.loading .cod-spinner { display: block; }
      .cod-spinner { display: none; width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: codSpin 0.8s linear infinite; }
      @keyframes codSpin { to { transform: rotate(360deg); } }
      .cod-footer { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: -4px; padding-bottom: 24px; font-size: 12px; color: #6B7280; font-weight: 500; text-align: center; }
      .cod-footer svg { color: #059669; flex-shrink: 0; }
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
      @media (max-width: 480px) {
        #cod-form-root { border-radius: 16px; border-left: none; border-right: none; border-top: 1px solid #E5E7EB; }
        .cod-row { grid-template-columns: 1fr; gap: 12px; }
        .cod-delivery-grid { grid-template-columns: 1fr; }
        .cod-header { padding: 24px 20px 16px; }
        .cod-body { padding: 20px; gap: 16px; }
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

      <div class="cod-urgency">
        <div class="cod-live-group">
          <div class="cod-pulse"></div>
          <span><span id="cod-viewers" style="color:#111827;font-weight:800;">${state.viewerCount}</span> clients consultent ceci</span>
        </div>
        <div class="cod-timer" id="cod-timer">15:00</div>
      </div>

      <div class="cod-body" id="cod-body">

        <div class="cod-field-group" id="cod-variant-group" style="display:none;">
          <label class="cod-label">Option / Variante *</label>
          <select id="cod-variant-select" class="cod-select"></select>
        </div>

        <div class="cod-field-group">
          <label class="cod-label">Nom et Prénom *</label>
          <input id="cod-name" class="cod-input" type="text" placeholder="Ex: Ahmed Benali" autocomplete="name" />
          <span class="cod-error-msg" id="cod-name-err">Veuillez entrer votre nom complet</span>
        </div>

        <div class="cod-field-group">
          <label class="cod-label">Numéro de Téléphone *</label>
          <input id="cod-phone" class="cod-input" type="tel" placeholder="05 XX XX XX XX" autocomplete="tel" maxlength="14" dir="ltr" />
          <span class="cod-error-msg" id="cod-phone-err">Numéro invalide (ex: 0551 23 45 67)</span>
        </div>

        <div class="cod-row">
          <div class="cod-field-group">
            <label class="cod-label">Wilaya *</label>
            <select id="cod-wilaya" class="cod-select"></select>
            <span class="cod-error-msg" id="cod-wilaya-err">Sélectionnez une wilaya</span>
          </div>
          <div class="cod-field-group">
            <label class="cod-label">Commune *</label>
            <select id="cod-commune" class="cod-select"><option value="">Sélectionner</option></select>
            <span class="cod-error-msg" id="cod-commune-err">Sélectionnez une commune</span>
          </div>
        </div>

        <div class="cod-field-group">
          <label class="cod-label">Mode de Livraison *</label>
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

        <div class="cod-field-group">
          <label class="cod-label">Adresse détaillée (Facultatif)</label>
          <input id="cod-address" class="cod-input" type="text" placeholder="Nom de la rue, numéro de bâtiment..." />
        </div>

        <div class="cod-summary-section">
          <div class="cod-qty-row">
            <span class="cod-qty-label">Quantité</span>
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

        <button class="cod-submit-btn" id="cod-submit" type="button">
          <span class="cod-btn-text">Confirmer ma commande</span>
          <div class="cod-spinner"></div>
        </button>
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
      </div>
    `;
  }

  /* ─────────────────────────────────────────────
     CONVERSION EVENTS
     Fires Facebook, Google, TikTok, Snapchat
     pixels right after a successful order.
  ───────────────────────────────────────────── */
  function fireConversionEvents(orderId, total, variantId) {
    // DZD → USD approximate conversion for pixel reporting
    // Facebook & Google don't support DZD natively
    const valueUSD = parseFloat((total / 136).toFixed(2));
    const valueDZD = parseFloat(total);
    const contentId = String(variantId || CONFIG.variantId || "");

    // ── 1. Facebook / Meta Pixel ──
    try {
      if (typeof fbq === "function") {
        fbq("track", "Purchase", {
          value: valueUSD,
          currency: "USD",
          content_ids: [contentId],
          content_type: "product",
          content_name: CONFIG.productTitle,
          num_items: state.qty,
          order_id: orderId,
        });
        console.log("[COD Pixel] ✅ Facebook Purchase fired — $" + valueUSD);
      }
    } catch(e) { console.warn("[COD Pixel] Facebook error:", e.message); }

    // ── 2. Google Analytics 4 ──
    try {
      if (typeof gtag === "function") {
        gtag("event", "purchase", {
          transaction_id: orderId,
          value: valueUSD,
          currency: "USD",
          items: [{
            item_id: contentId,
            item_name: CONFIG.productTitle,
            price: parseFloat((CONFIG.price / 136).toFixed(2)),
            quantity: state.qty,
          }],
        });
        console.log("[COD Pixel] ✅ Google Analytics purchase fired");
      }
    } catch(e) { console.warn("[COD Pixel] GA4 error:", e.message); }

    // ── 3. TikTok Pixel ──
    try {
      if (typeof ttq !== "undefined" && typeof ttq.track === "function") {
        ttq.track("PlaceAnOrder", {
          value: valueUSD,
          currency: "USD",
          content_id: contentId,
          content_type: "product",
          content_name: CONFIG.productTitle,
          quantity: state.qty,
          order_id: orderId,
        });
        console.log("[COD Pixel] ✅ TikTok PlaceAnOrder fired");
      }
    } catch(e) { console.warn("[COD Pixel] TikTok error:", e.message); }

    // ── 4. Snapchat Pixel ──
    try {
      if (typeof snaptr === "function") {
        snaptr("track", "PURCHASE", {
          price: valueUSD,
          currency: "USD",
          transaction_id: orderId,
          item_ids: [contentId],
          number_items: state.qty,
        });
        console.log("[COD Pixel] ✅ Snapchat PURCHASE fired");
      }
    } catch(e) { console.warn("[COD Pixel] Snapchat error:", e.message); }

    // ── 5. Shopify Web Pixels / Analytics ──
    try {
      if (window.Shopify && window.Shopify.analytics && typeof window.Shopify.analytics.publish === "function") {
        window.Shopify.analytics.publish("checkout_completed", {
          order_id: orderId,
          total_price: valueDZD,
          currency: "DZD",
        });
        console.log("[COD Pixel] ✅ Shopify analytics event fired");
      }
    } catch(e) { console.warn("[COD Pixel] Shopify analytics error:", e.message); }

    // ── 6. dataLayer (Google Tag Manager) ──
    try {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce data
        window.dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: orderId,
            value: valueUSD,
            currency: "USD",
            items: [{
              item_id: contentId,
              item_name: CONFIG.productTitle,
              price: parseFloat((CONFIG.price / 136).toFixed(2)),
              quantity: state.qty,
            }],
          },
        });
        console.log("[COD Pixel] ✅ GTM dataLayer purchase pushed");
      }
    } catch(e) { console.warn("[COD Pixel] GTM error:", e.message); }
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
        const currentId = urlParams.get("variant") || CONFIG.variantId || SHOPIFY_VARIANTS[0].id;
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
    if (v) { CONFIG.variantId = v.id; CONFIG.price = v.price / 100; state.variantTitle = v.title; calcAndRender(); fetchStock(); }
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
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/stock?variant_id=${CONFIG.variantId}`);
      if (!resp.ok) return;
      const { inventory } = await resp.json();
      if (typeof inventory === "number" && inventory > 0) { state.maxQty = inventory; updateQtyBtns(); }
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
    const name = document.getElementById("cod-name");
    const phone = document.getElementById("cod-phone");
    const wilaya = document.getElementById("cod-wilaya");
    const commune = document.getElementById("cod-commune");
    if (!name?.value.trim()||name.value.trim().length<3) { setError("cod-name","cod-name-err",true); valid=false; } else setError("cod-name","cod-name-err",false);
    const rp = phone?.value.replace(/\s/g,"");
    if (!rp||!/^0[5-7]\d{8}$/.test(rp)) { setError("cod-phone","cod-phone-err",true); valid=false; } else setError("cod-phone","cod-phone-err",false);
    if (!wilaya?.value) { setError("cod-wilaya","cod-wilaya-err",true); valid=false; } else setError("cod-wilaya","cod-wilaya-err",false);
    if (!commune?.value) { setError("cod-commune","cod-commune-err",true); valid=false; } else setError("cod-commune","cod-commune-err",false);
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
    const phone = document.getElementById("cod-phone")?.value.replace(/\s/g,"");
    const address = document.getElementById("cod-address")?.value.trim();
    const communeVal = document.getElementById("cod-commune")?.value;
    const payload = {
      variant_id: CONFIG.variantId, quantity: state.qty,
      customer_name: document.getElementById("cod-name")?.value.trim(),
      phone, wilaya: state.wilaya, commune: communeVal,
      address: address || `${communeVal}, ${state.wilaya}`,
      delivery_type: state.deliveryType, shipping_cost: state.shippingCost,
      product_price: CONFIG.price,
      total: (CONFIG.price * state.qty) + state.shippingCost,
      currency: CONFIG.currency,
    };
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/create-order`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error||"Order failed");
      state.submitted = true;
      showSuccess(data.order_id||data.order?.name||"#COD-"+Date.now().toString().slice(-6), payload);
    } catch(err) {
      if(btn) {
        btn.classList.remove("loading"); btn.disabled=false;
        const t=btn.querySelector(".cod-btn-text");
        if(t) { t.textContent="Erreur — Réessayer"; setTimeout(()=>{ if(t) t.textContent="Confirmer ma commande"; },3000); }
      }
      state.submitting=false;
    }
  }

  function showSuccess(orderId, payload) {
    const body = document.getElementById("cod-body");
    const footer = document.querySelector(".cod-footer");
    const success = document.getElementById("cod-success");
    if(body) body.style.display="none";
    if(footer) footer.style.display="none";

    // Fill receipt
    setEl("succ-order-id", orderId);
    setEl("succ-variant", state.variantTitle !== "Default Title" ? state.variantTitle : "Standard");
    setEl("succ-qty", state.qty + "x");
    setEl("succ-del-type", state.deliveryType === "home" ? "Domicile" : "StopDesk");
    setEl("succ-location", `${payload.commune}, ${payload.wilaya}`);
    setEl("succ-total", payload.total.toLocaleString("fr-DZ") + " " + CONFIG.currency);

    if(success) success.classList.add("visible");
    clearInterval(timerInterval);

    // Fire all conversion pixels
    fireConversionEvents(orderId, payload.total, CONFIG.variantId);
  }

  function formatPhone(input) {
    let v=input.value.replace(/\D/g,"").slice(0,10), f="";
    for(let i=0;i<v.length;i++){ if(i===2||i===4||i===6||i===8) f+=" "; f+=v[i]; }
    input.value=f;
  }

  let timerInterval;
  function startTimer() {
    timerInterval = setInterval(()=>{
      state.timerSecs--;
      if(state.timerSecs<=0) state.timerSecs=900;
      const m=String(Math.floor(state.timerSecs/60)).padStart(2,"0");
      const s=String(state.timerSecs%60).padStart(2,"0");
      const el=document.getElementById("cod-timer");
      if(el) el.textContent=`${m}:${s}`;
    },1000);
  }

  function animateCounters() {
    setInterval(()=>{ state.viewerCount=Math.max(3,Math.min(35,state.viewerCount+(Math.random()<0.5?-1:1))); setEl("cod-viewers",state.viewerCount); },4500);
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
    ["cod-name","cod-phone","cod-wilaya","cod-commune"].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.addEventListener("input",()=>{ el.classList.remove("cod-error"); const e=document.getElementById(id+"-err"); if(e) e.classList.remove("visible"); });
    });
  }

  function updateQtyBtns() {
    const m=document.getElementById("cod-qty-minus"), p=document.getElementById("cod-qty-plus");
    if(m) m.disabled=state.qty<=1;
    if(p) p.disabled=state.qty>=state.maxQty;
  }

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
    calcAndRender(); updateQtyBtns(); startTimer(); animateCounters();
    loadCommunes();
    fetchShopifyVariants().then(()=>{ fetchStock(); });
    bindEvents();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
