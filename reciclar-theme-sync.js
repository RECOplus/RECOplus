/* ══════════════════════════════════════════════════════════════
   RECICLAR-THEME-SYNC.JS  — DEPRECADO / INERTE

   Este script existía para reemplazar en caliente el tile de
   Leaflet del mini-mapa (#rcMiniMap, en reciclar.html) entre
   CartoDB claro y oscuro cuando el usuario togglea el tema DESPUÉS
   de que el mini-mapa ya cargó, porque antes reciclar.js elegía el
   tile una sola vez al iniciar, leyendo html.dark en ese instante.

   Ya no hace falta: reciclar.js ahora carga el MISMO tile de OSM en
   ambos temas (mismo criterio que initMap() en app.js — CartoDB
   empezó a exigir API key para sus tiles gratuitos, así que se
   soltó esa dependencia), y el look oscuro lo da el filtro CSS de
   la sección 0 de mapa-dark-theme.css sobre .leaflet-tile-pane, que
   reacciona solo con la clase html.dark sin necesitar JS.

   Se dejó el archivo en el repo (en vez de borrarlo) por si en el
   futuro se vuelve a necesitar swap de tiles por algún otro motivo,
   pero el <script> que lo cargaba se sacó de reciclar.html: si lo
   querés reactivar, actualizá tileUrlFor() primero (todavía apunta
   al dark_all/light_all de CartoDB que pide key) y volvé a agregar
   la etiqueta <script src="reciclar-theme-sync.js"></script>.
═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function tileUrlFor(isDark) {
    return isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  }

  function swapTileForTheme() {
    if (!window.recoMiniMap || typeof L === "undefined") return;

    var isDark = document.documentElement.classList.contains("dark");

    // Evita trabajo innecesario si ya está en el tile correcto.
    if (window.recoMiniMapTileLayer && window.recoMiniMapTileLayer._recoIsDark === isDark) {
      return;
    }

    if (window.recoMiniMapTileLayer) {
      window.recoMiniMap.removeLayer(window.recoMiniMapTileLayer);
    }

    var newLayer = L.tileLayer(tileUrlFor(isDark), { maxZoom: 19 }).addTo(window.recoMiniMap);
    newLayer._recoIsDark = isDark;

    window.recoMiniMapTileLayer = newLayer;
  }

  ready(function () {
    var mapEl = document.getElementById("rcMiniMap");
    if (!mapEl) return; // esta página no tiene el mini-mapa

    // El mini-mapa se crea dentro de reciclar.js en el mismo tick de
    // DOMContentLoaded; puede que este script corra antes de que
    // window.recoMiniMap exista todavía, así que reintenta un poco,
    // igual que mapa-theme-sync.js con window.recoMap.
    var attempts = 0;
    var waitForMap = setInterval(function () {
      attempts++;
      if (window.recoMiniMap) {
        clearInterval(waitForMap);
        if (window.recoMiniMapTileLayer) {
          window.recoMiniMapTileLayer._recoIsDark = document.documentElement.classList.contains("dark");
        }

        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (m) {
            if (m.attributeName === "class") {
              swapTileForTheme();
            }
          });
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      } else if (attempts > 40) {
        clearInterval(waitForMap); // ~8s de espera máxima, luego se rinde
      }
    }, 200);
  });
})();