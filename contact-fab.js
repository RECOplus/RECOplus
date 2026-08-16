/**
 * RECO+ — Barra flotante de contacto (WhatsApp)
 * ─────────────────────────────────────────────────────────────
 * Capa ADITIVA: se inyecta sola en document.body al cargar, sin
 * tocar el HTML de cada página. Compatible con TODAS las páginas
 * del sitio (index, reciclar, donar, guía, mapa, alianzas, scanner-
 * demo, videos, login, registro, reset-password, contacto).
 *
 * Datos de contacto: mismo teléfono que ya aparece en el footer del
 * sitio (+507 6399-1249). Actualiza WHATSAPP_NUMBER abajo si cambia.
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  "use strict";

  /* ═══════════════════════════════════════════════════════════
     CONFIG — edita aquí tus datos reales de contacto
     ═══════════════════════════════════════════════════════════ */
  var WHATSAPP_NUMBER = "50763991249";       // mismo tel. que el footer, sin + ni espacios
  var WHATSAPP_MSG     = "Hola RECO+, quiero más información.";

  var LABELS = {
    es: { whatsapp: "WhatsApp" },
    en: { whatsapp: "WhatsApp" }
  };

  function getLang() {
    return localStorage.getItem("reco-lang") || "es";
  }

  /* ═══════════════════════════════════════════════════════════
     MARKUP
     ═══════════════════════════════════════════════════════════ */
  function buildFab() {
    var t = LABELS[getLang()] || LABELS.es;

    var wrap = document.createElement("div");
    wrap.className = "reco-fab";
    wrap.id = "recoFab";

    wrap.innerHTML =
      '<a class="reco-fab__btn reco-fab__btn--whatsapp" ' +
         'href="https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MSG) + '" ' +
         'target="_blank" rel="noopener" aria-label="WhatsApp" data-label="' + t.whatsapp + '">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 004.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.02c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.1.11-1.78-.11-.41-.13-.93-.3-1.6-.6-2.82-1.22-4.66-4.07-4.8-4.26-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.35.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.61-.07.16-.19.7-.81.88-1.09.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.47.21.53.33.07.12.07.68-.17 1.36z"/></svg>' +
      '</a>';

    return wrap;
  }

  function init() {
    if (document.getElementById("recoFab")) return; // evita duplicados
    document.body.appendChild(buildFab());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Si el usuario cambia de idioma en caliente, refresca las etiquetas */
  window.addEventListener("storage", function (e) {
    if (e.key === "reco-lang") {
      var old = document.getElementById("recoFab");
      if (old) old.remove();
      init();
    }
  });
})();
