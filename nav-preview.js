/**
 * RECO+ — Nav Bubble + Preview Cards + Sticky Blur Navbar
 * ─────────────────────────────────────────────────────────────
 * Funciones:
 *  1. NAVBAR FIJA con fondo blur/frosted al hacer scroll
 *  2. BURBUJA activa en la página actual (con punto pulsante)
 *  3. BURBUJA de hover sobre cualquier enlace al pasar el cursor
 *  4. MINI PREVIEW flotante con info de la sección destino
 *  5. ANIMACIÓN de salida suave (fade + slide) al hacer clic en un enlace
 *
 * Compatible con: index.html, mapa.html, guia.html, donar.html, alianzas.html
 * No toca traducciones — solo añade clases y estilos JS.
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  "use strict";

  /* ═══════════════════════════════════════════════════════════
     1. DATOS DE CADA PÁGINA
     ═══════════════════════════════════════════════════════════ */
  var PAGE_DATA = {
    "index.html": {
      icon: "♻️", color: "#2d8c4e", bg: "#e8f5ec", border: "#a8dab5",
      es: { label: "Inicio",       desc: "El punto de partida: busca, recicla y conecta con tu comunidad.",                   pill: "Ir a Inicio" },
      en: { label: "Home",         desc: "The starting point: search, recycle and connect with your community.",              pill: "Go to Home" }
    },
    "mapa.html": {
      icon: "📍", color: "#1a7a3a", bg: "#dff2e6", border: "#8ecfa0",
      es: { label: "Mapa",         desc: "Encuentra puntos de reciclaje y donación cerca de ti con filtros por material.",    pill: "Ir al Mapa" },
      en: { label: "Map",          desc: "Find recycling and donation points near you with filters by material.",             pill: "Go to Map" }
    },
    "guia.html": {
      icon: "📖", color: "#2d6e8c", bg: "#e0f0f8", border: "#8ec8e0",
      es: { label: "Guía",         desc: "Aprende paso a paso cómo reciclar, donar y generar impacto positivo.",             pill: "Ir a la Guía" },
      en: { label: "Guide",        desc: "Learn step by step how to recycle, donate and create a positive impact.",          pill: "Go to Guide" }
    },
    "donar.html": {
      icon: "🤝", color: "#8c4a2d", bg: "#f8ede0", border: "#e0b48e",
      es: { label: "Donar / Ayuda", desc: "Publica donaciones o solicitudes y conecta con quienes más lo necesitan.",        pill: "Ir a Donar" },
      en: { label: "Donate / Help", desc: "Post donations or requests and connect with those who need it most.",             pill: "Go to Donate" }
    },
    "blog.html": {
      icon: "✍️", color: "#5a2d8c", bg: "#ede0f8", border: "#c4a0e0",
      es: { label: "Blog",         desc: "Artículos, tips y noticias sobre sostenibilidad y medio ambiente.",                pill: "Ir al Blog" },
      en: { label: "Blog",         desc: "Articles, tips and news about sustainability and the environment.",                pill: "Go to Blog" }
    },
    "alianzas.html": {
      icon: "🏢", color: "#1a5c2a", bg: "#e8f5ec", border: "#a8dab5",
      es: { label: "Alianzas",     desc: "Espacio para empresas y fundaciones que colaboran con RECO+.",                    pill: "Ir a Alianzas" },
      en: { label: "Alliances",    desc: "A space for companies and foundations that collaborate with RECO+.",              pill: "Go to Alliances" }
    },
    "contacto.html": {
      icon: "💬", color: "#2d5a8c", bg: "#e0ecf8", border: "#8eb8e0",
      es: { label: "Contacto",     desc: "¿Tienes dudas o sugerencias? Escríbenos, estamos para ayudarte.",                pill: "Ir a Contacto" },
      en: { label: "Contact",      desc: "Have questions or suggestions? Write to us, we're here to help.",                pill: "Go to Contact" }
    }
  };

  /* Helper: devuelve el sub-objeto {label, desc, pill} en el idioma activo */
  function getLang() {
    return localStorage.getItem("reco-lang") || "es";
  }
  function getData(pageData) {
    var lang = getLang();
    return pageData[lang] || pageData["es"];
  }

  /* ═══════════════════════════════════════════════════════════
     2. INYECTAR ESTILOS
     ═══════════════════════════════════════════════════════════ */
  var style = document.createElement("style");
  style.textContent = [

    /* ── Navbar: fixed + blur al hacer scroll ── */
    ".navbar, header.header, header.navbar {",
    "  position: fixed !important;",
    "  top: 0 !important;",
    "  left: 0 !important;",
    "  right: 0 !important;",
    "  width: 100% !important;",
    "  z-index: 9000 !important;",
    "  transition: background 0.35s cubic-bezier(.4,0,.2,1),",
    "              box-shadow 0.35s cubic-bezier(.4,0,.2,1),",
    "              backdrop-filter 0.35s cubic-bezier(.4,0,.2,1);",
    "}",

    /* Estado inicial — transparente */
    ".navbar.reco-nav-top, header.header.reco-nav-top {",
    "  background: transparent !important;",
    "  box-shadow: none !important;",
    "  backdrop-filter: none !important;",
    "}",

    /* Estado scroll — frosted glass */
    ".navbar.reco-nav-scrolled, header.header.reco-nav-scrolled {",
    "  background: rgba(255,255,255,0.72) !important;",
    "  backdrop-filter: blur(18px) saturate(1.6) !important;",
    "  -webkit-backdrop-filter: blur(18px) saturate(1.6) !important;",
    "  box-shadow: 0 2px 20px rgba(30,80,40,0.10), 0 0.5px 0 rgba(30,80,40,0.08) !important;",
    "}",

    /* Compensar la altura del navbar fijo para el body */
    ".reco-body-offset {",
    "  padding-top: var(--reco-nav-h, 72px);",
    "}",

    /* ── Hover bubble sobre cualquier enlace del nav ── */
    ".navbar__links a, .header nav a, header nav a[href] {",
    "  position: relative;",
    "  display: inline-flex;",
    "  align-items: center;",
    "  border-radius: 999px;",
    "  padding: 5px 13px !important;",
    "  transition: background 0.2s cubic-bezier(.4,0,.2,1),",
    "              color 0.2s, box-shadow 0.2s, transform 0.18s !important;",
    "}",

    /* Ocultar el ::after underline solo cuando tiene la burbuja hover */
    ".reco-link-hover::after { display: none !important; }",

    /* Hover genérico — burbuja suave */
    ".reco-link-hover {",
    "  background: rgba(45,140,78,0.10) !important;",
    "  color: #2d8c4e !important;",
    "  transform: translateY(-1px) !important;",
    "}",

    /* ── Burbuja activa (página actual) ── */
    ".reco-nav-bubble {",
    "  background: linear-gradient(135deg, #2d8c4e 0%, #1a5c2a 100%) !important;",
    "  color: #fff !important;",
    "  font-weight: 700 !important;",
    "  box-shadow: 0 4px 16px rgba(45,140,78,0.32) !important;",
    "  gap: 6px !important;",
    "  padding: 5px 15px 5px 11px !important;",
    "}",
    ".reco-nav-bubble::after { display: none !important; }",
    ".reco-nav-bubble:hover {",
    "  background: linear-gradient(135deg, #2d8c4e 0%, #1a5c2a 100%) !important;",
    "  color: #fff !important;",
    "  box-shadow: 0 6px 22px rgba(45,140,78,0.42) !important;",
    "  transform: translateY(-2px) !important;",
    "}",

    /* Punto pulsante dentro de la burbuja activa */
    ".reco-bubble-dot {",
    "  width: 6px; height: 6px;",
    "  background: rgba(255,255,255,0.82);",
    "  border-radius: 50%;",
    "  flex-shrink: 0;",
    "  animation: recoPulse 1.9s ease-in-out infinite;",
    "  display: inline-block;",
    "}",
    "@keyframes recoPulse {",
    "  0%,100%{ opacity:1; transform:scale(1); }",
    "  50%    { opacity:0.45; transform:scale(1.55); }",
    "}",

    /* ── Contenedor flotante del preview ── */
    ".reco-nav-preview {",
    "  position: fixed;",
    "  z-index: 99999;",
    "  pointer-events: none;",
    "  opacity: 0;",
    "  transform: translateY(8px) scale(0.96);",
    "  transition: opacity 0.2s cubic-bezier(.4,0,.2,1),",
    "              transform 0.2s cubic-bezier(.4,0,.2,1);",
    "  will-change: opacity, transform;",
    "}",
    ".reco-nav-preview.reco-preview-visible {",
    "  opacity: 1;",
    "  transform: translateY(0) scale(1);",
    "}",

    /* ── Tarjeta preview ── */
    ".reco-preview-card {",
    "  background: rgba(255,255,255,0.97);",
    "  backdrop-filter: blur(12px);",
    "  -webkit-backdrop-filter: blur(12px);",
    "  border-radius: 16px;",
    "  padding: 15px 17px 13px;",
    "  min-width: 220px;",
    "  max-width: 262px;",
    "  box-shadow: 0 10px 36px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06);",
    "  border: 1.5px solid #c8e6c9;",
    "  font-family: 'DM Sans', sans-serif;",
    "  position: relative;",
    "}",
    ".reco-preview-arrow {",
    "  position: absolute;",
    "  top: -7px;",
    "  left: 22px;",
    "  width: 13px; height: 13px;",
    "  background: rgba(255,255,255,0.97);",
    "  border-left: 1.5px solid #c8e6c9;",
    "  border-top: 1.5px solid #c8e6c9;",
    "  transform: rotate(45deg);",
    "  border-radius: 2px 0 0 0;",
    "}",
    ".reco-preview-header {",
    "  display: flex; align-items: center; gap: 10px; margin-bottom: 8px;",
    "}",
    ".reco-preview-icon {",
    "  font-size: 1.35rem;",
    "  width: 36px; height: 36px;",
    "  display: flex; align-items: center; justify-content: center;",
    "  border-radius: 9px;",
    "  flex-shrink: 0;",
    "}",
    ".reco-preview-label {",
    "  font-family: 'Fraunces', Georgia, serif;",
    "  font-weight: 900;",
    "  font-size: 0.95rem;",
    "  line-height: 1.2;",
    "}",
    ".reco-preview-desc {",
    "  font-size: 0.76rem;",
    "  line-height: 1.52;",
    "  color: #4a6b52;",
    "  margin-bottom: 10px;",
    "}",
    ".reco-preview-pill {",
    "  display: inline-flex;",
    "  align-items: center;",
    "  gap: 4px;",
    "  font-size: 0.70rem;",
    "  font-weight: 700;",
    "  padding: 4px 12px;",
    "  border-radius: 999px;",
    "  color: #fff;",
    "  letter-spacing: 0.01em;",
    "}",
    ".reco-preview-pill::before { content: '→ '; }",

    /* ── Animación de salida de página ── */
    "@keyframes recoPageOut {",
    "  0%   { opacity: 1; transform: translateY(0); }",
    "  100% { opacity: 0; transform: translateY(-10px); }",
    "}",
    ".reco-page-out {",
    "  animation: recoPageOut 0.28s cubic-bezier(.4,0,.2,1) forwards;",
    "}"

  ].join("\n");
  document.head.appendChild(style);

  /* ═══════════════════════════════════════════════════════════
     3. NAVBAR FIJA — scroll listener + body offset
     ═══════════════════════════════════════════════════════════ */
  function initStickyNav() {
    // Selecciona el navbar sea cual sea la página
    var navbar = document.querySelector(".navbar") || document.querySelector("header.header");
    if (!navbar) return;

    // Medir altura y compensar en el body — solo si el hero NO ocupa 100vh
    var navH = navbar.offsetHeight || 72;
    document.documentElement.style.setProperty("--reco-nav-h", navH + "px");
    var firstSection = document.body.querySelector("section, .hero, main");
    var heroFull = firstSection && window.getComputedStyle(firstSection).height === window.innerHeight + "px";
    if (!heroFull) {
      document.body.classList.add("reco-body-offset");
    }

    // Estado inicial
    navbar.classList.add("reco-nav-top");

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 12) {
            navbar.classList.remove("reco-nav-top");
            navbar.classList.add("reco-nav-scrolled");
          } else {
            navbar.classList.remove("reco-nav-scrolled");
            navbar.classList.add("reco-nav-top");
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // correr una vez al cargar
  }

  /* ═══════════════════════════════════════════════════════════
     4. PREVIEW FLOTANTE (singleton)
     ═══════════════════════════════════════════════════════════ */
  var previewEl = document.createElement("div");
  previewEl.className = "reco-nav-preview";
  previewEl.innerHTML =
    '<div class="reco-preview-card">' +
      '<div class="reco-preview-arrow" id="recoArrow"></div>' +
      '<div class="reco-preview-header">' +
        '<div class="reco-preview-icon"  id="recoIcon"></div>' +
        '<div class="reco-preview-label" id="recoLabel"></div>' +
      '</div>' +
      '<div class="reco-preview-desc" id="recoDesc"></div>' +
      '<span class="reco-preview-pill" id="recoPill"></span>' +
    '</div>';
  document.body.appendChild(previewEl);

  var hideTimer   = null;
  var recoIcon    = document.getElementById("recoIcon");
  var recoLabel   = document.getElementById("recoLabel");
  var recoDesc    = document.getElementById("recoDesc");
  var recoPill    = document.getElementById("recoPill");
  var recoArrow   = document.getElementById("recoArrow");
  var recoCard    = previewEl.querySelector(".reco-preview-card");

  function showPreview(link, data) {
    clearTimeout(hideTimer);

    // Obtener textos en el idioma activo
    var t = getData(data);

    // Contenido
    recoIcon.textContent  = data.icon;
    recoIcon.style.background = data.bg;
    recoLabel.textContent = t.label;
    recoLabel.style.color = data.color;
    recoDesc.textContent  = t.desc;
    recoPill.textContent  = t.pill;
    recoPill.style.background  = data.color;
    recoCard.style.borderColor = data.border;
    recoArrow.style.borderLeftColor = data.border;
    recoArrow.style.borderTopColor  = data.border;

    // Posición
    var rect   = link.getBoundingClientRect();
    var cardW  = 262;
    var margin = 12;
    var left   = rect.left + rect.width / 2 - cardW / 2;
    if (left < margin) left = margin;
    if (left + cardW > window.innerWidth - margin) left = window.innerWidth - cardW - margin;

    previewEl.style.left = left + "px";
    previewEl.style.top  = (rect.bottom + 10) + "px";

    // Flecha centrada bajo el enlace
    var arrowLeft = (rect.left + rect.width / 2) - left - 7;
    recoArrow.style.left = Math.max(12, Math.min(arrowLeft, cardW - 28)) + "px";

    previewEl.classList.add("reco-preview-visible");
  }

  function hidePreview() {
    hideTimer = setTimeout(function () {
      previewEl.classList.remove("reco-preview-visible");
    }, 130);
  }

  /* ═══════════════════════════════════════════════════════════
     5. DETECTAR PÁGINA ACTUAL + APLICAR BURBUJA + EVENTOS
     ═══════════════════════════════════════════════════════════ */
  function getPageKey(href) {
    if (!href) return null;
    var match = href.match(/([^/\\?#]+\.html)/);
    if (match) return match[1];
    if (href === "/" || /\/$/.test(href) || href === "" || href === "#") return "index.html";
    return null;
  }

  var currentFile = (location.pathname.split("/").pop() || "index.html") || "index.html";
  if (!currentFile || currentFile === "") currentFile = "index.html";

  var navSelectors = [".navbar__links a", ".header nav a", "header nav a"];
  var allNavLinks  = [];

  navSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (a) {
      if (allNavLinks.indexOf(a) === -1) allNavLinks.push(a);
    });
  });

  allNavLinks.forEach(function (link) {
    var pageKey = getPageKey(link.getAttribute("href"));
    var data    = PAGE_DATA[pageKey];
    if (!data) return;

    var isCurrent = (pageKey === currentFile) || (currentFile === "" && pageKey === "index.html");

    /* ── Burbuja activa ── */
    if (isCurrent) {
      link.classList.add("reco-nav-bubble");
      // Quitar la clase .active nativa para evitar conflictos de estilo
      link.classList.remove("active");
      var dot = document.createElement("span");
      dot.className = "reco-bubble-dot";
      link.insertBefore(dot, link.firstChild);
    }

    /* ── Hover: burbuja suave ── */
    link.addEventListener("mouseenter", function () {
      if (!link.classList.contains("reco-nav-bubble")) {
        link.classList.add("reco-link-hover");
      }
      showPreview(link, data);
    });

    link.addEventListener("mouseleave", function () {
      link.classList.remove("reco-link-hover");
      hidePreview();
    });

    link.addEventListener("focus", function ()  { showPreview(link, data); });
    link.addEventListener("blur",  function ()  { hidePreview(); });

    /* ── Animación de salida al hacer clic ── */
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      // Solo animar si es una página interna real y no la página actual
      if (!href || href === "#" || isCurrent) return;
      if (href.startsWith("http") || href.startsWith("//")) return;

      e.preventDefault();
      hidePreview();
      document.body.classList.add("reco-page-out");

      setTimeout(function () {
        window.location.href = href;
      }, 260);
    });
  });

  /* ═══════════════════════════════════════════════════════════
     6. INIT
     ═══════════════════════════════════════════════════════════ */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStickyNav);
  } else {
    initStickyNav();
  }

})();