/**
 * RECO+ — Aliados Marquee Infinito
 * Mueve las tarjetas de empresas hacia la izquierda en bucle continuo.
 * Técnica: duplica el grupo original para que el loop sea imperceptible.
 * Pausa al hacer hover. Sin dependencias externas.
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
    var offset   = 0;
    var paused   = false;
    var trackW   = 0; // ancho de UN grupo (se recalcula si cambia el viewport)
    var rafId    = null;

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

    // 3. Bucle de animación
    function tick() {
      if (!paused) {
        offset += SPEED;

        // Cuando hemos desplazado el ancho completo de un grupo, reseteamos
        if (offset >= trackW) {
          offset -= trackW;
        }

        marquee.style.transform = "translateX(-" + offset + "px)";
      }
      rafId = requestAnimationFrame(tick);
    }

    // 4. Pausa en hover
    wrapper.addEventListener("mouseenter", function () { paused = true; });
    wrapper.addEventListener("mouseleave", function () { paused = false; });

    // Touch: pausa al tocar, reanuda al soltar
    wrapper.addEventListener("touchstart", function () { paused = true; }, { passive: true });
    wrapper.addEventListener("touchend",   function () { paused = false; }, { passive: true });

    // 5. Recalcular ancho si las imágenes cargan tarde o el viewport cambia
    window.addEventListener("resize", function () {
      measureTrack();
      // Evitar salto visual cuando se redimensiona
      if (offset >= trackW) offset = offset % trackW;
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