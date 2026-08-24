/**
 * RECO+ — Aliados Marquee Infinito
 * Mueve las tarjetas de empresas hacia la izquierda en bucle continuo.
 * Técnica: duplica el grupo original para que el loop sea imperceptible.
 * Pausa al hacer hover. Se puede arrastrar con mouse o dedo.
 */

(function () {
  "use strict";

  var SPEED = 0.6; // píxeles por frame — ajusta aquí la velocidad

  document.addEventListener("DOMContentLoaded", function () {
    var wrapper = document.querySelector(".aliados-marquee-wrapper");
    var marquee = document.getElementById("aliadosMarquee");
    var track   = document.getElementById("aliadosTrack");

    if (!wrapper || !marquee || !track) return;

    // 1. Clonar el grupo original para que el bucle sea continuo
    var clone = track.cloneNode(true);
    clone.removeAttribute("id");
    clone.setAttribute("aria-hidden", "true");
    marquee.appendChild(clone);

    // 2. Variables de estado
    var offset      = 0;
    var paused      = false;
    var trackW      = 0; // ancho de UN grupo (se recalcula si cambia el viewport)
    var rafId       = null;
    var isDragging  = false;

    function measureTrack() {
      trackW = track.offsetWidth +
               parseInt(getComputedStyle(marquee).gap || "0", 10);
      // Si no hay gap definido en el flex del marquee, usamos el gap del track
      if (!trackW || trackW < 10) {
        // fallback: medir con getBoundingClientRect
        trackW = track.getBoundingClientRect().width + 24;
      }
    }

    measureTrack();

    function normalizeOffset() {
      if (trackW <= 0) return;
      while (offset >= trackW) offset -= trackW;
      while (offset < 0)       offset += trackW;
    }

    function render() {
      marquee.style.transform = "translateX(-" + offset + "px)";
    }

    // 3. Bucle de animación
    function tick() {
      if (!paused && !isDragging) {
        offset += SPEED;
        normalizeOffset();
        render();
      }
      rafId = requestAnimationFrame(tick);
    }

    // 4. Pausa en hover (desktop)
    wrapper.addEventListener("mouseenter", function () { paused = true; });
    wrapper.addEventListener("mouseleave", function () { if (!isDragging) paused = false; });

    // ── 4b. Arrastrar con mouse o dedo ──
    // Mismo bloqueo de dirección que "¿Qué puedes hacer?" y los
    // comentarios: en el primer movimiento de un toque se decide si el
    // gesto es horizontal (arrastrar el carril) o vertical (scroll
    // normal de la página), para no pelear con el scroll de la página.
    var dragDecided     = false;
    var startX          = 0;
    var startY          = 0;
    var dragStartOffset = 0;
    var resumeTimer     = null;
    var DIR_THRESHOLD   = 6;

    marquee.style.cursor = "grab";
    marquee.style.touchAction = "pan-y";

    function pointX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function pointY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

    function dragStart(e) {
      isDragging      = true;
      dragDecided     = e.type === "mousedown";
      paused          = true;
      startX          = pointX(e);
      startY          = pointY(e);
      dragStartOffset = offset;
      clearTimeout(resumeTimer);
      if (e.type === "mousedown") marquee.style.cursor = "grabbing";
    }

    function dragMove(e) {
      if (!isDragging) return;
      var x = pointX(e);
      var y = pointY(e);
      var deltaX = startX - x;
      var deltaY = startY - y;

      if (e.type === "touchmove" && !dragDecided) {
        if (Math.abs(deltaX) < DIR_THRESHOLD && Math.abs(deltaY) < DIR_THRESHOLD) return;
        dragDecided = true;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          // Gesto vertical: scroll de página, no arrastre del carril.
          isDragging = false;
          return;
        }
      }

      offset = dragStartOffset + deltaX;
      normalizeOffset();
      render();
      if (e.cancelable) e.preventDefault();
    }

    function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      marquee.style.cursor = "grab";
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { paused = false; }, 900);
    }

    marquee.addEventListener("mousedown", dragStart);
    window.addEventListener("mousemove", dragMove);
    window.addEventListener("mouseup", dragEnd);

    marquee.addEventListener("touchstart", dragStart, { passive: true });
    marquee.addEventListener("touchmove", dragMove, { passive: false });
    marquee.addEventListener("touchend", dragEnd, { passive: true });
    marquee.addEventListener("touchcancel", dragEnd, { passive: true });

    // 5. Recalcular ancho si las imágenes cargan tarde o el viewport cambia
    window.addEventListener("resize", function () {
      measureTrack();
      // Evitar salto visual cuando se redimensiona
      normalizeOffset();
    });

    // Esperar a que las imágenes del track carguen para medir bien
    var imgs = track.querySelectorAll("img");
    var loaded = 0;
    if (imgs.length === 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      imgs.forEach(function (img) {
        if (img.complete) {
          loaded++;
          if (loaded === imgs.length) { measureTrack(); rafId = requestAnimationFrame(tick); }
        } else {
          img.addEventListener("load",  function () {
            loaded++;
            if (loaded === imgs.length) { measureTrack(); rafId = requestAnimationFrame(tick); }
          });
          img.addEventListener("error", function () {
            loaded++;
            if (loaded === imgs.length) { measureTrack(); rafId = requestAnimationFrame(tick); }
          });
        }
      });
    }

  });

})();