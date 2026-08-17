/**
 * RECO+ — tutorial-steps-alianzas.js
 * Configuración de pasos del tour interactivo para alianzas.html.
 * Debe cargarse ANTES de tutorial.js.
 * Los textos (título/descripción) viven en i18n.js bajo las claves
 * "tutorial.ali_stepN.title" / "tutorial.ali_stepN.desc".
 */
(function () {
  'use strict';

  window.RECO_TUTORIAL_STEPS = [
    { key: 'ali_step0',  selector: null, kind: 'welcome' },

    { key: 'ali_step1',  selector: '.alianzas-intro',          placement: 'bottom', radius: 20,  pad: 10, section: 'intro' },
    { key: 'ali_step2',  selector: '.alianzas-features__grid', placement: 'top',    radius: 20,  pad: 10, section: 'features' },
    { key: 'ali_step3',  selector: '.alianzas-aliados',        placement: 'top',    radius: 20,  pad: 10, section: 'aliados' },
    { key: 'ali_step4',  selector: '.alianzas-cta',            placement: 'top',    radius: 20,  pad: 10, section: 'cta' },

    { key: 'ali_step5',  selector: null, kind: 'finish' }
  ];

  /* Puntos de entrada del menú de secciones → índice de paso donde arrancar */
  window.RECO_TUTORIAL_SECTIONS = {
    full:     0,
    intro:    1,
    features: 2,
    aliados:  3,
    cta:      4
  };
})();
