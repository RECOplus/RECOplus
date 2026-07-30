/**
 * donar-effects.js — Luces, partículas, sparkles y barra de progreso
 * para donar.html. Mismo patrón que reciclar-effects.js. No modifica
 * donar.js ni su estado, solo añade capas visuales aditivas.
 * Cargar DESPUÉS de donar.js:
 * <script src="donar-effects.js"></script>
 */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ready(function () {

    /* ── SCROLL PROGRESS BAR ── */
    if (!document.getElementById('reco-progress-donar')) {
      var bar = document.createElement('div');
      bar.id = 'reco-progress-donar';
      document.body.prepend(bar);
      window.addEventListener('scroll', function () {
        var scrolled = window.scrollY;
        var total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
      }, { passive: true });
    }

    if (prefersReducedMotion()) return;

    /* ── PARTÍCULAS SUAVES en hero y trust badges ── */
    function addLights(sectionSel, count) {
      var section = document.querySelector(sectionSel);
      if (!section) return;
      if (section.querySelector(':scope > .dn-lights')) return;
      var wrap = document.createElement('div');
      wrap.className = 'dn-lights';
      section.prepend(wrap);
      for (var i = 0; i < count; i++) {
        var dot = document.createElement('div');
        dot.className = 'dn-dot';
        var size = 3 + Math.random() * 6;
        var x = Math.random() * 100;
        var y = Math.random() * 100;
        var dur = 5 + Math.random() * 7;
        var delay = Math.random() * -dur;
        var opacity = 0.12 + Math.random() * 0.30;
        dot.style.cssText =
          'left:' + x + '%;' +
          'top:' + y + '%;' +
          'width:' + size + 'px;' +
          'height:' + size + 'px;' +
          'opacity:' + opacity + ';' +
          'animation-duration:' + dur + 's;' +
          'animation-delay:' + delay + 's;';
        wrap.appendChild(dot);
      }
    }
    addLights('.donar-hero', 18);
    addLights('.donar-tabs-section', 10);
    addLights('.footer', 14);

    document.querySelectorAll('.donar-trust-item').forEach(function (item) {
      if (item.querySelector(':scope > .dn-lights')) return;
      var wrap = document.createElement('div');
      wrap.className = 'dn-lights';
      item.prepend(wrap);
      for (var j = 0; j < 4; j++) {
        var dot = document.createElement('div');
        dot.className = 'dn-dot';
        var size = 2 + Math.random() * 3;
        var x = Math.random() * 100;
        var y = Math.random() * 100;
        var dur = 6 + Math.random() * 6;
        var delay = Math.random() * -dur;
        dot.style.cssText =
          'left:' + x + '%; top:' + y + '%; width:' + size + 'px; height:' + size + 'px;' +
          'opacity:0.18; animation-duration:' + dur + 's; animation-delay:' + delay + 's;';
        wrap.appendChild(dot);
      }
    });

    /* ── GUIRNALDA DE LUCES en cajas grandes ── */
    document.querySelectorAll('.donar-hero, .donar-form-panel').forEach(function (box) {
      if (box.querySelector(':scope > .dn-string-lights')) return;
      var lights = document.createElement('div');
      lights.className = 'dn-string-lights';
      lights.setAttribute('aria-hidden', 'true');
      box.prepend(lights);
    });

    /* ── Nota: los sparkles/destello de los botones ahora los
       inyecta donar-shimmer.js (mismo sistema rc-shine-static /
       rc-shine-sweep que reciclar-shimmer.js), para que se vea
       idéntico en ambas páginas. ── */

    /* ── REVEAL ON SCROLL escalonado ── */
    var staggerTargets = document.querySelectorAll('.donar-trust-item');
    staggerTargets.forEach(function (el, i) {
      el.classList.add('dn-reveal');
      el.style.transitionDelay = (i * 0.06) + 's';
    });

    /* ── Footer: reveal como contenedor único, igual que en mapa.html ── */
    var footerEl = document.querySelector('.footer');
    if (footerEl) footerEl.classList.add('dn-reveal');

    var revealTargets = document.querySelectorAll('.dn-reveal');
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      revealTargets.forEach(function (el) { observer.observe(el); });
    } else {
      revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ── FIX: reveal de .sidebar / .footer-cta / .footer en mapa.html ──
       mapa-effects.css (sección 9) define estas tres como
       "opacity:0; transform:translateY(18px)" en reposo, visibles
       solo al ganar la clase .is-visible — pensado para un reveal
       on-scroll. Pero este archivo es una copia de donar-effects.js
       que nunca observa estos tres selectores (solo conoce clases de
       donar.html), así que en mapa.html .sidebar se quedaba con
       opacity:0 para siempre: la lista de resultados existía en el
       DOM (JS la poblaba bien) pero era invisible y el contenedor no
       bloqueaba clics, por eso se sentía "interactivo pero vacío".
       Esto agrega el mismo patrón IntersectionObserver, apuntando a
       los selectores reales que existen en mapa.html. Aditivo: no
       toca mapa-effects.css ni el resto de este archivo. */
    var mapaRevealTargets = document.querySelectorAll('.sidebar, .footer-cta, .footer');
    if (mapaRevealTargets.length) {
      if ('IntersectionObserver' in window) {
        var mapaObserver = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          });
        }, { threshold: 0.1 });
        mapaRevealTargets.forEach(function (el) { mapaObserver.observe(el); });
      } else {
        mapaRevealTargets.forEach(function (el) { el.classList.add('is-visible'); });
      }
      // La sidebar vive en el viewport inicial (no requiere scroll para
      // verse) en la mayoría de tamaños de pantalla; con threshold:0.1
      // el IntersectionObserver ya dispara casi de inmediato al cargar,
      // pero por si el layout tarda en asentarse (fuentes, imágenes,
      // Leaflet redimensionando el mapa) forzamos una revalidación tras
      // el primer frame para que nunca quede colgada en opacity:0.
      requestAnimationFrame(function () {
        mapaRevealTargets.forEach(function (el) {
          var rect = el.getBoundingClientRect();
          var inViewport = rect.top < window.innerHeight && rect.bottom > 0;
          if (inViewport) el.classList.add('is-visible');
        });
      });
    }

  });
})();