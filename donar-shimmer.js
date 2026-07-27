/**
 * donar-shimmer.js — Inyecta el mismo doble destello que
 * reciclar-shimmer.js (línea fija .rc-shine-static + barrido
 * .rc-shine-sweep en hover) en los botones y paneles de donar.html.
 * Reutiliza las clases genéricas de reciclar-shimmer.css (no
 * dependen del prefijo rc-, así que el resultado visual es
 * idéntico entre reciclar y donar).
 *
 * Capa 100% aditiva: no modifica donar.js ni donar-effects.js.
 *
 * Requiere que reciclar-shimmer.css esté cargado en la página.
 * Cargar DESPUÉS de donar.js y donar-effects.js:
 * <script src="donar-shimmer.js"></script>
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  // Elementos que reciben el destello directamente (se marcan como
  // .rc-shine-host y ganan overflow:hidden para recortarlo).
  var DIRECT_TARGETS = [
    ".donar-form-panel",
    ".donar-trust-item",
    ".donar-upload",
    ".donar-tab",
    ".donar-hero__card-float"
  ];

  // Botones "sólidos": igual que .rc-btn en reciclar, necesitan un
  // wrapper interno (.rc-btn__clip) porque donar-submit-btn usa
  // overflow:visible!important para su propio glow (::after).
  var BUTTON_TARGETS = [
    ".donar-submit-btn",
    ".donar-modal-close-btn"
  ];

  function makeStatic() {
    var el = document.createElement("span");
    el.className = "rc-shine-static";
    el.setAttribute("aria-hidden", "true");
    return el;
  }

  function makeSweep() {
    var el = document.createElement("span");
    el.className = "rc-shine-sweep";
    el.setAttribute("aria-hidden", "true");
    return el;
  }

  function playSweep(sweepEl) {
    if (!sweepEl || sweepEl.classList.contains("rc-shine--play")) return;
    sweepEl.classList.add("rc-shine--play");
  }

  function onSweepAnimationEnd(e) {
    if (e.target.classList.contains("rc-shine-sweep")) {
      e.target.classList.remove("rc-shine--play");
    }
  }

  function wireHover(hostEl) {
    if (hostEl.dataset.dnShineWired) return;
    hostEl.dataset.dnShineWired = "1";
    hostEl.addEventListener("mouseenter", function () {
      hostEl.querySelectorAll(".rc-shine-sweep").forEach(playSweep);
    });
    hostEl.addEventListener("touchstart", function () {
      hostEl.querySelectorAll(".rc-shine-sweep").forEach(playSweep);
    }, { passive: true });
  }

  function injectIntoButtons() {
    BUTTON_TARGETS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (btn) {
        var clip = btn.querySelector(":scope > .rc-btn__clip");
        if (!clip) {
          clip = document.createElement("span");
          clip.className = "rc-btn__clip";
          clip.setAttribute("aria-hidden", "true");
          clip.appendChild(makeStatic());
          clip.appendChild(makeSweep());
          btn.appendChild(clip);
        }
        wireHover(btn);
      });
    });
  }

  function injectDirect() {
    DIRECT_TARGETS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.querySelector(":scope > .rc-shine-static")) {
          el.classList.add("rc-shine-host");
          el.appendChild(makeStatic());
          el.appendChild(makeSweep());
        }
        wireHover(el);
      });
    });
  }

  ready(function () {
    injectIntoButtons();
    injectDirect();
    document.addEventListener("animationend", onSweepAnimationEnd, true);
  });
})();
