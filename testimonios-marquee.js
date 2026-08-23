/**
 * RECO+ — Testimonios Marquee Dos Filas
 * Fila 1 se mueve a velocidad normal, fila 2 un poco más lento.
 * Pausa al hacer hover. Sin dependencias. requestAnimationFrame.
 */

(function () {
  "use strict";

  var SPEED_ROW1 = 0.55;   // px por frame — fila superior
  var SPEED_ROW2 = 0.38;   // px por frame — fila inferior (más lenta = sensación de profundidad)

  function initRow(rowId, trackId, speed) {
    var row   = document.getElementById(rowId);
    var track = document.getElementById(trackId);
    if (!row || !track) return;

    // Clonar el grupo para el loop continuo
    var clone = track.cloneNode(true);
    clone.removeAttribute("id");
    clone.setAttribute("aria-hidden", "true");
    row.appendChild(clone);

    var offset  = 0;
    var paused  = false;
    var trackW  = 0;

    function measure() {
      trackW = track.getBoundingClientRect().width + 16; // 16 = gap
      if (trackW < 20) trackW = track.offsetWidth + 16;
    }

    measure();

    function normalizeOffset() {
      if (trackW <= 0) return;
      while (offset >= trackW) offset -= trackW;
      while (offset < 0)       offset += trackW;
    }

    function render() {
      row.style.transform = "translateX(-" + offset + "px)";
    }

    function tick() {
      if (!paused && !isDragging) {
        offset += speed;
        normalizeOffset();
        render();
      }
      requestAnimationFrame(tick);
    }

    // ── Arrastrar con mouse o dedo ──
    // Mismo bloqueo de dirección que el carril "¿Qué puedes hacer?"
    // (acc-cards.js): en el primer movimiento de un toque se decide si
    // el gesto es horizontal (arrastrar la fila) o vertical (scroll
    // normal de la página), para no pelear con el scroll de la página.
    var isDragging      = false;
    var dragDecided     = false;
    var startX          = 0;
    var startY          = 0;
    var dragStartOffset = 0;
    var resumeTimer     = null;
    var DIR_THRESHOLD   = 6;

    row.style.cursor = "grab";
    row.style.touchAction = "pan-y";

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
      if (e.type === "mousedown") row.style.cursor = "grabbing";
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
          // Gesto vertical: scroll de página, no arrastre de la fila.
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
      row.style.cursor = "grab";
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { paused = false; }, 900);
    }

    row.addEventListener("mousedown", dragStart);
    window.addEventListener("mousemove", dragMove);
    window.addEventListener("mouseup", dragEnd);

    row.addEventListener("touchstart", dragStart, { passive: true });
    row.addEventListener("touchmove", dragMove, { passive: false });
    row.addEventListener("touchend", dragEnd, { passive: true });
    row.addEventListener("touchcancel", dragEnd, { passive: true });

    // Pausa (por hover, en desktop) desde el wrapper — el estado de
    // arrastre en sí lo maneja el gesto de cada fila arriba.
    var wrapper = document.querySelector(".test-marquee-wrapper");
    if (wrapper) {
      wrapper.addEventListener("mouseenter", function () { paused = true; });
      wrapper.addEventListener("mouseleave", function () { if (!isDragging) paused = false; });
    }

    window.addEventListener("resize", function () {
      measure();
      normalizeOffset();
    });

    // Esperar imágenes antes de medir
    var imgs   = track.querySelectorAll("img");
    var loaded = 0;
    var total  = imgs.length;

    function start() { measure(); requestAnimationFrame(tick); }

    if (total === 0) {
      start();
    } else {
      imgs.forEach(function (img) {
        function onDone() { if (++loaded >= total) start(); }
        if (img.complete) { onDone(); }
        else {
          img.addEventListener("load",  onDone);
          img.addEventListener("error", onDone);
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initRow("testRow1", "testTrack1", SPEED_ROW1);
    initRow("testRow2", "testTrack2", SPEED_ROW2);
  });

})();