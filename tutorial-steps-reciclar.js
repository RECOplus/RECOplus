/**
 * RECO+ — tutorial-steps-reciclar.js
 * Configuración de pasos del tour interactivo para reciclar.html.
 * Debe cargarse ANTES de tutorial.js.
 * Los textos (título/descripción) viven en i18n.js bajo las claves
 * "tutorial.rec_stepN.title" / "tutorial.rec_stepN.desc".
 */
(function () {
  'use strict';

  window.RECO_TUTORIAL_STEPS = [
    { key: 'rec_step0',  selector: null, kind: 'welcome' },

    { key: 'rec_step1',  selector: '.bubble-nav',         placement: 'bottom', radius: 999, pad: 8,  section: 'nav' },
    { key: 'rec_step2',  selector: '#darkModeToggle',     placement: 'bottom', radius: 999, pad: 6,  section: 'nav' },
    { key: 'rec_step3',  selector: '.lang-pill',          placement: 'bottom', radius: 999, pad: 6,  section: 'nav' },
    { key: 'rec_step4',  selector: '.bubble-nav__cta',    placement: 'bottom', radius: 999, pad: 6,  section: 'nav' },

    { key: 'rec_step5',  selector: '.rc-hero__actions',   placement: 'bottom', radius: 20,  pad: 10, section: 'hero' },

    { key: 'rec_step6',  selector: '#rcMaterials',        placement: 'top',    radius: 20,  pad: 12, section: 'tools' },
    { key: 'rec_step7',  selector: '#rcScannerDrop',      placement: 'top',    radius: 20,  pad: 12, section: 'tools' },
    { key: 'rec_step8',  selector: '.rc-process',         placement: 'top',    radius: 20,  pad: 12, section: 'info' },
    { key: 'rec_step9',  selector: '.rc-map-preview',     placement: 'top',    radius: 20,  pad: 12, section: 'info' },
    { key: 'rec_step10', selector: '.rc-cta',             placement: 'top',    radius: 22,  pad: 12, section: 'info' },

    { key: 'rec_step11', selector: null, kind: 'finish' }
  ];

  /* Puntos de entrada del menú de secciones → índice de paso donde arrancar */
  window.RECO_TUTORIAL_SECTIONS = {
    full:  0,
    nav:   1,
    hero:  5,
    tools: 6,
    info:  8
  };
})();
