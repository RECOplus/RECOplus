/**
 * RECO+ — Modo Optimizado (Perf Mode)
 * ─────────────────────────────────────────────────
 * Reduce el costo de renderizado en dispositivos de gama media/baja
 * apagando la capa de efectos visuales "liquid glass": backdrop-filter
 * (blur), animaciones de glow/shimmer/sparkle/pulse y drop-shadows.
 *
 * - Guarda preferencia en localStorage bajo "reco-perf-mode" ("true"/"false")
 * - Aplica la clase "perf-mode" al <html> INMEDIATAMENTE (antes del primer
 *   paint), igual que darkmode.js hace con "dark", para evitar parpadeo
 *   (flash del modo normal seguido de un salto al modo optimizado).
 * - Inyecta un pill toggle en el navbar (junto a dm-pill) en todas las
 *   páginas, reutilizando el mismo patrón visual que dm-pill/lang-pill.
 * - Expone window.RecoPerf = { isOn, set, toggle } para que otros scripts
 *   (ajustes-modal.js, liquid-glass-fx.js) puedan leer/cambiar el estado
 *   y reaccionar a él.
 * - Dispara el evento "reco:perfmodechange" en `document` con
 *   { detail: { on: boolean } } cada vez que el estado cambia.
 * ─────────────────────────────────────────────────
 */
(function () {
  "use strict";

  var STORAGE_KEY = "reco-perf-mode";

  /* ══════════════════════════════════════════════
     1. APLICAR ESTADO INMEDIATAMENTE (evita flash)
     ══════════════════════════════════════════════ */
  function getSaved() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch (e) {
      return false;
    }
  }

  function setSaved(on) {
    try {
      localStorage.setItem(STORAGE_KEY, on ? "true" : "false");
    } catch (e) {}
  }

  var isOn = getSaved();
  if (isOn) {
    document.documentElement.classList.add("perf-mode");
  }

  /* ══════════════════════════════════════════════
     2. API PÚBLICA
     ══════════════════════════════════════════════ */
  function apply(on, opts) {
    opts = opts || {};
    isOn = !!on;
    document.documentElement.classList.toggle("perf-mode", isOn);
    setSaved(isOn);
    updateAllVisuals();
    if (!opts.silent) {
      document.dispatchEvent(
        new CustomEvent("reco:perfmodechange", { detail: { on: isOn } })
      );
    }
  }

  function toggle() {
    apply(!isOn);
  }

  window.RecoPerf = {
    isOn: function () {
      return isOn;
    },
    set: apply,
    toggle: toggle,
  };

  /* ══════════════════════════════════════════════
     3. INYECTAR PILL EN EL NAVBAR
     ─────────────────────────────────────────────
     Mismo patrón visual que .dm-pill (icono único, sin track/knob),
     insertado justo antes de .dm-pill si existe.
     ══════════════════════════════════════════════ */
  var PERF_ICON_ON =
    '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2 4 11h4.5L8 18l7-9h-4.5z"/></svg>';

  function buildPerfPill() {
    var pill = document.createElement("button");
    pill.type = "button";
    pill.className = "perf-pill";
    pill.setAttribute("aria-label", "Modo optimizado");
    pill.setAttribute("title", "Modo optimizado: reduce efectos visuales");
    pill.setAttribute("data-on", isOn ? "true" : "false");
    pill.innerHTML =
      '<span class="perf-pill__btn">' + PERF_ICON_ON + "</span>";
    pill.addEventListener("click", function () {
      toggle();
    });
    return pill;
  }

  function injectPerfPill() {
    if (document.querySelector(".perf-pill")) return; // ya inyectado

    var dmPill = document.querySelector(".dm-pill");
    var pill = buildPerfPill();

    if (dmPill && dmPill.parentNode) {
      dmPill.parentNode.insertBefore(pill, dmPill);
      return;
    }

    // Fallback: mismos puntos de anclaje que darkmode.js usa para su botón
    var spacer = document.querySelector(".navbar__spacer");
    if (spacer) {
      spacer.insertBefore(pill, spacer.firstChild);
      return;
    }
    var actions = document.querySelector(".bubble-nav__actions");
    if (actions) {
      actions.insertBefore(pill, actions.firstChild);
      return;
    }
    var navbar =
      document.querySelector(".navbar") ||
      document.querySelector("header.navbar") ||
      document.querySelector("header.header");
    if (navbar) navbar.appendChild(pill);
  }

  /* ══════════════════════════════════════════════
     4. SINCRONIZAR VISUALES (pill navbar + switch ajustes)
     ══════════════════════════════════════════════ */
  function updateAllVisuals() {
    document.querySelectorAll(".perf-pill").forEach(function (pill) {
      pill.setAttribute("data-on", isOn ? "true" : "false");
    });
    var ajSwitch = document.getElementById("ajPerfSwitch");
    if (ajSwitch) {
      ajSwitch.setAttribute("data-on", isOn ? "true" : "false");
    }
  }

  /* ══════════════════════════════════════════════
     5. INIT
     ══════════════════════════════════════════════ */
  function init() {
    injectPerfPill();
    updateAllVisuals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
