/**
 * RECO+ — tutorial-steps-donar.js
 * Configuración de pasos del tour interactivo para donar.html.
 * Debe cargarse ANTES de tutorial.js.
 * Los textos (título/descripción) viven en i18n.js bajo las claves
 * "tutorial.don_stepN.title" / "tutorial.don_stepN.desc".
 */
(function () {
  'use strict';

  window.RECO_TUTORIAL_STEPS = [
    { key: 'don_step0',  selector: null, kind: 'welcome' },

    { key: 'don_step1',  selector: '.dh-hero-ctas',     placement: 'bottom', radius: 20,  pad: 10, section: 'hero' },
    { key: 'don_step2',  selector: '.dh-choice-grid',   placement: 'top',    radius: 20,  pad: 10, section: 'choice' },
    { key: 'don_step3',  selector: '.dh-stats-grid',    placement: 'top',    radius: 20,  pad: 10, section: 'stats' },
    { key: 'don_step4',  selector: '.dh-listings-grid', placement: 'top',    radius: 20,  pad: 10, section: 'listings' },
    { key: 'don_step5',  selector: '#campanas-empresas',placement: 'top',    radius: 20,  pad: 10, section: 'campanas' },
    { key: 'don_step6',  selector: '.dh-tracker-row',   placement: 'top',    radius: 20,  pad: 10, section: 'tracker' },
    { key: 'don_step7',  selector: '.donar-trust-grid', placement: 'top',    radius: 20,  pad: 10, section: 'trust' },

    { key: 'don_step8', selector: null, kind: 'finish' }
  ];

  /* Puntos de entrada del menú de secciones → índice de paso donde arrancar */
  window.RECO_TUTORIAL_SECTIONS = {
    full:     0,
    hero:     1,
    choice:   2,
    stats:    3,
    listings: 4,
    campanas: 5,
    tracker:  6,
    trust:    7
  };
})();
