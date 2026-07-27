/* ══════════════════════════════════════════════════════════════
   RECICLAR-THEME-SYNC.JS
   Capa ADITIVA. No modifica darkmode.js ni reciclar.js (salvo dos
   líneas en reciclar.js que exponen window.recoMiniMap /
   window.recoMiniMapTileLayer, necesarias para que este script
   pueda alcanzar el mini-mapa).

   Mismo problema y misma solución que mapa-theme-sync.js aplicado
   al mini-mapa de vista previa (#rcMiniMap) en reciclar.html:
   reciclar.js elegía el tile de Leaflet (CartoDB claro vs. oscuro)
   una sola vez al crear el mapa, leyendo html.dark en ese instante.
   darkmode.js no dispara ningún evento al togglear el tema, así que
   si el usuario cambiaba de modo el mini-mapa se quedaba con las
   teselas del tema anterior hasta recargar la página.

   Un MutationObserver observa la clase del <html> (sin tocar
   darkmode.js) y, cada vez que detecta que .dark se agregó o quitó,
   reemplaza la capa de teselas activa por la correcta.

   Cárgalo DESPUÉS de reciclar.js:
   <script src="reciclar-theme-sync.js"></script>
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