/**
 * RECO+ — interactive.js  v2.0
 * Interactividad avanzada: cursor magnético, tilt 3D, ripple,
 * nav pill deslizante, parallax del hero, section dots, newsletter feedback
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     UTILS
  ═══════════════════════════════════════════ */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ═══════════════════════════════════════════
     1. CURSOR MAGNÉTICO
  ═══════════════════════════════════════════ */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var dot  = document.createElement('div');
    var ring = document.createElement('div');
    dot.id   = 'reco-cursor';
    ring.id  = 'reco-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = -200, my = -200;
    var rx = -200, ry = -200;

    var LERP_RING = 0.12;

    function tick() {
      rx = lerp(rx, mx, LERP_RING);
      ry = lerp(ry, my, LERP_RING);
      dot.style.transform  = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
    });

    /* Cursor se agranda sobre interactivos */
    var interactives = 'a, button, [role=button], input, .acc-card, .rd-banner, .aliado, .test-card, label';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactives)) {
        document.body.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactives)) {
        document.body.classList.remove('cursor-hover');
      }
    });
  }

  /* ═══════════════════════════════════════════
     2. RIPPLE en click
  ═══════════════════════════════════════════ */
  function initRipple() {
    var targets = qsa('.bubble-nav__cta, .search-glass__btn, .cta-btn, .acc-card__cta, .newsletter-form button, .mini-nav__chip, .rd-banner');
    targets.forEach(function (el) {
      el.classList.add('reco-ripple-host');
      el.addEventListener('click', function (e) {
        var r = document.createElement('span');
        r.className = 'reco-ripple';
        var rect = el.getBoundingClientRect();
        r.style.top  = (e.clientY - rect.top)  + 'px';
        r.style.left = (e.clientX - rect.left) + 'px';
        el.appendChild(r);
        r.addEventListener('animationend', function () { r.remove(); });
      });
    });
  }

  /* ═══════════════════════════════════════════
     3. NAV PILL deslizante
  ═══════════════════════════════════════════ */
  function initNavPill() {
    var nav = qs('.bubble-nav__links');
    if (!nav) return;

    var pill = document.createElement('span');
    pill.id  = 'nav-active-pill';
    nav.style.position = 'relative';
    nav.prepend(pill);

    function movePillTo(el) {
      var navRect = nav.getBoundingClientRect();
      var r       = el.getBoundingClientRect();
      pill.style.left   = (r.left - navRect.left - 6) + 'px';
      pill.style.top    = (r.top  - navRect.top  - 4) + 'px';
      pill.style.width  = (r.width  + 12) + 'px';
      pill.style.height = (r.height + 8)  + 'px';
      pill.style.opacity = '1';
    }

    var links = qsa('a', nav);

    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { movePillTo(a); });
    });

    nav.addEventListener('mouseleave', function () {
      /* Vuelve al link activo si existe */
      var active = qs('a.active', nav);
      if (active) { movePillTo(active); }
      else         { pill.style.opacity = '0'; }
    });

    /* Inicializar en el link activo */
    var active = qs('a.active', nav);
    if (active) {
      pill.style.transition = 'none';
      movePillTo(active);
      requestAnimationFrame(function () {
        pill.style.transition = '';
      });
    } else {
      pill.style.opacity = '0';
    }
  }

  /* ═══════════════════════════════════════════
     4. BADGE en el CTA del nav
  ═══════════════════════════════════════════ */
  function initNavBadge() {
    var cta = qs('.bubble-nav__cta');
    if (!cta) return;
    var badge = document.createElement('span');
    badge.id = 'nav-badge';
    badge.title = 'Únete a la comunidad';
    cta.style.position = 'relative';
    cta.appendChild(badge);
  }

  /* ═══════════════════════════════════════════
     5. TILT 3D en cards de acciones
  ═══════════════════════════════════════════ */
  function initTilt() {
    var cards = qsa('.acc-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r    = card.getBoundingClientRect();
        var cx   = r.left + r.width  / 2;
        var cy   = r.top  + r.height / 2;
        var dx   = (e.clientX - cx) / (r.width  / 2);
        var dy   = (e.clientY - cy) / (r.height / 2);
        var rotX = clamp(-dy * 7, -7, 7);
        var rotY = clamp( dx * 7, -7, 7);
        card.style.transform =
          'translateY(-6px) scale(1.01) perspective(700px)' +
          ' rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════
     6. HERO PARALLAX (mouse tracking suave)
  ═══════════════════════════════════════════ */
  function initHeroParallax() {
    var hero    = qs('.hero');
    var content = qs('.hero-content');
    if (!hero || !content) return;

    var targetX = 0, targetY = 0;
    var currentX = 0, currentY = 0;

    hero.addEventListener('mousemove', function (e) {
      var r  = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left  - r.width  / 2) / r.width;
      var ny = (e.clientY - r.top   - r.height / 2) / r.height;
      targetX = nx * 8;
      targetY = ny * 5;
    });

    hero.addEventListener('mouseleave', function () {
      targetX = 0;
      targetY = 0;
    });

    function parallaxTick() {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);
      content.style.transform =
        'translate3d(' + currentX + 'px,' + currentY + 'px,0)';
      requestAnimationFrame(parallaxTick);
    }
    requestAnimationFrame(parallaxTick);
  }

  /* ═══════════════════════════════════════════
     7. SECTION DOTS de navegación lateral
  ═══════════════════════════════════════════ */
  function initSectionDots() {
    var sections = [
      { sel: '.hero',        label: 'Inicio' },
      { sel: '.acciones',    label: '¿Qué puedes hacer?' },
      { sel: '.stats',       label: 'Estadísticas' },
      { sel: '.aliados',     label: 'Aliados' },
      { sel: '.testimonios', label: 'Testimonios' },
      { sel: '.cta-banner',  label: 'Únete' },
      { sel: '.footer',      label: 'Footer' },
    ];

    var els = sections.map(function (s) {
      return { el: qs(s.sel), label: s.label };
    }).filter(function (s) { return !!s.el; });

    if (els.length < 2) return;

    var container = document.createElement('div');
    container.id  = 'section-dots';

    var dots = els.map(function (s, i) {
      var dot = document.createElement('div');
      dot.className = 'section-dot';
      dot.setAttribute('title', s.label);
      dot.addEventListener('click', function () {
        s.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      container.appendChild(dot);
      return dot;
    });

    document.body.appendChild(container);

    /* Mostrar después de hacer scroll */
    var shown = false;
    function updateDots() {
      var scrollY    = window.scrollY;
      var winH       = window.innerHeight;

      if (!shown && scrollY > 100) {
        shown = true;
        container.classList.add('is-visible');
      }

      var active = 0;
      els.forEach(function (s, i) {
        var top = s.el.getBoundingClientRect().top + scrollY;
        if (scrollY + winH / 2 >= top) active = i;
      });

      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === active);
      });
    }

    window.addEventListener('scroll', updateDots, { passive: true });
    updateDots();
  }

  /* ═══════════════════════════════════════════
     8. LOGO FLIP al cambiar tema
  ═══════════════════════════════════════════ */
  function initLogoFlip() {
    var toggle = qs('#darkModeToggle');
    if (!toggle) return;
    var logos  = qsa('.bubble-nav__logo img');
    toggle.addEventListener('click', function () {
      logos.forEach(function (l) {
        l.classList.add('logo-flipping');
        l.addEventListener('animationend', function () {
          l.classList.remove('logo-flipping');
        }, { once: true });
      });
    });
  }

  /* ═══════════════════════════════════════════
     9. TOOLTIPS en nav links (desde data-i18n)
  ═══════════════════════════════════════════ */
  function initNavTooltips() {
    var links = qsa('.bubble-nav__links a');
    links.forEach(function (a) {
      var span = qs('[data-i18n]', a);
      if (span && span.textContent.trim()) {
        a.setAttribute('data-tooltip', span.textContent.trim());
      }
    });
  }

  /* ═══════════════════════════════════════════
     10. NEWSLETTER FEEDBACK
  ═══════════════════════════════════════════ */
  function initNewsletter() {
    var form  = qs('.newsletter-form');
    if (!form) return;
    var input = qs('input', form);
    var btn   = qs('button', form);
    if (!btn) return;

    btn.addEventListener('click', function () {
      if (!input || !input.value || !input.value.includes('@')) {
        form.classList.remove('shake');
        void form.offsetWidth; /* reflow para re-trigger */
        form.classList.add('shake');
        input && (input.style.borderColor = '#ef4444');
        setTimeout(function () {
          input && (input.style.borderColor = '');
          form.classList.remove('shake');
        }, 600);
      } else {
        form.classList.add('success-state');
        btn.textContent = 'Suscrito';
        input.value = '';
        input.disabled = true;
        btn.disabled   = true;
      }
    });
  }

  /* ═══════════════════════════════════════════
     11. SEARCH DROPDOWN: clip-path open/close
  ═══════════════════════════════════════════ */
  function initSearchDropdown() {
    var dropdown = qs('#heroSearchDropdown');
    if (!dropdown) return;

    /* Observar cambios del atributo hidden */
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName === 'hidden') {
          if (!dropdown.hasAttribute('hidden')) {
            dropdown.classList.add('is-open');
          } else {
            dropdown.classList.remove('is-open');
          }
        }
      });
    });
    observer.observe(dropdown, { attributes: true });
  }

  /* ═══════════════════════════════════════════
     12. RIPPLE en cards de acciones (click-to-navigate)
  ═══════════════════════════════════════════ */
  function initCardClickRipple() {
    var cards = qsa('.acc-card[data-href]');
    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return; /* si clic en el link interno, no interferir */
        var href = card.getAttribute('data-href');
        if (!href) return;

        /* Ripple visual antes de navegar */
        var r = document.createElement('div');
        r.style.cssText =
          'position:absolute;border-radius:50%;background:rgba(255,255,255,0.15);' +
          'width:120px;height:120px;margin-top:-60px;margin-left:-60px;' +
          'transform:scale(0);pointer-events:none;' +
          'animation:rippleExpand 400ms cubic-bezier(0.19,1,0.22,1) forwards;';
        var rect = card.getBoundingClientRect();
        r.style.top  = (e.clientY - rect.top)  + 'px';
        r.style.left = (e.clientX - rect.left) + 'px';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(r);

        setTimeout(function () {
          window.location.href = href;
        }, 280);
      });
    });
  }

  /* ═══════════════════════════════════════════
     13. STAT COUNTER animado al entrar en viewport
  ═══════════════════════════════════════════ */
  function initStatCounters() {
    var items = qsa('.stat-item');
    if (!items.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el       = entry.target;
        var numEl    = qs('.stat-number', el);
        if (!numEl) return;

        var target   = parseInt(el.dataset.target || '0', 10);
        var prefix   = el.dataset.prefix  || '';
        var fmt      = el.dataset.format;
        var duration = 1400;
        var start    = performance.now();
        var initial  = 0;

        function ease(t) { return 1 - Math.pow(1 - t, 3); }

        function tick(now) {
          var progress = clamp((now - start) / duration, 0, 1);
          var value    = Math.round(initial + (target - initial) * ease(progress));
          var display;
          if (fmt === 'short' && value >= 1000) {
            display = (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'k';
          } else {
            display = value.toLocaleString('es-CO');
          }
          numEl.textContent = prefix + display;
          if (progress < 1) requestAnimationFrame(tick);
          else numEl.textContent = prefix + (fmt === 'short' && target >= 1000
            ? (target / 1000).toFixed(0) + 'k'
            : target.toLocaleString('es-CO'));
        }

        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    items.forEach(function (el) { obs.observe(el); });
  }

  /* ═══════════════════════════════════════════
     14. KEYBOARD: Escape cierra dropdown de búsqueda
  ═══════════════════════════════════════════ */
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var dd = qs('#heroSearchDropdown');
        if (dd && !dd.hidden) { dd.hidden = true; }
        var input = qs('#heroSearchInput');
        if (input) input.blur();
      }
      /* '/' para foco en búsqueda */
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        var inp = qs('#heroSearchInput');
        if (inp) { inp.focus(); inp.select(); }
      }
    });
  }

  /* ═══════════════════════════════════════════
     INIT — esperar DOMContentLoaded
  ═══════════════════════════════════════════ */
  function init() {
    initCursor();
    initRipple();
    initNavPill();
    initNavBadge();
    initTilt();
    initHeroParallax();
    initSectionDots();
    initLogoFlip();
    initNavTooltips();
    initNewsletter();
    initSearchDropdown();
    initCardClickRipple();
    initStatCounters();
    initKeyboardShortcuts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();