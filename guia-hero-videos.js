/**
 * guia-hero-videos.js — Llena el hero de guia.html (3 tarjetas
 * grandes "Videos principales" + hasta 4 minis "Más videos") con
 * los videos de la biblioteca de RECO+.
 *
 * Los videos ya NO se consultan a Supabase en tiempo real: viven
 * como contenido estático en window.RECO_VIDEOS_DATA (ver
 * videos-data.js), la misma fuente que usa videos.html. Este script
 * solo toma los primeros 7 (3 grandes + 4 minis) y los pinta.
 *
 * Capa 100% aditiva: no modifica guia-hub.js ni videos-data.js.
 * Requiere, antes de este script:
 *   <script src="i18n.js"></script>
 *   <script src="videos-data.js"></script>
 * <script src="guia-hero-videos.js"></script>
 */
(function () {
  'use strict';

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
    return tr('videos.cat.' + categoria, categoria);
  }

  function tituloDe(video) {
    return video.titleKey ? tr(video.titleKey, video.titleFallback) : video.titleFallback;
  }

  function descripcionDe(video) {
    return video.descKey ? tr(video.descKey, video.descFallback) : video.descFallback;
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
      a.href = 'videos.html?v=' + video.id;
      a.className = 'gh-video-card gh-reveal is-visible';
      a.innerHTML =
        '<div class="gh-video-card__thumb">' +
          '<span class="gh-video-card__icon">' + PLAY_ICON + '</span>' +
        '</div>' +
        '<div class="gh-video-card__body">' +
          '<h3 class="gh-video-card__title">' + escapeHtml(tituloDe(video)) + '</h3>' +
          '<p class="gh-video-card__desc">' + escapeHtml(descripcionDe(video)) + '</p>' +
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
      a.href = 'videos.html?v=' + video.id;
      a.className = 'gh-mini';
      a.innerHTML =
        '<span class="gh-mini__thumb">' + PLAY_ICON_SMALL + '</span>' +
        '<span class="gh-mini__text">' +
          '<span class="gh-mini__title">' + escapeHtml(tituloDe(video)) + '</span>' +
          '<span class="gh-mini__desc">' + escapeHtml(catLabel(video.category)) + '</span>' +
        '</span>';
      wrap.appendChild(a);
    });
  }

  function pintarHero() {
    var data = window.RECO_VIDEOS_DATA;
    if (!data || !data.videos) return;
    renderVideoRow(data.videos);
    renderMinis(data.videos);
  }

  document.addEventListener('reco:langchange', pintarHero);

  ready(function () {
    if (!document.getElementById('ghVideoRow')) return;
    pintarHero();
  });
})();
