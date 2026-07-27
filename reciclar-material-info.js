/**
 * reciclar-material-info.js
 * Hace funcional la sección "¿Qué deseas reciclar?": al hacer clic
 * en un material, despliega un panel con cómo prepararlo, dónde
 * llevarlo y qué se obtiene al reciclarlo — tal como promete
 * .rc-note.
 *
 * Capa 100% aditiva: no modifica reciclar.js. Escucha el mismo
 * click en .rc-material (además del listener ya existente que
 * solo alterna la clase .active) e inserta/actualiza un panel
 * .rc-minfo justo después de .rc-note dentro de .rc-panel.
 *
 * Cárgalo DESPUÉS de reciclar.js:
 * <script src="reciclar-material-info.js"></script>
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

  // Ícono reutilizado de cada .rc-material__icon (mismo SVG que ya
  // existe en el HTML, para no duplicar mantenimiento de íconos).
  function getMaterialIconSVG(materialEl) {
    var icon = materialEl.querySelector(".rc-material__icon svg");
    return icon ? icon.outerHTML : "";
  }

  function getMaterialLabel(materialEl) {
    var span = materialEl.querySelector("span:not(.rc-material__icon)");
    return span ? span.textContent.trim() : "";
  }

  // ── Base de datos de materiales ──
  // reciclable: true/false controla el badge (verde "Reciclable" /
  // ámbar "Requiere punto especial").
  // impacto: frase corta de cierre, coherente con la calculadora
  // de impacto de la misma página (no repite cifras exactas, solo
  // contextualiza).
  var MATERIALS = {
    electronicos: {
      badge: "Requiere punto especial",
      warn: true,
      preparacion: [
        "Borra tus datos personales y haz respaldo antes de entregarlo.",
        "Retira baterías o pilas si el dispositivo lo permite.",
        "Entrégalo completo, sin desarmar ni retirar piezas internas."
      ],
      lugares: [
        { nombre: "Centros de acopio electrónico", detalle: "Recomendado" },
        { nombre: "Puntos de marcas participantes", detalle: "Según fabricante" },
        { nombre: "Campañas municipales de e-waste", detalle: "Temporales" }
      ],
      obtienes: [
        "Se recuperan metales como oro, cobre y aluminio.",
        "Se evita la filtración de componentes tóxicos al suelo.",
        "Partes reutilizables alargan la vida de otros equipos."
      ],
      impacto: "Cada equipo evita contaminación por plomo y mercurio."
    },
    celulares: {
      badge: "Requiere punto especial",
      warn: true,
      preparacion: [
        "Haz respaldo de tus fotos y contactos, luego borra el equipo.",
        "Retira la funda, chip SIM y tarjeta de memoria.",
        "Si la batería está hinchada, no la manipules: entrégala así."
      ],
      lugares: [
        { nombre: "Puntos de recolección de operadoras", detalle: "Recomendado" },
        { nombre: "Centros de acopio electrónico", detalle: "Alternativa" }
      ],
      obtienes: [
        "Se recuperan metales preciosos de la placa base.",
        "Equipos funcionales pueden reacondicionarse y donarse.",
        "Se evita que baterías dañadas terminen en rellenos sanitarios."
      ],
      impacto: "Un celular reciclado recupera hasta 30 materiales distintos."
    },
    plastico: {
      badge: "Reciclable",
      warn: false,
      preparacion: [
        "Enjuaga el envase para retirar restos de comida o líquido.",
        "Retira tapas y etiquetas si son de un material distinto.",
        "Aplástalo para ahorrar espacio, sin romperlo en pedazos pequeños."
      ],
      lugares: [
        { nombre: "Contenedores de reciclaje municipal", detalle: "Recomendado" },
        { nombre: "Centros de acopio de plásticos", detalle: "Mayor volumen" }
      ],
      obtienes: [
        "Se transforma en fibra textil, mobiliario o nuevos envases.",
        "Reduce la extracción de petróleo para plástico virgen.",
        "Disminuye la cantidad de plástico que llega a ríos y mares."
      ],
      impacto: "Reciclar 1 kg de plástico ahorra cerca de 2 kg de CO₂."
    },
    metal: {
      badge: "Reciclable",
      warn: false,
      preparacion: [
        "Enjuaga latas y envases metálicos para quitar residuos.",
        "Separa tapas de plástico o vidrio si vienen combinadas.",
        "No es necesario aplastar las latas, pero ayuda al transporte."
      ],
      lugares: [
        { nombre: "Contenedores de reciclaje municipal", detalle: "Recomendado" },
        { nombre: "Chatarrerías y centros de acopio metálico", detalle: "Mayor volumen" }
      ],
      obtienes: [
        "El metal se funde y reutiliza casi sin perder calidad.",
        "Ahorra energía frente a la extracción de metal nuevo.",
        "Reduce la minería y su impacto ambiental asociado."
      ],
      impacto: "El aluminio reciclado usa hasta 95% menos energía que el nuevo."
    },
    papel: {
      badge: "Reciclable",
      warn: false,
      preparacion: [
        "Mantenlo seco: el papel mojado no se puede reciclar.",
        "Retira clips, grapas y espirales metálicas.",
        "Separa el papel encerado o plastificado, que no aplica aquí."
      ],
      lugares: [
        { nombre: "Contenedores de reciclaje municipal", detalle: "Recomendado" },
        { nombre: "Centros de acopio de papel y cartón", detalle: "Mayor volumen" }
      ],
      obtienes: [
        "Se convierte en nuevo papel, cartón o empaques.",
        "Cada tonelada reciclada salva árboles de tala directa.",
        "Reduce el consumo de agua frente a producir papel virgen."
      ],
      impacto: "Reciclar papel ahorra agua, energía y árboles en pie."
    },
    vidrio: {
      badge: "Reciclable",
      warn: false,
      preparacion: [
        "Enjuaga el envase y retira tapas metálicas o plásticas.",
        "No es necesario quitar etiquetas de papel.",
        "Envuelve el vidrio roto para evitar accidentes al transportarlo."
      ],
      lugares: [
        { nombre: "Contenedores de reciclaje municipal", detalle: "Recomendado" },
        { nombre: "Centros de acopio de vidrio", detalle: "Mayor volumen" }
      ],
      obtienes: [
        "El vidrio se funde y reutiliza infinitas veces sin perder calidad.",
        "Se ahorra energía frente a fabricar vidrio desde materia prima.",
        "Se reduce la extracción de arena y otros minerales."
      ],
      impacto: "El vidrio es 100% reciclable sin perder pureza ni calidad."
    },
    ropa: {
      badge: "Reciclable / Donable",
      warn: false,
      preparacion: [
        "Lava y seca la ropa antes de entregarla.",
        "Separa piezas en buen estado (donación) de las dañadas (textil).",
        "Junta pares de zapatos y accesorios para facilitar la entrega."
      ],
      lugares: [
        { nombre: "Fundaciones y bancos de ropa", detalle: "Si está en buen estado" },
        { nombre: "Puntos de acopio textil", detalle: "Ropa dañada o incompleta" }
      ],
      obtienes: [
        "Prendas en buen estado ayudan directamente a otras familias.",
        "La ropa dañada se transforma en trapos industriales o relleno.",
        "Se reduce la demanda de fibras textiles nuevas."
      ],
      impacto: "Donar una prenda puede darle hasta 3 vidas útiles más."
    },
    muebles: {
      badge: "Reutilizable",
      warn: false,
      preparacion: [
        "Verifica que el mueble esté funcional o fácilmente reparable.",
        "Límpialo y, si puedes, toma fotos para facilitar la donación.",
        "Desarma piezas grandes solo si esto no daña la estructura."
      ],
      lugares: [
        { nombre: "Fundaciones y bancos de muebles", detalle: "Si está en buen estado" },
        { nombre: "Puntos de acopio de madera y metal", detalle: "Muebles dañados" }
      ],
      obtienes: [
        "Muebles reutilizables equipan hogares que los necesitan.",
        "La madera y el metal se pueden separar y reciclar por tipo.",
        "Se evita el volumen de relleno sanitario que ocupan los muebles."
      ],
      impacto: "Un mueble donado reduce directamente residuos voluminosos."
    },
    libros: {
      badge: "Reutilizable",
      warn: false,
      preparacion: [
        "Verifica que estén completos y en buen estado de lectura.",
        "Retira separadores, notas adhesivas o material suelto.",
        "Agrúpalos por tema o nivel escolar si vas a donarlos."
      ],
      lugares: [
        { nombre: "Bibliotecas comunitarias y escuelas", detalle: "Recomendado" },
        { nombre: "Centros de acopio de papel", detalle: "Si están muy deteriorados" }
      ],
      obtienes: [
        "Libros en buen estado llegan a nuevos lectores.",
        "Los que no se pueden reutilizar se reciclan como papel.",
        "Se fomenta el acceso a la lectura en comunidades con menos recursos."
      ],
      impacto: "Un libro donado puede pasar por decenas de lectores más."
    },
    juguetes: {
      badge: "Reutilizable",
      warn: false,
      preparacion: [
        "Límpialos y verifica que funcionen o estén completos.",
        "Junta piezas sueltas del mismo juguete en una bolsa.",
        "Retira pilas si el juguete las usa."
      ],
      lugares: [
        { nombre: "Fundaciones y campañas de juguetes", detalle: "Recomendado" },
        { nombre: "Centros de acopio según material", detalle: "Juguetes dañados" }
      ],
      obtienes: [
        "Juguetes funcionales alegran a otros niños directamente.",
        "Piezas plásticas o metálicas pueden reciclarse por separado.",
        "Se reduce la producción de juguetes nuevos y su huella asociada."
      ],
      impacto: "Donar juguetes reduce residuos y genera impacto social directo."
    },
    baterias: {
      badge: "Requiere punto especial",
      warn: true,
      preparacion: [
        "Nunca las tires a la basura común ni al reciclaje mixto.",
        "Cubre los polos con cinta si están sueltas, para evitar cortocircuitos.",
        "Si están hinchadas o dañadas, transpórtalas con cuidado extra."
      ],
      lugares: [
        { nombre: "Puntos de acopio de baterías", detalle: "Obligatorio" },
        { nombre: "Tiendas de electrónica participantes", detalle: "Alternativa" }
      ],
      obtienes: [
        "Se evita la contaminación de suelo y agua por metales pesados.",
        "Se recuperan materiales como litio, níquel y cadmio.",
        "Se previene el riesgo de incendios por descarte inadecuado."
      ],
      impacto: "Una sola batería mal desechada puede contaminar litros de agua."
    },
    bombillos: {
      badge: "Requiere punto especial",
      warn: true,
      preparacion: [
        "Transpórtalos con cuidado para evitar que se rompan.",
        "Si es un bombillo ahorrador o fluorescente, no lo tires con la basura.",
        "Guárdalo en su empaque original si aún lo conservas."
      ],
      lugares: [
        { nombre: "Puntos de acopio de residuos especiales", detalle: "Obligatorio" },
        { nombre: "Tiendas de iluminación participantes", detalle: "Alternativa" }
      ],
      obtienes: [
        "Se evita la liberación de mercurio en bombillos fluorescentes.",
        "Se recuperan vidrio y componentes metálicos internos.",
        "Se reduce el riesgo de contaminación en rellenos sanitarios."
      ],
      impacto: "Los bombillos fluorescentes requieren manejo especial por su mercurio."
    }
  };

  var ICONS = {
    prep: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" width="14" height="14"><path d="M10 2l1.5 3.5L15 7l-3.5 1.5L10 12l-1.5-3.5L5 7l3.5-1.5L10 2z"/><circle cx="15.5" cy="14.5" r="2"/></svg>',
    lugar: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" width="14" height="14"><path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z"/><circle cx="10" cy="8" r="2"/></svg>',
    obtienes: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" width="14" height="14"><path d="M10 3v3M10 3c-2.5 0-4 2-4 4 0 1.5 1 2.5 2 3l-1 5h6l-1-5c1-.5 2-1.5 2-3 0-2-1.5-4-4-4z"/></svg>',
    mapa: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15"><path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z"/><circle cx="10" cy="8" r="2"/></svg>'
  };

  function renderList(items) {
    return items.map(function (t) { return "<li>" + t + "</li>"; }).join("");
  }

  function renderLugares(lugares) {
    return lugares.map(function (l) {
      return (
        '<div class="rc-minfo__point"><strong>' + l.nombre + "</strong><span>" + l.detalle + "</span></div>"
      );
    }).join("");
  }

  function buildPanelHTML(materialKey, materialEl) {
    var data = MATERIALS[materialKey];
    if (!data) return "";

    var label = getMaterialLabel(materialEl);
    var iconSVG = getMaterialIconSVG(materialEl);
    var badgeClass = data.warn ? "rc-minfo__badge warn" : "rc-minfo__badge";
    var badgeIcon = data.warn
      ? '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" width="11" height="11"><path d="M10 3l8 14H2L10 3z"/><line x1="10" y1="8.5" x2="10" y2="12"/><circle cx="10" cy="14.5" r="0.6" fill="currentColor"/></svg>'
      : '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M4 10l4 4 8-8"/></svg>';

    return (
      '<div class="rc-minfo__inner">' +
        '<div class="rc-minfo__head">' +
          '<span class="rc-minfo__icon">' + iconSVG + "</span>" +
          "<div>" +
            '<div class="rc-minfo__title">' + label + "</div>" +
            '<span class="' + badgeClass + '">' + badgeIcon + data.badge + "</span>" +
          "</div>" +
        "</div>" +

        '<div class="rc-minfo__grid">' +
          '<div class="rc-minfo__block">' +
            '<div class="rc-minfo__block-head">' + ICONS.prep + "<span>Cómo prepararlo</span></div>" +
            "<ul>" + renderList(data.preparacion) + "</ul>" +
          "</div>" +

          '<div class="rc-minfo__block">' +
            '<div class="rc-minfo__block-head">' + ICONS.lugar + "<span>Dónde llevarlo</span></div>" +
            '<div class="rc-minfo__points">' + renderLugares(data.lugares) + "</div>" +
          "</div>" +

          '<div class="rc-minfo__block">' +
            '<div class="rc-minfo__block-head">' + ICONS.obtienes + "<span>Qué se obtiene</span></div>" +
            "<ul>" + renderList(data.obtienes) + "</ul>" +
          "</div>" +
        "</div>" +

        '<div class="rc-minfo__footer">' +
          '<span class="rc-minfo__impact">' + ICONS.obtienes + '<strong>Impacto:</strong>&nbsp;' + data.impacto + "</span>" +
          '<a class="rc-minfo__cta" href="mapa.html?material=' + encodeURIComponent(materialKey) + '">' +
            ICONS.mapa + "<span>Ver puntos en el mapa</span>" +
          "</a>" +
        "</div>" +
      "</div>"
    );
  }

  ready(function () {
    var materialsWrap = document.getElementById("rcMaterials");
    if (!materialsWrap) return;

    var panel = document.getElementById("rcMaterialInfo");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "rcMaterialInfo";
      panel.className = "rc-minfo";
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-live", "polite");
      // Se inserta después de .rc-note, dentro del mismo .rc-panel
      var note = materialsWrap.parentElement.querySelector(".rc-note");
      if (note && note.parentElement) {
        note.parentElement.insertBefore(panel, note.nextSibling);
      } else {
        materialsWrap.parentElement.appendChild(panel);
      }
    }

    function showMaterial(materialEl, opts) {
      var key = materialEl.getAttribute("data-material");
      if (!key || !MATERIALS[key]) return;
      panel.innerHTML = buildPanelHTML(key, materialEl);
      panel.classList.add("rc-minfo--open");
      if (!opts || !opts.silent) {
        // Desplaza suavemente el panel a la vista si quedó fuera
        // (por ejemplo, en pantallas pequeñas tras varios cambios).
        requestAnimationFrame(function () {
          var rect = panel.getBoundingClientRect();
          var fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (!fullyVisible) {
            panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      }
    }

    // El listener existente en reciclar.js ya alterna .active; aquí
    // solo añadimos el despliegue de información, sin interferir.
    document.querySelectorAll(".rc-material").forEach(function (m) {
      m.addEventListener("click", function () {
        showMaterial(m);
      });
      // Accesibilidad: activar también con teclado (Enter/Espacio)
      // si el elemento es focuseable.
      m.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          showMaterial(m);
        }
      });
    });

    // Estado inicial: el HTML ya trae "plástico" como .active,
    // así que mostramos su info sin animación de scroll al cargar.
    var initial = document.querySelector(".rc-material.active") || document.querySelector(".rc-material");
    if (initial) showMaterial(initial, { silent: true });

    // ── API pública (capa aditiva) ──
    // Permite que otros scripts (ej. reciclar-scanner.js, el escáner
    // con IA) reutilicen esta misma base de datos y panel de info
    // sin duplicar contenido ni reconstruir el HTML por su cuenta.
    window.recoMaterialInfo = {
      keys: Object.keys(MATERIALS),
      has: function (key) { return !!MATERIALS[key]; },
      getLabel: function (key) {
        var el = document.querySelector('.rc-material[data-material="' + key + '"]');
        return el ? getMaterialLabel(el) : key;
      },
      // Activa visualmente el material (marca .active en su botón)
      // y despliega su panel de información, igual que un click manual.
      showByKey: function (key, opts) {
        var el = document.querySelector('.rc-material[data-material="' + key + '"]');
        if (!el || !MATERIALS[key]) return false;
        document.querySelectorAll(".rc-material").forEach(function (x) {
          x.classList.remove("active");
        });
        el.classList.add("active");
        showMaterial(el, opts);
        return true;
      }
    };
  });
})();