/**
 * guia-hero-videos.js — Llena el hero de guia.html (3 tarjetas
 * grandes "Videos principales" + hasta 4 minis "Más videos") con
 * videos REALES de la comunidad, consultados directamente a
 * Supabase (tabla `videos_usuario`, estado 'aprobado').
 *
 * Antes esas 7 tarjetas eran contenido de demostración hardcodeado
 * en el HTML (v1–v7 de videos-data.js). Ahora se generan en JS a
 * partir de lo que la comunidad ha subido y ha sido aprobado, en
 * orden del más reciente al más antiguo. Si hay menos de 7 videos
 * aprobados, el hero simplemente muestra los que existan (sin
 * huecos ni tarjetas de relleno).
 *
 * Capa 100% aditiva: no modifica guia-hub.js ni videos-data.js.
 * Requiere, antes de este script:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *   <script src="i18n.js"></script>
 * <script src="guia-hero-videos.js"></script>
 */
(function () {
  'use strict';

  var TABLE = 'videos_usuario';
  var CATEGORIAS_VALIDAS = ['reciclaje', 'donacion', 'sostenibilidad', 'comunidad'];
  var MAX_GRANDES = 3;
  var MAX_MINIS = 4;

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

  function catLabel(categoria) {
    var key = CATEGORIAS_VALIDAS.indexOf(categoria) !== -1 ? categoria : 'comunidad';
    return tr('videos.cat.' + key, key);
  }

  var PLAY_ICON = '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M6 4.5v11l9-5.5-9-5.5z"/></svg>';
  var PLAY_ICON_SMALL = '<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M6 4.5v11l9-5.5-9-5.5z"/></svg>';

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function renderVideoRow(videos) {
    var wrap = document.getElementById('ghVideoRow');
    if (!wrap) return;
    wrap.innerHTML = '';

    videos.slice(0, MAX_GRANDES).forEach(function (video) {
      var a = document.createElement('a');
      a.href = 'videos.html?v=u' + video.id;
      a.className = 'gh-video-card gh-reveal is-visible';
      a.innerHTML =
        '<div class="gh-video-card__thumb">' +
          '<span class="gh-video-card__icon">' + PLAY_ICON + '</span>' +
        '</div>' +
        '<div class="gh-video-card__body">' +
          '<h3 class="gh-video-card__title">' + escapeHtml(video.titulo) + '</h3>' +
          '<p class="gh-video-card__desc">' + escapeHtml(video.descripcion || tr('subirvideo.videoComunidad', 'Video compartido por la comunidad')) + '</p>' +
        '</div>';
      wrap.appendChild(a);
    });
  }

  function renderMinis(videos) {
    var wrap = document.getElementById('ghVideoMinis');
    if (!wrap) return;
    wrap.innerHTML = '';

    videos.slice(MAX_GRANDES, MAX_GRANDES + MAX_MINIS).forEach(function (video) {
      var a = document.createElement('a');
      a.href = 'videos.html?v=u' + video.id;
      a.className = 'gh-mini';
      a.innerHTML =
        '<span class="gh-mini__thumb">' + PLAY_ICON_SMALL + '</span>' +
        '<span class="gh-mini__text">' +
          '<span class="gh-mini__title">' + escapeHtml(video.titulo) + '</span>' +
          '<span class="gh-mini__desc">' + escapeHtml(catLabel(video.categoria)) + '</span>' +
        '</span>';
      wrap.appendChild(a);
    });
  }

  function cargarHeroVideos() {
    if (!window.recoSupabase) return;

    window.recoSupabase
      .from(TABLE)
      .select('id, titulo, descripcion, categoria, video_url, created_at')
      .eq('estado', 'aprobado')
      .order('created_at', { ascending: false })
      .limit(MAX_GRANDES + MAX_MINIS)
      .then(function (res) {
        if (res.error || !res.data) return;
        renderVideoRow(res.data);
        renderMinis(res.data);
      })
      .catch(function () {
        // Sin conexión o servicio no disponible: el hero se queda
        // vacío en vez de romper el resto de la página.
      });
  }

  document.addEventListener('reco:langchange', cargarHeroVideos);

  ready(function () {
    if (!document.getElementById('ghVideoRow')) return;
    cargarHeroVideos();
  });
})();
