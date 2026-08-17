/**
 * RECO+ — tutorial-steps-mapa.js
 * Configuración de pasos del tour interactivo para mapa.html.
 * Debe cargarse ANTES de tutorial.js.
 * Los textos (título/descripción) viven en i18n.js bajo las claves
 * "tutorial.map_stepN.title" / "tutorial.map_stepN.desc".
 */
(function () {
  'use strict';

  window.RECO_TUTORIAL_STEPS = [
    { key: 'map_step0',  selector: null, kind: 'welcome' },

    { key: 'map_step1',  selector: '.search-bar',      placement: 'bottom', radius: 999, pad: 8,  section: 'search' },
    { key: 'map_step2',  selector: '#filterChips',     placement: 'bottom', radius: 20,  pad: 10, section: 'filters' },
    { key: 'map_step3',  selector: '#moreFiltersBtn',  placement: 'bottom', radius: 999, pad: 6,  section: 'filters' },

    { key: 'map_step4',  selector: '.map-wrapper',     placement: 'top',    radius: 20,  pad: 10, section: 'map' },
    { key: 'map_step5',  selector: '.legend',          placement: 'left',   radius: 16,  pad: 10, section: 'map' },

    { key: 'map_step6',  selector: '.sidebar',         placement: 'left',   radius: 20,  pad: 10, section: 'sidebar' },
    { key: 'map_step7',  selector: '#sortSelect',      placement: 'bottom', radius: 14,  pad: 6,  section: 'sidebar' },
    { key: 'map_step8',  selector: '#seeAllBtn',       placement: 'top',    radius: 14,  pad: 6,  section: 'sidebar' },

    { key: 'map_step9',  selector: '.footer-cta',      placement: 'top',    radius: 20,  pad: 10, section: 'suggest' },

    { key: 'map_step10', selector: null, kind: 'finish' }
  ];

  /* Puntos de entrada del menú de secciones → índice de paso donde arrancar */
  window.RECO_TUTORIAL_SECTIONS = {
    full:    0,
    search:  1,
    filters: 2,
    map:     4,
    sidebar: 6,
    suggest: 9
  };
})();
