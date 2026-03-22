/**
 * COD Lead Form System — Algeria
 * Drop-in Shopify embed script
 * Usage: <script src="https://your-vercel-app.vercel.app/embed.js"
 *               data-variant-id="12345678"
 *               data-price="2500"
 *               data-product-title="Product Name"
 *               data-currency="DZD"></script>
 */
(function () {
  "use strict";

  /* ─────────────────────────────────────────────
     CONFIG  (can be overridden via data-* attrs)
  ───────────────────────────────────────────── */
  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  const BASE_URL = currentScript.src
    ? currentScript.src.split("/embed.js")[0]
    : "";

const CONFIG = {
  variantId: window.__COD_CONFIG__?.variantId || null,
  price: window.__COD_CONFIG__?.price || 2500,
  productTitle: window.__COD_CONFIG__?.productTitle || "Votre Produit",
  currency: window.__COD_CONFIG__?.currency || "DZD",
  apiBase: window.__COD_CONFIG__?.apiBase || "https://leadform-ebth.vercel.app",
  defaultWilaya: "Alger",
};

  /* ─────────────────────────────────────────────
     SHIPPING PRICES  (wilaya → stop desk / home)
  ───────────────────────────────────────────── */
  const SHIPPING = {
    Adrar: { stopdesk: 700, home: 900 },
    Chlef: { stopdesk: 300, home: 450 },
    Laghouat: { stopdesk: 400, home: 550 },
    "Oum El Bouaghi": { stopdesk: 350, home: 500 },
    Batna: { stopdesk: 300, home: 450 },
    Bejaia: { stopdesk: 300, home: 450 },
    Biskra: { stopdesk: 350, home: 500 },
    Bechar: { stopdesk: 600, home: 800 },
    Blida: { stopdesk: 250, home: 400 },
    Bouira: { stopdesk: 300, home: 450 },
    Tamanrasset: { stopdesk: 900, home: 1100 },
    Tebessa: { stopdesk: 400, home: 550 },
    Tlemcen: { stopdesk: 350, home: 500 },
    Tiaret: { stopdesk: 350, home: 500 },
    "Tizi Ouzou": { stopdesk: 300, home: 450 },
    Alger: { stopdesk: 200, home: 350 },
    Djelfa: { stopdesk: 400, home: 550 },
    Jijel: { stopdesk: 350, home: 500 },
    Setif: { stopdesk: 300, home: 450 },
    Saida: { stopdesk: 400, home: 550 },
    Skikda: { stopdesk: 350, home: 500 },
    "Sidi Bel Abbes": { stopdesk: 350, home: 500 },
    Annaba: { stopdesk: 350, home: 500 },
    Guelma: { stopdesk: 350, home: 500 },
    Constantine: { stopdesk: 300, home: 450 },
    Medea: { stopdesk: 300, home: 450 },
    Mostaganem: { stopdesk: 350, home: 500 },
    "M'Sila": { stopdesk: 350, home: 500 },
    Mascara: { stopdesk: 350, home: 500 },
    Ouargla: { stopdesk: 500, home: 700 },
    Oran: { stopdesk: 250, home: 400 },
    "El Bayadh": { stopdesk: 500, home: 700 },
    Illizi: { stopdesk: 900, home: 1100 },
    "Bordj Bou Arreridj": { stopdesk: 350, home: 500 },
    Boumerdes: { stopdesk: 250, home: 400 },
    "El Tarf": { stopdesk: 400, home: 550 },
    Tindouf: { stopdesk: 900, home: 1100 },
    Tissemsilt: { stopdesk: 400, home: 550 },
    "El Oued": { stopdesk: 450, home: 650 },
    Khenchela: { stopdesk: 400, home: 550 },
    Souk Ahras: { stopdesk: 400, home: 550 },
    Tipaza: { stopdesk: 250, home: 400 },
    Mila: { stopdesk: 350, home: 500 },
    "Ain Defla": { stopdesk: 300, home: 450 },
    Naama: { stopdesk: 500, home: 700 },
    "Ain Temouchent": { stopdesk: 350, home: 500 },
    Ghardaia: { stopdesk: 500, home: 700 },
    Relizane: { stopdesk: 350, home: 500 },
  };

  /* ─────────────────────────────────────────────
     ALGERIA COMMUNES DATA  (embedded minimal set
     — full JSON loaded async from /api/communes)
  ───────────────────────────────────────────── */
  // Will be populated after fetch
  let COMMUNES_BY_WILAYA = {};

  /* ─────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────── */
  let state = {
    qty: 1,
    maxQty: 99,
    wilaya: CONFIG.defaultWilaya,
    commune: "",
    deliveryType: "home",
    shippingCost: SHIPPING[CONFIG.defaultWilaya]?.home ?? 400,
    submitting: false,
    submitted: false,
    stockLoaded: false,
    viewerCount: Math.floor(Math.random() * 18) + 7,
    ordersToday: Math.floor(Math.random() * 60) + 40,
    timerSecs: 900, // 15 min countdown
  };

  /* ─────────────────────────────────────────────
     CSS INJECTION
  ───────────────────────────────────────────── */
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

      :root {
        --cod-ink: #0a0a0a;
        --cod-bg: #fafaf8;
        --cod-surface: #ffffff;
        --cod-accent: #e8533a;
        --cod-accent-light: #fdf1ee;
        --cod-accent-hover: #d4432a;
        --cod-green: #1db87e;
        --cod-green-bg: #edfaf4;
        --cod-border: #e8e8e6;
        --cod-muted: #888882;
        --cod-warning: #f5a623;
        --cod-radius: 14px;
        --cod-radius-sm: 8px;
        --cod-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
        --cod-shadow-lg: 0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
        --cod-font-display: 'Syne', sans-serif;
        --cod-font-body: 'DM Sans', sans-serif;
        --cod-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      #cod-form-root * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: var(--cod-font-body);
        -webkit-font-smoothing: antialiased;
      }

      #cod-form-root {
        width: 100%;
        max-width: 520px;
        background: var(--cod-surface);
        border-radius: var(--cod-radius);
        box-shadow: var(--cod-shadow-lg);
        overflow: hidden;
        border: 1px solid var(--cod-border);
        position: relative;
      }

      /* ── Header ── */
      .cod-header {
        background: var(--cod-ink);
        padding: 20px 24px 16px;
        position: relative;
        overflow: hidden;
      }
      .cod-header::before {
        content: '';
        position: absolute;
        top: -40px; right: -40px;
        width: 140px; height: 140px;
        background: var(--cod-accent);
        border-radius: 50%;
        opacity: 0.15;
      }
      .cod-header-title {
        font-family: var(--cod-font-display);
        font-size: 18px;
        font-weight: 800;
        color: #fff;
        line-height: 1.2;
        position: relative;
      }
      .cod-header-sub {
        font-size: 12px;
        color: rgba(255,255,255,0.55);
        margin-top: 3px;
        font-weight: 400;
        position: relative;
      }

      /* ── Live bar ── */
      .cod-live-bar {
        display: flex;
        align-items: center;
        gap: 16px;
        background: var(--cod-accent-light);
        border-bottom: 1px solid #f2d5ce;
        padding: 9px 24px;
        font-size: 12px;
        font-weight: 500;
        color: var(--cod-accent);
        flex-wrap: wrap;
      }
      .cod-live-dot {
        display: inline-block;
        width: 7px; height: 7px;
        background: var(--cod-accent);
        border-radius: 50%;
        animation: cod-pulse 1.4s ease-in-out infinite;
        flex-shrink: 0;
      }
      .cod-live-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .cod-live-sep { color: #e2b5ac; }

      /* ── Countdown ── */
      .cod-countdown-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: #fff8f0;
        border-bottom: 1px solid #fde8cc;
        padding: 8px 24px;
        font-size: 12px;
        color: var(--cod-warning);
        font-weight: 600;
      }
      .cod-timer {
        font-family: var(--cod-font-display);
        font-size: 14px;
        letter-spacing: 1px;
        font-weight: 700;
        color: var(--cod-accent);
      }

      /* ── Body ── */
      .cod-body {
        padding: 20px 24px 24px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      /* ── Trust badges ── */
      .cod-badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .cod-badge {
        display: flex;
        align-items: center;
        gap: 5px;
        background: var(--cod-green-bg);
        color: var(--cod-green);
        border-radius: 20px;
        padding: 5px 11px;
        font-size: 11.5px;
        font-weight: 600;
        border: 1px solid #c0edd9;
        flex-shrink: 0;
      }
      .cod-badge svg { flex-shrink: 0; }

      /* ── Field groups ── */
      .cod-row {
        display: flex;
        gap: 10px;
      }
      .cod-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex: 1;
      }
      .cod-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--cod-ink);
        letter-spacing: 0.3px;
        text-transform: uppercase;
      }
      .cod-input,
      .cod-select {
        width: 100%;
        height: 46px;
        padding: 0 14px;
        background: var(--cod-bg);
        border: 1.5px solid var(--cod-border);
        border-radius: var(--cod-radius-sm);
        font-size: 14.5px;
        font-family: var(--cod-font-body);
        color: var(--cod-ink);
        outline: none;
        transition: border-color var(--cod-transition), box-shadow var(--cod-transition), background var(--cod-transition);
        appearance: none;
        -webkit-appearance: none;
      }
      .cod-select {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 13px center;
        padding-right: 34px;
        cursor: pointer;
      }
      .cod-input:focus,
      .cod-select:focus {
        border-color: var(--cod-accent);
        background: #fff;
        box-shadow: 0 0 0 3px rgba(232,83,58,0.12);
      }
      .cod-input::placeholder { color: #b8b8b2; }
      .cod-input.cod-error,
      .cod-select.cod-error {
        border-color: var(--cod-accent);
        background: var(--cod-accent-light);
      }
      .cod-error-msg {
        font-size: 11.5px;
        color: var(--cod-accent);
        font-weight: 500;
        margin-top: 2px;
        display: none;
      }
      .cod-error-msg.visible { display: block; }

      /* ── Qty ── */
      .cod-qty-wrapper {
        display: flex;
        align-items: center;
        gap: 0;
        background: var(--cod-bg);
        border: 1.5px solid var(--cod-border);
        border-radius: var(--cod-radius-sm);
        overflow: hidden;
        height: 46px;
        width: 130px;
        flex-shrink: 0;
      }
      .cod-qty-btn {
        width: 40px;
        height: 100%;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: var(--cod-ink);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background var(--cod-transition);
        flex-shrink: 0;
      }
      .cod-qty-btn:hover { background: var(--cod-border); }
      .cod-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      .cod-qty-input {
        flex: 1;
        text-align: center;
        height: 100%;
        border: none;
        background: none;
        font-size: 15px;
        font-weight: 600;
        color: var(--cod-ink);
        outline: none;
        font-family: var(--cod-font-body);
        width: 0;
      }
      .cod-stock-warning {
        font-size: 11.5px;
        color: var(--cod-warning);
        font-weight: 600;
        display: none;
        align-items: center;
        gap: 4px;
        margin-top: 3px;
      }
      .cod-stock-warning.visible { display: flex; }

      /* ── Delivery type ── */
      .cod-delivery-toggle {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
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
        align-items: center;
        gap: 4px;
        padding: 12px 8px;
        border: 1.5px solid var(--cod-border);
        border-radius: var(--cod-radius-sm);
        background: var(--cod-bg);
        transition: all var(--cod-transition);
        text-align: center;
      }
      .cod-delivery-option input:checked + .cod-delivery-card {
        border-color: var(--cod-accent);
        background: var(--cod-accent-light);
        box-shadow: 0 0 0 2px rgba(232,83,58,0.15);
      }
      .cod-delivery-card-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--cod-ink);
      }
      .cod-delivery-card-price {
        font-size: 12px;
        color: var(--cod-muted);
        font-weight: 500;
      }
      .cod-delivery-option input:checked + .cod-delivery-card .cod-delivery-card-price {
        color: var(--cod-accent);
        font-weight: 600;
      }

      /* ── Price summary ── */
      .cod-price-box {
        background: var(--cod-bg);
        border: 1.5px solid var(--cod-border);
        border-radius: var(--cod-radius-sm);
        overflow: hidden;
      }
      .cod-price-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        font-size: 13.5px;
        color: var(--cod-ink);
        border-bottom: 1px solid var(--cod-border);
      }
      .cod-price-row:last-child { border-bottom: none; }
      .cod-price-row.total {
        background: var(--cod-ink);
        padding: 12px 14px;
      }
      .cod-price-row.total span { color: #fff; }
      .cod-price-row.total .cod-price-val {
        font-family: var(--cod-font-display);
        font-size: 18px;
        font-weight: 700;
      }
      .cod-price-label { color: var(--cod-muted); font-size: 13px; }
      .cod-price-val { font-weight: 600; }

      /* ── Submit button ── */
      .cod-submit-btn {
        width: 100%;
        height: 54px;
        background: var(--cod-accent);
        color: #fff;
        border: none;
        border-radius: var(--cod-radius-sm);
        font-family: var(--cod-font-display);
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all var(--cod-transition);
        position: relative;
        overflow: hidden;
        letter-spacing: 0.3px;
      }
      .cod-submit-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
      }
      .cod-submit-btn:hover:not(:disabled) {
        background: var(--cod-accent-hover);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(232,83,58,0.35);
      }
      .cod-submit-btn:active:not(:disabled) { transform: translateY(0); }
      .cod-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

      /* Loading spinner */
      .cod-spinner {
        width: 20px; height: 20px;
        border: 2.5px solid rgba(255,255,255,0.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: cod-spin 0.7s linear infinite;
        display: none;
      }
      .cod-submit-btn.loading .cod-spinner { display: block; }
      .cod-submit-btn.loading .cod-btn-text { display: none; }

      /* ── Success state ── */
      .cod-success {
        display: none;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 40px 24px;
        gap: 14px;
        animation: cod-fadeUp 0.5s ease both;
      }
      .cod-success.visible { display: flex; }
      .cod-success-icon {
        width: 72px; height: 72px;
        background: var(--cod-green-bg);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: cod-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      .cod-success-title {
        font-family: var(--cod-font-display);
        font-size: 22px;
        font-weight: 800;
        color: var(--cod-ink);
      }
      .cod-success-sub {
        font-size: 14px;
        color: var(--cod-muted);
        line-height: 1.6;
        max-width: 280px;
      }
      .cod-success-order {
        background: var(--cod-bg);
        border: 1.5px solid var(--cod-border);
        border-radius: var(--cod-radius-sm);
        padding: 12px 20px;
        font-size: 13px;
        color: var(--cod-muted);
        width: 100%;
        max-width: 300px;
      }
      .cod-success-order strong { color: var(--cod-ink); font-size: 15px; }

      /* ── Footer ── */
      .cod-footer {
        border-top: 1px solid var(--cod-border);
        padding: 10px 24px;
        font-size: 11px;
        color: var(--cod-muted);
        text-align: center;
      }

      /* ── Animations ── */
      @keyframes cod-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes cod-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.85); }
      }
      @keyframes cod-fadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes cod-pop {
        from { transform: scale(0.5); opacity: 0; }
        to   { transform: scale(1); opacity: 1; }
      }

      /* ── Mobile ── */
      @media (max-width: 480px) {
        #cod-form-root { border-radius: 0; max-width: 100%; border-left: none; border-right: none; }
        .cod-body { padding: 16px 16px 20px; }
        .cod-header { padding: 16px 16px 14px; }
        .cod-live-bar, .cod-countdown-bar { padding: 8px 16px; }
        .cod-row { flex-direction: column; }
        .cod-qty-wrapper { width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────
     HTML TEMPLATE
  ───────────────────────────────────────────── */
  function buildHTML() {
    return `
      <div class="cod-header">
        <div class="cod-header-title">Commander Maintenant — Paiement à la Livraison</div>
        <div class="cod-header-sub">${CONFIG.productTitle}</div>
      </div>

      <div class="cod-live-bar">
        <div class="cod-live-item"><span class="cod-live-dot"></span><span id="cod-viewers">${state.viewerCount} personnes</span> voient ceci</div>
        <span class="cod-live-sep">•</span>
        <div class="cod-live-item">🛒 <span id="cod-orders">${state.ordersToday}</span> commandes aujourd'hui</div>
      </div>

      <div class="cod-countdown-bar">
        ⏳ Offre limitée — expire dans <span class="cod-timer" id="cod-timer">15:00</span>
      </div>

      <div class="cod-body" id="cod-body">

        <div class="cod-badges">
          <div class="cod-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Paiement à la livraison
          </div>
          <div class="cod-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            Livraison 24–72h
          </div>
        </div>

        <!-- Name -->
        <div class="cod-field">
          <label class="cod-label">Nom complet *</label>
          <input id="cod-name" class="cod-input" type="text" placeholder="ex: Ahmed Benali" autocomplete="name" />
          <span class="cod-error-msg" id="cod-name-err">Veuillez entrer votre nom</span>
        </div>

        <!-- Phone -->
        <div class="cod-field">
          <label class="cod-label">Numéro de téléphone *</label>
          <input id="cod-phone" class="cod-input" type="tel" placeholder="05 XX XX XX XX" autocomplete="tel" maxlength="14" />
          <span class="cod-error-msg" id="cod-phone-err">Numéro invalide (10 chiffres)</span>
        </div>

        <!-- Wilaya + Commune -->
        <div class="cod-row">
          <div class="cod-field">
            <label class="cod-label">Wilaya *</label>
            <select id="cod-wilaya" class="cod-select"></select>
            <span class="cod-error-msg" id="cod-wilaya-err">Sélectionnez une wilaya</span>
          </div>
          <div class="cod-field">
            <label class="cod-label">Commune *</label>
            <select id="cod-commune" class="cod-select"><option value="">— Commune —</option></select>
            <span class="cod-error-msg" id="cod-commune-err">Sélectionnez une commune</span>
          </div>
        </div>

        <!-- Delivery type -->
        <div class="cod-field">
          <label class="cod-label">Mode de livraison *</label>
          <div class="cod-delivery-toggle">
            <label class="cod-delivery-option">
              <input type="radio" name="cod-delivery" value="home" checked />
              <div class="cod-delivery-card">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <div class="cod-delivery-card-title">Domicile</div>
                <div class="cod-delivery-card-price" id="cod-home-price">— DZD</div>
              </div>
            </label>
            <label class="cod-delivery-option">
              <input type="radio" name="cod-delivery" value="stopdesk" />
              <div class="cod-delivery-card">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                <div class="cod-delivery-card-title">Stop Desk</div>
                <div class="cod-delivery-card-price" id="cod-stopdesk-price">— DZD</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Quantity -->
        <div class="cod-row" style="align-items:flex-end; gap:12px;">
          <div class="cod-field" style="flex:0 0 auto;">
            <label class="cod-label">Quantité</label>
            <div class="cod-qty-wrapper">
              <button class="cod-qty-btn" id="cod-qty-minus" type="button">−</button>
              <input class="cod-qty-input" id="cod-qty" type="number" value="1" min="1" max="99" readonly />
              <button class="cod-qty-btn" id="cod-qty-plus" type="button">+</button>
            </div>
            <div class="cod-stock-warning" id="cod-stock-warn">⚠ Seulement <span id="cod-stock-num">5</span> en stock</div>
          </div>

          <!-- Price summary -->
          <div style="flex:1;">
            <div class="cod-price-box">
              <div class="cod-price-row">
                <span class="cod-price-label">Produit</span>
                <span class="cod-price-val" id="cod-product-total">— DZD</span>
              </div>
              <div class="cod-price-row">
                <span class="cod-price-label">Livraison</span>
                <span class="cod-price-val" id="cod-shipping-total">— DZD</span>
              </div>
              <div class="cod-price-row total">
                <span style="color:#fff;font-size:13px;font-weight:500;">Total</span>
                <span class="cod-price-val" id="cod-grand-total">— DZD</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Address note -->
        <div class="cod-field">
          <label class="cod-label">Adresse précise (optionnel)</label>
          <input id="cod-address" class="cod-input" type="text" placeholder="Rue, quartier, numéro..." />
        </div>

        <!-- Submit -->
        <button class="cod-submit-btn" id="cod-submit" type="button">
          <span class="cod-btn-text">✔ Confirmer ma commande</span>
          <div class="cod-spinner"></div>
        </button>

      </div>

      <!-- Success screen (hidden initially) -->
      <div class="cod-success" id="cod-success">
        <div class="cod-success-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1db87e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="cod-success-title">Commande confirmée ! 🎉</div>
        <div class="cod-success-sub">Merci ! Notre équipe vous contactera sous <strong>24h</strong> pour confirmer la livraison.</div>
        <div class="cod-success-order">
          Numéro de commande<br/>
          <strong id="cod-order-id">#COD-000000</strong>
        </div>
      </div>

      <div class="cod-footer">🔒 Paiement sécurisé à la livraison · Retour gratuit 7 jours</div>
    `;
  }

  /* ─────────────────────────────────────────────
     COMMUNES DATA LOADER
  ───────────────────────────────────────────── */
  async function loadCommunes() {
    try {
      const resp = await fetch(`${CONFIG.apiBase}/api/communes`);
      if (!resp.ok) throw new Error("communes fetch failed");
      const data = await resp.json();
      // Build map: { "Alger": ["Alger Centre", "Bab El Oued", ...], ... }
      data.forEach((c) => {
        const w = c.wilaya_name_ascii;
        if (!COMMUNES_BY_WILAYA[w]) COMMUNES_BY_WILAYA[w] = [];
        COMMUNES_BY_WILAYA[w].push(c.commune_name_ascii);
      });
    } catch (e) {
      // Fallback: populate with wilaya names only
      Object.keys(SHIPPING).forEach((w) => {
        COMMUNES_BY_WILAYA[w] = [w + " Centre"];
      });
    }
    populateWilayas();
    populateCommunes(state.wilaya);
  }

  /* ─────────────────────────────────────────────
     POPULATE DROPDOWNS
  ───────────────────────────────────────────── */
  function populateWilayas() {
    const sel = document.getElementById("cod-wilaya");
    if (!sel) return;
    const wilayas = Object.keys(SHIPPING).sort();
    sel.innerHTML = wilayas
      .map(
        (w) =>
          `<option value="${w}" ${w === CONFIG.defaultWilaya ? "selected" : ""}>${w}</option>`
      )
      .join("");
  }

  function populateCommunes(wilaya) {
    const sel = document.getElementById("cod-commune");
    if (!sel) return;
    const communes = COMMUNES_BY_WILAYA[wilaya] || [];
    communes.sort();
    sel.innerHTML =
      `<option value="">— Commune —</option>` +
      communes.map((c) => `<option value="${c}">${c}</option>`).join("");
    state.commune = "";
  }

  /* ─────────────────────────────────────────────
     STOCK FETCH
  ───────────────────────────────────────────── */
  async function fetchStock() {
    if (!CONFIG.variantId) return;
    try {
      const resp = await fetch(
        `${CONFIG.apiBase}/api/stock?variant_id=${CONFIG.variantId}`
      );
      if (!resp.ok) return;
      const { inventory } = await resp.json();
      if (typeof inventory === "number" && inventory > 0) {
        state.maxQty = inventory;
        const qtyInput = document.getElementById("cod-qty");
        if (qtyInput) qtyInput.max = inventory;
        if (inventory <= 5) {
          const warn = document.getElementById("cod-stock-warn");
          const num = document.getElementById("cod-stock-num");
          if (warn && num) {
            num.textContent = inventory;
            warn.classList.add("visible");
          }
        }
        state.stockLoaded = true;
      }
    } catch (_) {}
  }

  /* ─────────────────────────────────────────────
     PRICE CALCULATION
  ───────────────────────────────────────────── */
  function calcAndRender() {
    const productTotal = CONFIG.price * state.qty;
    const shipping = SHIPPING[state.wilaya]?.[state.deliveryType] ?? 400;
    state.shippingCost = shipping;
    const grand = productTotal + shipping;

    const fmt = (n) =>
      n.toLocaleString("fr-DZ") + " " + CONFIG.currency;

    setEl("cod-product-total", fmt(productTotal));
    setEl("cod-shipping-total", fmt(shipping));
    setEl("cod-grand-total", fmt(grand));

    // Update delivery card prices
    const w = SHIPPING[state.wilaya] || { stopdesk: 400, home: 550 };
    setEl("cod-home-price", fmt(w.home));
    setEl("cod-stopdesk-price", fmt(w.stopdesk));
  }

  function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ─────────────────────────────────────────────
     VALIDATION
  ───────────────────────────────────────────── */
  function validate() {
    let valid = true;

    const name = document.getElementById("cod-name");
    const phone = document.getElementById("cod-phone");
    const wilaya = document.getElementById("cod-wilaya");
    const commune = document.getElementById("cod-commune");

    // Name
    if (!name?.value.trim() || name.value.trim().length < 3) {
      setError("cod-name", "cod-name-err", true);
      valid = false;
    } else setError("cod-name", "cod-name-err", false);

    // Phone (DZ: 0[567]\d{8})
    const rawPhone = phone?.value.replace(/\s/g, "");
    if (!rawPhone || !/^0[5-7]\d{8}$/.test(rawPhone)) {
      setError("cod-phone", "cod-phone-err", true);
      valid = false;
    } else setError("cod-phone", "cod-phone-err", false);

    // Wilaya
    if (!wilaya?.value) {
      setError("cod-wilaya", "cod-wilaya-err", true);
      valid = false;
    } else setError("cod-wilaya", "cod-wilaya-err", false);

    // Commune
    if (!commune?.value) {
      setError("cod-commune", "cod-commune-err", true);
      valid = false;
    } else setError("cod-commune", "cod-commune-err", false);

    return valid;
  }

  function setError(inputId, errId, show) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (input)
      show ? input.classList.add("cod-error") : input.classList.remove("cod-error");
    if (err)
      show ? err.classList.add("visible") : err.classList.remove("visible");
  }

  /* ─────────────────────────────────────────────
     SUBMIT
  ───────────────────────────────────────────── */
  async function handleSubmit() {
    if (state.submitting || state.submitted) return;
    if (!validate()) return;

    state.submitting = true;
    const btn = document.getElementById("cod-submit");
    if (btn) btn.classList.add("loading");
    if (btn) btn.disabled = true;

    const phone = document
      .getElementById("cod-phone")
      ?.value.replace(/\s/g, "");
    const address = document.getElementById("cod-address")?.value.trim();

    const payload = {
      variant_id: CONFIG.variantId,
      quantity: state.qty,
      customer_name: document.getElementById("cod-name")?.value.trim(),
      phone,
      wilaya: state.wilaya,
      commune: document.getElementById("cod-commune")?.value,
      address: address || `${document.getElementById("cod-commune")?.value}, ${state.wilaya}`,
      delivery_type: state.deliveryType,
      shipping_cost: state.shippingCost,
      product_price: CONFIG.price,
      total: CONFIG.price * state.qty + state.shippingCost,
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

      // Show success
      state.submitted = true;
      showSuccess(data.order_id || data.order?.name || "#COD-" + Date.now().toString().slice(-6));
    } catch (err) {
      // Show generic error on button
      if (btn) {
        btn.classList.remove("loading");
        btn.disabled = false;
        const txt = btn.querySelector(".cod-btn-text");
        if (txt) {
          txt.textContent = "⚠ Erreur — Réessayer";
          setTimeout(() => {
            if (txt) txt.textContent = "✔ Confirmer ma commande";
          }, 3000);
        }
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
    // Stop countdown
    clearInterval(timerInterval);
  }

  /* ─────────────────────────────────────────────
     PHONE FORMATTER
  ───────────────────────────────────────────── */
  function formatPhone(input) {
    let v = input.value.replace(/\D/g, "").slice(0, 10);
    let formatted = "";
    for (let i = 0; i < v.length; i++) {
      if (i === 2 || i === 4 || i === 6 || i === 8) formatted += " ";
      formatted += v[i];
    }
    input.value = formatted;
  }

  /* ─────────────────────────────────────────────
     COUNTDOWN TIMER
  ───────────────────────────────────────────── */
  let timerInterval;
  function startTimer() {
    timerInterval = setInterval(() => {
      state.timerSecs--;
      if (state.timerSecs <= 0) {
        state.timerSecs = 900; // reset
      }
      const m = String(Math.floor(state.timerSecs / 60)).padStart(2, "0");
      const s = String(state.timerSecs % 60).padStart(2, "0");
      const el = document.getElementById("cod-timer");
      if (el) el.textContent = `${m}:${s}`;
    }, 1000);
  }

  /* ─────────────────────────────────────────────
     LIVE COUNTER ANIMATION
  ───────────────────────────────────────────── */
  function animateCounters() {
    setInterval(() => {
      // Viewers fluctuate ±2
      const delta = Math.random() < 0.5 ? -1 : 1;
      state.viewerCount = Math.max(3, Math.min(35, state.viewerCount + delta));
      setEl("cod-viewers", state.viewerCount + " personnes");
    }, 4500);

    setInterval(() => {
      if (Math.random() < 0.3) {
        state.ordersToday++;
        setEl("cod-orders", state.ordersToday);
      }
    }, 8000);
  }

  /* ─────────────────────────────────────────────
     BIND EVENTS
  ───────────────────────────────────────────── */
  function bindEvents() {
    // Wilaya change
    const wilaySel = document.getElementById("cod-wilaya");
    if (wilaySel) {
      wilaySel.addEventListener("change", (e) => {
        state.wilaya = e.target.value;
        populateCommunes(state.wilaya);
        calcAndRender();
      });
    }

    // Delivery type
    document.querySelectorAll("input[name='cod-delivery']").forEach((radio) => {
      radio.addEventListener("change", (e) => {
        state.deliveryType = e.target.value;
        calcAndRender();
      });
    });

    // Qty buttons
    const minus = document.getElementById("cod-qty-minus");
    const plus = document.getElementById("cod-qty-plus");
    if (minus)
      minus.addEventListener("click", () => {
        if (state.qty > 1) {
          state.qty--;
          document.getElementById("cod-qty").value = state.qty;
          calcAndRender();
          updateQtyButtons();
        }
      });
    if (plus)
      plus.addEventListener("click", () => {
        if (state.qty < state.maxQty) {
          state.qty++;
          document.getElementById("cod-qty").value = state.qty;
          calcAndRender();
          updateQtyButtons();
        }
      });

    // Phone format
    const phoneInput = document.getElementById("cod-phone");
    if (phoneInput)
      phoneInput.addEventListener("input", () => formatPhone(phoneInput));

    // Submit
    const btn = document.getElementById("cod-submit");
    if (btn) btn.addEventListener("click", handleSubmit);

    // Clear errors on input
    ["cod-name", "cod-phone", "cod-wilaya", "cod-commune"].forEach((id) => {
      const el = document.getElementById(id);
      if (el)
        el.addEventListener("input", () => {
          el.classList.remove("cod-error");
          const errEl = document.getElementById(id + "-err");
          if (errEl) errEl.classList.remove("visible");
        });
    });
  }

  function updateQtyButtons() {
    const minus = document.getElementById("cod-qty-minus");
    const plus = document.getElementById("cod-qty-plus");
    if (minus) minus.disabled = state.qty <= 1;
    if (plus) plus.disabled = state.qty >= state.maxQty;
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    injectStyles();

    // Find mount point or create one
    let mount =
      document.getElementById("cod-form-mount") ||
      document.querySelector("[data-cod-form]");

    if (!mount) {
      // Auto-inject near buy button
      const buyBtn =
        document.querySelector('[name="add"]') ||
        document.querySelector(".product-form__submit") ||
        document.querySelector(".btn-addtocart") ||
        document.querySelector('[data-testid="Checkout-button"]');

      if (buyBtn) {
        mount = document.createElement("div");
        buyBtn.parentNode.insertBefore(mount, buyBtn.nextSibling);
      } else {
        mount = document.createElement("div");
        document.body.appendChild(mount);
      }
    }

    const root = document.createElement("div");
    root.id = "cod-form-root";
    root.innerHTML = buildHTML();
    mount.appendChild(root);

    // Init state
    calcAndRender();
    updateQtyButtons();
    startTimer();
    animateCounters();

    // Auto-focus name field
    setTimeout(() => {
      document.getElementById("cod-name")?.focus();
    }, 300);

    // Async loads
    loadCommunes();
    fetchStock();

    bindEvents();
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
