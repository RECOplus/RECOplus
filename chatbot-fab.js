/**
 * RECO+ — Botón flotante del Chatbot (Botpress)
 * ─────────────────────────────────────────────────────────────
 * Capa ADITIVA: inyecta el webchat de Botpress y un botón propio
 * (mismo lenguaje visual que .reco-fab de WhatsApp y .reco-tut-fab
 * del tutorial) en document.body al cargar, sin tocar el HTML de
 * cada página. Compatible con TODAS las páginas del sitio.
 *
 * El botón se apila arriba del FAB de tutorial (ver chatbot-fab.css:
 * right:24px bottom:154px) para no superponerse con WhatsApp (18px)
 * ni con el tutorial (92px).
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  "use strict";

  var INJECT_SRC = "https://cdn.botpress.cloud/webchat/v3.7/inject.js";
  var CONFIG_SRC = "https://files.bpcontent.cloud/2026/08/17/20/20260817205324-SFRU528A.js";

  var LABELS = {
    es: { chat: "Chat" },
    en: { chat: "Chat" }
  };

  function getLang() {
    try { return localStorage.getItem("reco-lang") || "es"; } catch (e) { return "es"; }
  }

  /* ═══════════════════════════════════════════════════════════
     1) Cargar scripts de Botpress (una sola vez, en orden)
     ═══════════════════════════════════════════════════════════ */
  function loadScript(src, attrs, cb) {
    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) { if (cb) cb(); return; }
    var s = document.createElement("script");
    s.src = src;
    if (attrs) {
      for (var k in attrs) { if (attrs.hasOwnProperty(k)) s.setAttribute(k, attrs[k]); }
    }
    if (cb) s.addEventListener("load", cb, { once: true });
    document.head.appendChild(s);
  }

  function loadBotpress() {
    // El script de inyección debe cargar primero; el de configuración
    // depende de window.botpress y puede ir con defer, igual que en
    // el snippet original.
    loadScript(INJECT_SRC, {}, function () {
      loadScript(CONFIG_SRC, { defer: "" });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     2) Botón flotante propio (abre/cierra el webchat)
     ═══════════════════════════════════════════════════════════ */
  function buildFab() {
    var t = LABELS[getLang()] || LABELS.es;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "reco-chatbot-fab";
    btn.id = "recoChatbotFab";
    btn.setAttribute("aria-label", t.chat);
    btn.setAttribute("data-label", t.chat);

    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>' +
      '</svg>' +
      '<span class="reco-chatbot-fab__dot" aria-hidden="true"></span>';

    btn.addEventListener("click", function () {
      try {
        if (window.botpress && typeof window.botpress.open === "function") {
          window.botpress.open();
        } else {
          // Botpress todavía no terminó de inicializar: reintenta brevemente.
          var tries = 0;
          var iv = setInterval(function () {
            tries++;
            if (window.botpress && typeof window.botpress.open === "function") {
              window.botpress.open();
              clearInterval(iv);
            } else if (tries > 20) {
              clearInterval(iv);
            }
          }, 150);
        }
      } catch (e) { /* noop */ }
    });

    document.body.appendChild(btn);
    return btn;
  }

  function init() {
    if (document.getElementById("recoChatbotFab")) return; // evita duplicados
    loadBotpress();
    buildFab();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Si el usuario cambia de idioma en caliente, refresca la etiqueta */
  window.addEventListener("storage", function (e) {
    if (e.key === "reco-lang") {
      var btn = document.getElementById("recoChatbotFab");
      if (!btn) return;
      var t = LABELS[getLang()] || LABELS.es;
      btn.setAttribute("aria-label", t.chat);
      btn.setAttribute("data-label", t.chat);
    }
  });
})();
