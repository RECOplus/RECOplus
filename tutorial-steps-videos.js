/**
 * RECO+ — tutorial-steps-videos.js
 * Configuración de pasos del tour interactivo para videos.html.
 * Debe cargarse ANTES de tutorial.js.
 * Los textos (título/descripción) viven en i18n.js bajo las claves
 * "tutorial.vid_stepN.title" / "tutorial.vid_stepN.desc".
 */
(function () {
  'use strict';

  window.RECO_TUTORIAL_STEPS = [
    { key: 'vid_step0',  selector: null, kind: 'welcome' },

    { key: 'vid_step1',  selector: '.vh-search',        placement: 'bottom', radius: 999, pad: 8,  section: 'search' },
    { key: 'vid_step2',  selector: '.vh-filters__row',  placement: 'bottom', radius: 20,  pad: 10, section: 'filters' },
    { key: 'vid_step3',  selector: '.vh-grid',          placement: 'top',    radius: 20,  pad: 10, section: 'grid' },

    { key: 'vid_step4',  selector: null, kind: 'finish' }
  ];

  /* Puntos de entrada del menú de secciones → índice de paso donde arrancar */
  window.RECO_TUTORIAL_SECTIONS = {
    full:    0,
    search:  1,
    filters: 2,
    grid:    3
  };
})();
