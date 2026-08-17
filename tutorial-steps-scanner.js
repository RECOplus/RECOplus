/**
 * RECO+ — tutorial-steps-scanner.js
 * Configuración de pasos del tour interactivo para scanner-demo.html.
 * Debe cargarse ANTES de tutorial.js.
 * Los textos (título/descripción) viven en i18n.js bajo las claves
 * "tutorial.esc_stepN.title" / "tutorial.esc_stepN.desc".
 */
(function () {
  'use strict';

  window.RECO_TUTORIAL_STEPS = [
    { key: 'esc_step0',  selector: null, kind: 'welcome' },

    { key: 'esc_step1',  selector: '.reco-scanner__stage',  placement: 'bottom', radius: 20,  pad: 10, section: 'stage' },
    { key: 'esc_step2',  selector: '#recoBotonOverlay',     placement: 'bottom', radius: 999, pad: 6,  section: 'stage' },
    { key: 'esc_step3',  selector: '#recoBtnIA',            placement: 'top',    radius: 999, pad: 6,  section: 'ia' },
    { key: 'esc_step4',  selector: '.historial',            placement: 'top',    radius: 20,  pad: 10, section: 'historial' },

    { key: 'esc_step5',  selector: null, kind: 'finish' }
  ];

  /* Puntos de entrada del menú de secciones → índice de paso donde arrancar */
  window.RECO_TUTORIAL_SECTIONS = {
    full:      0,
    stage:     1,
    ia:        3,
    historial: 4
  };
})();
