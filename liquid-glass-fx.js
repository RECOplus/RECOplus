/* ══════════════════════════════════════════════════════════════
   LIQUID-GLASS-FX.JS
   Capa ADITIVA de interactividad visual. No modifica app.js ni su
   estado: solo observa el DOM que Leaflet genera y le añade un
   halo tipo "radar" a cada marcador cuando aparece, además de
   pequeñas animaciones de scroll-reveal para elementos estáticos
   de la página (legend, hero, etc.) que no dependen de app.js.

   Cárgalo DESPUÉS de app.js:
   <script src="liquid-glass-fx.js"></script>
═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ── Halo tipo radar sobre cada marcador nuevo del mapa ──
  // Leaflet monta cada marcador como un <img>/<div class="leaflet-marker-icon">
  // dentro de .leaflet-marker-pane. Observamos ese pane y, por cada nodo
  // que se añade, le insertamos un halo pulsante detrás (position absolute,
  // mismo tamaño, centrado), que se retira solo tras un par de pulsos para
  // no acumular animaciones infinitas de más en mapas con muchos puntos.
  function attachMarkerHalo(markerEl) {
    if (prefersReducedMotion()) return;
    if (!markerEl || markerEl.dataset.lgfxHalo) return;
    markerEl.dataset.lgfxHalo = "1";

    const halo = document.createElement("span");
    halo.className = "lgfx-marker-halo";
    Object.assign(halo.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: "34px",
      height: "34px",
      marginLeft: "-17px",
      marginTop: "-17px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(94,207,130,0.45) 0%, rgba(94,207,130,0) 70%)",
      pointerEvents: "none",
      zIndex: "0",
      animation: "lgfx-ring-ping 1.4s cubic-bezier(.2,.8,.3,1) 2",
    });

    // Insertar el halo como hermano, detrás del ícono visual.
    if (markerEl.style.position !== "absolute") {
      // Leaflet ya posiciona el marcador con transform; el halo se ancla
      // en un wrapper relativo que envolvemos alrededor del contenido.
      markerEl.style.position = markerEl.style.position || "relative";
    }
    markerEl.appendChild(halo);

    setTimeout(() => {
      halo.remove();
    }, 2900);
  }

  function watchMapMarkers() {
    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    const tryAttach = () => {
      const pane = mapEl.querySelector(".leaflet-marker-pane");
      if (!pane) return false;

      // Marcadores ya presentes al momento de observar
      pane.querySelectorAll(".leaflet-marker-icon").forEach(attachMarkerHalo);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            if (node.classList && node.classList.contains("leaflet-marker-icon")) {
              attachMarkerHalo(node);
            } else if (node.querySelectorAll) {
              node.querySelectorAll(".leaflet-marker-icon").forEach(attachMarkerHalo);
            }
          });
        });
      });
      observer.observe(pane, { childList: true });
      return true;
    };

    // El pane de Leaflet puede tardar un tick en existir tras initMap().
    if (!tryAttach()) {
      const retry = setInterval(() => {
        if (tryAttach()) clearInterval(retry);
      }, 200);
      setTimeout(() => clearInterval(retry), 8000);
    }
  }

  // ── Scroll-reveal suave para bloques que no dependen de app.js ──
  // (legend, tooltip, footer-cta): aparecen con fade-up la primera
  // vez que entran en el viewport, sin afectar su funcionalidad.
  function initScrollReveal() {
    if (prefersReducedMotion()) return;
    const targets = document.querySelectorAll(".legend, .footer-cta, .site-header, .controls");
    if (!targets.length || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animation = "lgfx-fade-up .6s cubic-bezier(.2,.8,.3,1) both";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((el) => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    watchMapMarkers();
    initScrollReveal();
  });
})();