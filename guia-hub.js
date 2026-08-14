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

  var DATA = {
    reciclar: {
      badge: "Reciclar",
      order: ["plastico", "papel", "vidrio", "metal", "electronicos", "ropa", "libros"],
      items: {
        plastico: {
          label: "Plástico",
          title: "Plástico",
          desc: "El plástico puede tener muchas vidas más si lo reciclas correctamente.",
          steps: ["Límpialo y enjuágalo", "Sécalo bien", "Retira tapas y etiquetas", "Llévalo a un punto de reciclaje"]
        },
        papel: {
          label: "Papel",
          title: "Papel y cartón",
          desc: "El papel puede reciclarse varias veces antes de perder su fibra útil.",
          steps: ["Retira grapas y clips", "Evita que se moje", "Dóblalo o aplánalo", "Llévalo a un punto de reciclaje"]
        },
        vidrio: {
          label: "Vidrio",
          title: "Vidrio",
          desc: "El vidrio es 100% reciclable y se puede reutilizar de forma indefinida.",
          steps: ["Enjuágalo", "Retira tapas metálicas", "No lo rompas para transportarlo", "Deposítalo en el contenedor de vidrio"]
        },
        metal: {
          label: "Metal",
          title: "Metal",
          desc: "Latas y objetos metálicos se transforman en nuevos productos con enorme ahorro de energía.",
          steps: ["Enjuágalo", "Aplasta las latas si puedes", "Sepáralo de otros materiales", "Llévalo a un punto de reciclaje"]
        },
        electronicos: {
          label: "Electrónicos",
          title: "Electrónicos",
          desc: "Requieren un manejo especial: nunca los tires con la basura común.",
          steps: ["Borra tus datos personales", "Retira baterías si es posible", "Guárdalo en una caja", "Llévalo a un punto especializado"]
        },
        ropa: {
          label: "Ropa y Textiles",
          title: "Ropa y textiles",
          desc: "La ropa en buen estado puede donarse; la que no, también puede reciclarse como textil.",
          steps: ["Verifica que esté limpia", "Sepárala por tipo", "Dóblala o empácala", "Dónala o llévala a un punto textil"]
        },
        libros: {
          label: "Libros",
          title: "Libros",
          desc: "Un libro que ya no lees puede abrirle una puerta a otra persona.",
          steps: ["Revisa que estén completos", "Agrúpalos por tema", "Empácalos bien", "Dónalos a una biblioteca o punto de acopio"]
        }
      }
    },
    donar: {
      badge: "Donar",
      order: ["ropa", "libros", "juguetes", "muebles", "electronicos", "otro"],
      items: {
        ropa: {
          label: "Ropa y calzado",
          title: "Ropa y calzado",
          desc: "Dona prendas y calzado en buen estado. Alguien cerca de ti los está esperando.",
          steps: ["Publicas lo que quieres donar", "Buscamos a quien lo necesita", "Coordinan la entrega de forma segura", "Tu donación genera un cambio real"]
        },
        libros: {
          label: "Libros y útiles",
          title: "Libros y útiles escolares",
          desc: "Libros, cuadernos y material escolar pueden abrirle puertas a otra persona.",
          steps: ["Publicas lo que quieres donar", "Buscamos a quien lo necesita", "Coordinan la entrega de forma segura", "Tu donación genera un cambio real"]
        },
        juguetes: {
          label: "Juguetes",
          title: "Juguetes",
          desc: "Un juguete que ya no usas puede alegrarle el día a un niño o niña.",
          steps: ["Publicas lo que quieres donar", "Buscamos a quien lo necesita", "Coordinan la entrega de forma segura", "Tu donación genera un cambio real"]
        },
        muebles: {
          label: "Muebles",
          title: "Muebles",
          desc: "Sillas, mesas o estantes en buen estado pueden encontrar un nuevo hogar.",
          steps: ["Publicas lo que quieres donar", "Buscamos a quien lo necesita", "Coordinan la entrega de forma segura", "Tu donación genera un cambio real"]
        },
        electronicos: {
          label: "Electrónicos",
          title: "Electrónicos",
          desc: "Celulares, tablets o computadoras que aún funcionan pueden seguir siendo útiles.",
          steps: ["Publicas lo que quieres donar", "Buscamos a quien lo necesita", "Coordinan la entrega de forma segura", "Tu donación genera un cambio real"]
        },
        otro: {
          label: "Otro",
          title: "¿No encuentras tu categoría?",
          desc: "Publícala igual: seguro alguien la está buscando.",
          steps: ["Publicas lo que quieres donar", "Buscamos a quien lo necesita", "Coordinan la entrega de forma segura", "Tu donación genera un cambio real"]
        }
      }
    }
  };

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

  function renderPanel(mode, key) {
    var item = DATA[mode].items[key];
    if (!item) return;
    var icon = document.getElementById("ghPanelIcon");
    var badge = document.getElementById("ghPanelBadge");
    var title = document.getElementById("ghPanelTitle");
    var desc = document.getElementById("ghPanelDesc");
    var steps = document.getElementById("ghPanelSteps");
    var cta = document.getElementById("ghPanelCta");

    if (icon) icon.innerHTML = ICONS[key] || "";
    if (badge) badge.textContent = mode === "reciclar" ? "Cómo reciclarlo" : "Cómo donarlo";
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
        cta.textContent = "Encuentra un punto de reciclaje →";
        cta.href = "mapa.html";
      } else {
        cta.textContent = "Ir a Donar / Ayuda →";
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

    // Botón "Ver todos los videos" del sidebar → ancla a la guía
    var sideBtn = document.querySelector(".gh-learn__side-btn");
    if (sideBtn) {
      sideBtn.addEventListener("click", function () {
        var target = document.querySelector(".gh-guide");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  });
})();
