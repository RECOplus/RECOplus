/* ──────────────────────────────────────────────────
   NAVBAR COMPONENT — RECO+ v1.21
   Bubble nav: logo, links, dark-mode pill, lang pill, CTA
   Compatible with darkmode.js (injectToggleButton uses .dm-pill)
────────────────────────────────────────────────── */

/* ── LANG PILL SYNC ── */
(function () {
  function syncLangPill(lang) {
    var esLabel = document.querySelector('.lang-pill .lang-label-es');
    var enLabel = document.querySelector('.lang-pill .lang-label-en');
    var btn     = document.querySelector('.lang-pill');
    if (!btn) return;
    if (lang === 'en') {
      if (esLabel) esLabel.style.display = 'none';
      if (enLabel) enLabel.style.display = 'inline';
      btn.setAttribute('data-current', 'en');
    } else {
      if (esLabel) esLabel.style.display = 'inline';
      if (enLabel) enLabel.style.display = 'none';
      btn.setAttribute('data-current', 'es');
    }
  }

  // Inicializar al cargar el DOM
  document.addEventListener('DOMContentLoaded', function () {
    var saved = localStorage.getItem('reco-lang') || 'es';
    syncLangPill(saved);

    // Parchear toggleLang global para mantener sincronizado el pill
    var origToggle = window.toggleLang;
    if (origToggle) {
      window.toggleLang = function () {
        origToggle();
        syncLangPill(localStorage.getItem('reco-lang') || 'es');
      };
    }
  });

  // Fallback por si toggleLang se define después (ej. i18n.js)
  window.addEventListener('load', function () {
    var origToggle = window.toggleLang;
    if (origToggle && !origToggle._patched) {
      window.toggleLang = function () {
        origToggle();
        syncLangPill(localStorage.getItem('reco-lang') || 'es');
      };
      window.toggleLang._patched = true;
    }
  });
})();

/* ── LOGO: pequeño feedback visual al togglear el tema ──
   Usa una clase (.logo-pulse) en vez de tocar style.transform
   directamente: el logo ya está centrado con
   "transform: translate(-50%,-50%)" desde navbar.css, así que
   pisarlo con un transform inline lo haría saltar de posición
   durante el pulso. La clase combina scale con ese mismo translate. */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var dmToggle = document.getElementById('darkModeToggle');
    if (!dmToggle) return;
    dmToggle.addEventListener('click', function () {
      var logos = document.querySelectorAll('.bubble-nav__logo img');
      logos.forEach(function (l) {
        l.classList.add('logo-pulse');
        setTimeout(function () { l.classList.remove('logo-pulse'); }, 180);
      });
    });
  });
})();