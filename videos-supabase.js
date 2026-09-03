/**
 * videos-supabase.js — Mezcla videos aprobados de la comunidad
 * (tabla `videos_usuario`, subidos vía subir-video-modal.js) dentro
 * de la biblioteca de videos.html.
 *
 * Capa 100% aditiva: no modifica videos-data.js ni videos-hub.js.
 * Solo empuja nuevas entradas a window.RECO_VIDEOS_DATA.videos (que
 * videos-data.js ya dejó listo) y pide un re-render vía el hook
 * window.recoVideosHubRefresh que expone videos-hub.js.
 *
 * REQUIERE, en este orden, antes de este script:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *   <script src="videos-data.js"></script>
 *   <script src="videos-supabase.js"></script>
 *   <script src="videos-hub.js"></script>
 *
 * Los videos de la comunidad se distinguen en el grid con la clase
 * .vh-card--community (ver videos-hub.css) y, al hacer clic, abren
 * el link o archivo original en una pestaña nueva — no tienen una
 * página propia como los videos de demostración (v1–v12).
 */
(function () {
  'use strict';

  var TABLE = 'videos_usuario';
  var CATEGORIAS_VALIDAS = ['reciclaje', 'donacion', 'sostenibilidad', 'comunidad'];

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function tr(key, fallback) {
    if (typeof window.t === 'function') {
      var val = window.t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  }

  function mapRow(row, idx) {
    var categoria = CATEGORIAS_VALIDAS.indexOf(row.categoria) !== -1 ? row.categoria : 'comunidad';
    var descripcion = row.descripcion && row.descripcion.trim()
      ? row.descripcion
      : tr('subirvideo.videoComunidad', 'Video compartido por la comunidad');

    return {
      id: 'u' + row.id,
      category: categoria,
      duration: null,
      variant: (idx % 3) + 1,
      titleKey: null,
      titleFallback: row.titulo,
      descKey: null,
      descFallback: descripcion,
      isCommunity: true,
      videoUrl: row.video_url
    };
  }

  function fusionarVideos(rows) {
    var data = window.RECO_VIDEOS_DATA;
    if (!data || !data.videos) return;

    var indicePorId = {};
    data.videos.forEach(function (v, i) { indicePorId[v.id] = i; });

    rows.forEach(function (row, idx) {
      var video = mapRow(row, idx);
      if (indicePorId.hasOwnProperty(video.id)) {
        // Ya existe (ej. se está re-fusionando tras un cambio de
        // idioma): actualiza título/descripción en el mismo lugar en
        // vez de duplicar la tarjeta, para que la traducción sí se
        // refleje al alternar ES/EN.
        var existente = data.videos[indicePorId[video.id]];
        existente.titleFallback = video.titleFallback;
        existente.descFallback = video.descFallback;
        return;
      }
      data.videos.push(video);
      indicePorId[video.id] = data.videos.length - 1;
    });

    if (typeof window.recoVideosHubRefresh === 'function') {
      window.recoVideosHubRefresh();
    }

    // Si la página se abrió con un deep-link a un video de comunidad
    // (videos.html?v=uN) que aún no existía en RECO_VIDEOS_DATA cuando
    // videos-hub.js proceso la URL por primera vez (esta consulta a
    // Supabase es asíncrona), se reintenta una vez que el video ya
    // está disponible, para que el resaltado/scroll sí funcione.
    if (typeof window.recoVideosHubAplicarDeepLink === 'function') {
      window.recoVideosHubAplicarDeepLink();
    }
  }

  function cargarVideosComunidad() {
    if (!window.recoSupabase || !window.RECO_VIDEOS_DATA) return;

    window.recoSupabase
      .from(TABLE)
      .select('id, titulo, descripcion, categoria, video_url, created_at')
      .eq('estado', 'aprobado')
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error || !res.data) return;
        if (window.RecoVideoTranslate) {
          window.RecoVideoTranslate.translate(res.data, fusionarVideos);
        } else {
          fusionarVideos(res.data);
        }
      })
      .catch(function () {
        // Sin conexión o servicio no disponible: la biblioteca sigue
        // mostrando los videos estáticos de videos-data.js con
        // normalidad, sin bloquear nada.
      });
  }

  /* ══════════════════════════════════════════════
     CLIC en una tarjeta de video de la comunidad:
     abre el video original en el modal reproductor
     del sitio (video-player-modal.js) en vez de una
     pestaña nueva. Si ese modal no está cargado en la
     página por algún motivo, cae de vuelta a
     window.open como antes. Se delega en #vhGrid
     porque las tarjetas se generan dinámicamente.
     ══════════════════════════════════════════════ */
  function wireClicksComunidad() {
    var grid = document.getElementById('vhGrid');
    if (!grid || grid._recoComunidadWired) return;
    grid._recoComunidadWired = true;

    grid.addEventListener('click', function (e) {
      var card = e.target.closest ? e.target.closest('.vh-card--community') : null;
      if (!card) return;
      var id = card.getAttribute('data-id');
      var data = window.RECO_VIDEOS_DATA;
      if (!data || !data.videos) return;
      var video = data.videos.filter(function (v) { return v.id === id; })[0];
      if (!video || !video.videoUrl) return;

      if (typeof window.recoAbrirVideoModal === 'function') {
        var titulo = video.titleKey ? tr(video.titleKey, video.titleFallback) : video.titleFallback;
        window.recoAbrirVideoModal(video.videoUrl, titulo);
      } else {
        window.open(video.videoUrl, '_blank', 'noopener');
      }
    });
  }

  ready(function () {
    if (!document.getElementById('vhGrid')) return;
    wireClicksComunidad();
    cargarVideosComunidad();
  });

  // Al cambiar de idioma (botón ES/EN), vuelve a pedir los videos: si
  // ahora el idioma activo es inglés, cargarVideosComunidad() pasa
  // por RecoVideoTranslate y fusionarVideos() actualiza el título y
  // la descripción de las tarjetas ya renderizadas con la traducción
  // (usando caché, así que no vuelve a llamar a Gemini si ya se había
  // traducido antes en esta sesión/navegador).
  document.addEventListener('reco:langchange', function () {
    if (document.getElementById('vhGrid')) cargarVideosComunidad();
  });

  // Permite recargar manualmente (ej. después de moderar un video
  // desde el Table Editor de Supabase y querer refrescar sin salir
  // de la página).
  window.recoVideosComunidadRecargar = cargarVideosComunidad;
})();
