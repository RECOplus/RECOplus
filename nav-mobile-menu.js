/* ──────────────────────────────────────────────────
   NAV-MOBILE-MENU.JS — RECO+
   Capa aditiva: agrega un botón hamburguesa + panel desplegable
   a la navbar burbuja en viewports ≤860px, donde .bubble-nav__links
   se oculta (display:none) sin ningún reemplazo. Sin este script,
   en móvil no hay forma de navegar entre páginas.

   No modifica navbar.js ni el HTML de cada página: clona los links
   ya existentes de .bubble-nav__links (misma fuente de verdad, así
   que si se agrega/quita un link ahí, el menú móvil lo refleja
   automáticamente sin tocar este archivo).

   Compatible con i18n.js: los <a> clonados conservan data-i18n, así
   que applyLang() los traduce igual que a los originales (ver nota
   dentro de i18n.js sobre data-i18n en <a> con SVG: applyLang ya
   contempla ese caso).
────────────────────────────────────────────────── */

(function () {
  function init() {
    var links = document.querySelector('.bubble-nav__links');
    var actions = document.querySelector('.bubble-nav__actions');
    if (!links || !actions) return;

    // Evita doble-inicialización si el script se incluyera dos veces.
    if (document.getElementById('navBurger')) return;

    /* ── Botón hamburguesa ── */
    var burger = document.createElement('button');
    burger.type = 'button';
    burger.className = 'nav-burger';
    burger.id = 'navBurger';
    burger.setAttribute('aria-label', 'Abrir menú');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'navMobilePanel');
    burger.innerHTML = '<span></span><span></span><span></span>';

    // Se inserta antes del CTA "Únete" (última acción a la derecha)
    // para que quede junto a los otros controles, no al final.
    var cta = actions.querySelector('.bubble-nav__cta');
    if (cta) {
      actions.insertBefore(burger, cta);
    } else {
      actions.appendChild(burger);
    }

    /* ── Overlay ── */
    var overlay = document.createElement('div');
    overlay.className = 'nav-mobile-overlay';
    overlay.id = 'navMobileOverlay';

    /* ── Panel con los links clonados ── */
    var panel = document.createElement('nav');
    panel.className = 'nav-mobile-panel';
    panel.id = 'navMobilePanel';
    panel.setAttribute('aria-label', 'Menú de navegación');

    Array.prototype.forEach.call(links.querySelectorAll('a'), function (a) {
      panel.appendChild(a.cloneNode(true));
    });

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    function openMenu() {
      overlay.classList.add('is-open');
      panel.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      overlay.classList.remove('is-open');
      panel.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', function () {
      var isOpen = panel.classList.contains('is-open');
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });

    overlay.addEventListener('click', closeMenu);

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Si la ventana crece más allá del breakpoint móvil mientras el
    // menú está abierto (ej. rotar tablet o resize de escritorio),
    // se cierra para no dejar el overlay/scroll-lock colgado.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && panel.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Los links del panel son clones tomados en el momento de init().
    // Si el idioma cambia después (toggleLang -> reco:langchange),
    // i18n.js ya tradujo los originales en .bubble-nav__links, así
    // que simplemente se vuelven a clonar para reflejar el cambio.
    document.addEventListener('reco:langchange', function () {
      var freshLinks = document.querySelector('.bubble-nav__links');
      if (!freshLinks) return;
      panel.innerHTML = '';
      Array.prototype.forEach.call(freshLinks.querySelectorAll('a'), function (a) {
        panel.appendChild(a.cloneNode(true));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
