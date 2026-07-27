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

  });
})();