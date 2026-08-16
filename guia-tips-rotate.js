/**
 * guia-tips-rotate.js — Rotación automática de "¿Sabías qué?" y
 * "Consejos rápidos" en guia.html.
 *
 * Capa 100% aditiva: no modifica guia-hub.js ni i18n.js. Usa
 * window.t(key) (definido en i18n.js) para que el texto rotado
 * siempre respete el idioma actual, y se re-sincroniza en el
 * evento "reco:langchange" que dispara applyLang().
 *
 * - "¿Sabías qué?" (#ghInfoRotate): cross-fade de una frase a la vez,
 *   recorriendo las claves en data-gh-rotate-keys.
 * - "Consejos rápidos" (#ghTipsRotate): recambia el subconjunto de
 *   <li> visibles (data-gh-rotate-visible) cada cierto tiempo.
 *
 * Se pausa al pasar el mouse / mantener el foco sobre la tarjeta,
 * y no rota si el usuario tiene activado prefers-reduced-motion.
 *
 * Cárgalo después de i18n.js y guia-hub.js:
 * <script src="guia-tips-rotate.js"></script>
 */
(function () {
  "use strict";

  var INFO_INTERVAL = 6000;   // ms entre frases de "¿Sabías qué?"
  var TIPS_INTERVAL  = 5000;  // ms entre tandas de "Consejos rápidos"
  var FADE_MS        = 350;   // duración del cross-fade

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function tr(key, fallback) {
    return (typeof window.t === "function") ? window.t(key) : (fallback || key);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* ─────────────────────────────────────────────
     "¿Sabías qué?" — cross-fade de una frase a la vez
     ───────────────────────────────────────────── */
  function initInfoRotate() {
    var el = document.getElementById("ghInfoRotate");
    if (!el) return;
    var keys = (el.getAttribute("data-gh-rotate-keys") || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    if (keys.length < 2) return;

    var order = shuffle(keys);
    var idx = 0;
    var paused = false;
    var timer = null;

    function paint(key) {
      el.style.transition = "opacity " + FADE_MS + "ms ease";
      el.style.opacity = "0";
      window.setTimeout(function () {
        el.innerHTML = tr(key);
        el.setAttribute("data-gh-current-key", key);
        el.style.opacity = "1";
      }, FADE_MS);
    }

    function next() {
      if (paused) return;
      idx = (idx + 1) % order.length;
      paint(order[idx]);
    }

    function loop() {
      if (timer) window.clearInterval(timer);
      if (prefersReducedMotion()) return; // se queda en la frase actual, sin rotar
      timer = window.setInterval(next, INFO_INTERVAL);
    }

    el.addEventListener("mouseenter", function () { paused = true; });
    el.addEventListener("mouseleave", function () { paused = false; });
    el.addEventListener("focusin", function () { paused = true; });
    el.addEventListener("focusout", function () { paused = false; });

    // Re-pinta la frase actual (traducida) cuando cambia el idioma,
    // sin reiniciar el orden de rotación.
    document.addEventListener("reco:langchange", function () {
      var current = order[idx];
      el.innerHTML = tr(current);
    });

    loop();
  }

  /* ─────────────────────────────────────────────
     "Consejos rápidos" — recambia el subconjunto visible
     ───────────────────────────────────────────── */
  function initTipsRotate() {
    var list = document.getElementById("ghTipsRotate");
    if (!list) return;
    var keys = (list.getAttribute("data-gh-rotate-keys") || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var visibleCount = parseInt(list.getAttribute("data-gh-rotate-visible"), 10) || 5;
    if (keys.length <= visibleCount) return; // nada que rotar

    var checkIcon = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M4 10l4 4 8-9"/></svg>';
    var order = shuffle(keys);
    var cursor = 0;
    var paused = false;
    var timer = null;

    function currentSlice() {
      var out = [];
      for (var i = 0; i < visibleCount; i++) {
        out.push(order[(cursor + i) % order.length]);
      }
      return out;
    }

    function render(keysToShow) {
      list.style.transition = "opacity " + FADE_MS + "ms ease";
      list.style.opacity = "0";
      window.setTimeout(function () {
        list.innerHTML = "";
        keysToShow.forEach(function (key) {
          var li = document.createElement("li");
          li.innerHTML = checkIcon + '<span data-i18n="' + key + '">' + tr(key) + "</span>";
          list.appendChild(li);
        });
        list.setAttribute("data-gh-current-keys", keysToShow.join(","));
        list.style.opacity = "1";
      }, FADE_MS);
    }

    function next() {
      if (paused) return;
      cursor = (cursor + visibleCount) % order.length;
      render(currentSlice());
    }

    function loop() {
      if (timer) window.clearInterval(timer);
      if (prefersReducedMotion()) return; // se queda con la tanda actual, sin rotar
      timer = window.setInterval(next, TIPS_INTERVAL);
    }

    list.addEventListener("mouseenter", function () { paused = true; });
    list.addEventListener("mouseleave", function () { paused = false; });
    list.addEventListener("focusin", function () { paused = true; });
    list.addEventListener("focusout", function () { paused = false; });

    // Re-pinta las frases actualmente visibles (traducidas) al cambiar
    // de idioma, sin cambiar cuáles están mostrándose.
    document.addEventListener("reco:langchange", function () {
      var shown = (list.getAttribute("data-gh-current-keys") || "").split(",").filter(Boolean);
      if (!shown.length) shown = currentSlice();
      list.innerHTML = "";
      shown.forEach(function (key) {
        var li = document.createElement("li");
        li.innerHTML = checkIcon + '<span data-i18n="' + key + '">' + tr(key) + "</span>";
        list.appendChild(li);
      });
    });

    loop();
  }

  ready(function () {
    initInfoRotate();
    initTipsRotate();
  });
})();
