/**
 * RECO+ — tutorial-steps-guia.js
 * Configuración de pasos del tour interactivo para guia.html.
 * Debe cargarse ANTES de tutorial.js.
 * Los textos (título/descripción) viven en i18n.js bajo las claves
 * "tutorial.gui_stepN.title" / "tutorial.gui_stepN.desc".
 */
(function () {
  'use strict';

  window.RECO_TUTORIAL_STEPS = [
    { key: 'gui_step0',  selector: null, kind: 'welcome' },

    { key: 'gui_step1',  selector: '.gh-video-row',     placement: 'bottom', radius: 20,  pad: 10, section: 'videos' },
    { key: 'gui_step2',  selector: '.gh-learn__side',   placement: 'left',   radius: 20,  pad: 10, section: 'videos' },

    { key: 'gui_step3',  selector: '.gh-switch',        placement: 'bottom', radius: 999, pad: 8,  section: 'guide' },
    { key: 'gui_step4',  selector: '.gh-chips',         placement: 'bottom', radius: 20,  pad: 8,  section: 'guide' },
    { key: 'gui_step5',  selector: '.gh-guide__panels', placement: 'top',    radius: 20,  pad: 10, section: 'guide' },

    { key: 'gui_step6',  selector: '.gh-info__grid',    placement: 'top',    radius: 20,  pad: 10, section: 'info' },

    { key: 'gui_step7',  selector: '.gh-cta__inner',    placement: 'top',    radius: 20,  pad: 10, section: 'cta' },

    { key: 'gui_step8',  selector: null, kind: 'finish' }
  ];

  /* Puntos de entrada del menú de secciones → índice de paso donde arrancar */
  window.RECO_TUTORIAL_SECTIONS = {
    full:   0,
    videos: 1,
    guide:  3,
    info:   6,
    cta:    7
  };
})();
