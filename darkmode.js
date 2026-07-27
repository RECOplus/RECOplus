/**
 * RECO+ — Modo Oscuro / Dark Mode
 * ─────────────────────────────────────────────────
 * - Guarda preferencia en localStorage bajo "reco-theme"
 * - Aplica clase "dark" al <html> element
 * - Inyecta el botón toggle en el navbar automáticamente
 * - Funciona en todas las páginas: index, mapa, guia, donar, alianzas
 * ─────────────────────────────────────────────────
 */

(function () {
  "use strict";

  /* ══════════════════════════════════════════════
     1. APLICAR TEMA INMEDIATAMENTE (evita flash)
     ══════════════════════════════════════════════ */
  var saved = localStorage.getItem("reco-theme") || "dark";
  if (saved === "dark") {
    document.documentElement.classList.add("dark");
  }

  /* ══════════════════════════════════════════════
     2. FUNCIÓN TOGGLE
     ══════════════════════════════════════════════ */
  function toggleTheme() {
    var isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("reco-theme", isDark ? "dark" : "light");
    updateToggleVisual(isDark);
  }

  function updateToggleVisual(isDark) {
    // Soporte para el dm-pill ya presente en el HTML (estructura .dm-pill__sun / .dm-pill__moon)
    var pill = document.querySelector(".dm-pill");
    if (pill) {
      var pillSun  = pill.querySelector(".dm-pill__sun");
      var pillMoon = pill.querySelector(".dm-pill__moon");
      if (isDark) {
        if (pillSun)  pillSun.style.opacity  = "0.38";
        if (pillMoon) pillMoon.style.opacity = "1";
      } else {
        if (pillSun)  pillSun.style.opacity  = "1";
        if (pillMoon) pillMoon.style.opacity = "0.38";
      }
    }

    // Soporte para el toggle inyectado por JS (estructura .dm-sun / .dm-moon / .dm-knob)
    var btn = document.getElementById("darkModeToggle");
    if (!btn) return;
    var sun  = btn.querySelector(".dm-sun");
    var moon = btn.querySelector(".dm-moon");
    var knob = btn.querySelector(".dm-knob");
    var track = btn.querySelector(".dm-track");

    if (isDark) {
      if (knob)  knob.style.transform  = "translateX(22px)";
      if (track) track.style.background = "#2d8c4e";
      if (sun)   sun.style.opacity  = "0.45";
      if (moon)  moon.style.opacity = "1";
    } else {
      if (knob)  knob.style.transform  = "translateX(0)";
      if (track) track.style.background = "rgba(0,0,0,0.22)";
      if (sun)   sun.style.opacity  = "1";
      if (moon)  moon.style.opacity = "0.45";
    }
  }

  /* ══════════════════════════════════════════════
     3. INYECTAR BOTÓN EN EL NAVBAR
     ══════════════════════════════════════════════ */
  function injectToggleButton() {
    // Si ya existe un .dm-pill en el HTML (bubble-nav), conectarle el click directamente
    var existingPill = document.querySelector(".dm-pill");
    if (existingPill) {
      existingPill.addEventListener("click", toggleTheme);
      return;
    }

    if (document.getElementById("darkModeToggle")) return; // ya existe botón inyectado

    var btn = document.createElement("button");
    btn.id = "darkModeToggle";
    btn.className = "dm-toggle";
    btn.setAttribute("title", "Cambiar modo claro/oscuro");
    btn.setAttribute("aria-label", "Toggle dark mode");
    btn.innerHTML =
      '<span class="dm-sun">☀️</span>' +
      '<span class="dm-track"><span class="dm-knob"></span></span>' +
      '<span class="dm-moon">🌙</span>';

    btn.addEventListener("click", toggleTheme);

    // 1) navbar__spacer (mapa, guia, donar, alianzas)
    var spacer = document.querySelector(".navbar__spacer");
    if (spacer) {
      var langToggle = spacer.querySelector(".lang-toggle");
      if (langToggle) {
        spacer.insertBefore(btn, langToggle);
      } else {
        spacer.insertBefore(btn, spacer.firstChild);
      }
      return;
    }

    // 2) index.html: lang-toggle lives inside <nav> inside <header.header>
    var langInNav = document.querySelector("header.header .lang-toggle, header.header nav .lang-toggle");
    if (langInNav && langInNav.parentNode) {
      langInNav.parentNode.insertBefore(btn, langInNav);
      return;
    }

    // 3) Fallback: insertar directamente en el navbar al final
    var navbar = document.querySelector(".navbar") || document.querySelector("header.navbar") || document.querySelector("header.header");
    if (navbar) {
      navbar.appendChild(btn);
    }
  }

  /* ══════════════════════════════════════════════
     4. INYECTAR ESTILOS
     ══════════════════════════════════════════════ */
  function injectStyles() {
    var style = document.createElement("style");
    style.id = "reco-darkmode-styles";
    style.textContent = `

      /* ────────────────────────────────────────────
         BOTÓN TOGGLE DARK MODE
         ──────────────────────────────────────────── */
      .dm-toggle {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        background: rgba(255,255,255,0.15);
        border: 1.5px solid rgba(255,255,255,0.3);
        border-radius: 999px;
        padding: 4px 8px;
        transition: background 0.2s, border-color 0.2s;
        user-select: none;
        font-size: 13px;
        line-height: 1;
      }

      .dm-toggle:hover {
        background: rgba(255,255,255,0.25);
      }

      .dm-sun, .dm-moon {
        font-size: 13px;
        transition: opacity 0.2s;
        line-height: 1;
      }

      .dm-track {
        position: relative;
        width: 40px;
        height: 20px;
        background: rgba(0,0,0,0.22);
        border-radius: 999px;
        flex-shrink: 0;
        transition: background 0.3s cubic-bezier(.4,0,.2,1);
      }

      .dm-knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        background: #ffffff;
        border-radius: 50%;
        transition: transform 0.28s cubic-bezier(.4,0,.2,1);
        box-shadow: 0 1px 4px rgba(0,0,0,0.28);
      }

      /* ────────────────────────────────────────────
         VARIABLES BASE (MODO CLARO)
         ──────────────────────────────────────────── */
      :root {
        --bg-primary:     #f2faf4;
        --bg-secondary:   #ffffff;
        --bg-card:        #ffffff;
        --bg-card-alt:    #aef8c1;
        --bg-muted:       #e8f5ec;
        --bg-hero-overlay-start: rgba(255,255,255,0.97);
        --bg-hero-overlay-end:   rgba(255,255,255,0.00);

        --text-primary:   #1a2e1e;
        --text-secondary: #4a6b52;
        --text-muted:     #8aab90;
        --text-heading:   #1a5c2a;
        --text-link:      #2d8c4e;

        --border-light:   #a8dab5;
        --border-muted:   #c8e6c9;
        --border-card:    #d4eeda;

        --accent:         #2d8c4e;
        --accent-dark:    #1a5c2a;
        --accent-light:   #e8f5ec;

        --sidebar-bg:     #ffffff;
        --search-bg:      #ffffff;
        --chip-bg:        #ffffff;
        --select-bg:      #ffffff;
        --input-bg:       #f2faf4;
        --modal-bg:       #ffffff;
        --modal-overlay:  rgba(0,0,0,0.45);
        --legend-bg:      rgba(255,255,255,0.92);
        --tooltip-bg:     rgba(255,255,255,0.95);
        --scrollbar-track:#e8f5ec;
        --scrollbar-thumb:#a8dab5;

        --nav-scrolled-bg: rgba(255,255,255,0.72);
        --preview-card-bg: rgba(255,255,255,0.97);
        --preview-card-border: #c8e6c9;

        --footer-bg:      #1a1a1a;
        --footer-text:    #ccc;
        --footer-text-dim:#aaa;
        --footer-border:  #333;
        --footer-redes:   #333;
        --footer-bottom:  #666;
        --newsletter-input:#333;

        --feat-card-bg:   #aef8c1;
        --aliado-bg:      #ffffff;
        --aliados-section:#f2faf4;

        --testimonios-bg:      #f2faf4;
        --testimonios-heading: #1a5c2a;
        --test-card-bg:        #ffffff;
        --test-card-border:    #d4eeda;
        --test-card-handle:    #1a2e1e;
        --test-card-x:         #8aab90;
        --test-card-text:      #4a6b52;
      }

      /* ────────────────────────────────────────────
         VARIABLES MODO OSCURO
         ──────────────────────────────────────────── */
      html.dark {
        --bg-primary:     #0f1a12;
        --bg-secondary:   #162219;
        --bg-card:        #1c2e20;
        --bg-card-alt:    #1a3020;
        --bg-muted:       #182618;
        --bg-hero-overlay-start: rgba(10,20,12,0.96);
        --bg-hero-overlay-end:   rgba(10,20,12,0.00);

        --text-primary:   #d4ead8;
        --text-secondary: #8ab898;
        --text-muted:     #5a7a62;
        --text-heading:   #6fcf8a;
        --text-link:      #56c472;

        --border-light:   #2a4a32;
        --border-muted:   #254030;
        --border-card:    #2a4432;

        --accent:         #3daa60;
        --accent-dark:    #2d8c4e;
        --accent-light:   #1a3020;

        --sidebar-bg:     #162219;
        --search-bg:      #1c2e20;
        --chip-bg:        #1c2e20;
        --select-bg:      #1c2e20;
        --input-bg:       #1a2b1e;
        --modal-bg:       #1c2e20;
        --modal-overlay:  rgba(0,0,0,0.65);
        --legend-bg:      rgba(18,30,20,0.95);
        --tooltip-bg:     rgba(18,30,20,0.97);
        --scrollbar-track:#182618;
        --scrollbar-thumb:#2a4a32;

        --nav-scrolled-bg: rgba(12,20,14,0.82);
        --preview-card-bg: rgba(22,34,25,0.97);
        --preview-card-border: #2a4832;

        --footer-bg:      #080e09;
        --footer-text:    #7a9a80;
        --footer-text-dim:#5a7a62;
        --footer-border:  #1a2a1e;
        --footer-redes:   #1c2e20;
        --footer-bottom:  #3a5a42;
        --newsletter-input:#1c2e20;

        --feat-card-bg:   #1a3020;
        --aliado-bg:      #1c2e20;
        --aliados-section:#121e14;

        --testimonios-bg:      #0d1510;
        --testimonios-heading: #6fcf8a;
        --test-card-bg:        #1c1c1e;
        --test-card-border:    #2a2a2e;
        --test-card-handle:    #e0e0e0;
        --test-card-x:         #888888;
        --test-card-text:      #bbbbbb;
      }

      /* ────────────────────────────────────────────
         APLICACIÓN DE VARIABLES — styles.css targets
         ──────────────────────────────────────────── */
      html.dark body {
        background: var(--bg-primary);
        color: var(--text-primary);
      }

      /* Site header / section backgrounds */
      html.dark .site-header {
        background: var(--bg-primary);
      }

      html.dark .site-header h1 {
        color: var(--text-heading);
      }

      html.dark .subtitle {
        color: var(--text-secondary);
      }

      html.dark .header-underline {
        background: var(--accent);
      }

      /* Search bar */
      html.dark .search-bar {
        background: var(--search-bg);
        border-color: var(--border-light);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }

      html.dark .search-bar input {
        color: var(--text-primary);
        background: transparent;
      }

      html.dark .search-bar input::placeholder {
        color: var(--text-muted);
      }

      html.dark .search-icon { color: var(--text-muted); }

      /* Filter chips */
      html.dark .chip {
        background: var(--chip-bg);
        border-color: var(--border-light);
        color: var(--text-secondary);
      }

      html.dark .chip:hover {
        border-color: var(--accent);
        color: var(--accent);
      }

      html.dark .chip.active {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }

      html.dark .filter-label { color: var(--text-secondary); }

      html.dark .more-filters-btn {
        background: var(--chip-bg);
        border-color: var(--border-light);
        color: var(--text-secondary);
      }

      html.dark .more-filters-btn:hover {
        border-color: var(--accent);
        color: var(--accent);
      }

      /* Sidebar */
      html.dark .sidebar {
        background: var(--sidebar-bg);
        border-color: var(--border-light);
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      }

      html.dark .sidebar-header {
        border-bottom-color: var(--border-muted);
      }

      html.dark .sidebar-header strong {
        color: var(--text-heading);
      }

      html.dark .results-count { color: var(--text-muted); }

      html.dark .sort-select {
        background: var(--select-bg);
        border-color: var(--border-light);
        color: var(--text-secondary);
      }

      html.dark .results-list::-webkit-scrollbar-track { background: var(--scrollbar-track); }
      html.dark .results-list::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); }

      html.dark .result-item {
        border-bottom-color: var(--border-muted);
      }

      html.dark .result-item:hover { background: var(--bg-muted); }

      html.dark .result-icon.recycle  { background: var(--accent-light); color: var(--accent); }
      html.dark .result-icon.donation { background: #3a1a1a; color: #e06060; }
      html.dark .result-icon.acopio   { background: #1a2a1a; color: #6aaa6a; }

      html.dark .result-name {
        color: var(--text-primary);
      }

      html.dark .result-address {
        color: var(--text-muted);
      }

      html.dark .see-all-btn {
        background: var(--bg-muted);
        border-top-color: var(--border-muted);
        color: var(--text-secondary);
      }

      html.dark .see-all-btn:hover {
        background: var(--accent-light);
        color: var(--accent);
      }

      /* Legend */
      html.dark .legend {
        background: var(--legend-bg);
        border-color: var(--border-light);
      }

      html.dark .legend-item { color: var(--text-primary); }

      /* Map tooltip */
      html.dark .map-tooltip {
        background: var(--tooltip-bg);
        border-left-color: var(--accent);
      }

      html.dark .tooltip-text { color: var(--text-primary); }
      html.dark .tooltip-text strong { color: var(--text-heading); }
      html.dark .tooltip-close { color: var(--text-muted); }
      html.dark .tooltip-close:hover { color: var(--text-primary); }

      /* Footer CTA (mapa) */
      html.dark .footer-cta {
        background: var(--bg-secondary);
        border-top: 1px solid var(--border-muted);
      }

      html.dark .footer-cta .footer-left strong { color: var(--text-heading); }
      html.dark .footer-cta p { color: var(--text-secondary); }

      html.dark .suggest-btn {
        background: var(--accent);
        color: #fff;
      }

      html.dark .suggest-btn:hover {
        background: var(--accent-dark);
      }

      /* Modal (suggest point) */
      html.dark .modal-overlay {
        background: var(--modal-overlay);
      }

      html.dark .modal {
        background: var(--modal-bg);
        border: 1px solid var(--border-light);
        color: var(--text-primary);
      }

      html.dark .modal h2 { color: var(--text-heading); }
      html.dark .modal p  { color: var(--text-secondary); }

      html.dark .modal-input {
        background: var(--input-bg);
        border: 1.5px solid var(--border-light);
        color: var(--text-primary);
      }

      html.dark .modal-input::placeholder { color: var(--text-muted); }

      html.dark .modal-input:focus {
        border-color: var(--accent);
        background: var(--bg-secondary);
      }

      html.dark .modal-close {
        color: var(--text-muted);
      }

      html.dark .modal-close:hover { color: var(--text-primary); }

      html.dark .modal-submit {
        background: var(--accent);
      }

      html.dark .modal-submit:hover {
        background: var(--accent-dark);
      }

      /* ── HERO section overlay ── */
      html.dark .hero__illustration::after {
        background: linear-gradient(
          to right,
          var(--bg-hero-overlay-start) 0%,
          rgba(10,20,12,0.82) 38%,
          rgba(10,20,12,0.45) 60%,
          var(--bg-hero-overlay-end) 78%
        );
      }

      html.dark .hero__title   { color: var(--text-heading); }
      html.dark .hero__subtitle { color: var(--text-primary); }

      html.dark .hero__badge {
        background: var(--accent-light);
        border-color: var(--border-muted);
        color: var(--text-heading);
      }

      html.dark .hero__badge:hover {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }

      /* ── NAVBAR (nav-preview.js injects) ── */
      html.dark .navbar.reco-nav-scrolled,
      html.dark header.header.reco-nav-scrolled,
      html.dark header.navbar.reco-nav-scrolled {
        background: var(--nav-scrolled-bg) !important;
        box-shadow: 0 2px 20px rgba(0,0,0,0.4), 0 0.5px 0 rgba(0,0,0,0.2) !important;
      }

      html.dark .navbar__links a,
      html.dark header.header nav a {
        color: var(--text-secondary);
      }

      html.dark .navbar__links a:hover,
      html.dark header.header nav a:hover { color: var(--accent); }
      html.dark .navbar__links a.active,
      html.dark header.header nav a.active { color: var(--accent); }

      /* index.html header */
      html.dark header.header {
        /* transparent by default, handled by nav-preview.js scroll */
      }

      html.dark header.header nav a { color: var(--text-secondary); }
      html.dark header.header nav a:hover { color: var(--accent); }

      html.dark .reco-link-hover {
        background: rgba(61,170,96,0.12) !important;
        color: var(--accent) !important;
      }

      /* Preview card in dark mode */
      html.dark .reco-preview-card {
        background: var(--preview-card-bg) !important;
        border-color: var(--preview-card-border) !important;
        box-shadow: 0 10px 36px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25) !important;
      }

      html.dark .reco-preview-arrow {
        background: var(--preview-card-bg) !important;
        border-left-color: var(--preview-card-border) !important;
        border-top-color: var(--preview-card-border) !important;
      }

      html.dark .reco-preview-desc { color: var(--text-secondary) !important; }
      html.dark .reco-preview-label { color: #6fcf8a !important; }

      /* ── FOOTER (all pages) ── */
      html.dark .footer {
        background: var(--footer-bg);
        color: var(--footer-text);
      }

      html.dark .footer-logo { color: #d4ead8; }
      html.dark .footer-brand p { color: var(--footer-text-dim); }

      html.dark .redes a {
        background: var(--footer-redes);
        color: var(--footer-text);
      }

      html.dark .footer-col h4 { color: #d4ead8; }

      html.dark .footer-col a,
      html.dark .footer-col p { color: var(--footer-text-dim); }

      html.dark .footer-col a:hover { color: var(--accent); }

      html.dark .newsletter-form input {
        background: var(--newsletter-input);
        color: #d4ead8;
      }

      html.dark .newsletter-form input::placeholder { color: #4a6a52; }

      html.dark .footer-bottom {
        border-top-color: var(--footer-border);
        color: var(--footer-bottom);
      }

      /* ════════════════════════════════════════════
         ALIANZAS PAGE (alianzas.css targets)
         ════════════════════════════════════════════ */

      /* Hero overlay for alianzas */
      html.dark .alianzas-hero__image::after {
        background: linear-gradient(
          to right,
          rgba(10,20,12,0.96) 0%,
          rgba(10,20,12,0.82) 38%,
          rgba(10,20,12,0.45) 60%,
          rgba(10,20,12,0.00) 78%
        );
      }

      html.dark .alianzas-hero__title { color: var(--text-heading); }
      html.dark .alianzas-hero__subtitle { color: var(--text-primary); }

      html.dark .alianzas-intro {
        background: var(--bg-primary);
      }

      html.dark .alianzas-intro__title { color: var(--text-heading); }
      html.dark .alianzas-intro__deco  { color: var(--border-light); }

      html.dark .alianzas-features {
        background: var(--bg-primary);
      }

      html.dark .feat-card {
        background: var(--feat-card-bg);
        border-color: var(--border-muted);
      }

      html.dark .feat-card:hover {
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        border-color: var(--border-light);
      }

      html.dark .feat-card__icon-wrap {
        background: var(--accent-light);
      }

      html.dark .feat-card__title { color: var(--text-heading); }
      html.dark .feat-card__desc  { color: var(--text-secondary); }

      html.dark .feat-card__link {
        background: var(--bg-secondary);
        border-color: var(--border-muted);
        color: var(--accent);
      }

      html.dark .feat-card__link:hover {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }

      /* Aliados section */
      html.dark .alianzas-aliados {
        background: var(--aliados-section);
        border-top-color: var(--border-muted);
        border-bottom-color: var(--border-muted);
      }

      html.dark .alianzas-aliados__header h2 { color: var(--text-heading); }

      html.dark .aliado-card {
        background: var(--aliado-bg);
        border-color: var(--border-muted);
      }

      html.dark .aliado-card:hover {
        border-color: var(--accent);
        box-shadow: 0 4px 18px rgba(0,0,0,0.3);
      }

      html.dark .aliado-card__name    { color: var(--text-heading); }
      html.dark .aliado-card__tagline { color: var(--text-secondary); }

      html.dark .carousel-btn {
        background: var(--aliado-bg);
        border-color: var(--border-muted);
        color: var(--accent);
      }

      html.dark .carousel-btn:hover {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }

      /* CTA banner alianzas — stays green but slightly darker */
      html.dark .alianzas-cta {
        background: #0f3018;
      }

      html.dark .alianzas-cta__btn {
        background: #d4ead8;
        color: #0f3018;
      }

      html.dark .alianzas-cta__btn:hover {
        background: #fff;
      }

      /* ════════════════════════════════════════════
         DONAR PAGE (donar.css targets)
         ════════════════════════════════════════════ */

      html.dark .donar-hero__image::after {
        background: linear-gradient(
          to right,
          rgba(10,20,12,0.96) 0%,
          rgba(10,20,12,0.82) 38%,
          rgba(10,20,12,0.45) 60%,
          rgba(10,20,12,0.00) 78%
        );
      }

      html.dark .donar-hero__title    { color: var(--text-heading); }
      html.dark .donar-hero__subtitle { color: var(--text-primary); }

      html.dark .donar-hero__card-float {
        background: rgba(22,34,25,0.92);
        border-color: var(--border-muted);
      }

      html.dark .donar-hero__card-float strong { color: var(--text-heading); }
      html.dark .donar-hero__card-float p      { color: var(--text-secondary); }

      /* Tabs */
      html.dark .donar-tabs-section {
        background: var(--bg-primary);
      }

      html.dark .donar-tabs {
        background: var(--bg-card);
        border-color: var(--border-muted);
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      }

      html.dark .donar-tab {
        color: var(--text-secondary);
      }

      html.dark .donar-tab:hover { color: var(--accent); }

      html.dark .donar-tab.active {
        background: var(--accent);
        color: #fff;
      }

      /* Forms section */
      html.dark .donar-forms-section {
        background: var(--bg-primary);
      }

      html.dark .donar-form-panel {
        background: var(--bg-card);
        border-color: var(--border-muted);
        box-shadow: 0 4px 24px rgba(0,0,0,0.35);
      }

      html.dark .donar-form-header {
        border-bottom-color: var(--border-muted);
      }

      html.dark .donar-form-header h2 { color: var(--text-heading); }
      html.dark .donar-form-header p  { color: var(--text-secondary); }

      html.dark .donar-label { color: var(--text-heading); }
      html.dark .donar-optional { color: var(--text-muted); }

      html.dark .donar-input {
        background: var(--input-bg);
        border-color: var(--border-light);
        color: var(--text-primary);
      }

      html.dark .donar-input::placeholder { color: var(--text-muted); }

      html.dark .donar-input:focus {
        border-color: var(--accent);
        background: var(--bg-secondary);
        box-shadow: 0 0 0 3px rgba(61,170,96,0.15);
      }

      html.dark .donar-upload {
        background: var(--input-bg);
        border-color: var(--border-muted);
      }

      html.dark .donar-upload:hover,
      html.dark .donar-upload.dragover {
        border-color: var(--accent);
        background: var(--accent-light);
      }

      html.dark .donar-upload p { color: var(--text-secondary); }
      html.dark .donar-upload p strong { color: var(--accent); }

      html.dark .donar-form-footer {
        border-top-color: var(--border-muted);
      }

      html.dark .donar-form-note { color: var(--text-muted); }
      html.dark .donar-form-note a { color: var(--accent); }

      /* Trust section donar */
      html.dark .donar-trust {
        background: #0f3018;
      }

      /* Donar modal */
      html.dark .donar-modal-overlay {
        background: rgba(0,0,0,0.65);
      }

      html.dark .donar-modal {
        background: var(--modal-bg);
        box-shadow: 0 10px 50px rgba(0,0,0,0.5);
      }

      html.dark .donar-modal h3 { color: var(--text-heading); }
      html.dark .donar-modal p  { color: var(--text-secondary); }

      /* Preview container */
      html.dark .donar-preview-container {
        border-color: var(--border-light);
      }

      /* ════════════════════════════════════════════
         INDEX PAGE (style.css targets)
         ════════════════════════════════════════════ */

      html.dark .acciones {
        background: var(--bg-primary);
      }

      html.dark .acciones h2 { color: var(--text-heading); }

      html.dark .card {
        background: var(--bg-card);
        color: var(--text-primary);
      }

      html.dark .card h3 { color: var(--text-heading); }
      html.dark .card p  { color: var(--text-secondary); }
      html.dark .card a  { color: var(--accent); }

      html.dark .stats {
        background: var(--bg-muted);
        color: var(--text-primary);
      }

      html.dark .stats span { color: var(--text-secondary); }

      /* Tienda */
      html.dark .tienda {
        background: var(--bg-primary);
      }

      html.dark .tienda-title h2 { color: var(--text-heading); }
      html.dark .tienda-title p  { color: var(--text-secondary); }

      html.dark .ver-todos-btn {
        background: var(--bg-secondary);
        border-color: var(--accent);
        color: var(--accent);
      }

      html.dark .ver-todos-btn:hover {
        background: var(--accent);
        color: #fff;
      }

      html.dark .producto {
        border-color: var(--border-muted);
        background: var(--bg-card);
        color: var(--text-primary);
      }

      html.dark .producto-nombre { color: var(--text-primary); }
      html.dark .producto-estado { color: var(--text-muted); }
      html.dark .producto-precio { color: var(--text-primary); }

      html.dark .ver-producto-btn {
        border-color: var(--accent);
        color: var(--accent);
      }

      html.dark .ver-producto-btn:hover {
        background: var(--accent);
        color: #fff;
      }

      /* Trust badges */
      html.dark .trust-badges {
        border-color: var(--border-muted);
        background: var(--bg-secondary);
      }

      html.dark .badge-item strong { color: var(--text-primary); }
      html.dark .badge-item p      { color: var(--text-muted); }
      html.dark .badge-icon        { color: var(--accent); }

      /* Aliados (index) */
      html.dark .aliados {
        background: var(--bg-primary);
      }

      html.dark .aliados h2 { color: var(--text-heading); }

      html.dark .aliado {
        border-color: var(--border-muted);
        color: var(--text-primary);
        background: var(--bg-card);
      }

      html.dark .aliado:hover {
        border-color: var(--accent);
        background: var(--accent-light);
      }

      html.dark .aliado span { color: var(--text-secondary); }
      html.dark .aliado small { color: var(--text-muted); }

      /* Testimonios */
      html.dark .testimonios {
        background: var(--testimonios-bg);
      }

      html.dark .testimonios h2 { color: var(--testimonios-heading); }

      /* test-card (marquee cards) */
      html.dark .test-card {
        background: var(--test-card-bg);
        border-color: var(--test-card-border);
      }

      html.dark .test-card__handle { color: var(--test-card-handle); }
      html.dark .test-card__x      { color: var(--test-card-x); }
      html.dark .test-card__text   { color: var(--test-card-text); }

      html.dark .testimonio {
        background: var(--bg-card);
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      }

      html.dark .testimonio p      { color: var(--text-secondary); }
      html.dark .testimonio strong { color: var(--text-primary); }
      html.dark .estrellas         { color: var(--accent); }

      /* CTA Banner */
      html.dark .cta-banner {
        background: linear-gradient(135deg, #0f3018, #1a5c2a);
      }

      html.dark .cta-btn {
        background: #d4ead8;
        color: #0f3018;
      }

      html.dark .cta-btn:hover { background: #fff; }

      /* Products carousel shadows */
      html.dark .productos-carousel-wrapper::before {
        background: linear-gradient(to right, var(--bg-primary), transparent);
      }

      html.dark .productos-carousel-wrapper::after {
        background: linear-gradient(to left, var(--bg-primary), transparent);
      }

      /* ── Mini nav ── */
      html.dark .mini-nav {
        background: var(--bg-card);
        border: 1px solid var(--border-muted);
      }

      html.dark .mini-nav a { color: var(--text-primary); }

      /* ════════════════════════════════════════════
         GUIA PAGE (paginaguiastyle.css targets)
         ════════════════════════════════════════════ */

      html.dark .guia-intro,
      html.dark .steps-section,
      html.dark .guia-section { 
        background: var(--bg-primary); 
      }

      html.dark .guia-card,
      html.dark .step-card,
      html.dark .guide-card {
        background: var(--bg-card);
        border-color: var(--border-muted);
        color: var(--text-primary);
      }

      html.dark .guia-card h3,
      html.dark .step-card h3,
      html.dark .guide-card h3 { color: var(--text-heading); }

      html.dark .guia-card p,
      html.dark .step-card p,
      html.dark .guide-card p { color: var(--text-secondary); }

      html.dark .highlight { color: var(--accent); }

      /* ── Dark mode toggle button adjustments per page bg ── */
      html.dark .dm-toggle {
        background: rgba(61,170,96,0.15);
        border-color: rgba(61,170,96,0.3);
      }

      html.dark .dm-toggle:hover {
        background: rgba(61,170,96,0.25);
      }

      /* Lang toggle labels in dark mode */
      html.dark .lang-label-es,
      html.dark .lang-label-en {
        color: #d4ead8;
      }

      /* nav scrollbar de resultados en modo oscuro */
      html.dark select option {
        background: var(--bg-card);
        color: var(--text-primary);
      }

      /* ════════════════════════════════════════════
         TRANSICIÓN SUAVE GLOBAL
         ════════════════════════════════════════════ */
      *, *::before, *::after {
        transition-property: background-color, border-color, color, box-shadow;
        transition-duration: 0.28s;
        transition-timing-function: cubic-bezier(.4,0,.2,1);
      }

      /* Excepciones: animaciones y transforms no deben heredar la transición */
      .reco-bubble-dot,
      .reco-nav-preview,
      .reco-preview-card,
      .lang-knob,
      .dm-knob,
      .dm-track,
      [style*="animation"],
      .hero__banner-img,
      .alianzas-hero__banner-img,
      .donar-hero__banner-img {
        transition-property: opacity, transform, background, border-color !important;
      }

    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════════
     5. INIT
     ══════════════════════════════════════════════ */
  injectStyles();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      injectToggleButton();
      updateToggleVisual(document.documentElement.classList.contains("dark"));
    });
  } else {
    injectToggleButton();
    updateToggleVisual(document.documentElement.classList.contains("dark"));
  }

})();