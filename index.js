/**
 * index.js — Lógica de página del index
 * Scroll progress bar, reveal animations (IntersectionObserver),
 * partículas del hero, marcado de link activo en el nav.
 */

(function() {
  /* ── SCROLL PROGRESS BAR ── */
  var bar = document.createElement('div');
  bar.id = 'reco-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', function() {
    var scrolled = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }, { passive: true });

  /* ── INTERSECTION OBSERVER: reveal animations ── */
  var revealTargets = [
    { sel: '.acc-card',    threshold: 0.12, stagger: true },
    { sel: '.rd-banner',   threshold: 0.15, stagger: true },
    { sel: '.stats',       threshold: 0.20 },
    { sel: '.aliados',     threshold: 0.15 },
    { sel: '.testimonios', threshold: 0.12 },
    { sel: '.cta-banner',  threshold: 0.18 },
    { sel: '.footer',      threshold: 0.10 },
    { sel: '.acciones h2', threshold: 0.40 },
    { sel: '.aliados h2',  threshold: 0.40 },
    { sel: '.testimonios h2', threshold: 0.40 },
    /* ── Nuevas secciones: Datos curiosos / Cómo funciona / Materiales ── */
    { sel: '.curiosidades',  threshold: 0.15 },
    { sel: '.como-funciona', threshold: 0.15 },
    { sel: '.materiales',    threshold: 0.15 },
    /* ── Reveal escalonado por tarjeta/ícono dentro de esas secciones ── */
    { sel: '.curiosidad-card', threshold: 0.15, stagger: true },
    { sel: '.material-chip',   threshold: 0.15, stagger: true },
    { sel: '.cf-step',         threshold: 0.20, stagger: true },
  ];

  function makeObserver(threshold) {
    return new IntersectionObserver(function(entries, obs) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: threshold || 0.15 });
  }

  document.addEventListener('DOMContentLoaded', function() {
    revealTargets.forEach(function(t) {
      var els = document.querySelectorAll(t.sel);
      var obs = makeObserver(t.threshold);
      els.forEach(function(el, i) {
        if (t.stagger) {
          el.style.transitionDelay = (i * 0.07) + 's';
        }
        obs.observe(el);
      });
    });

    /* ── HERO PARTICLES ── */
    var hero = document.querySelector('.hero');
    if (hero) {
      var pWrap = document.createElement('div');
      pWrap.className = 'hero-particles';
      hero.prepend(pWrap);
      var count = 18;
      for (var i = 0; i < count; i++) {
        var p = document.createElement('div');
        p.className = 'hero-particle';
        var size = 4 + Math.random() * 10;
        var x = Math.random() * 100;
        var y = 30 + Math.random() * 60;
        var dur = 5 + Math.random() * 8;
        var delay = Math.random() * -dur;
        var opacity = 0.15 + Math.random() * 0.40;
        p.style.cssText =
          'left:' + x + '%;' +
          'top:' + y + '%;' +
          'width:' + size + 'px;' +
          'height:' + size + 'px;' +
          'opacity:' + opacity + ';' +
          'animation-duration:' + dur + 's;' +
          'animation-delay:' + delay + 's;';
        pWrap.appendChild(p);
      }
    }

    /* ── LUCES SUAVES: Datos curiosos / Materiales ── */
    function addLights(sectionSel, wrapClass, count) {
      var section = document.querySelector(sectionSel);
      if (!section) return;
      var wrap = document.createElement('div');
      wrap.className = wrapClass;
      section.prepend(wrap);
      for (var i = 0; i < count; i++) {
        var dot = document.createElement('div');
        dot.className = 'light-dot';
        var size = 3 + Math.random() * 7;
        var x = Math.random() * 100;
        var y = Math.random() * 100;
        var dur = 6 + Math.random() * 8;
        var delay = Math.random() * -dur;
        var opacity = 0.15 + Math.random() * 0.35;
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
    addLights('.curiosidades', 'curiosidades-lights', 12);
    addLights('.materiales', 'materiales-lights', 10);

    /* ── ACTIVE LINK: marca el link actual ── */
    var curPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.bubble-nav__links a').forEach(function(a) {
      var href = a.getAttribute('href');
      if (href === curPage || (curPage === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });

    /* ── LOGO: sincronizar con tema actual ── */
    /* Ya maneja con CSS (html:not(.dark) / html.dark) — solo asegurar transición al toggle */
    var dmToggle = document.getElementById('darkModeToggle');
    if (dmToggle) {
      dmToggle.addEventListener('click', function() {
        /* pequeña escala para feedback visual del logo. Se usa una
           clase (no style.transform directo) porque el logo ya está
           centrado con transform: translate(-50%,-50%) desde style.css;
           pisarlo con un transform inline le haría perder el centrado
           y saltar de posición durante el pulso. */
        var logos = document.querySelectorAll('.bubble-nav__logo img');
        logos.forEach(function(l) {
          l.classList.add('logo-pulse');
          setTimeout(function() { l.classList.remove('logo-pulse'); }, 180);
        });
      });
    }
  });
})();