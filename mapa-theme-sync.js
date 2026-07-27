/* ══════════════════════════════════════════════════════════════
   MAPA-THEME-SYNC.JS
   Capa ADITIVA. No modifica darkmode.js ni app.js (salvo dos líneas
   en app.js que exponen window.recoMap / window.recoMapTileLayer,
   necesarias para que este script pueda alcanzar el mapa).

   PROBLEMA QUE RESUELVE:
   app.js elegía el tile de Leaflet (OSM claro vs. CartoDB Dark
   Matter) UNA sola vez, al ejecutar initMap(), leyendo html.dark en
   ese instante. darkmode.js no dispara ningún evento al togglear el
   tema, así que si el usuario cambiaba de modo oscuro a claro (o
   viceversa) DESPUÉS de que el mapa ya había cargado, el tile nunca
   se enteraba y el mapa se quedaba con las teselas del tema anterior
   hasta recargar la página completa.

   SOLUCIÓN:
   Un MutationObserver observa la clase del <html> (sin tocar
   darkmode.js) y, cada vez que detecta que .dark se agregó o quitó,
   reemplaza la capa de teselas activa por la correcta para el nuevo
   tema.

   Cárgalo DESPUÉS de app.js:
   <script src="mapa-theme-sync.js"></script>
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