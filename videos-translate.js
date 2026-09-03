/**
 * videos-translate.js
 * ---------------------------------------------------------------
 * Capa compartida y 100% aditiva: traduce al inglés el título y la
 * descripción de videos de la comunidad (texto libre que escribió
 * quien subió el video, normalmente en español), llamando a
 * api/translate-video.js cuando el sitio está en inglés.
 *
 * i18n.js solo traduce textos FIJOS de la interfaz (data-i18n) — no
 * puede traducir contenido que no conoce de antemano. Este archivo
 * cubre ese hueco para:
 *   - guia-hero-videos.js (hero de guia.html)
 *   - videos-supabase.js  (biblioteca completa de videos.html)
 *
 * Caché en localStorage bajo la clave "reco-video-translations" para
 * no volver a llamar a Gemini por el mismo video ya traducido. Cada
 * entrada cacheada guarda { titulo, descripcion } en inglés, indexada
 * por el id del video (row.id de la tabla videos_usuario).
 *
 * Uso:
 *   window.RecoVideoTranslate.translate(rows, function (rowsTraducidas) {
 *     // rowsTraducidas: mismo array/orden, con .titulo/.descripcion
 *     // reemplazados por la traducción cuando el idioma activo es "en"
 *     // (o sin cambios si es "es", o si algo falla).
 *   });
 *
 * Requiere, antes de este script:
 *   <script src="i18n.js"></script>
 * <script src="videos-translate.js"></script>
 */
(function (global) {
  "use strict";

  var CACHE_KEY = "reco-video-translations";
  var ENDPOINT = "/api/translate-video";
  var LOTE = 12; // debe coincidir con MAX_ITEMS_POR_LLAMADA del endpoint

  function idiomaActual() {
    return localStorage.getItem("reco-lang") || "es";
  }

  function leerCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function guardarCache(cache) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      // localStorage lleno o no disponible: seguimos sin caché,
      // no es crítico (solo se pedirá traducción de nuevo).
    }
  }

  function trocear(arr, tam) {
    var lotes = [];
    for (var i = 0; i < arr.length; i += tam) {
      lotes.push(arr.slice(i, i + tam));
    }
    return lotes;
  }

  function pedirLote(lote) {
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lote.map(function (row) {
          return { id: String(row.id), titulo: row.titulo || "", descripcion: row.descripcion || "" };
        })
      })
    })
      .then(function (res) {
        // Si /api/translate-video no existe en este entorno (ej. el
        // sitio corriendo con Live Server u otro server estático que
        // no ejecuta funciones serverless de Vercel), la respuesta no
        // es JSON válido (404 en HTML). Se detecta por content-type
        // en vez de intentar parsear y fallar feo.
        var contentType = res.headers.get('content-type') || '';
        if (!res.ok || contentType.indexOf('application/json') === -1) {
          return [];
        }
        return res.json();
      })
      .then(function (data) { return (data && Array.isArray(data.items)) ? data.items : []; })
      .catch(function () { return []; });
  }

  /**
   * rows: array de objetos con al menos { id, titulo, descripcion }
   *       (formato de las filas de la tabla videos_usuario).
   * callback(rowsResultado): se llama SIEMPRE, incluso si el idioma
   *       es "es" o si la traducción falla — en esos casos rowsResultado
   *       trae exactamente lo que se le pasó, sin tocar nada.
   */
  function translate(rows, callback) {
    if (!Array.isArray(rows) || rows.length === 0) {
      callback(rows || []);
      return;
    }

    if (idiomaActual() !== "en") {
      callback(rows);
      return;
    }

    var cache = leerCache();
    var faltantes = rows.filter(function (row) { return !cache[row.id]; });

    function aplicarYDevolver() {
      var resultado = rows.map(function (row) {
        var cached = cache[row.id];
        if (!cached) return row;
        var copia = {};
        for (var k in row) { if (Object.prototype.hasOwnProperty.call(row, k)) copia[k] = row[k]; }
        copia.titulo = cached.titulo || row.titulo;
        copia.descripcion = cached.descripcion || row.descripcion;
        return copia;
      });
      callback(resultado);
    }

    if (faltantes.length === 0) {
      aplicarYDevolver();
      return;
    }

    var lotes = trocear(faltantes, LOTE);
    Promise.all(lotes.map(pedirLote))
      .then(function (resultadosPorLote) {
        resultadosPorLote.forEach(function (items) {
          items.forEach(function (item) {
            if (item && item.id) {
              cache[item.id] = { titulo: item.titulo, descripcion: item.descripcion };
            }
          });
        });
        guardarCache(cache);
        aplicarYDevolver();
      })
      .catch(function () {
        // Si algo revienta a mitad de camino, se muestra lo que ya
        // había en caché y el resto queda en su idioma original —
        // nunca se bloquea el render por esto.
        aplicarYDevolver();
      });
  }

  global.RecoVideoTranslate = { translate: translate };
})(window);
