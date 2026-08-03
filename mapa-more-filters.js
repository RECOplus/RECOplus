/**
 * mapa-more-filters.js
 * ---------------------------------------------------------------
 * Capa 100% aditiva sobre app.js. NO lo modifica.
 *
 * PROBLEMA QUE RESUELVE:
 * El mapa solo mostraba 7-8 chips de material en la fila principal
 * de filtros, y usaba valores propios ("plasticos", "organicos")
 * que no coinciden con los 18 ids reales de la tabla `categorias`
 * en Supabase (los mismos que usan el escáner de reciclar.html,
 * donar.html, etc. — ver material-map.js). Faltaban: cartón, libros,
 * celulares, muebles, juguetes, baterías, bombillos, tetrapak,
 * aceite, tela, cuero y útiles escolares.
 *
 * SOLUCIÓN:
 * mapa.html ahora tiene:
 *   - #filterChips          → principales (Todos, Plástico, Papel,
 *                              Vidrio, Metal, Ropa, Electrónicos).
 *   - #filterChipsExtra      → los 12 materiales restantes.
 *
 * Las dos filas se turnan en el MISMO lugar (ya no hay dropdown
 * flotante, ver mapa-effects.css sección 14): al pulsar "+ Más
 * filtros" se oculta #filterChips y aparece #filterChipsExtra en su
 * lugar; al pulsar de nuevo vuelve a mostrarse #filterChips. El
 * cambio SOLO ocurre al pulsar el botón — elegir un chip, hacer
 * click fuera o presionar Escape no revierte la vista.
 *
 * app.js.initFilters() ya escucha clicks dentro de "#filterChips" y
 * sabe pintar cualquier data-filter que reciba (getFilteredSortedPoints
 * simplemente hace `p.materials.includes(activeFilter)`, sin importar
 * si el chip vive en la fila principal o la secundaria). Este archivo:
 *   1) Alterna cuál de las dos filas se muestra al pulsar "+ Más
 *      filtros" (único disparador del cambio de vista).
 *   2) Delega el click de un chip secundario al mismo listener que
 *      ya tiene app.js sobre "#filterChips", simulándolo ahí — así
 *      no duplicamos la lógica de "quitar .active de todos, aplicar
 *      filtro, refrescar resultados" que ya vive en app.js.
 *
 * Cárgalo DESPUÉS de app.js (para que exista #filterChips ya con su
 * listener); el resto del orden no importa:
 *   <script src="mapa-more-filters.js"></script>
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
    var moreBtn = document.getElementById("moreFiltersBtn");
    var dropdown = document.getElementById("filterChipsExtra");
    var extraList = document.getElementById("filterChipsExtraList");
    var mainChips = document.getElementById("filterChips");
    if (!moreBtn || !dropdown || !extraList || !mainChips) return;

    var open = false;

    function setOpen(next) {
      open = next;
      dropdown.hidden = !open;
      // Las dos filas se turnan en el mismo lugar: al abrir la
      // secundaria, se oculta la principal (y viceversa) en vez de
      // apilarse una sobre otra como hacía el dropdown flotante.
      mainChips.hidden = open;
      moreBtn.classList.toggle("more-filters-btn--open", open);
      moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    moreBtn.setAttribute("aria-expanded", "false");
    moreBtn.setAttribute("aria-controls", "filterChipsExtra");
    moreBtn.setAttribute("aria-haspopup", "menu");

    moreBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!open);
    });

    // Delega el click de cualquier chip del dropdown al chip real de
    // #filterChips que app.js ya sabe manejar. Como los ids de
    // material que no tienen chip principal (ej. "carton") no
    // existen ahí, en su lugar reutilizamos su propio patrón: quitar
    // .active de TODOS los chips (ambas filas), marcar el elegido, y
    // refrescar vía un proxy oculto dentro de #filterChips.
    extraList.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;

      document.querySelectorAll("#filterChips .chip, #filterChipsExtraList .chip").forEach(function (c) {
        c.classList.remove("active");
      });
      chip.classList.add("active");

      var proxy = mainChips.querySelector('[data-proxy-filter="' + chip.dataset.filter + '"]');
      if (!proxy) {
        proxy = document.createElement("button");
        proxy.type = "button";
        proxy.className = "chip";
        proxy.dataset.filter = chip.dataset.filter;
        proxy.dataset.proxyFilter = chip.dataset.filter;
        proxy.hidden = true;
        proxy.setAttribute("aria-hidden", "true");
        proxy.tabIndex = -1;
        mainChips.appendChild(proxy);
      }
      // El listener de app.js hace document.querySelectorAll("#filterChips .chip")
      // .forEach(c => c.classList.remove("active")) antes de marcar el
      // chip clicado, así que basta con clicar el proxy: él mismo se
      // marca .active y dispara applyFilter() con el data-filter
      // correcto. Volvemos a marcar el chip del dropdown como .active
      // justo después, porque el paso anterior se lo quita (el proxy
      // vive dentro de #filterChips, así que el forEach de app.js
      // también lo alcanza a él, no al chip visible del dropdown).
      proxy.click();
      chip.classList.add("active");
    });

    // Si el usuario elige un chip de la fila PRINCIPAL después de
    // tener uno del dropdown activo, limpia el estado visual del
    // dropdown (app.js ya limpia #filterChips por su cuenta, pero no
    // conoce #filterChipsExtraList).
    mainChips.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip || chip.hasAttribute("data-proxy-filter")) return;
      extraList.querySelectorAll(".chip.active").forEach(function (c) {
        c.classList.remove("active");
      });
    });
  });
})();
