/**
 * mapa-material-filter-param.js
 * ---------------------------------------------------------------
 * Capa 100% aditiva sobre app.js y mapa-more-filters.js. No los
 * modifica.
 *
 * PROBLEMA QUE RESUELVE:
 * El botón "Ver en el mapa" del panel de info de material en
 * reciclar.html (reciclar-material-info.js) ya enlaza a
 * "mapa.html?material=<clave>", pero el mapa ignoraba ese parámetro
 * y siempre abría con el filtro "Todos" — el usuario tenía que
 * volver a elegir el material manualmente.
 *
 * SOLUCIÓN:
 * Al cargar mapa.html, si la URL trae ?material=<clave> con una
 * clave real (una de las 18 usadas en #filterChips /
 * #filterChipsExtraList — los mismos ids que reciclar.html y la
 * tabla `categorias` de Supabase), se simula el click sobre el chip
 * correspondiente, reusando el mismo listener que app.js ya tiene
 * en #filterChips (y el que mapa-more-filters.js tiene en
 * #filterChipsExtraList para los 11 materiales del dropdown "+ Más
 * filtros") — así no se duplica la lógica de filtrado/orden que ya
 * vive en app.js.
 *
 * Espera a que app.js termine su inicialización asíncrona (carga de
 * puntos desde Supabase + montaje del mapa + listeners de filtros,
 * todo dentro del mismo DOMContentLoaded async) antes de simular el
 * click. Usa window.recoMap —que app.js expone al final de
 * initMap()— como señal de que ya está listo: como el resto de esa
 * función (renderResults, initFilters, etc.) corre de forma síncrona
 * justo después, sin más "await" en medio, que exista window.recoMap
 * ya garantiza que #filterChips también tiene su listener puesto.
 *
 * Cárgalo DESPUÉS de app.js y de mapa-more-filters.js:
 * <script src="mapa-material-filter-param.js"></script>
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var material;
    try {
      material = new URLSearchParams(window.location.search).get("material");
    } catch (e) {
      return;
    }
    if (!material) return;

    var attempts = 0;
    var MAX_ATTEMPTS = 100; // ~10s a 100ms, margen de sobra para la carga de Supabase

    var timer = setInterval(function () {
      attempts++;
      if (window.recoMap) {
        clearInterval(timer);
        applyMaterialFilter(material);
      } else if (attempts >= MAX_ATTEMPTS) {
        clearInterval(timer);
      }
    }, 100);
  });

  function applyMaterialFilter(material) {
    var mainChips = document.getElementById("filterChips");
    var extraList = document.getElementById("filterChipsExtraList");
    var moreBtn = document.getElementById("moreFiltersBtn");
    var dropdown = document.getElementById("filterChipsExtra");
    if (!mainChips) return;

    // Caso 1: el material vive en la fila principal (Todos, Plástico,
    // Papel, Vidrio, Metal, Ropa, Electrónicos) — ya está visible.
    var chip = mainChips.querySelector('.chip[data-filter="' + material + '"]');
    if (chip) {
      chip.click();
      chip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      return;
    }

    // Caso 2: el material vive en el dropdown "+ Más filtros" (los
    // otros 11: cartón, libros, celulares, muebles, juguetes,
    // baterías, bombillos, tetrapak, aceite, tela, cuero, útiles
    // escolares). Se abre esa fila primero (igual que si el usuario
    // pulsara el botón) para que el chip activo quede visible.
    if (!extraList) return;
    var extraChip = extraList.querySelector('.chip[data-filter="' + material + '"]');
    if (!extraChip) return;

    if (dropdown && dropdown.hidden && moreBtn) {
      moreBtn.click();
    }
    extraChip.click();
    extraChip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }
})();
