/**
 * video-player-modal.js
 * Modal aditivo que reproduce un video del sitio (YouTube, Vimeo o
 * archivo directo .mp4/.webm) en una "ventanita" dentro de la propia
 * página, en vez de abrir una pestaña nueva.
 *
 * Expone window.recoAbrirVideoModal(url, title) para que cualquier
 * capa aditiva (ej. videos-supabase.js) lo use.
 *
 * Capa 100% aditiva: inyecta su propio HTML al final de <body> la
 * primera vez que se necesita. No depende de otros scripts, aunque
 * usa window.t() para textos si i18n.js ya está cargado.
 *
 * Requiere:
 *   <link rel="stylesheet" href="video-player-modal.css">
 *   <script src="video-player-modal.js"></script>
 */
(function () {
  "use strict";

  function tr(key, fallback) {
    if (typeof window.t === "function") {
      var val = window.t(key);
      if (val && val !== key) return val;
    }
    return fallback;
  }

  var overlay = null;
  var modalBody = null;
  var modalTitle = null;
  var lastFocused = null;

  function ensureModal() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "vpm-overlay";
    overlay.setAttribute("data-open", "false");
    overlay.innerHTML =
      '<div class="vpm-modal" role="dialog" aria-modal="true" aria-labelledby="vpmTitle">' +
        '<div class="vpm-modal__header">' +
          '<h3 class="vpm-modal__title" id="vpmTitle"></h3>' +
          '<button type="button" class="vpm-modal__close" aria-label="' + tr("videos.player.cerrar", "Cerrar") + '">' +
            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="16" height="16"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          "</button>" +
        "</div>" +
        '<div class="vpm-modal__body" id="vpmBody" data-state="loading">' +
          '<div class="vpm-modal__state vpm-modal__state--loading"><div class="vpm-spinner"></div><span>' + tr("videos.player.cargando", "Cargando video…") + "</span></div>" +
          '<div class="vpm-modal__state vpm-modal__state--error"><span>' + tr("videos.player.error", "No se pudo cargar el video.") + '</span><a href="#" id="vpmFallbackLink" target="_blank" rel="noopener">' + tr("videos.player.abrirExterno", "Abrirlo en una pestaña nueva") + "</a></div>" +
        "</div>" +
      "</div>";

    document.body.appendChild(overlay);
    modalBody = overlay.querySelector("#vpmBody");
    modalTitle = overlay.querySelector("#vpmTitle");

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector(".vpm-modal__close").addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.getAttribute("data-open") === "true") closeModal();
    });

    return overlay;
  }

  /* ── Detección de tipo de fuente ── */
  function getYouTubeId(url) {
    var m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
    return m ? m[1] : null;
  }
  function getVimeoId(url) {
    var m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
  }
  function isDirectFile(url) {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
  }

  function clearBody() {
    // Deja los dos estados (loading/error) intactos y remueve
    // cualquier iframe/video insertado en aperturas anteriores.
    var media = modalBody.querySelectorAll("iframe, video");
    media.forEach(function (el) { el.remove(); });
  }

  function renderVideo(url) {
    clearBody();
    modalBody.setAttribute("data-state", "loading");

    var ytId = getYouTubeId(url);
    var vimeoId = getVimeoId(url);

    if (ytId) {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube.com/embed/" + ytId + "?autoplay=1&rel=0";
      iframe.title = "YouTube video player";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      iframe.addEventListener("load", function () { modalBody.setAttribute("data-state", "ready"); });
      modalBody.appendChild(iframe);
      // Los iframes de YouTube no siempre disparan errores visibles;
      // basta con el evento load para quitar el spinner.
      return;
    }

    if (vimeoId) {
      var vIframe = document.createElement("iframe");
      vIframe.src = "https://player.vimeo.com/video/" + vimeoId + "?autoplay=1";
      vIframe.title = "Vimeo video player";
      vIframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
      vIframe.setAttribute("allowfullscreen", "");
      vIframe.addEventListener("load", function () { modalBody.setAttribute("data-state", "ready"); });
      modalBody.appendChild(vIframe);
      return;
    }

    // Archivo directo (mp4/webm/ogg/mov) o URL desconocida: se
    // intenta reproducir con <video>. Si el navegador no puede
    // decodificarlo, el evento "error" muestra el estado de error
    // con un enlace para abrirlo externamente.
    var video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.addEventListener("loadeddata", function () { modalBody.setAttribute("data-state", "ready"); });
    video.addEventListener("error", function () {
      modalBody.setAttribute("data-state", "error");
      var link = overlay.querySelector("#vpmFallbackLink");
      if (link) link.href = url;
    });
    modalBody.appendChild(video);
  }

  function openModal(url, title) {
    if (!url) return;
    ensureModal();
    modalTitle.textContent = title || tr("videos.player.titulo", "Reproduciendo video");
    lastFocused = document.activeElement;

    renderVideo(url);

    overlay.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
    overlay.querySelector(".vpm-modal__close").focus();
  }

  function closeModal() {
    if (!overlay) return;
    overlay.setAttribute("data-open", "false");
    document.body.style.overflow = "";

    // Pequeño delay para que termine la transición antes de destruir
    // el iframe/video (evita el "salto" visual y corta el audio).
    window.setTimeout(function () {
      if (overlay.getAttribute("data-open") === "false") clearBody();
    }, 240);

    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  window.recoAbrirVideoModal = openModal;
  window.recoCerrarVideoModal = closeModal;
})();
