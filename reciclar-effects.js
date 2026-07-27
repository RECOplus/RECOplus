/**
 * reciclar-effects.js — Luces, partículas, sparkles y barra de
 * progreso para reciclar.html. Mismo patrón que mapa-effects.js,
 * intensificado: más partículas, más secciones cubiertas, y
 * sparkles inyectados automáticamente en cada .rc-btn.
 * No modifica reciclar.js ni su estado.
 */

(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {

    /* ── SCROLL PROGRESS BAR ── */
    if (!document.getElementById('reco-progress-reciclar')) {
      var bar = document.createElement('div');
      bar.id = 'reco-progress-reciclar';
      document.body.prepend(bar);
      window.addEventListener('scroll', function () {
        var scrolled = window.scrollY;
        var total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
      }, { passive: true });
    }

    /* ── PARTÍCULAS SUAVES (más densas, más secciones) ── */
    function addLights(sectionSel, wrapClass, count) {
      var section = document.querySelector(sectionSel);
      if (!section) return;
      if (section.querySelector('.' + wrapClass)) return; // evita duplicados
      var wrap = document.createElement('div');
      wrap.className = wrapClass;
      section.prepend(wrap);
      for (var i = 0; i < count; i++) {
        var dot = document.createElement('div');
        dot.className = 'light-dot';
        var size = 3 + Math.random() * 7;
        var x = Math.random() * 100;
        var y = Math.random() * 100;
        var dur = 5 + Math.random() * 7;
        var delay = Math.random() * -dur;
        var opacity = 0.16 + Math.random() * 0.36;
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
    addLights('.rc-hero', 'rc-lights', 20);
    addLights('.rc-cta', 'rc-lights', 14);
    document.querySelectorAll('.rc-panel').forEach(function (panel, i) {
      if (!panel.querySelector('.rc-lights')) {
        var wrap = document.createElement('div');
        wrap.className = 'rc-lights';
        panel.prepend(wrap);
        for (var j = 0; j < 6; j++) {
          var dot = document.createElement('div');
          dot.className = 'light-dot';
          var size = 2 + Math.random() * 4;
          var x = Math.random() * 100;
          var y = Math.random() * 100;
          var dur = 6 + Math.random() * 6;
          var delay = Math.random() * -dur;
          var opacity = 0.10 + Math.random() * 0.20;
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
    });

    /* ── GUIRNALDA DE LUCES (string lights): mismo efecto que
       .map-wrapper / .sidebar / .footer en mapa.html. Se inyecta
       como elemento real (no ::before/::after, esos ya están
       ocupados) al borde superior de cada caja grande. ── */
    document.querySelectorAll('.rc-hero, .rc-panel, .rc-cta, .footer').forEach(function (box) {
      if (box.querySelector(':scope > .rc-string-lights')) return;
      var lights = document.createElement('div');
      lights.className = 'rc-string-lights';
      lights.setAttribute('aria-hidden', 'true');
      box.prepend(lights);
    });

    /* ── SPARKLES en cada botón (.rc-btn) para el efecto glow-boost ── */
    document.querySelectorAll('.rc-btn').forEach(function (btn) {
      if (!btn.querySelector('.btn-sparkle')) {
        var sparkle = document.createElement('span');
        sparkle.className = 'btn-sparkle';
        sparkle.setAttribute('aria-hidden', 'true');
        btn.appendChild(sparkle);
      }
    });

    /* ── REVEAL ON SCROLL escalonado (rc-reveal ya existe en reciclar.css,
       aquí solo agregamos stagger a las cards internas) ── */
    var staggerGroups = ['.rc-material', '.rc-scanner__feature', '.rc-process__step', '.rc-result', '.rc-stat'];
    staggerGroups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.05) + 's';
      });
    });

    var revealTargets = document.querySelectorAll('.rc-reveal');
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