/**
 * COD Lead Form System — Algeria
 * Premium redesign v2
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

  // Override with window config if present
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

  /* ── CSS ── */
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

      #cod-form-root, #cod-form-root * {
        box-sizing: border-box;
        margin: 0; padding: 0;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      #cod-form-root {
        width: 100%;
        background: #fff;
        border-radius: 24px;
        overflow: hidden;
        border: 1px solid #f0f0f0;
        box-shadow: 0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
        animation: codSlideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both;
      }

      @keyframes codSlideUp {
        from { opacity:0; transform:translateY(20px); }
        to   { opacity:1; transform:translateY(0); }
      }

      /* ── HEADER ── */
      .cod-header {
        background: linear-gradient(135deg, #111118 0%, #1e1e2e 100%);
        padding: 22px 24px 20px;
        position: relative;
        overflow: hidden;
      }
      .cod-header::after {
        content: '';
        position: absolute;
        top: -60px; right: -60px;
        width: 180px; height: 180px;
        background: radial-gradient(circle, rgba(255,77,48,0.35) 0%, transparent 70%);
        pointer-events: none;
      }
      .cod-header::before {
        content: '';
        position: absolute;
        bottom: -40px; left: -20px;
        width: 120px; height: 120px;
        background: radial-gradient(circle, rgba(255,149,0,0.2) 0%, transparent 70%);
        pointer-events: none;
      }
      .cod-header-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,77,48,0.18);
        border: 1px solid rgba(255,77,48,0.3);
        color: #ff7a5c;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 20px;
        margin-bottom: 10px;
        position: relative;
      }
      .cod-header-title {
        font-size: 19px;
        font-weight: 800;
        color: #fff;
        line-height: 1.25;
        position: relative;
        letter-spacing: -0.3px;
      }
      .cod-header-sub {
        font-size: 12.5px;
        color: rgba(255,255,255,0.45);
        margin-top: 4px;
        font-weight: 400;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ── URGENCY STRIP ── */
      .cod-urgency {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff8f5;
        border-bottom: 1px solid #ffe8e0;
        padding: 9px 20px;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cod-urgency-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: #cc3a1e;
      }
      .cod-live-pulse {
        width: 7px; height: 7px;
        background: #ff4d30;
        border-radius: 50%;
        flex-shrink: 0;
        animation: codPulse 1.5s ease-in-out infinite;
        box-shadow: 0 0 0 0 rgba(255,77,48,0.4);
      }
      @keyframes codPulse {
        0%   { box-shadow: 0 0 0 0 rgba(255,77,48,0.5); }
        70%  { box-shadow: 0 0 0 6px rgba(255,77,48,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,77,48,0); }
      }
      .cod-timer-badge {
        display: flex;
        align-items: center;
        gap: 5px;
        background: #fff0ec;
        border: 1px solid #ffd4c9;
        border-radius: 8px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 700;
        color: #cc3a1e;
      }
      .cod-timer { font-variant-numeric: tabular-nums; letter-spacing: 0.5px; }

      /* ── TRUST BADGES ── */
      .cod-trust {
        display: flex;
        gap: 8px;
        padding: 14px 20px 0;
        flex-wrap: wrap;
      }
      .cod-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #f0faf5;
        color: #00966b;
        border: 1px solid #c8edd9;
        border-radius: 10px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
      }
      .cod-badge-dot {
        width: 6px; height: 6px;
        background: #00b67a;
        border-radius: 50%;
        flex-shrink: 0;
      }

      /* ── BODY ── */
      .cod-body {
        padding: 16px 20px 20px;
        display: flex;
        flex-direction: column;
        gap: 13px;
      }

      /* ── FIELDS ── */
      .cod-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cod-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .cod-label {
        font-size: 12px;
        font-weight: 700;
        color: #444;
        letter-spacing: 0.2px;
      }
      .cod-input, .cod-select {
        width: 100%;
        height: 48px;
        padding: 0 14px;
        background: #f7f7f9;
        border: 1.5px solid #ebebeb;
        border-radius: 12px;
        font-size: 14px;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-weight: 500;
        color: #111;
        outline: none;
        transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        appearance: none;
        -webkit-appearance: none;
      }
      .cod-select {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 5L10 1' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 14px center;
        padding-right: 36px;
        cursor: pointer;
      }
      .cod-input:focus, .cod-select:focus {
        border-color: #ff4d30;
        background: #fff;
        box-shadow: 0 0 0 3.5px rgba(255,77,48,0.10);
      }
      .cod-input::placeholder { color: #bbb; font-weight: 400; }
      .cod-input.cod-error, .cod-select.cod-error {
        border-color: #ff4d30;
        background: #fff5f3;
        box-shadow: 0 0 0 3px rgba(255,77,48,0.08);
      }
      .cod-error-msg {
        font-size: 11.5px;
        color: #e03018;
        font-weight: 600;
        display: none;
        align-items: center;
        gap: 4px;
      }
      .cod-error-msg.visible { display: flex; }

      /* ── DELIVERY CARDS ── */
      .cod-delivery-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .cod-delivery-option { position: relative; cursor: pointer; }
      .cod-delivery-option input { position: absolute; opacity: 0; pointer-events: none; }
      .cod-delivery-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 13px 14px;
        border: 1.5px solid #ebebeb;
        border-radius: 14px;
        background: #f7f7f9;
        transition: all 0.15s ease;
        cursor: pointer;
      }
      .cod-delivery-icon {
        width: 36px; height: 36px;
        border-radius: 10px;
        background: #ebebeb;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background 0.15s ease;
      }
      .cod-delivery-info { flex: 1; min-width: 0; }
      .cod-delivery-name {
        font-size: 13px;
        font-weight: 700;
        color: #111;
        line-height: 1;
      }
      .cod-delivery-price {
        font-size: 12px;
        color: #999;
        font-weight: 500;
        margin-top: 3px;
      }
      .cod-delivery-option input:checked + .cod-delivery-card {
        border-color: #ff4d30;
        background: #fff5f3;
        box-shadow: 0 0 0 3px rgba(255,77,48,0.08);
      }
      .cod-delivery-option input:checked + .cod-delivery-card .cod-delivery-icon {
        background: rgba(255,77,48,0.12);
      }
      .cod-delivery-option input:checked + .cod-delivery-card .cod-delivery-price {
        color: #e03018;
        font-weight: 700;
      }

      /* ── QTY + PRICE ── */
      .cod-qty-price-row {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: start;
      }
      .cod-qty-wrapper {
        display: flex;
        align-items: center;
        background: #f7f7f9;
        border: 1.5px solid #ebebeb;
        border-radius: 12px;
        overflow: hidden;
        height: 48px;
        width: 120px;
      }
      .cod-qty-btn {
        width: 42px; height: 100%;
        background: none; border: none;
        cursor: pointer;
        font-size: 20px;
        font-weight: 300;
        color: #555;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.12s ease, color 0.12s ease;
        flex-shrink: 0;
        line-height: 1;
      }
      .cod-qty-btn:hover:not(:disabled) { background: #ebebeb; color: #ff4d30; }
      .cod-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      .cod-qty-input {
        flex: 1; text-align: center; height: 100%;
        border: none; background: none;
        font-size: 16px; font-weight: 700; color: #111;
        outline: none;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        width: 0;
      }
      .cod-stock-warn {
        font-size: 11px; color: #ff9500; font-weight: 700;
        display: none; align-items: center; gap: 4px; margin-top: 4px;
      }
      .cod-stock-warn.visible { display: flex; }

      /* ── PRICE SUMMARY ── */
      .cod-price-summary {
        background: #f7f7f9;
        border: 1.5px solid #ebebeb;
        border-radius: 14px;
        overflow: hidden;
      }
      .cod-price-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 9px 14px;
        font-size: 13px;
        border-bottom: 1px solid #ebebeb;
      }
      .cod-price-line:last-child { border-bottom: none; }
      .cod-price-line.total {
        background: #111118;
        padding: 12px 14px;
        border-bottom: none;
      }
      .cod-price-key { color: #888; font-weight: 500; }
      .cod-price-val { font-weight: 700; color: #111; }
      .cod-price-line.total .cod-price-key { color: rgba(255,255,255,0.6); font-weight: 500; }
      .cod-price-line.total .cod-price-val { color: #fff; font-size: 17px; font-weight: 800; letter-spacing: -0.3px; }

      /* ── ADDRESS ── */
      /* uses cod-input, cod-field, cod-label */

      /* ── SUBMIT ── */
      .cod-submit-btn {
        width: 100%; height: 56px;
        background: linear-gradient(135deg, #ff4d30 0%, #ff6b4a 100%);
        color: #fff;
        border: none;
        border-radius: 14px;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-size: 16px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        position: relative;
        overflow: hidden;
        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        letter-spacing: -0.2px;
        box-shadow: 0 4px 16px rgba(255,77,48,0.28), 0 1px 4px rgba(255,77,48,0.15);
      }
      .cod-submit-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
        pointer-events: none;
      }
      .cod-submit-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(255,77,48,0.38), 0 2px 6px rgba(255,77,48,0.2);
      }
      .cod-submit-btn:active:not(:disabled) { transform: translateY(0); }
      .cod-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; box-shadow: none; }
      .cod-submit-btn.loading .cod-btn-text { display: none; }
      .cod-submit-btn.loading .cod-spinner { display: block; }
      .cod-spinner {
        display: none;
        width: 22px; height: 22px;
        border: 2.5px solid rgba(255,255,255,0.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: codSpin 0.65s linear infinite;
      }
      @keyframes codSpin { to { transform: rotate(360deg); } }

      /* ── FOOTER ── */
      .cod-footer {
        padding: 12px 20px;
        text-align: center;
        font-size: 11.5px;
        color: #bbb;
        border-top: 1px solid #f0f0f0;
        font-weight: 500;
      }
      .cod-footer span { color: #00b67a; font-weight: 700; }

      /* ── SUCCESS ── */
      .cod-success {
        display: none;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 48px 28px 40px;
        gap: 0;
        background: #fff;
        animation: codFadeUp 0.5s ease both;
      }
      .cod-success.visible { display: flex; }
      @keyframes codFadeUp {
        from { opacity:0; transform:translateY(14px); }
        to   { opacity:1; transform:translateY(0); }
      }
      .cod-success-ring {
        width: 88px; height: 88px;
        border-radius: 50%;
        background: conic-gradient(#00b67a 0deg, #00b67a 360deg);
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 22px;
        position: relative;
        animation: codPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
      }
      .cod-success-ring::before {
        content: '';
        position: absolute;
        inset: 4px;
        background: #fff;
        border-radius: 50%;
      }
      .cod-success-ring svg { position: relative; z-index: 1; }
      @keyframes codPop {
        from { transform: scale(0.4); opacity:0; }
        to   { transform: scale(1); opacity:1; }
      }
      .cod-success-title {
        font-size: 24px; font-weight: 800; color: #111;
        letter-spacing: -0.5px; line-height: 1.2;
        margin-bottom: 10px;
      }
      .cod-success-sub {
        font-size: 14px; color: #888; line-height: 1.6;
        max-width: 260px; font-weight: 400;
        margin-bottom: 24px;
      }
      .cod-success-card {
        width: 100%; max-width: 280px;
        background: #f7f7f9;
        border: 1.5px solid #ebebeb;
        border-radius: 16px;
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 20px;
      }
      .cod-success-label { font-size: 11px; color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      .cod-success-order-id { font-size: 22px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
      .cod-success-badges {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .cod-success-badge {
        display: flex; align-items: center; gap: 5px;
        background: #f0faf5; color: #00966b;
        border: 1px solid #c8edd9;
        border-radius: 8px; padding: 6px 12px;
        font-size: 12px; font-weight: 600;
      }

      /* ── RESPONSIVE ── */
      @media (max-width: 480px) {
        #cod-form-root { border-radius: 16px; }
        .cod-header { padding: 18px 16px 16px; }
        .cod-body { padding: 14px 16px 18px; gap: 12px; }
        .cod-urgency { padding: 8px 16px; }
        .cod-trust { padding: 12px 16px 0; }
        .cod-row { grid-template-columns: 1fr 1fr; }
        .cod-footer { padding: 10px 16px; }
        .cod-header-title { font-size: 17px; }
      }
      @media (max-width: 360px) {
        .cod-row { grid-template-columns: 1fr; }
        .cod-delivery-grid { grid-template-columns: 1fr 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── HTML ── */
  function buildHTML() {
    return `
      <div class="cod-header">
        <div class="cod-header-eyebrow">
          <span style="width:6px;height:6px;background:#ff7a5c;border-radius:50%;display:inline-block;"></span>
          Commande rapide
        </div>
        <div class="cod-header-title">Paiement à la Livraison</div>
        <div class="cod-header-sub">${CONFIG.productTitle}</div>
      </div>

      <div class="cod-urgency">
        <div class="cod-urgency-item">
          <span class="cod-live-pulse"></span>
          <span><span id="cod-viewers">${state.viewerCount}</span> personnes voient ceci</span>
        </div>
        <div class="cod-urgency-item" style="color:#888;font-weight:500;">
          🛒 <span id="cod-orders">${state.ordersToday}</span> commandes aujourd'hui
        </div>
        <div class="cod-timer-badge">
          ⏱ <span class="cod-timer" id="cod-timer">15:00</span>
        </div>
      </div>

      <div class="cod-trust">
        <div class="cod-badge"><span class="cod-badge-dot"></span> Paiement à la livraison</div>
        <div class="cod-badge"><span class="cod-badge-dot"></span> Livraison 24–72h</div>
      </div>

      <div class="cod-body" id="cod-body">

        <div class="cod-field">
          <label class="cod-label">Nom complet *</label>
          <input id="cod-name" class="cod-input" type="text" placeholder="Ahmed Benali" autocomplete="name" />
          <span class="cod-error-msg" id="cod-name-err">⚠ Veuillez entrer votre nom</span>
        </div>

        <div class="cod-field">
          <label class="cod-label">Numéro de téléphone *</label>
          <input id="cod-phone" class="cod-input" type="tel" placeholder="05 XX XX XX XX" autocomplete="tel" maxlength="14" />
          <span class="cod-error-msg" id="cod-phone-err">⚠ Numéro invalide (ex: 0551234567)</span>
        </div>

        <div class="cod-row">
          <div class="cod-field">
            <label class="cod-label">Wilaya *</label>
            <select id="cod-wilaya" class="cod-select"></select>
            <span class="cod-error-msg" id="cod-wilaya-err">⚠ Sélectionnez</span>
          </div>
          <div class="cod-field">
            <label class="cod-label">Commune *</label>
            <select id="cod-commune" class="cod-select"><option value="">— Commune —</option></select>
            <span class="cod-error-msg" id="cod-commune-err">⚠ Sélectionnez</span>
          </div>
        </div>

        <div class="cod-field">
          <label class="cod-label">Mode de livraison *</label>
          <div class="cod-delivery-grid">
            <label class="cod-delivery-option">
              <input type="radio" name="cod-delivery" value="home" checked />
              <div class="cod-delivery-card">
                <div class="cod-delivery-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d30" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div class="cod-delivery-info">
                  <div class="cod-delivery-name">Domicile</div>
                  <div class="cod-delivery-price" id="cod-home-price">— DZD</div>
                </div>
              </div>
            </label>
            <label class="cod-delivery-option">
              <input type="radio" name="cod-delivery" value="stopdesk" />
              <div class="cod-delivery-card">
                <div class="cod-delivery-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                </div>
                <div class="cod-delivery-info">
                  <div class="cod-delivery-name">Stop Desk</div>
                  <div class="cod-delivery-price" id="cod-stopdesk-price">— DZD</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="cod-qty-price-row">
          <div class="cod-field">
            <label class="cod-label">Qté</label>
            <div class="cod-qty-wrapper">
              <button class="cod-qty-btn" id="cod-qty-minus" type="button">−</button>
              <input class="cod-qty-input" id="cod-qty" type="number" value="1" min="1" max="99" readonly />
              <button class="cod-qty-btn" id="cod-qty-plus" type="button">+</button>
            </div>
            <div class="cod-stock-warn" id="cod-stock-warn">⚠ <span id="cod-stock-num">5</span> en stock</div>
          </div>
          <div class="cod-field">
            <label class="cod-label">Récapitulatif</label>
            <div class="cod-price-summary">
              <div class="cod-price-line">
                <span class="cod-price-key">Produit</span>
                <span class="cod-price-val" id="cod-product-total">—</span>
              </div>
              <div class="cod-price-line">
                <span class="cod-price-key">Livraison</span>
                <span class="cod-price-val" id="cod-shipping-total">—</span>
              </div>
              <div class="cod-price-line total">
                <span class="cod-price-key">Total</span>
                <span class="cod-price-val" id="cod-grand-total">—</span>
              </div>
            </div>
          </div>
        </div>

        <div class="cod-field">
          <label class="cod-label">Adresse précise (optionnel)</label>
          <input id="cod-address" class="cod-input" type="text" placeholder="Rue, quartier, numéro..." />
        </div>

        <button class="cod-submit-btn" id="cod-submit" type="button">
          <span class="cod-btn-text">✓ Confirmer ma commande</span>
          <div class="cod-spinner"></div>
        </button>

      </div>

      <div class="cod-success" id="cod-success">
        <div class="cod-success-ring">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#00b67a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="cod-success-title">Commande confirmée !</div>
        <div class="cod-success-sub">Notre équipe vous contactera dans <strong>24h</strong> pour confirmer la livraison.</div>
        <div class="cod-success-card">
          <div class="cod-success-label">Numéro de commande</div>
          <div class="cod-success-order-id" id="cod-order-id">#COD-000000</div>
        </div>
        <div class="cod-success-badges">
          <div class="cod-success-badge">📦 Préparation en cours</div>
          <div class="cod-success-badge">💳 Paiement à la livraison</div>
        </div>
      </div>

      <div class="cod-footer">
        <span>🔒</span> Paiement 100% sécurisé · Retour gratuit sous 7 jours
      </div>
    `;
  }

  /* ── COMMUNES ── */
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
    sel.innerHTML = `<option value="">— Commune —</option>` + communes.map((c) => `<option value="${c}">${c}</option>`).join("");
    state.commune = "";
  }

  /* ── STOCK ── */
  async function fetchStock() {
    if (!CONFIG.variantId) return;
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/stock?variant_id=${CONFIG.variantId}`);
      if (!resp.ok) return;
      const { inventory } = await resp.json();
      if (typeof inventory === "number" && inventory > 0) {
        state.maxQty = inventory;
        const qtyInput = document.getElementById("cod-qty");
        if (qtyInput) qtyInput.max = inventory;
        if (inventory <= 5) {
          const warn = document.getElementById("cod-stock-warn");
          const num = document.getElementById("cod-stock-num");
          if (warn && num) { num.textContent = inventory; warn.classList.add("visible"); }
        }
      }
    } catch (_) {}
  }

  /* ── PRICE CALC ── */
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

  /* ── VALIDATION ── */
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

  /* ── SUBMIT ── */
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
        if (txt) { txt.textContent = "⚠ Erreur — Réessayer"; setTimeout(() => { if (txt) txt.textContent = "✓ Confirmer ma commande"; }, 3000); }
      }
      state.submitting = false;
    }
  }

  function showSuccess(orderId) {
    const body = document.getElementById("cod-body");
    const success = document.getElementById("cod-success");
    const orderIdEl = document.getElementById("cod-order-id");
    if (body) body.style.display = "none";
    if (success) success.classList.add("visible");
    if (orderIdEl) orderIdEl.textContent = orderId;
    clearInterval(timerInterval);
  }

  /* ── PHONE FORMAT ── */
  function formatPhone(input) {
    let v = input.value.replace(/\D/g,"").slice(0,10);
    let f = "";
    for (let i=0;i<v.length;i++) { if (i===2||i===4||i===6||i===8) f+=" "; f+=v[i]; }
    input.value = f;
  }

  /* ── TIMER ── */
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

  /* ── LIVE COUNTERS ── */
  function animateCounters() {
    setInterval(() => {
      state.viewerCount = Math.max(3, Math.min(35, state.viewerCount + (Math.random()<0.5?-1:1)));
      setEl("cod-viewers", state.viewerCount);
    }, 4500);
    setInterval(() => {
      if (Math.random()<0.3) { state.ordersToday++; setEl("cod-orders", state.ordersToday); }
    }, 8000);
  }

  /* ── BIND ── */
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

  /* ── INIT ── */
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
    setTimeout(() => document.getElementById("cod-name")?.focus(), 400);
    loadCommunes();
    fetchStock();
    bindEvents();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
