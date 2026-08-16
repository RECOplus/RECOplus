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

    var yaPresentes = {};
    data.videos.forEach(function (v) { yaPresentes[v.id] = true; });

    rows.forEach(function (row, idx) {
      var video = mapRow(row, idx);
      if (yaPresentes[video.id]) return;
      data.videos.push(video);
      yaPresentes[video.id] = true;
    });

    if (typeof window.recoVideosHubRefresh === 'function') {
      window.recoVideosHubRefresh();
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
        fusionarVideos(res.data);
      })
      .catch(function () {
        // Sin conexión o servicio no disponible: la biblioteca sigue
        // mostrando los videos estáticos de videos-data.js con
        // normalidad, sin bloquear nada.
      });
  }

  /* ══════════════════════════════════════════════
     CLIC en una tarjeta de video de la comunidad:
     abre el video original (link externo o archivo
     en Storage) en una pestaña nueva. Se delega en
     #vhGrid porque las tarjetas se generan dinámicamente.
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
      if (video && video.videoUrl) {
        window.open(video.videoUrl, '_blank', 'noopener');
      }
    });
  }

  ready(function () {
    if (!document.getElementById('vhGrid')) return;
    wireClicksComunidad();
    cargarVideosComunidad();
  });

  // Permite recargar manualmente (ej. después de moderar un video
  // desde el Table Editor de Supabase y querer refrescar sin salir
  // de la página).
  window.recoVideosComunidadRecargar = cargarVideosComunidad;
})();
