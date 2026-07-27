/**
 * donar-home.js — Funciones del nuevo homepage de donar.html:
 * - dhGoToTab(): botones del hero y de las tarjetas "¿Qué quieres
 *   hacer hoy?" saltan a la sección de formularios y activan el
 *   tab correcto (reutiliza el sistema de tabs ya definido en
 *   donar.js, no lo duplica).
 * - Carruseles de "Donaciones disponibles" y "Solicitudes de
 *   donación" con flechas prev/next.
 * - Contador animado para la sección de estadísticas.
 *
 * No modifica donar.js ni donar-effects.js, solo se apoya en las
 * clases que ya existen (.donar-tab, .donar-tabs-section) y en el
 * mismo patrón de "reveal on scroll" (clase .dn-reveal) que ya usa
 * el resto del sitio.
 *
 * Cargar DESPUÉS de donar.js y donar-effects.js:
 * <script src="donar-home.js"></script>
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

  /* ── VENTANA FLOTANTE DE FORMULARIOS (donar / solicitar) ──
     Un solo overlay comparte ambos formularios: activar el tab
     correcto (misma lógica de donar.js) y luego mostrar la
     ventana. Se abre desde el hero y desde las tarjetas
     "¿Qué quieres hacer hoy?" con dhOpenFormModal('donar'|'solicitar'). */
  function dhOpenFormModal(tabName) {
    var tabBtn = document.querySelector('.donar-tab[data-tab="' + tabName + '"]');
    if (tabBtn) tabBtn.click();

    var overlay = document.getElementById('dhFormModalOverlay');
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.classList.add('dh-modal-lock');

    var modal = overlay.querySelector('.dh-form-modal');
    if (modal && modal.focus) modal.setAttribute('tabindex', '-1');
    if (modal) modal.scrollTop = 0;
  }
  window.dhOpenFormModal = dhOpenFormModal;

  function dhCloseFormModal() {
    var overlay = document.getElementById('dhFormModalOverlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.classList.remove('dh-modal-lock');
  }
  window.dhCloseFormModal = dhCloseFormModal;

  /* dhGoToTab se conserva por compatibilidad (por si queda algún
     botón viejo apuntando a él) y ahora simplemente abre la
     ventana flotante en vez de hacer scroll. */
  function dhGoToTab(tabName) {
    dhOpenFormModal(tabName);
  }
  window.dhGoToTab = dhGoToTab;

  ready(function () {

    /* ── CIERRE DE LA VENTANA FLOTANTE ── */
    var formOverlay = document.getElementById('dhFormModalOverlay');
    var formCloseBtn = document.getElementById('dhFormModalClose');

    if (formCloseBtn) {
      formCloseBtn.addEventListener('click', dhCloseFormModal);
    }
    if (formOverlay) {
      formOverlay.addEventListener('click', function (e) {
        if (e.target === formOverlay) dhCloseFormModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && formOverlay && formOverlay.classList.contains('open')) {
        dhCloseFormModal();
      }
    });

    /* Al publicar con éxito, donar.js ya validó y abrió el modal de
       "¡Publicación enviada!" — acá solo cerramos la ventana
       flotante del formulario para que quede el modal de éxito
       solo. Se registra DESPUÉS del listener de donar.js, así que
       la validación (categoría vacía → shake) sigue mandando. */
    var btnDonar = document.getElementById('btnDonar');
    var btnSolicitar = document.getElementById('btnSolicitar');
    if (btnDonar) {
      btnDonar.addEventListener('click', function () {
        var categoria = document.getElementById('donacion-categoria');
        if (categoria && !categoria.value) return; // no hubo publicación válida
        dhCloseFormModal();
      });
    }
    if (btnSolicitar) {
      btnSolicitar.addEventListener('click', function () {
        dhCloseFormModal();
      });
    }

    /* ── CARRUSELES ── */
    function setupCarousel(trackId) {
      var track = document.getElementById(trackId);
      if (!track) return;
      var wrap = track.closest('.dh-carousel-wrap');
      if (!wrap) return;
      var prevBtn = wrap.querySelector('.dh-car-prev');
      var nextBtn = wrap.querySelector('.dh-car-next');

      function step(dir) {
        var card = track.querySelector('.dh-card');
        var gap = 16;
        var amount = card ? card.getBoundingClientRect().width + gap : 220;
        track.scrollBy({ left: dir * amount, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }

      if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });
    }

    setupCarousel('dhCarouselDonaciones');
    setupCarousel('dhCarouselSolicitudes');

    /* ── CONTADOR ANIMADO DE ESTADÍSTICAS ── */
    var statNums = document.querySelectorAll('.dh-stat-num');

    function animateStat(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var prefix = el.getAttribute('data-prefix') || '+';

      if (prefersReducedMotion()) {
        el.textContent = prefix + target.toLocaleString('es-PA');
        return;
      }

      var duration = 1400;
      var start = null;

      function frame(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.floor(eased * target).toLocaleString('es-PA');
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          el.textContent = prefix + target.toLocaleString('es-PA');
        }
      }
      requestAnimationFrame(frame);
    }

    if (statNums.length) {
      if ('IntersectionObserver' in window) {
        var statsObserver = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            animateStat(entry.target);
            obs.unobserve(entry.target);
          });
        }, { threshold: 0.4 });
        statNums.forEach(function (el) { statsObserver.observe(el); });
      } else {
        statNums.forEach(animateStat);
      }
    }

    /* ── REVEAL ON SCROLL para las secciones nuevas (mismo patrón
       que donar-effects.js: clase dn-reveal + IntersectionObserver).
       Si donar-effects.js ya corrió sobre estos nodos (misma clase,
       mismo comportamiento) esto simplemente no duplica nada extra
       porque cada nodo se deja de observar tras revelarse. ── */
    var newRevealTargets = document.querySelectorAll(
      '.dh-choice-card.dn-reveal, .dh-step.dn-reveal, .dh-stat.dn-reveal, .dh-card.dn-reveal, .dh-tracker-step.dn-reveal'
    );

    if (newRevealTargets.length) {
      if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          });
        }, { threshold: 0.12 });
        newRevealTargets.forEach(function (el, i) {
          el.style.transitionDelay = (i % 4 * 0.06) + 's';
          revealObserver.observe(el);
        });
      } else {
        newRevealTargets.forEach(function (el) { el.classList.add('is-visible'); });
      }
    }

  });
})();
