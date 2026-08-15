/**
 * guia-hub.js
 * Lógica del nuevo hub de la página Guía: switch Reciclar/Donar,
 * chips de categoría con panel de pasos, accesos rápidos del hero
 * y animaciones de aparición al hacer scroll.
 *
 * Capa 100% aditiva: no depende de reciclar.js ni de donar.js.
 * Cárgalo después de script.js:
 * <script src="guia-hub.js"></script>
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  // Íconos reutilizados de reciclar.html (mismo trazo/estilo que el resto del sitio)
  var ICONS = {
    plastico: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 3h6v3l1.5 2v11a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 017.5 19V8L9 6V3z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>',
    papel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 3h14v18l-3.5-2L12 21l-3.5-2L5 21V3z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
    vidrio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 2h6l.6 4-1.6 3v11a1.5 1.5 0 01-1.5 1.5h-1a1.5 1.5 0 01-1.5-1.5V9L8.4 6 9 2z"/></svg>',
    metal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 8a6 6 0 0112 0v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8z"/><ellipse cx="12" cy="8" rx="6" ry="2.4"/></svg>',
    electronicos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>',
    ropa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 4L4 7l2 3 2-1v11h8V9l2 1 2-3-4-3-2 2h-2L8 4z"/></svg>',
    libros: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5v-13z"/><path d="M20 5.5A1.5 1.5 0 0018.5 4H13v16h5.5a1.5 1.5 0 001.5-1.5v-13z"/></svg>',
    muebles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4"/><rect x="4" y="11" width="16" height="6" rx="1"/><line x1="5" y1="17" x2="5" y2="20"/><line x1="19" y1="17" x2="19" y2="20"/></svg>',
    juguetes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="9" cy="8" r="3"/><circle cx="15" cy="8" r="3"/><path d="M6 12c-1.5 2-1.5 6 1 8h10c2.5-2 2.5-6 1-8"/></svg>',
    otro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>'
  };

  // Traducción: usa window.t(key) si i18n.js ya cargó; si no, hace fallback al texto ES.
  function tr(key, fallback) {
    return (typeof window.t === "function") ? window.t(key) : fallback;
  }

  // Construye DATA en cada llamada para que siempre refleje el idioma actual.
  function buildData() {
    var donarSteps = [
      tr("guia.donarstep.1", "Publicas lo que quieres donar"),
      tr("guia.donarstep.2", "Buscamos a quien lo necesita"),
      tr("guia.donarstep.3", "Coordinan la entrega de forma segura"),
      tr("guia.donarstep.4", "Tu donación genera un cambio real")
    ];

    return {
      reciclar: {
        badge: tr("nav.reciclar", "Reciclar"),
        order: ["plastico", "papel", "vidrio", "metal", "electronicos", "ropa", "libros"],
        items: {
          plastico: {
            label: tr("guia.chip.plastico.label", "Plástico"),
            title: tr("guia.chip.plastico.title", "Plástico"),
            desc: tr("guia.chip.plastico.desc", "El plástico puede tener muchas vidas más si lo reciclas correctamente."),
            steps: [
              tr("guia.chip.plastico.step1", "Límpialo y enjuágalo"),
              tr("guia.chip.plastico.step2", "Sécalo bien"),
              tr("guia.chip.plastico.step3", "Retira tapas y etiquetas"),
              tr("guia.chip.plastico.step4", "Llévalo a un punto de reciclaje")
            ]
          },
          papel: {
            label: tr("guia.chip.papel.label", "Papel"),
            title: tr("guia.chip.papel.title", "Papel y cartón"),
            desc: tr("guia.chip.papel.desc", "El papel puede reciclarse varias veces antes de perder su fibra útil."),
            steps: [
              tr("guia.chip.papel.step1", "Retira grapas y clips"),
              tr("guia.chip.papel.step2", "Evita que se moje"),
              tr("guia.chip.papel.step3", "Dóblalo o aplánalo"),
              tr("guia.chip.papel.step4", "Llévalo a un punto de reciclaje")
            ]
          },
          vidrio: {
            label: tr("guia.chip.vidrio.label", "Vidrio"),
            title: tr("guia.chip.vidrio.title", "Vidrio"),
            desc: tr("guia.chip.vidrio.desc", "El vidrio es 100% reciclable y se puede reutilizar de forma indefinida."),
            steps: [
              tr("guia.chip.vidrio.step1", "Enjuágalo"),
              tr("guia.chip.vidrio.step2", "Retira tapas metálicas"),
              tr("guia.chip.vidrio.step3", "No lo rompas para transportarlo"),
              tr("guia.chip.vidrio.step4", "Deposítalo en el contenedor de vidrio")
            ]
          },
          metal: {
            label: tr("guia.chip.metal.label", "Metal"),
            title: tr("guia.chip.metal.title", "Metal"),
            desc: tr("guia.chip.metal.desc", "Latas y objetos metálicos se transforman en nuevos productos con enorme ahorro de energía."),
            steps: [
              tr("guia.chip.metal.step1", "Enjuágalo"),
              tr("guia.chip.metal.step2", "Aplasta las latas si puedes"),
              tr("guia.chip.metal.step3", "Sepáralo de otros materiales"),
              tr("guia.chip.metal.step4", "Llévalo a un punto de reciclaje")
            ]
          },
          electronicos: {
            label: tr("guia.chip.electronicos.label", "Electrónicos"),
            title: tr("guia.chip.electronicos.title", "Electrónicos"),
            desc: tr("guia.chip.electronicos.desc", "Requieren un manejo especial: nunca los tires con la basura común."),
            steps: [
              tr("guia.chip.electronicos.step1", "Borra tus datos personales"),
              tr("guia.chip.electronicos.step2", "Retira baterías si es posible"),
              tr("guia.chip.electronicos.step3", "Guárdalo en una caja"),
              tr("guia.chip.electronicos.step4", "Llévalo a un punto especializado")
            ]
          },
          ropa: {
            label: tr("guia.chip.ropa.label", "Ropa y Textiles"),
            title: tr("guia.chip.ropa.title", "Ropa y textiles"),
            desc: tr("guia.chip.ropa.desc", "La ropa en buen estado puede donarse; la que no, también puede reciclarse como textil."),
            steps: [
              tr("guia.chip.ropa.step1", "Verifica que esté limpia"),
              tr("guia.chip.ropa.step2", "Sepárala por tipo"),
              tr("guia.chip.ropa.step3", "Dóblala o empácala"),
              tr("guia.chip.ropa.step4", "Dónala o llévala a un punto textil")
            ]
          },
          libros: {
            label: tr("guia.chip.libros.label", "Libros"),
            title: tr("guia.chip.libros.title", "Libros"),
            desc: tr("guia.chip.libros.desc", "Un libro que ya no lees puede abrirle una puerta a otra persona."),
            steps: [
              tr("guia.chip.libros.step1", "Revisa que estén completos"),
              tr("guia.chip.libros.step2", "Agrúpalos por tema"),
              tr("guia.chip.libros.step3", "Empácalos bien"),
              tr("guia.chip.libros.step4", "Dónalos a una biblioteca o punto de acopio")
            ]
          }
        }
      },
      donar: {
        badge: tr("nav.donar", "Donar"),
        order: ["ropa", "libros", "juguetes", "muebles", "electronicos", "otro"],
        items: {
          ropa: {
            label: tr("guia.chip.donar_ropa.label", "Ropa y calzado"),
            title: tr("guia.chip.donar_ropa.title", "Ropa y calzado"),
            desc: tr("guia.chip.donar_ropa.desc", "Dona prendas y calzado en buen estado. Alguien cerca de ti los está esperando."),
            steps: donarSteps
          },
          libros: {
            label: tr("guia.chip.donar_libros.label", "Libros y útiles"),
            title: tr("guia.chip.donar_libros.title", "Libros y útiles escolares"),
            desc: tr("guia.chip.donar_libros.desc", "Libros, cuadernos y material escolar pueden abrirle puertas a otra persona."),
            steps: donarSteps
          },
          juguetes: {
            label: tr("guia.chip.juguetes.label", "Juguetes"),
            title: tr("guia.chip.juguetes.title", "Juguetes"),
            desc: tr("guia.chip.juguetes.desc", "Un juguete que ya no usas puede alegrarle el día a un niño o niña."),
            steps: donarSteps
          },
          muebles: {
            label: tr("guia.chip.muebles.label", "Muebles"),
            title: tr("guia.chip.muebles.title", "Muebles"),
            desc: tr("guia.chip.muebles.desc", "Sillas, mesas o estantes en buen estado pueden encontrar un nuevo hogar."),
            steps: donarSteps
          },
          electronicos: {
            label: tr("guia.chip.donar_electronicos.label", "Electrónicos"),
            title: tr("guia.chip.donar_electronicos.title", "Electrónicos"),
            desc: tr("guia.chip.donar_electronicos.desc", "Celulares, tablets o computadoras que aún funcionan pueden seguir siendo útiles."),
            steps: donarSteps
          },
          otro: {
            label: tr("guia.chip.otro.label", "Otro"),
            title: tr("guia.chip.otro.title", "¿No encuentras tu categoría?"),
            desc: tr("guia.chip.otro.desc", "Publícala igual: seguro alguien la está buscando."),
            steps: donarSteps
          }
        }
      }
    };
  }

  var DATA = buildData();

  function buildChips(mode) {
    var chipsWrap = document.getElementById("ghChips");
    if (!chipsWrap) return;
    chipsWrap.innerHTML = "";
    DATA[mode].order.forEach(function (key, i) {
      var item = DATA[mode].items[key];
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "gh-chip" + (i === 0 ? " active" : "");
      chip.dataset.key = key;
      chip.innerHTML = (ICONS[key] || "") + "<span>" + item.label + "</span>";
      chip.addEventListener("click", function () {
        chipsWrap.querySelectorAll(".gh-chip.active").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        renderPanel(mode, key);
      });
      chipsWrap.appendChild(chip);
    });
  }

  var currentMode = "reciclar";
  var currentKey = null;

  function renderPanel(mode, key) {
    var item = DATA[mode].items[key];
    if (!item) return;
    currentMode = mode;
    currentKey = key;
    var icon = document.getElementById("ghPanelIcon");
    var badge = document.getElementById("ghPanelBadge");
    var title = document.getElementById("ghPanelTitle");
    var desc = document.getElementById("ghPanelDesc");
    var steps = document.getElementById("ghPanelSteps");
    var cta = document.getElementById("ghPanelCta");

    if (icon) icon.innerHTML = ICONS[key] || "";
    if (badge) badge.textContent = mode === "reciclar"
      ? tr("guia.panel.badge.reciclar", "Cómo reciclarlo")
      : tr("guia.panel.badge.donar", "Cómo donarlo");
    if (title) title.textContent = item.title;
    if (desc) desc.textContent = item.desc;
    if (steps) {
      steps.innerHTML = "";
      item.steps.forEach(function (s) {
        var li = document.createElement("li");
        li.textContent = s;
        steps.appendChild(li);
      });
    }
    if (cta) {
      if (mode === "reciclar") {
        cta.textContent = tr("guia.panel.cta.reciclar", "Encuentra un punto de reciclaje →");
        cta.href = "mapa.html";
      } else {
        cta.textContent = tr("guia.panel.cta.donar", "Ir a Donar / Ayuda →");
        cta.href = "donar.html";
      }
    }
  }

  function setMode(mode) {
    var wrap = document.getElementById("ghGuide");
    if (!wrap) return;
    wrap.dataset.mode = mode;
    document.querySelectorAll(".gh-switch__btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.mode === mode);
    });
    buildChips(mode);
    renderPanel(mode, DATA[mode].order[0]);
  }

  // Reconstruye DATA con las traducciones del nuevo idioma y vuelve a
  // pintar chips + panel, conservando el modo y la categoría seleccionada.
  function refreshOnLangChange() {
    DATA = buildData();
    var wrap = document.getElementById("ghGuide");
    if (!wrap) return;
    var keyToKeep = (currentKey && DATA[currentMode].items[currentKey]) ? currentKey : DATA[currentMode].order[0];
    buildChips(currentMode);
    var chipsWrap = document.getElementById("ghChips");
    if (chipsWrap) {
      chipsWrap.querySelectorAll(".gh-chip").forEach(function (c) {
        c.classList.toggle("active", c.dataset.key === keyToKeep);
      });
    }
    renderPanel(currentMode, keyToKeep);
  }
  document.addEventListener("reco:langchange", refreshOnLangChange);

  ready(function () {
    // Switch Reciclar/Donar
    document.querySelectorAll(".gh-switch__btn").forEach(function (btn) {
      btn.addEventListener("click", function () { setMode(btn.dataset.mode); });
    });
    if (document.getElementById("ghGuide")) setMode("reciclar");

    // Accesos rápidos del hero: enlazan a la guía en el modo correcto
    document.querySelectorAll("[data-gh-goto]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var target = document.getElementById("gh-guide");
        if (!target) return;
        var mode = el.getAttribute("data-gh-goto");
        if (mode === "reciclar" || mode === "donar") {
          e.preventDefault();
          setMode(mode);
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // Reveal on scroll
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          o.unobserve(entry.target);
        });
      }, { threshold: 0.14 });
      document.querySelectorAll(".gh-reveal").forEach(function (el) { obs.observe(el); });
    } else {
      document.querySelectorAll(".gh-reveal").forEach(function (el) { el.classList.add("is-visible"); });
    }

    // Nota: el botón "Ver todos los videos" del sidebar ahora es un
    // enlace real a videos.html (biblioteca de videos con filtro por
    // categoría), por lo que ya no necesita JS aquí.
  });
})();
