/**
 * COD Lead Form System — Algeri
 * Premium Redesign v3 (High-Converting, Clean UI)
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
    Adrar:{stopdesk:700,home:900},Chlef:{stopdesk:300,home:450},Laghouat:{stopdesk:400,home:550},
    "Oum El Bouaghi":{stopdesk:350,home:500},Batna:{stopdesk:300,home:450},Bejaia:{stopdesk:300,home:450},
    Biskra:{stopdesk:350,home:500},Bechar:{stopdesk:600,home:800},Blida:{stopdesk:250,home:400},
    Bouira:{stopdesk:300,home:450},Tamanrasset:{stopdesk:900,home:1100},Tebessa:{stopdesk:400,home:550},
    Tlemcen:{stopdesk:350,home:500},Tiaret:{stopdesk:350,home:500},"Tizi Ouzou":{stopdesk:300,home:450},
    Alger:{stopdesk:200,home:350},Djelfa:{stopdesk:400,home:550},Jijel:{stopdesk:350,home:500},
    Setif:{stopdesk:300,home:450},Saida:{stopdesk:400,home:550},Skikda:{stopdesk:350,home:500},
    "Sidi Bel Abbes":{stopdesk:350,home:500},Annaba:{stopdesk:350,home:500},Guelma:{stopdesk:350,home:500},
    Constantine:{stopdesk:300,home:450},Medea:{stopdesk:300,home:450},Mostaganem:{stopdesk:350,home:500},
    "M'Sila":{stopdesk:350,home:500},Mascara:{stopdesk:350,home:500},Ouargla:{stopdesk:500,home:700},
    Oran:{stopdesk:250,home:400},"El Bayadh":{stopdesk:500,home:700},Illizi:{stopdesk:900,home:1100},
    "Bordj Bou Arreridj":{stopdesk:350,home:500},Boumerdes:{stopdesk:250,home:400},
    "El Tarf":{stopdesk:400,home:550},Tindouf:{stopdesk:900,home:1100},Tissemsilt:{stopdesk:400,home:550},
    "El Oued":{stopdesk:450,home:650},Khenchela:{stopdesk:400,home:550},"Souk Ahras":{stopdesk:400,home:550},
    Tipaza:{stopdesk:250,home:400},Mila:{stopdesk:350,home:500},"Ain Defla":{stopdesk:300,home:450},
    Naama:{stopdesk:500,home:700},"Ain Temouchent":{stopdesk:350,home:500},Ghardaia:{stopdesk:500,home:700},
    Relizane:{stopdesk:350,home:500},
  };

  let COMMUNES_BY_WILAYA = {};

  let state = {
    qty: 1, maxQty: 99, wilaya: CONFIG.defaultWilaya, commune: "",
    deliveryType: "home", shippingCost: SHIPPING[CONFIG.defaultWilaya]?.home ?? 400,
    submitting: false, submitted: false,
    viewerCount: Math.floor(Math.random() * 18) + 7,
    ordersToday: Math.floor(Math.random() * 60) + 40,
    timerSecs: 900,
  };

  /* ── PREMIUM CSS ── */
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

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

      /* ── HEADER ── */
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
      }
      
      .cod-trust-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #059669;
        background: #ECFDF5;
        padding: 6px 10px;
        border-radius: 8px;
      }

      .cod-title {
        font-size: 22px;
        font-weight: 800;
        color: #111827;
        margin: 0 0 6px 0;
        letter-spacing: -0.5px;
      }
      
      .cod-subtitle {
        font-size: 14px;
        color: #6B7280;
        margin: 0;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ── URGENCY STRIP (Subtle) ── */
      .cod-urgency {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #F9FAFB;
        padding: 12px 24px;
        border-bottom: 1px solid #F3F4F6;
        font-size: 12px;
        font-weight: 600;
        color: #4B5563;
      }

      .cod-live-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .cod-pulse {
        width: 8px; height: 8px;
        background: #EF4444;
        border-radius: 50%;
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
        animation: pulseLive 2s infinite;
      }

      @keyframes pulseLive {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }

      .cod-timer {
        color: #DC2626;
        background: #FEF2F2;
        padding: 4px 8px;
        border-radius: 6px;
        font-variant-numeric: tabular-nums;
      }

      /* ── BODY ── */
      .cod-body {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      /* ── FIELDS ── */
      .cod-field-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .cod-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .cod-label {
        font-size: 13px;
        font-weight: 700;
        color: #374151;
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
        box-shadow: 0 0 0 4px rgba(255, 90, 31, 0.1);
      }

      .cod-input::placeholder { color: #9CA3AF; font-weight: 400; }

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
      }
      .cod-error-msg.visible { display: block; }

      /* ── DELIVERY CARDS ── */
      .cod-delivery-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .cod-delivery-option { position: relative; cursor: pointer; }
      .cod-delivery-option input { position: absolute; opacity: 0; pointer-events: none; }
      
      .cod-delivery-card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        padding: 16px;
        border: 2px solid #E5E7EB;
        border-radius: 16px;
        background: #ffffff;
        transition: all 0.2s ease;
        height: 100%;
      }

      .cod-del-top {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 700;
        color: #111827;
      }

      .cod-del-icon {
        color: #6B7280;
        display: flex;
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
      
      .cod-delivery-option input:checked + .cod-delivery-card .cod-del-icon {
        color: #FF5A1F;
      }
      
      .cod-delivery-option input:checked + .cod-delivery-card .cod-delivery-price {
        color: #FF5A1F;
      }

      /* ── QUANTITY AND SUMMARY ── */
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

      .cod-qty-label {
        font-weight: 700;
        color: #374151;
        font-size: 14px;
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
        width: 40px; height: 100%;
        background: none; border: none;
        cursor: pointer;
        font-size: 18px;
        color: #4B5563;
        display: flex; align-items: center; justify-content: center;
        transition: 0.2s;
      }
      
      .cod-qty-btn:hover:not(:disabled) { background: #F3F4F6; color: #111827; }
      .cod-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      
      .cod-qty-input {
        width: 40px; text-align: center;
        border: none; background: none;
        font-size: 15px; font-weight: 700; color: #111827;
        font-family: inherit; pointer-events: none;
      }

      .cod-price-line {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #4B5563;
        margin-bottom: 12px;
      }
      
      .cod-price-line:last-child { margin-bottom: 0; }
      
      .cod-price-val { font-weight: 600; color: #111827; }
      
      .cod-price-line.total {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #E5E7EB;
        font-size: 18px;
      }
      .cod-price-line.total .cod-price-key { color: #111827; font-weight: 800; }
      .cod-price-line.total .cod-price-val { color: #FF5A1F; font-weight: 800; }

      /* ── SUBMIT BUTTON ── */
      .cod-submit-btn {
        width: 100%; height: 60px;
        background: #FF5A1F;
        color: #fff;
        border: none;
        border-radius: 14px;
        font-family: inherit;
        font-size: 17px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.2s ease;
        box-shadow: 0 8px 20px -6px rgba(255, 90, 31, 0.4);
      }
      
      .cod-submit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        background: #F0490E;
        box-shadow: 0 12px 24px -6px rgba(255, 90, 31, 0.5);
      }
      
      .cod-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
      
      .cod-submit-btn.loading .cod-btn-text { display: none; }
      .cod-submit-btn.loading .cod-spinner { display: block; }
      
      .cod-spinner {
        display: none;
        width: 24px; height: 24px;
        border: 3px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: codSpin 0.8s linear infinite;
      }
      
      @keyframes codSpin { to { transform: rotate(360deg); } }

      /* ── FOOTER ── */
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
      }
      .cod-footer svg { color: #059669; }

      /* ── SUCCESS SCREEN ── */
      .cod-success {
        display: none;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 40px 24px;
        background: #fff;
      }
      
      .cod-success.visible { display: flex; animation: slideIn 0.4s ease forwards; }
      
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .cod-success-icon {
        width: 72px; height: 72px;
        background: #D1FAE5;
        color: #059669;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 20px;
      }

      .cod-success-title {
        font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 8px;
      }
      
      .cod-success-desc {
        font-size: 15px; color: #6B7280; line-height: 1.5; margin-bottom: 24px;
      }

      .cod-order-box {
        background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 16px;
        padding: 20px; width: 100%; max-width: 300px;
      }
      
      .cod-order-label { font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
      .cod-order-val { font-size: 20px; font-weight: 800; color: #111827; }

      /* ── RESPONSIVE ── */
      @media (max-width: 480px) {
        #cod-form-root { border-radius: 16px; border-left: none; border-right: none; }
        .cod-row { grid-template-columns: 1fr; gap: 12px; }
        .cod-delivery-grid { grid-template-columns: 1fr; }
        .cod-header { padding: 24px 20px 16px; }
        .cod-body { padding: 20px; gap: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── PREMIUM HTML STRUCTURE ── */
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
          <span><span id="cod-viewers" style="color:#111827;font-weight:800;">${state.viewerCount}</span> clients consultent ce produit</span>
        </div>
        <div class="cod-timer" id="cod-timer">15:00</div>
      </div>

      <div class="cod-body" id="cod-body">
        
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
        Vos données sont sécurisées. Paiement à la réception.
      </div>

      <div class="cod-success" id="cod-success">
        <div class="cod-success-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="cod-success-title">Commande Réussie !</div>
        <div class="cod-success-desc">Merci pour votre confiance. Notre équipe vous appellera dans moins de 24h pour confirmer l'expédition.</div>
        
        <div class="cod-order-box">
          <div class="cod-order-label">Numéro de Commande</div>
          <div class="cod-order-val" id="cod-order-id">#COD-000000</div>
        </div>
      </div>
    `;
  }

  /* ── JS LOGIC (Unchanged from original) ── */
  async function loadCommunes() {
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/communes`);
      if (!resp.ok) throw new Error("fetch failed");
      const data = await resp.json();
      data.forEach((c) => {
        const w = c.wilaya_name_ascii;
        if (!COMMUNES_BY_WILAYA[w]) COMMUNES_BY_WILAYA[w] = [];
        COMMUNES_BY_WILAYA[w].push(c.commune_name_ascii);
      });
    } catch (e) {
      Object.keys(SHIPPING).forEach((w) => { COMMUNES_BY_WILAYA[w] = [w + " Centre"]; });
    }
    populateWilayas();
    populateCommunes(state.wilaya);
  }

  function populateWilayas() {
    const sel = document.getElementById("cod-wilaya");
    if (!sel) return;
    const wilayas = Object.keys(SHIPPING).sort();
    sel.innerHTML = wilayas.map((w) => `<option value="${w}" ${w === CONFIG.defaultWilaya ? "selected" : ""}>${w}</option>`).join("");
  }

  function populateCommunes(wilaya) {
    const sel = document.getElementById("cod-commune");
    if (!sel) return;
    const communes = (COMMUNES_BY_WILAYA[wilaya] || []).slice().sort();
    sel.innerHTML = `<option value="">Sélectionner</option>` + communes.map((c) => `<option value="${c}">${c}</option>`).join("");
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
      }
    } catch (_) {}
  }

  function calcAndRender() {
    const productTotal = CONFIG.price * state.qty;
    const shipping = SHIPPING[state.wilaya]?.[state.deliveryType] ?? 400;
    state.shippingCost = shipping;
    const grand = productTotal + shipping;
    const fmt = (n) => n.toLocaleString("fr-DZ") + " " + CONFIG.currency;
    setEl("cod-product-total", fmt(productTotal));
    setEl("cod-shipping-total", fmt(shipping));
    setEl("cod-grand-total", fmt(grand));
    const w = SHIPPING[state.wilaya] || { stopdesk: 400, home: 550 };
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
    if (!name?.value.trim() || name.value.trim().length < 3) { setError("cod-name","cod-name-err",true); valid=false; } else setError("cod-name","cod-name-err",false);
    const rawPhone = phone?.value.replace(/\s/g,"");
    if (!rawPhone || !/^0[5-7]\d{8}$/.test(rawPhone)) { setError("cod-phone","cod-phone-err",true); valid=false; } else setError("cod-phone","cod-phone-err",false);
    if (!wilaya?.value) { setError("cod-wilaya","cod-wilaya-err",true); valid=false; } else setError("cod-wilaya","cod-wilaya-err",false);
    if (!commune?.value) { setError("cod-commune","cod-commune-err",true); valid=false; } else setError("cod-commune","cod-commune-err",false);
    return valid;
  }

  function setError(inputId, errId, show) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (input) show ? input.classList.add("cod-error") : input.classList.remove("cod-error");
    if (err) show ? err.classList.add("visible") : err.classList.remove("visible");
  }

  async function handleSubmit() {
    if (state.submitting || state.submitted) return;
    if (!validate()) return;
    state.submitting = true;
    const btn = document.getElementById("cod-submit");
    if (btn) { btn.classList.add("loading"); btn.disabled = true; }
    const phone = document.getElementById("cod-phone")?.value.replace(/\s/g,"");
    const address = document.getElementById("cod-address")?.value.trim();
    const payload = {
      variant_id: CONFIG.variantId, quantity: state.qty,
      customer_name: document.getElementById("cod-name")?.value.trim(),
      phone, wilaya: state.wilaya,
      commune: document.getElementById("cod-commune")?.value,
      address: address || `${document.getElementById("cod-commune")?.value}, ${state.wilaya}`,
      delivery_type: state.deliveryType, shipping_cost: state.shippingCost,
      product_price: CONFIG.price, total: CONFIG.price * state.qty + state.shippingCost,
      currency: CONFIG.currency,
    };
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Order failed");
      state.submitted = true;
      showSuccess(data.order_id || data.order?.name || "#COD-" + Date.now().toString().slice(-6));
    } catch (err) {
      if (btn) {
        btn.classList.remove("loading"); btn.disabled = false;
        const txt = btn.querySelector(".cod-btn-text");
        if (txt) { txt.textContent = "Erreur — Réessayer"; setTimeout(() => { if (txt) txt.textContent = "Confirmer ma commande"; }, 3000); }
      }
      state.submitting = false;
    }
  }

  function showSuccess(orderId) {
    const body = document.getElementById("cod-body");
    const footer = document.querySelector(".cod-footer");
    const success = document.getElementById("cod-success");
    const orderIdEl = document.getElementById("cod-order-id");
    if (body) body.style.display = "none";
    if (footer) footer.style.display = "none";
    if (success) success.classList.add("visible");
    if (orderIdEl) orderIdEl.textContent = orderId;
    clearInterval(timerInterval);
  }

  function formatPhone(input) {
    let v = input.value.replace(/\D/g,"").slice(0,10);
    let f = "";
    for (let i=0;i<v.length;i++) { if (i===2||i===4||i===6||i===8) f+=" "; f+=v[i]; }
    input.value = f;
  }

  let timerInterval;
  function startTimer() {
    timerInterval = setInterval(() => {
      state.timerSecs--;
      if (state.timerSecs <= 0) state.timerSecs = 900;
      const m = String(Math.floor(state.timerSecs/60)).padStart(2,"0");
      const s = String(state.timerSecs%60).padStart(2,"0");
      const el = document.getElementById("cod-timer");
      if (el) el.textContent = `${m}:${s}`;
    }, 1000);
  }

  function animateCounters() {
    setInterval(() => {
      state.viewerCount = Math.max(3, Math.min(35, state.viewerCount + (Math.random()<0.5?-1:1)));
      setEl("cod-viewers", state.viewerCount);
    }, 4500);
  }

  function bindEvents() {
    const wilaySel = document.getElementById("cod-wilaya");
    if (wilaySel) wilaySel.addEventListener("change", (e) => { state.wilaya=e.target.value; populateCommunes(state.wilaya); calcAndRender(); });
    document.querySelectorAll("input[name='cod-delivery']").forEach((r) => r.addEventListener("change",(e)=>{ state.deliveryType=e.target.value; calcAndRender(); }));
    const minus = document.getElementById("cod-qty-minus");
    const plus = document.getElementById("cod-qty-plus");
    if (minus) minus.addEventListener("click",()=>{ if(state.qty>1){state.qty--;document.getElementById("cod-qty").value=state.qty;calcAndRender();updateQtyBtns();}});
    if (plus) plus.addEventListener("click",()=>{ if(state.qty<state.maxQty){state.qty++;document.getElementById("cod-qty").value=state.qty;calcAndRender();updateQtyBtns();}});
    const phoneInput = document.getElementById("cod-phone");
    if (phoneInput) phoneInput.addEventListener("input",()=>formatPhone(phoneInput));
    const btn = document.getElementById("cod-submit");
    if (btn) btn.addEventListener("click", handleSubmit);
    ["cod-name","cod-phone","cod-wilaya","cod-commune"].forEach((id)=>{
      const el=document.getElementById(id);
      if(el) el.addEventListener("input",()=>{ el.classList.remove("cod-error"); const e=document.getElementById(id+"-err"); if(e) e.classList.remove("visible"); });
    });
  }

  function updateQtyBtns() {
    const minus = document.getElementById("cod-qty-minus");
    const plus = document.getElementById("cod-qty-plus");
    if (minus) minus.disabled = state.qty <= 1;
    if (plus) plus.disabled = state.qty >= state.maxQty;
  }

  function init() {
    injectStyles();
    let mount = document.getElementById("cod-form-mount") || document.querySelector("[data-cod-form]");
    if (!mount) {
      const buyBtn = document.querySelector('[name="add"]') || document.querySelector(".product-form__submit") || document.querySelector(".btn-addtocart");
      if (buyBtn) { mount = document.createElement("div"); buyBtn.parentNode.insertBefore(mount, buyBtn.nextSibling); }
      else { mount = document.createElement("div"); document.body.appendChild(mount); }
    }
    const root = document.createElement("div");
    root.id = "cod-form-root";
    root.innerHTML = buildHTML();
    mount.appendChild(root);
    calcAndRender();
    updateQtyBtns();
    startTimer();
    animateCounters();
    loadCommunes();
    fetchStock();
    bindEvents();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
