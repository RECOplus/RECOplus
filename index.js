/**
 * index.js — Lógica de página del index
 * Scroll progress bar, reveal animations (IntersectionObserver),
 * partículas del hero, marcado de link activo en el nav.
 */

(function() {
  /* ── SCROLL PROGRESS BAR ──
     `total` (altura total de scroll disponible) se mide UNA VEZ al
     cargar y se vuelve a medir solo en resize "reales" (cambios de
     ANCHO — rotación de pantalla, teclado virtual no cuenta porque
     no cambia el ancho). No se recalcula en cada evento de scroll.

     Antes se recalculaba `window.innerHeight` en cada scroll: en
     Chrome/Safari móvil, la barra de direcciones se colapsa/expande
     sola tras un momento sin hacer scroll, y eso cambia
     window.innerHeight sin que el usuario se haya movido — lo que
     hacía que el ancho de la barra de progreso "saltara" solo,
     igual que le pasaba al navbar (ver navbar.css, bloque "NAV LOCK").
     Documentado por Chrome: developer.chrome.com/blog/url-bar-resizing */
  var bar = document.createElement('div');
  bar.id = 'reco-progress';
  document.body.prepend(bar);

  var progressTotal = 0;
  var progressViewportW = 0;

  function measureProgressTotal() {
    // clientHeight del <html> es la altura del LAYOUT viewport (la
    // misma que usan las unidades vw/vh estándar para fixed), y no
    // fluctuúa con la barra de direcciones como sí lo hace
    // window.innerHeight.
    var viewportH = document.documentElement.clientHeight;
    progressTotal = document.documentElement.scrollHeight - viewportH;
    progressViewportW = window.innerWidth;
  }
  measureProgressTotal();

  function updateProgressBar() {
    var scrolled = window.scrollY;
    bar.style.width = (progressTotal > 0 ? (scrolled / progressTotal) * 100 : 0) + '%';
  }
  updateProgressBar();

  window.addEventListener('scroll', updateProgressBar, { passive: true });

  window.addEventListener('resize', function () {
    // Solo remedir si cambió el ANCHO (rotación, cambio real de
    // viewport). Un resize disparado solo por la barra de
    // direcciones colapsando/expandiéndose no cambia el ancho.
    if (window.innerWidth !== progressViewportW) {
      measureProgressTotal();
      updateProgressBar();
    }
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