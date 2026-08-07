/* ══════════════════════════════════════════════════════════════
   RECICLAR-MINIMAP-REAL.JS
   Capa ADITIVA. Hace funcional el mini-mapa de vista previa
   (#rcMiniMap) en reciclar.html, que reciclar.js crea como un mapa
   Leaflet decorativo y no interactivo (dragging/zoom desactivados,
   4 puntos ficticios alrededor de un centro fijo).

   Este script, una vez que window.recoMiniMap existe (expuesto por
   reciclar.js) y Leaflet ya cargó:
     1. Reactiva la interacción del mapa (arrastrar, zoom con rueda,
        doble click, y agrega un control de zoom +/- compacto).
     2. Quita los marcadores decorativos y los reemplaza por los
        puntos reales de la app: los 12 puntos "oficiales" de
        window.RECO_MAP_POINTS (misma fuente que usa mapa.html) más
        los puntos sugeridos por la comunidad en Supabase (tabla
        puntos_sugeridos), igual que hace app.js.
     3. Detecta la ubicación real del usuario (mismo patrón que
        initMap() en app.js) y pinta el punto azul con pulso, estilo
        Google Maps. El mini-mapa encuadra tanto los puntos cercanos
        como al usuario cuando la ubicación está disponible.
     4. El botón "Cómo llegar" de cada popup traza una ruta REAL
        (calles, con Leaflet Routing Machine + OSRM) directamente en
        el mini-mapa, igual que en mapa.html — ya no abre Google
        Maps en una pestaña aparte. Muestra un panel propio con
        distancia y tiempo estimado, y se puede cerrar con "×". Si
        todavía no se detectó la ubicación del usuario, la pide en
        ese momento (gesto directo del usuario → más probable que el
        navegador la conceda).

   No modifica reciclar.js: solo lee window.recoMiniMap y
   window.RECO_MAP_POINTS, ambos ya expuestos globalmente.

   REQUIERE, en reciclar.html:
     - Leaflet (ya cargado) y Leaflet Routing Machine (CSS + JS,
       misma versión que usa mapa.html) ANTES de este script.
     - Cargar DESPUÉS de reciclar.js (que crea el mapa) y de
       map-points-data.js (que expone RECO_MAP_POINTS):
         <script src="map-points-data.js"></script>
         ...
         <script src="reciclar.js"></script>
         <script src="reciclar-minimap-real.js"></script>
     - Los estilos del botón "Cómo llegar", el punto azul de usuario,
       el panel de ruta y el popup en modo oscuro ya existen en
       mapa-dark-theme.css (compartido con mapa.html) — agregar ese
       <link> también en reciclar.html.
═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var SUPABASE_URL = "https://eephwthybxjwleajrvnl.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcGh3dGh5Ynhqd2xlYWpydm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5Njc0NzQsImV4cCI6MjA5OTU0MzQ3NH0.k8fnOuX9RJ-VEvFBSCU_Uwuqiybk9K_KuZyqMmTqekw";
  var SUPABASE_TABLE = "puntos_sugeridos";
  var SUPABASE_ID_OFFSET = 100000;

  // ── Estado propio de este mini-mapa (independiente del mapa
  //    grande: cada página tiene su propia instancia de Leaflet) ──
  var rcUserLat = null;
  var rcUserLng = null;
  var rcUserMarker = null;
  var rcRoutingControl = null;
  var rcRouteEndMarker = null;
  var rcPanelEl = null;
  // Combinado de puntos oficiales + comunidad, la MISMA lista que se
  // pintó en el mini-mapa (se llena en populateMiniMap). Se expone
  // en la API pública para que otros scripts (ej. la ruta automática
  // por material) puedan elegir el punto más cercano sin volver a
  // pedirle los datos a Supabase.
  var rcAllPoints = [];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function tr(key, fallback) {
    if (typeof window.t === "function") {
      var val = window.t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  }

  /* ── Convierte una fila de Supabase (snake_case) al mismo shape
     que usan los puntos "oficiales" (camelCase), igual criterio
     que supabaseRowToPoint() en app.js. ── */
  function supabaseRowToPoint(row) {
    // La columna real en Supabase se llama "materials" (ver
    // supabase-setup.sql), no "materiales" — se lee así para que el
    // filtro por material (usado por la ruta automática más abajo)
    // funcione también con los puntos sugeridos por la comunidad.
    var materiales = [];
    if (Array.isArray(row.materials)) materiales = row.materials;
    else if (typeof row.materials === "string") {
      try { materiales = JSON.parse(row.materials); } catch (e) { materiales = []; }
    }
    return {
      id: SUPABASE_ID_OFFSET + Number(row.id || 0),
      name: row.name || tr("reciclar.mapa.puntoSinNombre", "Punto sugerido"),
      type: row.type || "reciclaje",
      address: row.address || "",
      lat: Number(row.lat),
      lng: Number(row.lng),
      materials: materiales,
      materialIcons: Array.isArray(row.material_icons) ? row.material_icons : [],
      rating: typeof row.rating === "number" ? row.rating : null,
      reviewCount: row.review_count || 0
    };
  }

  function fetchCommunityPoints() {
    var url = SUPABASE_URL + "/rest/v1/" + SUPABASE_TABLE + "?select=*";
    return fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      }
    })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (rows) {
        if (!Array.isArray(rows)) return [];
        return rows
          .map(supabaseRowToPoint)
          .filter(function (p) { return isFinite(p.lat) && isFinite(p.lng); });
      })
      .catch(function () { return []; }); // sin red/CORS: seguimos solo con los puntos oficiales
  }

  /* ── Icono por tipo, mismo lenguaje visual que app.js pero en
     miniatura para no saturar el mini-mapa. ── */
  function makeIcon(type) {
    var color = type === "donacion" ? "#3b82f6" : type === "acopio" ? "#8b5cf6" : "#2d8c4e";
    return L.divIcon({
      className: "",
      html: '<div style="width:14px;height:14px;border-radius:50%;background:' + color + ';border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  }

  function typeLabel(type) {
    if (type === "donacion") return tr("mapa.type.donacion", "Donación");
    if (type === "acopio") return tr("mapa.type.acopio", "Acopio");
    return tr("mapa.type.reciclaje", "Reciclaje");
  }

  function buildPopup(p) {
    var materialesHTML = (p.materialIcons && p.materialIcons.length)
      ? '<div style="margin-top:.35rem;display:flex;gap:.2rem;flex-wrap:wrap">' +
          p.materialIcons.map(function (ic) { return '<span style="font-size:.85rem">' + ic + '</span>'; }).join("") +
        "</div>"
      : "";

    var routeLabel = tr("mapa.route.btn", "🧭 Cómo llegar");
    var safeName = String(p.name || "").replace(/"/g, "&quot;");

    return (
      '<div style="font-family:\'DM Sans\',sans-serif;min-width:170px">' +
        '<strong style="font-size:.85rem;color:#1a5c2a;display:block;margin-bottom:.15rem">' + p.name + "</strong>" +
        '<span style="font-size:.6rem;font-weight:700;text-transform:uppercase;color:#4a6b52">' + typeLabel(p.type) + "</span>" +
        (p.address ? '<p style="font-size:.72rem;color:#8aab90;margin:.3rem 0 0">' + p.address + "</p>" : "") +
        materialesHTML +
        '<button type="button" class="popup-route-btn" data-lat="' + p.lat + '" data-lng="' + p.lng + '" data-name="' + safeName + '">' +
          routeLabel +
        "</button>" +
      "</div>"
    );
  }

  /* ══════════════════════════════════════════════
     UBICACIÓN DEL USUARIO
     ══════════════════════════════════════════════ */

  // Pinta (o reposiciona) el punto azul con pulso, mismo divIcon y
  // clase CSS que usa app.js/mapa.html (.user-location-marker, ya
  // definida en mapa-dark-theme.css).
  function placeUserMarker(map, lat, lng) {
    if (rcUserMarker) {
      map.removeLayer(rcUserMarker);
      rcUserMarker = null;
    }
    rcUserMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "",
        html: '<div class="user-location-marker"><span class="dot-pulse"></span><span class="dot-core"></span></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      }),
      zIndexOffset: 1000
    }).addTo(map);
    return rcUserMarker;
  }

  // Pide la ubicación al cargar la página (silencioso: si el
  // navegador la niega o no responde, el mini-mapa simplemente se
  // queda encuadrando solo los puntos, como hasta ahora). Si se
  // obtiene, agrega el punto azul al grupo para que fitBounds
  // encuadre puntos + usuario juntos.
  function detectUserLocation(map, group) {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        rcUserLat = pos.coords.latitude;
        rcUserLng = pos.coords.longitude;

        var marker = placeUserMarker(map, rcUserLat, rcUserLng);
        if (group) {
          group.addLayer(marker);
          if (group.getLayers().length) {
            map.fitBounds(group.getBounds().pad(0.25), { maxZoom: 14 });
          }
        }
      },
      function () {
        // Sin permiso / sin señal: no molestamos con alertas, el
        // botón "Cómo llegar" la vuelve a pedir si hace falta.
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }

  /* ══════════════════════════════════════════════
     RUTA REAL (Leaflet Routing Machine + OSRM)
     ══════════════════════════════════════════════ */

  function fmtDuration(seconds) {
    var min = Math.round(seconds / 60);
    if (min < 1) return "< 1 min";
    if (min < 60) return min + " min";
    var h = Math.floor(min / 60);
    var m = min % 60;
    return h + " h " + (m ? m + " min" : "");
  }

  function fmtDistance(meters) {
    if (meters < 1000) return Math.round(meters) + " m";
    return (meters / 1000).toFixed(1) + " km";
  }

  function ensurePanel() {
    if (rcPanelEl) return rcPanelEl;
    var wrap = document.querySelector(".rc-map-preview");
    if (!wrap) return null;

    rcPanelEl = document.createElement("div");
    rcPanelEl.className = "route-info-panel hidden";
    rcPanelEl.innerHTML =
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

    wrap.appendChild(rcPanelEl);
    rcPanelEl.querySelector(".route-info-close").addEventListener("click", clearRoute);
    return rcPanelEl;
  }

  function showPanelMessage(msg, loading) {
    var panel = ensurePanel();
    if (!panel) return;
    panel.classList.remove("hidden");
    panel.classList.toggle("loading", !!loading);
    panel.querySelector(".route-info-name").textContent = msg;
    panel.querySelector(".route-info-time").textContent = "";
    panel.querySelector(".route-info-distance").textContent = "";
  }

  function clearRoute() {
    var map = window.recoMiniMap;
    if (rcRoutingControl && map) {
      map.removeControl(rcRoutingControl);
      rcRoutingControl = null;
    }
    if (rcRouteEndMarker && map) {
      map.removeLayer(rcRouteEndMarker);
      rcRouteEndMarker = null;
    }
    if (rcPanelEl) rcPanelEl.classList.add("hidden");
  }

  function drawRouteTo(lat, lng, name) {
    var map = window.recoMiniMap;
    if (!map) return;

    if (typeof L === "undefined" || !L.Routing) {
      showPanelMessage(tr("mapa.route.error", "No se pudo cargar el módulo de rutas. Revisa tu conexión."));
      return;
    }

    // Todavía no tenemos ubicación (la automática al cargar falló,
    // fue denegada, o sigue en curso): la pedimos ahora mismo, como
    // gesto directo del usuario al tocar el botón.
    if (typeof rcUserLat !== "number" || typeof rcUserLng !== "number") {
      if (!navigator.geolocation) {
        showPanelMessage(tr("mapa.route.needLocation", "Activa tu ubicación para trazar la ruta."));
        return;
      }
      showPanelMessage(tr("mapa.route.calculating", "Obteniendo tu ubicación…"), true);
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          rcUserLat = pos.coords.latitude;
          rcUserLng = pos.coords.longitude;
          placeUserMarker(map, rcUserLat, rcUserLng);
          drawRouteTo(lat, lng, name); // reintenta ya con la ubicación lista
        },
        function () {
          showPanelMessage(tr("mapa.route.needLocation", "Activa tu ubicación para trazar la ruta."));
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
      return;
    }

    clearRoute();
    var panel = ensurePanel();
    if (panel) {
      panel.classList.remove("hidden");
      panel.classList.add("loading");
      panel.querySelector(".route-info-name").textContent = tr("mapa.route.calculating", "Calculando ruta…");
      panel.querySelector(".route-info-time").textContent = "";
      panel.querySelector(".route-info-distance").textContent = "";
    }

    rcRouteEndMarker = L.circleMarker([lat, lng], {
      radius: 6,
      color: "#fff",
      weight: 2,
      fillColor: "#2d8c4e",
      fillOpacity: 1
    }).addTo(map);

    rcRoutingControl = L.Routing.control({
      waypoints: [L.latLng(rcUserLat, rcUserLng), L.latLng(lat, lng)],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving"
      }),
      routeWhileDragging: false,
      draggableWaypoints: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: function () {
        return null; // el usuario y el destino ya tienen sus propios marcadores
      },
      lineOptions: {
        styles: [{ color: "#4c9eff", weight: 5, opacity: 0.95, className: "route-line-glow" }]
      }
    })
      .on("routesfound", function (e) {
        var route = e.routes && e.routes[0];
        if (!route || !panel) return;
        panel.classList.remove("loading");
        panel.querySelector(".route-info-name").textContent = name || tr("mapa.route.title", "Ruta");
        panel.querySelector(".route-info-time").textContent = fmtDuration(route.summary.totalTime);
        panel.querySelector(".route-info-distance").textContent = fmtDistance(route.summary.totalDistance);
      })
      .on("routingerror", function () {
        clearRoute();
        showPanelMessage(tr("mapa.route.error", "No se pudo calcular la ruta. Intenta de nuevo."));
      })
      .addTo(map);
  }

  /* ══════════════════════════════════════════════
     SETUP DEL MINI-MAPA
     ══════════════════════════════════════════════ */

  function populateMiniMap(map) {
    if (!map || typeof L === "undefined") return;

    // Reactivar interacción (reciclar.js la crea deshabilitada a
    // propósito para una vista previa estática).
    if (map.dragging && !map.dragging.enabled()) map.dragging.enable();
    if (map.scrollWheelZoom && !map.scrollWheelZoom.enabled()) map.scrollWheelZoom.enable();
    if (map.doubleClickZoom && !map.doubleClickZoom.enabled()) map.doubleClickZoom.enable();
    if (map.boxZoom && !map.boxZoom.enabled()) map.boxZoom.enable();
    if (map.keyboard && !map.keyboard.enabled()) map.keyboard.enable();

    if (!map.__recoZoomControlAdded) {
      L.control.zoom({ position: "bottomright" }).addTo(map);
      map.__recoZoomControlAdded = true;
    }

    // Quitar los marcadores decorativos (punto central + 4 puntos
    // ficticios) que reciclar.js agregó al crear el mapa, antes de
    // pintar los reales.
    map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    var officialPoints = Array.isArray(window.RECO_MAP_POINTS) ? window.RECO_MAP_POINTS : [];

    fetchCommunityPoints().then(function (communityPoints) {
      var allPoints = officialPoints.concat(communityPoints);
      rcAllPoints = allPoints; // disponible para recoMiniMapRoute.findNearestForMaterial

      var group = L.featureGroup();
      allPoints.forEach(function (p) {
        if (!isFinite(p.lat) || !isFinite(p.lng)) return;
        var marker = L.marker([p.lat, p.lng], { icon: makeIcon(p.type) })
          .bindPopup(buildPopup(p), { maxWidth: 200 });
        marker.addTo(map);
        group.addLayer(marker);
      });

      if (group.getLayers().length) {
        map.fitBounds(group.getBounds().pad(0.25), { maxZoom: 13 });
      }

      setTimeout(function () { map.invalidateSize(); }, 150);

      // Ubicación del usuario: se pide después de que los puntos ya
      // están en el mapa (para no perder el marcador azul si algo
      // más arriba limpiara marcadores). Si se obtiene, el mini-mapa
      // se reencuadra para mostrar puntos + usuario juntos.
      detectUserLocation(map, group);
    });
  }

  /* ══════════════════════════════════════════════
     API PÚBLICA (capa aditiva)
     -------------------------------------------------------------
     Permite que otros scripts (ej. reciclar-auto-route.js) tracen
     una ruta en el mini-mapa o la limpien, y consulten/reaccionen a
     la ubicación del usuario, sin duplicar la lógica de geolocalización
     ni de Leaflet Routing Machine que ya vive en este archivo.
     ══════════════════════════════════════════════ */
  window.recoMiniMapRoute = {
    // Traza la ruta real hacia (lat, lng). Si aún no hay ubicación
    // del usuario, la pide primero (mismo comportamiento que el
    // botón "Cómo llegar" de los popups).
    to: function (lat, lng, name) {
      drawRouteTo(lat, lng, name);
    },
    // Quita la ruta trazada actualmente, si existe.
    clear: function () {
      clearRoute();
    },
    // true si ya se conoce la ubicación del usuario (geolocalización
    // concedida y resuelta al menos una vez).
    hasUserLocation: function () {
      return typeof rcUserLat === "number" && typeof rcUserLng === "number";
    },
    // Coordenadas del usuario, o null si aún no se detectaron.
    getUserLocation: function () {
      if (typeof rcUserLat !== "number" || typeof rcUserLng !== "number") return null;
      return { lat: rcUserLat, lng: rcUserLng };
    },
    // Lista combinada de puntos oficiales + comunidad, tal como se
    // pintaron en el mini-mapa (vacía hasta que termine de cargar).
    getPoints: function () {
      return rcAllPoints.slice();
    }
  };

  ready(function () {
    var mapEl = document.getElementById("rcMiniMap");
    if (!mapEl) return; // esta página no tiene el mini-mapa

    // Delegación de eventos para el botón "Cómo llegar" dentro del
    // popup (Leaflet lo crea/destruye dinámicamente). Se filtra por
    // cercanía a #rcMiniMap para no interferir si alguna vez convive
    // con el mapa grande en la misma página.
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".popup-route-btn");
      if (!btn || !btn.closest("#rcMiniMap")) return;
      var lat = parseFloat(btn.dataset.lat);
      var lng = parseFloat(btn.dataset.lng);
      var name = btn.dataset.name;
      drawRouteTo(lat, lng, name);
    });

    // reciclar.js crea el mapa en el mismo tick de DOMContentLoaded;
    // este script puede correr antes de que window.recoMiniMap
    // exista todavía, así que reintenta un poco (mismo patrón que
    // reciclar-theme-sync.js).
    var attempts = 0;
    var waitForMap = setInterval(function () {
      attempts++;
      if (window.recoMiniMap) {
        clearInterval(waitForMap);
        populateMiniMap(window.recoMiniMap);
      } else if (attempts > 40) {
        clearInterval(waitForMap); // ~8s de espera máxima, luego se rinde
      }
    }, 200);
  });
})();
