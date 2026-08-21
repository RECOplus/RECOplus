/* ═══════════════════════════════════════════════════════════════
   INDEX-HERO-VIDEO.JS
   Capa ADITIVA: controla el <video class="hero-video-bg"> del hero.
   - Respeta prefers-reduced-motion: si el usuario lo pide, pausa el
     video y deja el poster (img/bannerdelinicio.png) como fondo fijo.
   - Si el navegador no puede reproducir el video (autoplay bloqueado,
     formato no soportado, error de red), oculta el <video> para que
     quede visible el background-image de respaldo definido en
     style.css (.hero { background: ... url(img/bannerdelinicio.png) }).

   No depende de ningún otro script del proyecto.
═══════════════════════════════════════════════════════════════ */
(function () {
  var video = document.querySelector('.hero-video-bg');
  if (!video) return;

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    video.pause();
    video.removeAttribute('autoplay');
    video.style.display = 'none';
    return;
  }

  // Si el autoplay es bloqueado por el navegador o el video falla al
  // cargar, se oculta para dejar ver el fondo estático de respaldo.
  video.addEventListener('error', function () {
    video.style.display = 'none';
  });

  var playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {
      video.style.display = 'none';
    });
  }
})();
