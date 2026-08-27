/* ══════════════════════════════════════════════════════════════
   MAPA-THEME-SYNC.JS  — DEPRECADO / INERTE

   Este script existía para reemplazar en caliente el tile de
   Leaflet (OSM claro ↔ CartoDB Dark Matter) cuando el usuario
   togglea el tema DESPUÉS de que el mapa ya cargó, porque antes
   app.js elegía el tile una sola vez al iniciar.

   Ya no hace falta: app.js ahora carga el MISMO tile de OSM en
   ambos temas (CartoDB empezó a exigir API key para sus tiles
   gratuitos, así que se soltó esa dependencia), y el look oscuro lo
   da un filtro CSS sobre .leaflet-tile-pane en mapa-dark-theme.css,
   que reacciona solo con la clase html.dark sin necesitar JS.

   Se dejó el archivo en el repo (en vez de borrarlo) por si en el
   futuro se vuelve a necesitar swap de tiles por algún otro motivo,
   pero el <script> que lo cargaba se sacó de mapa.html: si lo
   querés reactivar, actualizá tileConfigFor() primero (todavía
   apunta al dark_all de CartoDB que pide key) y volvé a agregar la
   etiqueta <script src="mapa-theme-sync.js"></script>.
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

  function tileConfigFor(isDark) {
    return {
      url: isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: isDark
        ? "© OpenStreetMap © CARTO"
        : "© OpenStreetMap",
    };
  }

  function swapTileForTheme() {
    if (!window.recoMap || typeof L === "undefined") return;

    var isDark = document.documentElement.classList.contains("dark");
    var config = tileConfigFor(isDark);

    // Evita trabajo innecesario si ya está en el tile correcto
    // (ej. si el observer dispara por otro cambio de clase en <html>
    // que no sea .dark).
    if (window.recoMapTileLayer && window.recoMapTileLayer._recoIsDark === isDark) {
      return;
    }

    if (window.recoMapTileLayer) {
      window.recoMap.removeLayer(window.recoMapTileLayer);
    }

    var newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 19,
    }).addTo(window.recoMap);
    newLayer._recoIsDark = isDark;

    window.recoMapTileLayer = newLayer;
  }

  ready(function () {
    var mapEl = document.getElementById("map");
    if (!mapEl) return; // esta página no tiene mapa

    // El mapa (initMap en app.js) puede tardar un tick en existir;
    // reintenta hasta encontrarlo, igual que hace liquid-glass-fx.js
    // con el pane de marcadores.
    var attempts = 0;
    var waitForMap = setInterval(function () {
      attempts++;
      if (window.recoMap) {
        clearInterval(waitForMap);
        // Marca el tile inicial con su tema actual para que el
        // primer chequeo de swapTileForTheme no lo reemplace sin
        // necesidad.
        if (window.recoMapTileLayer) {
          window.recoMapTileLayer._recoIsDark = document.documentElement.classList.contains("dark");
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