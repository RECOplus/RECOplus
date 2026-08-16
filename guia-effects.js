/**
 * guia-effects.js — Luces, partículas y barra de progreso para
 * guia.html. Mismo patrón que reciclar-effects.js / mapa-effects.js.
 * No modifica guia-hub.js ni su estado; solo inyecta elementos
 * decorativos y escucha el scroll.
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
    if (!document.getElementById('reco-progress-guia')) {
      var bar = document.createElement('div');
      bar.id = 'reco-progress-guia';
      document.body.prepend(bar);
      window.addEventListener('scroll', function () {
        var scrolled = window.scrollY;
        var total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
      }, { passive: true });
    }

    /* ── PARTÍCULAS DE LUZ EN EL HERO Y EL CTA FINAL ── */
    function addLights(sectionSel, wrapClass, count) {
      var section = document.querySelector(sectionSel);
      if (!section) return;
      if (section.querySelector('.' + wrapClass)) return; // evita duplicados
      var wrap = document.createElement('div');
      wrap.className = wrapClass;
      wrap.setAttribute('aria-hidden', 'true');
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
    addLights('.gh-hero', 'gh-lights', 20);
    addLights('.gh-cta', 'gh-lights', 14);

    /* ── SPARKLES en botones destacados ── */
    ['.gh-learn__side-btn', '.gh-donate-panel__cta', '.gh-cta__btn'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (btn) {
        if (!btn.querySelector('.btn-sparkle')) {
          var sparkle = document.createElement('span');
          sparkle.className = 'btn-sparkle';
          sparkle.setAttribute('aria-hidden', 'true');
          btn.appendChild(sparkle);
        }
      });
    });

    /* ── STAGGER en cards al aparecer (usa gh-reveal + observer ya
       existente en guia-hub.js; aquí solo escalonamos el delay) ── */
    var staggerGroups = ['.gh-video-card', '.gh-mini', '.gh-box', '.gh-donate-cat'];
    staggerGroups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        el.style.transitionDelay = (i * 0.04) + 's';
      });
    });

  });
})();
