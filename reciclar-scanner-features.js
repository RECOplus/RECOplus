/**
 * reciclar-scanner-features.js
 * Hace funcionales los 4 chips de ".rc-scanner__features" dentro del
 * panel del escáner ("¿Es reciclable?", "Categoría", "Dónde llevarlo",
 * "Cómo prepararlo"): al hacer clic, desplazan la vista hasta la
 * sección correspondiente del panel de información generado por
 * reciclar-material-info.js (#rcMaterialInfo) y la resaltan un
 * instante para que quede claro a dónde se saltó.
 *
 * Capa 100% aditiva: no modifica reciclar.js, reciclar-scanner.js ni
 * reciclar-material-info.js. Solo añade listeners nuevos.
 *
 * CÓMO FUNCIONA:
 * -------------------------------------------------------------
 * reciclar-material-info.js ya marca, dentro de cada panel .rc-minfo,
 * bloques con el atributo data-minfo-section="...":
 *   - "reciclable" → encabezado con el badge (Reciclable / warn)
 *   - "categoria"  → tipo de objeto, materiales que lo componen,
 *                    tiempo de descomposición
 *   - "preparar"   → bloque "Cómo prepararlo" (+ tips extra)
 *   - "lugares"    → bloque "Dónde llevarlo"
 *
 * Este archivo mapea cada uno de los 4 chips del escáner a una de
 * esas claves y, al hacer clic, hace scrollIntoView hacia el bloque
 * indicado + un pequeño flash visual (.rc-minfo__flash, definido en
 * reciclar-material-info.css).
 *
 * Si el panel de info aún no tiene contenido (nadie ha escaneado ni
 * seleccionado un material todavía), el panel de materiales ya trae
 * "Plástico" activo por defecto, así que #rcMaterialInfo siempre
 * tiene contenido disponible — este archivo no necesita generarlo,
 * solo desplazarse hacia él.
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

  function goToSection(sectionKey) {
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
    if (!features.length) return;

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

      feature.addEventListener("click", function () {
        goToSection(sectionKey);
      });
      feature.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToSection(sectionKey);
        }
      });
    });
  });
})();
