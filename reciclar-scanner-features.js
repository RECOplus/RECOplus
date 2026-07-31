/**
 * reciclar-scanner-features.js
 * Hace funcionales los 4 chips de ".rc-scanner__features" dentro del
 * panel del escáner ("¿Es reciclable?", "Categoría", "Dónde llevarlo",
 * "Cómo prepararlo"): al hacer clic, muestran la sección correspondiente
 * DIRECTAMENTE en el panel derecho del escáner (debajo de los propios
 * chips), usando el material que fue escaneado o seleccionado más
 * recientemente. Un segundo clic sobre el mismo chip la oculta de
 * nuevo (toggle). También hacen scroll suave hasta el bloque del
 * panel izquierdo (#rcMaterialInfo) y lo resaltan, como ya hacía
 * antes, para quien prefiera ver el detalle completo allí.
 *
 * Capa 100% aditiva: no modifica reciclar.js ni reciclar-scanner.js.
 * Solo añade listeners y un contenedor nuevo; en reciclar-material-info.js
 * se agregó una API adicional (getSectionHTML/getCurrentKey) para no
 * duplicar la fuente de datos ni el HTML de cada sección.
 *
 * CÓMO FUNCIONA:
 * -------------------------------------------------------------
 * reciclar-material-info.js expone:
 *   - window.recoMaterialInfo.getCurrentKey()      → clave del material
 *     mostrado actualmente (el último escaneado o seleccionado a mano)
 *   - window.recoMaterialInfo.getSectionHTML(key, sectionKey) → HTML
 *     de una sola sección ("reciclable" | "categoria" | "preparar" | "lugares")
 *     para esa clave, ya con la data de Supabase o el respaldo local.
 *
 * Este archivo mapea cada uno de los 4 chips a una de esas claves,
 * pinta el HTML resultante en un panel nuevo (#rcFeaturePanel) dentro
 * del panel derecho, y de paso conserva el scroll+flash hacia el
 * panel izquierdo que ya existía.
 *
 * Cárgalo DESPUÉS de reciclar-material-info.js y reciclar-scanner.js:
 * <script src="reciclar-scanner-features.js"></script>
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

  // Orden de los 4 chips tal como aparecen en el HTML dentro de
  // ".rc-scanner__features" → clave de sección en .rc-minfo.
  var FEATURE_TO_SECTION = ["reciclable", "categoria", "lugares", "preparar"];

  // Título corto mostrado como encabezado del panel de la derecha,
  // por sección — coincide con el texto de cada chip.
  var SECTION_TITLES = {
    reciclable: "reciclar.escaner.f1",
    categoria: "reciclar.escaner.f2",
    lugares: "reciclar.escaner.f3",
    preparar: "reciclar.escaner.f4"
  };
  var SECTION_TITLES_FALLBACK = {
    reciclable: "¿Es reciclable?",
    categoria: "Categoría",
    lugares: "Dónde llevarlo",
    preparar: "Cómo prepararlo"
  };

  function tr(key, fallback) {
    if (typeof window.t !== "function") return fallback;
    var val = window.t(key);
    return (val && val !== key) ? val : fallback;
  }

  function flashSection(el) {
    el.classList.remove("rc-minfo__flash");
    // Fuerza reflow para poder re-disparar la animación si el mismo
    // bloque se vuelve a resaltar en clics consecutivos.
    void el.offsetWidth;
    el.classList.add("rc-minfo__flash");
    window.setTimeout(function () {
      el.classList.remove("rc-minfo__flash");
    }, 1500);
  }

  function goToSectionInLeftPanel(sectionKey) {
    var panel = document.getElementById("rcMaterialInfo");
    if (!panel) return;

    // Si el panel todavía está colapsado (sin selección previa), lo
    // abrimos con el material activo actual antes de saltar, para
    // que el usuario nunca haga scroll hacia algo vacío.
    if (!panel.classList.contains("rc-minfo--open") && window.recoMaterialInfo) {
      var activo = document.querySelector(".rc-material.active") || document.querySelector(".rc-material");
      if (activo) {
        var key = activo.getAttribute("data-material");
        if (key) window.recoMaterialInfo.showByKey(key, { silent: true });
      }
    }

    var target = panel.querySelector('[data-minfo-section="' + sectionKey + '"]') || panel;

    requestAnimationFrame(function () {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      flashSection(target);
    });
  }

  ready(function () {
    var features = document.querySelectorAll(".rc-scanner__feature");
    if (!features.length || !window.recoMaterialInfo) return;

    // ── Panel de la derecha: se inserta una sola vez, justo después
    // de ".rc-scanner__features", dentro del mismo .rc-panel del
    // escáner. Empieza vacío/oculto hasta el primer clic en un chip. ──
    var featuresWrap = document.querySelector(".rc-scanner__features");
    var scannerPanel = featuresWrap ? featuresWrap.closest(".rc-panel") : null;
    var featurePanel = document.getElementById("rcFeaturePanel");
    if (!featurePanel && featuresWrap && scannerPanel) {
      featurePanel = document.createElement("div");
      featurePanel.id = "rcFeaturePanel";
      featurePanel.className = "rc-minfo rc-feature-panel";
      featurePanel.setAttribute("role", "region");
      featurePanel.setAttribute("aria-live", "polite");
      featuresWrap.insertAdjacentElement("afterend", featurePanel);
    }

    // Clave de sección actualmente abierta en el panel derecho (o
    // null si está cerrado), para poder hacer toggle con el mismo chip.
    var openSectionKey = null;

    function currentMaterialKey() {
      // Prioriza el material realmente escaneado/seleccionado más
      // reciente; si por algún motivo aún no hay ninguno, cae al
      // material marcado .active en la grilla (siempre hay uno,
      // "Plástico" viene activo por defecto en el HTML).
      var fromInfo = window.recoMaterialInfo.getCurrentKey && window.recoMaterialInfo.getCurrentKey();
      if (fromInfo) return fromInfo;
      var activo = document.querySelector(".rc-material.active") || document.querySelector(".rc-material");
      return activo ? activo.getAttribute("data-material") : null;
    }

    function closeFeaturePanel() {
      if (!featurePanel) return;
      featurePanel.classList.remove("rc-minfo--open");
      openSectionKey = null;
      features.forEach(function (f) { f.classList.remove("rc-scanner__feature--active"); });
    }

    function openFeaturePanel(sectionKey, feature) {
      if (!featurePanel) return;

      var key = currentMaterialKey();
      if (!key || !window.recoMaterialInfo.has(key)) {
        featurePanel.innerHTML =
          '<p class="rc-minfo__categoria">' +
          tr("reciclar.escaner.sinMaterial", "Escanea un objeto o elige un material a la izquierda para ver este detalle aquí.") +
          "</p>";
        featurePanel.classList.add("rc-minfo--open");
        openSectionKey = sectionKey;
        return;
      }

      var label = window.recoMaterialInfo.getLabel(key);
      var titleText = tr(SECTION_TITLES[sectionKey], SECTION_TITLES_FALLBACK[sectionKey]);
      var sectionHTML = window.recoMaterialInfo.getSectionHTML(key, sectionKey);

      featurePanel.innerHTML =
        '<div class="rc-feature-panel__head">' +
          '<span class="rc-feature-panel__eyebrow">' + titleText + " · " + label + "</span>" +
        "</div>" +
        '<div class="rc-feature-panel__body">' + sectionHTML + "</div>";

      featurePanel.classList.add("rc-minfo--open");
      openSectionKey = sectionKey;

      features.forEach(function (f) { f.classList.remove("rc-scanner__feature--active"); });
      feature.classList.add("rc-scanner__feature--active");

      requestAnimationFrame(function () {
        var rect = featurePanel.getBoundingClientRect();
        var fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!fullyVisible) {
          featurePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        flashSection(featurePanel);
      });
    }

    features.forEach(function (feature, i) {
      var sectionKey = FEATURE_TO_SECTION[i];
      if (!sectionKey) return;

      // Hace el chip visualmente interactivo y accesible por teclado,
      // sin depender de que el HTML original lo haya marcado como botón.
      feature.classList.add("rc-scanner__feature--clickable");
      feature.setAttribute("role", "button");
      feature.setAttribute("tabindex", "0");
      feature.setAttribute(
        "aria-label",
        tr("reciclar.escaner.f" + (i + 1) + ".aria", "Ver más detalles en el panel de información")
      );

      function toggle() {
        if (openSectionKey === sectionKey) {
          closeFeaturePanel();
        } else {
          openFeaturePanel(sectionKey, feature);
        }
        // Mantiene también el atajo hacia el panel izquierdo completo,
        // por si el usuario prefiere ver todo el detalle allí.
        goToSectionInLeftPanel(sectionKey);
      }

      feature.addEventListener("click", toggle);
      feature.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  });
})();
