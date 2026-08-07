/**
 * reciclar-auto-route.js
 * ============================================================
 * Capa 100% aditiva: no modifica reciclar-material-info.js,
 * reciclar-scanner.js ni reciclar-minimap-real.js.
 *
 * QUÉ HACE
 * -------------------------------------------------------------
 * Cada vez que el usuario:
 *   1) hace clic (o teclado) en una categoría de la grilla
 *      "¿Qué deseas reciclar?" (#rcMaterials), o
 *   2) el escáner con IA (MobileNet o el backend /api/classify)
 *      identifica un material en la foto subida,
 * este script busca, entre los puntos ya pintados en el mini-mapa
 * (#rcMiniMap), el centro más cercano que acepte ese material
 * (según su campo `materials`) y traza automáticamente la ruta
 * real hacia allí — la misma ruta con calles (Leaflet Routing
 * Machine + OSRM) que ya dibuja el botón "Cómo llegar" de cada
 * popup, mostrando también el panel con nombre, distancia y tiempo.
 *
 * CÓMO SE ENGANCHA (sin tocar los otros archivos)
 * -------------------------------------------------------------
 * - reciclar-material-info.js dispara un evento del DOM
 *   "reco:material-shown" con { key } cada vez que se muestra un
 *   material — ya sea por clic manual en la grilla, por
 *   "Anterior/Siguiente" en la ventana, o porque el escáner llamó a
 *   recoMaterialInfo.showByKey(key) tras detectar un objeto. Este
 *   único evento cubre AMBOS casos pedidos (selección manual y
 *   detección por IA) sin duplicar lógica en cada punto de origen.
 * - reciclar-minimap-real.js expone window.recoMiniMapRoute con
 *   .to(lat, lng, name) para trazar la ruta y .getPoints() para
 *   leer la misma lista de centros que ya están pintados en el
 *   mini-mapa (oficiales + sugeridos por la comunidad en Supabase).
 *
 * Si el mini-mapa no existe en la página (ej. otra pantalla que
 * cargue reciclar-material-info.js sin #rcMiniMap), este script no
 * hace nada: sigue escuchando el evento pero getPoints() devolverá
 * una lista vacía y simplemente no se traza ninguna ruta.
 *
 * ELECCIÓN DEL CENTRO MÁS CERCANO
 * -------------------------------------------------------------
 * - Si ya se conoce la ubicación del usuario (geolocalización
 *   concedida), se calcula la distancia real (fórmula de Haversine)
 *   a cada punto que acepte el material y se traza ruta al más
 *   cercano.
 * - Si todavía no se conoce la ubicación, recoMiniMapRoute.to() la
 *   pide en ese momento (mismo comportamiento que el botón "Cómo
 *   llegar"); mientras tanto se traza hacia el primer punto
 *   compatible encontrado, y en cuanto la ubicación esté disponible
 *   este script recalcula el más cercano real y vuelve a trazar sin
 *   que el usuario tenga que hacer nada.
 * - Si ningún punto acepta el material, no se traza ninguna ruta
 *   (evita mandar al usuario a un centro que no lo recibe) y se
 *   limpia cualquier ruta previa.
 *
 * Cárgalo DESPUÉS de reciclar-material-info.js y
 * reciclar-minimap-real.js:
 *   <script src="reciclar-minimap-real.js"></script>
 *   <script src="reciclar-material-info.js"></script>
 *   <script src="reciclar-scanner.js"></script>
 *   <script src="reciclar-auto-route.js"></script>
 */
(function () {
  "use strict";

  var DEBUG = true; // deja rastro en consola mientras se valida el flujo end-to-end

  function log() {
    if (DEBUG && window.console) console.log.apply(console, ["[RECO+ auto-route]"].concat([].slice.call(arguments)));
  }

  var EARTH_RADIUS_KM = 6371;

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  // Distancia en línea recta (km) — suficiente para ELEGIR el punto
  // más cercano; la distancia/tiempo por calle que ve el usuario en
  // el panel la calcula OSRM, no esta función.
  function haversineKm(lat1, lng1, lat2, lng2) {
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  function acceptsMaterial(point, materialKey) {
    return Array.isArray(point.materials) && point.materials.indexOf(materialKey) !== -1;
  }

  // Entre los puntos compatibles, elige el más cercano al usuario si
  // ya se conoce su ubicación; si no, el primero de la lista (mejor
  // que nada mientras se resuelve la geolocalización — se recalcula
  // después, ver más abajo).
  function pickNearest(points, materialKey, userLoc) {
    var candidatos = points.filter(function (p) {
      return isFinite(p.lat) && isFinite(p.lng) && acceptsMaterial(p, materialKey);
    });
    if (!candidatos.length) return null;

    if (!userLoc) return candidatos[0];

    var mejor = candidatos[0];
    var mejorDist = haversineKm(userLoc.lat, userLoc.lng, mejor.lat, mejor.lng);
    for (var i = 1; i < candidatos.length; i++) {
      var d = haversineKm(userLoc.lat, userLoc.lng, candidatos[i].lat, candidatos[i].lng);
      if (d < mejorDist) {
        mejor = candidatos[i];
        mejorDist = d;
      }
    }
    return mejor;
  }

  // Último material para el que se trazó (o intentó trazar) ruta,
  // para poder recalcular el más cercano real en cuanto llegue la
  // ubicación del usuario, sin retrazar si mientras tanto el usuario
  // ya cambió a otro material.
  var lastMaterialKey = null;
  var recalculated = false;

  function routeForMaterial(materialKey) {
    if (!window.recoMiniMapRoute) {
      log("recoMiniMapRoute no existe todavía (¿reciclar-minimap-real.js cargó?)");
      return;
    }
    if (!materialKey) return;

    log("material mostrado:", materialKey);

    lastMaterialKey = materialKey;
    recalculated = false;

    var points = window.recoMiniMapRoute.getPoints();
    if (!points.length) {
      log("mini-mapa sin puntos todavía, reintentando en 900ms…");
      // Los puntos del mini-mapa aún no terminaron de cargar (fetch a
      // Supabase en curso): reintenta en un momento, una sola vez,
      // en vez de simplemente rendirse.
      setTimeout(function () {
        if (lastMaterialKey !== materialKey) return; // el usuario ya cambió de material
        var retryPoints = window.recoMiniMapRoute.getPoints();
        if (!retryPoints.length) {
          log("reintento: sigue sin puntos, se rinde para este material");
          return;
        }
        trazarConPuntos(retryPoints, materialKey);
      }, 900);
      return;
    }

    trazarConPuntos(points, materialKey);
  }

  function trazarConPuntos(points, materialKey) {
    var userLoc = window.recoMiniMapRoute.getUserLocation();
    var destino = pickNearest(points, materialKey, userLoc);

    log("puntos disponibles:", points.length, "| ubicación usuario:", userLoc, "| destino elegido:", destino);

    if (!destino) {
      // Ningún centro acepta este material: no mandamos al usuario a
      // un lugar equivocado. Se limpia cualquier ruta previa de un
      // material distinto que sí tuviera destino.
      log("ningún centro acepta '" + materialKey + "', limpiando ruta");
      window.recoMiniMapRoute.clear();
      return;
    }

    window.recoMiniMapRoute.to(destino.lat, destino.lng, destino.name);

    // Si todavía no había ubicación del usuario, el punto elegido
    // pudo no ser el más cercano real (se tomó el primero de la
    // lista). En cuanto recoMiniMapRoute.to() la obtenga (pidiéndola
    // al usuario) y quede disponible, recalculamos una sola vez el
    // más cercano de verdad y volvemos a trazar si cambia.
    if (!userLoc) {
      waitForLocationAndRecalculate(materialKey);
    }
  }

  function waitForLocationAndRecalculate(materialKey) {
    var intentos = 0;
    var timer = setInterval(function () {
      intentos++;
      if (recalculated || lastMaterialKey !== materialKey) {
        clearInterval(timer);
        return;
      }
      var loc = window.recoMiniMapRoute.getUserLocation();
      if (loc) {
        clearInterval(timer);
        recalculated = true;
        var points = window.recoMiniMapRoute.getPoints();
        var destino = pickNearest(points, materialKey, loc);
        log("ubicación lista, recalculando destino:", destino);
        if (destino) {
          window.recoMiniMapRoute.to(destino.lat, destino.lng, destino.name);
        }
        return;
      }
      if (intentos > 25) clearInterval(timer); // ~12.5s: el usuario probablemente negó el permiso
    }, 500);
  }

  document.addEventListener("reco:material-shown", function (e) {
    var key = e.detail && e.detail.key;
    routeForMaterial(key);
  });

  log("listener 'reco:material-shown' registrado");
})();
