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

    function tick() {
      if (!paused) {
        offset += speed;
        if (offset >= trackW) offset -= trackW;
        row.style.transform = "translateX(-" + offset + "px)";
      }
      requestAnimationFrame(tick);
    }

    // Pausa global desde el wrapper (hover)
    var wrapper = document.querySelector(".test-marquee-wrapper");
    if (wrapper) {
      wrapper.addEventListener("mouseenter", function () { paused = true;  });
      wrapper.addEventListener("mouseleave", function () { paused = false; });
      wrapper.addEventListener("touchstart", function () { paused = true;  }, { passive: true });
      wrapper.addEventListener("touchend",   function () { paused = false; }, { passive: true });
    }

    window.addEventListener("resize", function () {
      measure();
      if (offset >= trackW) offset = offset % trackW;
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