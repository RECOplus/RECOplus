/**
 * reciclar-shimmer.js — Inyecta DOS destellos independientes en
 * TODOS los botones y elementos interactivos de reciclar.html:
 *
 *   1. .rc-shine-static — línea fija, tenue, siempre visible,
 *      nunca se anima. Se inyecta una vez y ya no se toca.
 *
 *   2. .rc-shine-sweep — destello que solo se anima (rápido y
 *      fluido) cuando el cursor entra al elemento (mouseenter).
 *      Al terminar la pasada (animationend) se le quita la clase
 *      .rc-shine--play y vuelve a quedar invisible hasta la
 *      próxima vez.
 *
 * Ambos elementos son completamente independientes entre sí: la
 * línea fija jamás participa de la animación de hover.
 *
 * Capa 100% aditiva: no modifica reciclar.js, reciclar-effects.js
 * ni su estado.
 *
 * Cárgalo DESPUÉS de reciclar.js y reciclar-effects.js:
 * <script src="reciclar-shimmer.js"></script>
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

  // Selectores que reciben los destellos directamente (el propio
  // elemento se marca como .rc-shine-host y recibe el overflow:hidden)
  var DIRECT_TARGETS = [
    ".rc-btn--outline",
    ".rc-material",
    ".rc-panel",
    ".rc-scanner__drop",
    ".rc-scanner__feature",
    ".rc-result",
    ".rc-stat",
    ".rc-note",
    ".rc-map-preview",
    ".rc-cta",
    ".rc-btn--full",
    ".rc-input-wrap"
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

  // Dispara UNA pasada del destello de hover. Si ya está en curso,
  // no la reinicia (evita saltos si el mouse entra/sale rápido).
  function playSweep(sweepEl) {
    if (!sweepEl || sweepEl.classList.contains("rc-shine--play")) return;
    sweepEl.classList.add("rc-shine--play");
  }

  function onSweepAnimationEnd(e) {
    if (e.target.classList.contains("rc-shine-sweep")) {
      e.target.classList.remove("rc-shine--play");
    }
  }

  // Vincula el hover del host a su(s) .rc-shine-sweep. La línea
  // estática nunca se toca aquí.
  function wireHover(hostEl) {
    if (hostEl.dataset.rcShineWired) return;
    hostEl.dataset.rcShineWired = "1";
    hostEl.addEventListener("mouseenter", function () {
      hostEl.querySelectorAll(".rc-shine-sweep").forEach(playSweep);
    });
    // Soporte táctil: un tap dispara el mismo feedback una vez.
    hostEl.addEventListener("touchstart", function () {
      hostEl.querySelectorAll(".rc-shine-sweep").forEach(playSweep);
    }, { passive: true });
  }

  // .rc-btn (incluye --solid) necesita tratamiento especial: usa
  // overflow:visible!important para su glow externo (::after), así
  // que los destellos no pueden vivir directo en el botón — se
  // recortan dentro de un wrapper interno .rc-btn__clip.
  function injectIntoButtons() {
    document.querySelectorAll(".rc-btn").forEach(function (btn) {
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
    // Un único listener delegado para todos los .rc-shine-sweep,
    // en vez de uno por elemento.
    document.addEventListener("animationend", onSweepAnimationEnd, true);
  });
})();