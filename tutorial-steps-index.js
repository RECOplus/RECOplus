/**
 * RECO+ — tutorial-steps-index.js
 * Configuración de pasos del tour interactivo para index.html (Inicio).
 * Debe cargarse ANTES de tutorial.js.
 * Los textos (título/descripción) viven en i18n.js bajo las claves
 * "tutorial.idx_stepN.title" / "tutorial.idx_stepN.desc".
 */
(function () {
  'use strict';

  window.RECO_TUTORIAL_STEPS = [
    { key: 'idx_step0',  selector: null, kind: 'welcome' },

    { key: 'idx_step1',  selector: '.bubble-nav',        placement: 'bottom', radius: 999, pad: 8,  section: 'nav' },
    { key: 'idx_step2',  selector: '#darkModeToggle',    placement: 'bottom', radius: 999, pad: 6,  section: 'nav' },
    { key: 'idx_step3',  selector: '.lang-pill',         placement: 'bottom', radius: 999, pad: 6,  section: 'nav' },
    { key: 'idx_step4',  selector: '.bubble-nav__cta',   placement: 'bottom', radius: 999, pad: 6,  section: 'nav' },

    { key: 'idx_step5',  selector: '#heroMiniNav',       placement: 'bottom', radius: 20,  pad: 10, section: 'search' },
    { key: 'idx_step6',  selector: '#heroSearchBar',     placement: 'bottom', radius: 999, pad: 8,  section: 'search' },

    { key: 'idx_step7',  selector: '.curiosidades',      placement: 'top',    radius: 24,  pad: 12, section: 'info' },
    { key: 'idx_step8',  selector: '.rd-banners',        placement: 'top',    radius: 22,  pad: 10, section: 'actions' },
    { key: 'idx_step9',  selector: '.acc-strip-wrapper', placement: 'top',    radius: 26,  pad: 12, section: 'actions' },
    { key: 'idx_step10', selector: '.como-funciona',     placement: 'top',    radius: 24,  pad: 12, section: 'info' },
    { key: 'idx_step11', selector: '.aliados',           placement: 'top',    radius: 24,  pad: 12, section: 'community' },
    { key: 'idx_step12', selector: '.testimonios',       placement: 'top',    radius: 24,  pad: 12, section: 'community' },
    { key: 'idx_step13', selector: '.stats',             placement: 'top',    radius: 24,  pad: 12, section: 'community' },

    { key: 'idx_step14', selector: null, kind: 'finish' }
  ];

  /* Puntos de entrada del menú de secciones → índice de paso donde arrancar */
  window.RECO_TUTORIAL_SECTIONS = {
    full:      0,
    nav:       1,
    search:    5,
    actions:   8,
    info:      7,
    community: 11
  };
})();
