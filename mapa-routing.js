/**
 * mapa-routing.js — Rutas en tiempo real para mapa.html (Dark Mode)
 * ---------------------------------------------------------------
 * Usa Leaflet Routing Machine (https://www.liedman.net/leaflet-routing-machine/)
 * en vez de llamar a OSRM a mano: se apoya en una librería mantenida
 * y ampliamente usada, con mejor manejo de errores, reintentos y
 * parsing de la respuesta.
 *
 * Capa ADITIVA: no toca app.js más allá de leer sus variables
 * globales (map, userLat, userLng, showToast, t), accesibles aquí
 * porque comparten el mismo scope léxico global del documento.
 *
 * Qué hace:
 *  - Escucha clics en el botón "Cómo llegar" de cada popup de
 *    marcador (ver buildPopup en app.js).
 *  - Traza la ruta real (calles) con L.Routing.control + OSRM.
 *  - Oculta el panel de itinerario por defecto de la librería
 *    (ver regla CSS .leaflet-routing-container en
 *    mapa-dark-theme.css) y en su lugar muestra un panel propio
 *    con distancia y tiempo estimado, coherente con el diseño.
 *  - Permite cerrar la ruta con el botón "×" del panel.
 */
(function () {
  let routingControl = null;
  let routeEndMarker = null;
  let panelEl = null;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function fmtDuration(seconds) {
    const min = Math.round(seconds / 60);
    if (min < 1) return "< 1 min";
    if (min < 60) return min + " min";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h + " h " + (m ? m + " min" : "");
  }

  function fmtDistance(meters) {
    if (meters < 1000) return Math.round(meters) + " m";
    return (meters / 1000).toFixed(1) + " km";
  }

  function ensurePanel() {
    if (panelEl) return panelEl;
    const wrap = document.querySelector(".map-wrapper");
    if (!wrap) return null;

    panelEl = document.createElement("div");
    panelEl.className = "route-info-panel hidden";
    panelEl.innerHTML =
      '<div class="route-info-main">' +
        '<div class="route-info-icon">🧭</div>' +
        '<div class="route-info-text">' +
          '<strong class="route-info-name"></strong>' +
          '<span class="route-info-meta">' +
            '<span class="route-info-time"></span>' +
            '<span class="route-info-sep"> · </span>' +
            '<span class="route-info-distance"></span>' +
          '</span>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="route-info-close" aria-label="Cerrar ruta">&times;</button>';

    wrap.appendChild(panelEl);
    panelEl.querySelector(".route-info-close").addEventListener("click", clearRoute);
    return panelEl;
  }

  function clearRoute() {
    if (routingControl && typeof map !== "undefined" && map) {
      map.removeControl(routingControl);
      routingControl = null;
    }
    if (routeEndMarker && typeof map !== "undefined" && map) {
      map.removeLayer(routeEndMarker);
      routeEndMarker = null;
    }
    if (panelEl) panelEl.classList.add("hidden");
  }

  function drawRouteTo(lat, lng, name) {
    if (typeof map === "undefined" || !map) return;

    if (typeof L === "undefined" || !L.Routing) {
      if (typeof showToast === "function") {
        showToast(
          typeof t === "function"
            ? t("mapa.route.error")
            : "No se pudo cargar el módulo de rutas. Revisa tu conexión."
        );
      }
      return;
    }

    if (typeof userLat !== "number" || typeof userLng !== "number") {
      if (typeof showToast === "function") {
        showToast(
          typeof t === "function"
            ? t("mapa.route.needLocation")
            : "Activa tu ubicación (📍) para trazar la ruta."
        );
      }
      return;
    }

    clearRoute();
    const panel = ensurePanel();
    if (panel) {
      panel.classList.remove("hidden");
      panel.classList.add("loading");
      panel.querySelector(".route-info-name").textContent =
        typeof t === "function" ? t("mapa.route.calculating") : "Calculando ruta…";
      panel.querySelector(".route-info-time").textContent = "";
      panel.querySelector(".route-info-distance").textContent = "";
    }

    routeEndMarker = L.circleMarker([lat, lng], {
      radius: 6,
      color: "#fff",
      weight: 2,
      fillColor: "#2d8c4e",
      fillOpacity: 1,
    }).addTo(map);

    routingControl = L.Routing.control({
      waypoints: [L.latLng(userLat, userLng), L.latLng(lat, lng)],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
      }),
      routeWhileDragging: false,
      draggableWaypoints: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: function () {
        return null; // los marcadores propios (usuario + destino) ya están en el mapa
      },
      lineOptions: {
        styles: [{ color: "#4c9eff", weight: 5, opacity: 0.95, className: "route-line-glow" }],
      },
    })
      .on("routesfound", function (e) {
        const route = e.routes && e.routes[0];
        if (!route || !panel) return;
        panel.classList.remove("loading");
        panel.querySelector(".route-info-name").textContent =
          name || (typeof t === "function" ? t("mapa.route.title") : "Ruta");
        panel.querySelector(".route-info-time").textContent = fmtDuration(route.summary.totalTime);
        panel.querySelector(".route-info-distance").textContent = fmtDistance(route.summary.totalDistance);
      })
      .on("routingerror", function () {
        clearRoute();
        if (typeof showToast === "function") {
          showToast(
            typeof t === "function"
              ? t("mapa.route.error")
              : "No se pudo calcular la ruta. Intenta de nuevo."
          );
        }
      })
      .addTo(map);
  }

  ready(function () {
    // Delegación de eventos: el botón "Cómo llegar" vive dentro del
    // popup de Leaflet, que se crea/destruye dinámicamente.
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".popup-route-btn");
      if (!btn) return;
      const lat = parseFloat(btn.dataset.lat);
      const lng = parseFloat(btn.dataset.lng);
      const name = btn.dataset.name;
      drawRouteTo(lat, lng, name);
    });
  });

  // Expuesto por si se quiere disparar la ruta desde otro punto
  // (por ejemplo, un botón futuro en la lista de resultados).
  window.recoDrawRouteTo = drawRouteTo;
  window.recoClearRoute = clearRoute;
})();