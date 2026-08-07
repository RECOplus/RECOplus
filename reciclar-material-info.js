/**
 * reciclar-material-info.js
 * Hace funcional la sección "¿Qué deseas reciclar?": al hacer clic
 * en un material, despliega una VENTANA (modal) centrada con cómo
 * prepararlo, dónde llevarlo y qué se obtiene al reciclarlo — tal
 * como promete .rc-note. La ventana se puede recorrer material por
 * material con los botones "Anterior/Siguiente" o con las flechas
 * ← → del teclado, sin cerrarla.
 *
 * Capa 100% aditiva: no modifica reciclar.js. Escucha el mismo
 * click en .rc-material (además del listener ya existente que
 * solo alterna la clase .active) y crea/actualiza una ventana
 * modal (#rcMaterialInfoOverlay > #rcMaterialInfo) como hijo
 * directo de <body>, fuera del flujo de .rc-panel — así la sección
 * de materiales ya no se alarga verticalmente al mostrar la info.
 *
 * FUENTE DE VERDAD (tabla `categorias` en Supabase):
 * -------------------------------------------------------------
 * Todo el contenido (badge, preparación, lugares, qué se obtiene,
 * impacto, y el mensaje de "es/no es reciclable") se carga una vez
 * desde la tabla `categorias` de Supabase — la MISMA que usa el
 * escáner (reciclar-scanner.js) y el escaneo con IA (api/classify.js).
 * Así los tres quedan siempre sincronizados con un solo lugar donde
 * editar la información.
 *
 * Mientras esa carga termina (o si falla, ej. sin internet), se usa
 * un respaldo local (MATERIALS_RESPALDO) idéntico al contenido
 * original, para que el panel nunca se muestre vacío. En cuanto los
 * datos de Supabase llegan, si la ventana ya está abierta, su
 * contenido se refresca solo con la versión más actualizada.
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

  // ── Respaldo local ──
  // Se usa mientras cargan los datos de Supabase, o si la carga
  // falla. Mismo contenido que tenía este archivo originalmente.
  // reciclable: true/false controla el badge (verde "Reciclable" /
  // ámbar "Requiere punto especial").
  // impacto: frase corta de cierre, coherente con la calculadora
  // de impacto de la misma página (no repite cifras exactas, solo
  // contextualiza).
  var MATERIALS_RESPALDO = {
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
    },
    carton: {
      badge: "Reciclable",
      warn: false,
      preparacion: [
        "Desarma o aplasta las cajas para ahorrar espacio.",
        "Retira cinta adhesiva, grapas y restos de plástico o poliestireno.",
        "Mantenlo seco: el cartón mojado o engrasado no se puede reciclar."
      ],
      lugares: [
        { nombre: "Contenedores de reciclaje municipal", detalle: "Recomendado" },
        { nombre: "Centros de acopio de papel y cartón", detalle: "Mayor volumen" }
      ],
      obtienes: [
        "Se convierte en nuevas cajas, empaques o papel reciclado.",
        "Cada tonelada reciclada reduce la tala de árboles.",
        "Disminuye el volumen de residuos que llega a los rellenos sanitarios."
      ],
      impacto: "El cartón puede reciclarse hasta 7 veces antes de perder calidad.",
      tipsExtra: [
        "El cartón encerado (como el de pizza con grasa) no se recicla junto al cartón normal.",
        "Guarda las cajas planas: ocupan menos espacio y facilitan el transporte al punto de acopio."
      ]
    },
    tetrapak: {
      badge: "Reciclable",
      warn: false,
      preparacion: [
        "Enjuaga el envase para retirar restos de líquido.",
        "Aplástalo para ahorrar espacio, sin necesidad de desarmarlo.",
        "Si tiene tapa de plástico, puedes dejarla puesta o separarla según el punto de acopio."
      ],
      lugares: [
        { nombre: "Contenedores de reciclaje municipal", detalle: "Recomendado" },
        { nombre: "Centros de acopio especializados en Tetra Pak", detalle: "Mayor volumen" }
      ],
      obtienes: [
        "Sus capas de cartón, plástico y aluminio se separan y reutilizan por separado.",
        "Se transforma en láminas, techos ecológicos o nuevo papel.",
        "Se reduce la cantidad de envases multicapa en rellenos sanitarios."
      ],
      impacto: "Un envase Tetra Pak combina 3 materiales que pueden recuperarse por separado.",
      tipsExtra: [
        "No es necesario retirar el plástico interior: la planta de reciclaje se encarga de separarlo.",
        "Evita aplastarlo demasiado si el punto de acopio pide entregarlo armado para facilitar el conteo."
      ]
    },
    aceite: {
      badge: "Requiere punto especial",
      warn: true,
      preparacion: [
        "Deja enfriar el aceite antes de manipularlo.",
        "Viértelo en una botella plástica limpia y ciérrala bien; nunca lo tires por el drenaje.",
        "Evita mezclarlo con agua u otros líquidos para facilitar su reciclaje."
      ],
      lugares: [
        { nombre: "Puntos de acopio de aceite usado", detalle: "Obligatorio" },
        { nombre: "Restaurantes o negocios participantes", detalle: "Alternativa" }
      ],
      obtienes: [
        "Se transforma en biodiesel u otros combustibles alternativos.",
        "Se evita la contaminación de ríos, mares y sistemas de agua potable.",
        "Se previene la obstrucción de tuberías y plantas de tratamiento."
      ],
      impacto: "Un litro de aceite mal desechado puede contaminar hasta 1,000 litros de agua.",
      tipsExtra: [
        "Nunca lo mezcles con el aceite de motor u otros químicos: son procesos de reciclaje distintos.",
        "Reutiliza el mismo envase varias veces antes de entregarlo, para acumular más cantidad de una vez."
      ]
    },
    tela: {
      badge: "Reciclable / Donable",
      warn: false,
      preparacion: [
        "Lava y seca bien la tela antes de entregarla.",
        "Separa retazos limpios y en buen estado de los muy desgastados o manchados.",
        "Corta o dobla piezas grandes para facilitar el transporte."
      ],
      lugares: [
        { nombre: "Puntos de acopio textil", detalle: "Recomendado" },
        { nombre: "Talleres de costura o reciclaje textil", detalle: "Alternativa" }
      ],
      obtienes: [
        "Se transforma en trapos industriales, relleno o nuevas fibras.",
        "Retazos en buen estado pueden reutilizarse en manualidades o costura.",
        "Se reduce la demanda de fibras textiles nuevas."
      ],
      impacto: "Reciclar textiles evita que terminen ocupando espacio en rellenos sanitarios.",
      tipsExtra: [
        "Los retazos pequeños también sirven: no los deseches solo por no ser prendas completas.",
        "Separa telas sintéticas (poliester, nylon) de las naturales (algodón, lino) si el punto de acopio lo pide."
      ]
    },
    cuero: {
      badge: "Reutilizable",
      warn: false,
      preparacion: [
        "Limpia el cuero y verifica que no tenga hongos ni mal olor.",
        "Separa piezas grandes (zapatos, carteras, cinturones) de los retazos pequeños.",
        "Evita mojarlo antes de entregarlo, ya que puede dañar el material."
      ],
      lugares: [
        { nombre: "Fundaciones y bancos de ropa", detalle: "Si está en buen estado" },
        { nombre: "Talleres de marroquinería o zapaterías", detalle: "Retazos y reparación" }
      ],
      obtienes: [
        "Artículos en buen estado pueden reutilizarse directamente.",
        "Los retazos se aprovechan en talleres para reparaciones o piezas nuevas.",
        "Se reduce la demanda de cuero nuevo y su proceso de curtido."
      ],
      impacto: "El curtido de cuero nuevo consume grandes cantidades de agua y químicos.",
      tipsExtra: [
        "Aplica una capa de acondicionador antes de guardarlo si no lo donas de inmediato, para evitar que se reseque.",
        "El cuero sintético (cuerina) no se procesa igual que el cuero real: sepáralos si sabes cuál es cuál."
      ]
    },
    utilesescolares: {
      badge: "Reutilizable",
      warn: false,
      preparacion: [
        "Verifica que cuadernos, lápices y colores estén en buen estado o con uso restante.",
        "Agrupa por tipo: escritura, dibujo, geometría, mochilas.",
        "Limpia estuches y mochilas antes de donarlos."
      ],
      lugares: [
        { nombre: "Escuelas y bibliotecas comunitarias", detalle: "Recomendado" },
        { nombre: "Fundaciones educativas", detalle: "Alternativa" }
      ],
      obtienes: [
        "Útiles en buen estado llegan directamente a estudiantes que los necesitan.",
        "Se reduce el desperdicio de materiales escolares aún funcionales.",
        "Se facilita el acceso a la educación en comunidades con menos recursos."
      ],
      impacto: "Donar útiles escolares reduce directamente la barrera económica de estudiar.",
      tipsExtra: [
        "Los lápices y colores usados a la mitad también sirven: no necesitan estar nuevos.",
        "Revisa que marcadores y borradores aún funcionen antes de incluirlos en la donación."
      ]
    }
  };

  // ── Carga desde Supabase (tabla `categorias`) ──
  var categoriasCache = null; // se llena cuando responde Supabase; null mientras tanto
  var categoriasPromise = null;

  function loadCategorias() {
    if (categoriasPromise) return categoriasPromise;

    if (!window.recoSupabase) {
      categoriasPromise = Promise.resolve(null);
      return categoriasPromise;
    }

    categoriasPromise = window.recoSupabase
      .from("categorias")
      .select("id, badge, requiere_punto_especial, mensaje_escaner, preparacion, lugares, obtienes, impacto, tipo_objeto, materiales_compuestos, tiempo_descomposicion, tips_extra, alerta_seguridad, dato_curioso")
      .then(function (res) {
        if (res.error || !res.data) {
          console.warn("[RECO+ info materiales] No se pudieron cargar categorías de Supabase, usando respaldo local:", res.error && res.error.message);
          return null;
        }
        var mapa = {};
        res.data.forEach(function (fila) {
          mapa[fila.id] = fila;
        });
        categoriasCache = mapa;
        return mapa;
      })
      .catch(function (err) {
        console.warn("[RECO+ info materiales] Error consultando categorías de Supabase, usando respaldo local:", err);
        return null;
      });

    return categoriasPromise;
  }

  // Dispara la carga de inmediato (no espera al DOM).
  loadCategorias();

  /** Devuelve los datos de un material, priorizando Supabase y
   *  cayendo al respaldo local si aún no está listo o falló. */
  function getMaterialData(materialKey) {
    var fila = categoriasCache && categoriasCache[materialKey];
    if (fila) {
      return {
        badge: fila.badge,
        warn: !!fila.requiere_punto_especial,
        mensaje: fila.mensaje_escaner || "",
        preparacion: Array.isArray(fila.preparacion) ? fila.preparacion : [],
        lugares: Array.isArray(fila.lugares) ? fila.lugares : [],
        obtienes: Array.isArray(fila.obtienes) ? fila.obtienes : [],
        impacto: fila.impacto || "",
        tipoObjeto: fila.tipo_objeto || "",
        materialesCompuestos: Array.isArray(fila.materiales_compuestos) ? fila.materiales_compuestos : [],
        tiempoDescomposicion: fila.tiempo_descomposicion || "",
        tipsExtra: Array.isArray(fila.tips_extra) ? fila.tips_extra : [],
        alertaSeguridad: fila.alerta_seguridad || "",
        datoCurioso: fila.dato_curioso || ""
      };
    }
    var respaldo = MATERIALS_RESPALDO[materialKey];
    if (!respaldo) return null;
    return {
      badge: respaldo.badge,
      warn: respaldo.warn,
      mensaje: "",
      preparacion: respaldo.preparacion,
      lugares: respaldo.lugares,
      obtienes: respaldo.obtienes,
      impacto: respaldo.impacto,
      tipoObjeto: "",
      materialesCompuestos: [],
      tiempoDescomposicion: "",
      tipsExtra: Array.isArray(respaldo.tipsExtra) ? respaldo.tipsExtra : [],
      alertaSeguridad: "",
      datoCurioso: ""
    };
  }

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
    var data = getMaterialData(materialKey);
    if (!data) return "";

    var label = getMaterialLabel(materialEl);
    var iconSVG = getMaterialIconSVG(materialEl);
    var badgeClass = data.warn ? "rc-minfo__badge warn" : "rc-minfo__badge";
    var badgeIcon = data.warn
      ? '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" width="11" height="11"><path d="M10 3l8 14H2L10 3z"/><line x1="10" y1="8.5" x2="10" y2="12"/><circle cx="10" cy="14.5" r="0.6" fill="currentColor"/></svg>'
      : '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M4 10l4 4 8-8"/></svg>';

    var tieneCompuestos = data.materialesCompuestos && data.materialesCompuestos.length > 0;
    var tieneTipsExtra = data.tipsExtra && data.tipsExtra.length > 0;

    return (
      '<div class="rc-minfo__inner">' +
        '<div class="rc-minfo__head" data-minfo-section="reciclable">' +
          '<span class="rc-minfo__icon">' + iconSVG + "</span>" +
          "<div>" +
            '<div class="rc-minfo__title">' + label + "</div>" +
            '<span class="' + badgeClass + '">' + badgeIcon + data.badge + "</span>" +
          "</div>" +
        "</div>" +

        (data.mensaje ? '<p class="rc-minfo__mensaje">' + data.mensaje + "</p>" : "") +

        (data.alertaSeguridad ? '<p class="rc-minfo__alerta">⚠️ ' + data.alertaSeguridad + "</p>" : "") +

        '<div class="rc-minfo__section" data-minfo-section="categoria">' +
          (data.tipoObjeto ? '<div class="rc-minfo__categoria"><strong>Tipo de objeto:</strong> ' + data.tipoObjeto + "</div>" : "") +
          (tieneCompuestos
            ? '<div class="rc-minfo__compuestos"><strong>Materiales que lo componen:</strong> ' + data.materialesCompuestos.join(", ") + "</div>"
            : "") +
          (data.tiempoDescomposicion ? '<div class="rc-minfo__descomp"><strong>Tiempo de descomposición:</strong> ' + data.tiempoDescomposicion + "</div>" : "") +
        "</div>" +

        '<div class="rc-minfo__grid">' +
          '<div class="rc-minfo__block" data-minfo-section="preparar">' +
            '<div class="rc-minfo__block-head">' + ICONS.prep + "<span>Cómo prepararlo</span></div>" +
            "<ul>" + renderList(data.preparacion) + "</ul>" +
          "</div>" +

          '<div class="rc-minfo__block" data-minfo-section="lugares">' +
            '<div class="rc-minfo__block-head">' + ICONS.lugar + "<span>Dónde llevarlo</span></div>" +
            '<div class="rc-minfo__points">' + renderLugares(data.lugares) + "</div>" +
          "</div>" +

          '<div class="rc-minfo__block">' +
            '<div class="rc-minfo__block-head">' + ICONS.obtienes + "<span>Qué se obtiene</span></div>" +
            "<ul>" + renderList(data.obtienes) + "</ul>" +
          "</div>" +

          (tieneTipsExtra
            ? '<div class="rc-minfo__block rc-minfo__block--tips" data-minfo-section="tipsextra">' +
                '<div class="rc-minfo__block-head">' + ICONS.prep + "<span>Tips extra</span></div>" +
                "<ul>" + renderList(data.tipsExtra) + "</ul>" +
              "</div>"
            : "") +
        "</div>" +

        (data.datoCurioso ? '<p class="rc-minfo__curioso">💡 <strong>¿Sabías que…?</strong> ' + data.datoCurioso + "</p>" : "") +

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

    /* ── Ventana (modal): overlay + caja ──
       Se crea UNA sola vez, como hijo directo de <body> (fuera del
       flujo de .rc-panel), para que la información se muestre
       flotando centrada sobre la página en vez de alargar
       verticalmente la sección de materiales. */
    var overlay = document.getElementById("rcMaterialInfoOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "rcMaterialInfoOverlay";
      overlay.className = "rc-minfo-overlay";
      overlay.innerHTML =
        '<div class="rc-minfo" id="rcMaterialInfo" role="dialog" aria-modal="true" aria-label="Información del material">' +
          '<button type="button" class="rc-minfo__close" id="rcMinfoClose" aria-label="Cerrar">' +
            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          "</button>" +
          '<div class="rc-minfo__scrollbody" id="rcMinfoBody" aria-live="polite"></div>' +
          '<div class="rc-minfo__nav">' +
            '<button type="button" class="rc-minfo__navbtn rc-minfo__navbtn--prev" id="rcMinfoPrev" aria-label="Material anterior">' +
              '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M12 4l-6 6 6 6"/></svg>' +
              "<span>Anterior</span>" +
            "</button>" +
            '<span class="rc-minfo__navcount" id="rcMinfoCount"></span>' +
            '<button type="button" class="rc-minfo__navbtn rc-minfo__navbtn--next" id="rcMinfoNext" aria-label="Material siguiente">' +
              "<span>Siguiente</span>" +
              '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M8 4l6 6-6 6"/></svg>' +
            "</button>" +
          "</div>" +
        "</div>";
      document.body.appendChild(overlay);
    }

    var panel = document.getElementById("rcMaterialInfo");
    var body = document.getElementById("rcMinfoBody");
    var closeBtn = document.getElementById("rcMinfoClose");
    var prevBtn = document.getElementById("rcMinfoPrev");
    var nextBtn = document.getElementById("rcMinfoNext");
    var countEl = document.getElementById("rcMinfoCount");

    // Clave y elemento del material mostrado actualmente, para poder
    // refrescar el contenido cuando lleguen los datos de Supabase, y
    // para que "Anterior/Siguiente" y las flechas del teclado sepan
    // desde dónde navegar.
    var currentKey = null;
    var currentEl = null;
    var lastFocused = null;

    function materialsArray() {
      return Array.prototype.slice.call(document.querySelectorAll(".rc-material"));
    }

    function updateNavCount() {
      var list = materialsArray();
      var idx = currentEl ? list.indexOf(currentEl) : -1;
      countEl.textContent = (idx === -1 || !list.length) ? "" : (idx + 1) + " / " + list.length;
    }

    function isOpen() {
      return overlay.classList.contains("rc-minfo-overlay--open");
    }

    function openOverlay(opts) {
      if (!isOpen()) {
        lastFocused = document.activeElement;
        overlay.classList.add("rc-minfo-overlay--open");
        document.body.classList.add("rc-modal-open");
      }
      // Se mantiene también como marca de estado sobre el propio panel
      // (compatibilidad con reciclar-scanner-features.js, que revisa
      // esta misma clase para saber si ya hay un material mostrado).
      panel.classList.add("rc-minfo--open");
      if (!opts || !opts.silent) {
        requestAnimationFrame(function () { closeBtn.focus(); });
      }
    }

    function closeOverlay() {
      if (!isOpen()) return;
      overlay.classList.remove("rc-minfo-overlay--open");
      panel.classList.remove("rc-minfo--open");
      document.body.classList.remove("rc-modal-open");
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
      lastFocused = null;
    }

    function showMaterial(materialEl, opts) {
      var key = materialEl.getAttribute("data-material");
      if (!key || !MATERIALS_RESPALDO[key]) return;
      currentKey = key;
      currentEl = materialEl;
      body.innerHTML = buildPanelHTML(key, materialEl);
      body.scrollTop = 0;
      updateNavCount();
      openOverlay(opts);

      // Avisa a otros scripts (ej. reciclar-auto-route.js) que se
      // mostró un material, sin acoplarlos a este archivo ni al DOM
      // interno de la ventana.
      document.dispatchEvent(new CustomEvent("reco:material-shown", {
        detail: { key: key, silent: !!(opts && opts.silent) }
      }));
    }

    // Avanza/retrocede al material anterior o siguiente según el
    // orden en que aparecen en la grilla, actualiza cuál queda
    // ".active" y refresca el contenido de la ventana ya abierta —
    // así los botones y las flechas del teclado navegan sin cerrarla.
    function goToOffset(delta) {
      var list = materialsArray();
      if (!list.length) return;
      var idx = currentEl ? list.indexOf(currentEl) : -1;
      if (idx === -1) idx = 0;
      var nextEl = list[(idx + delta + list.length) % list.length];
      list.forEach(function (x) { x.classList.remove("active"); });
      nextEl.classList.add("active");
      showMaterial(nextEl, { silent: true });
    }

    // Cuando terminan de cargar las categorías de Supabase, si el
    // usuario ya tiene la ventana abierta, se refresca en el sitio
    // con el contenido actualizado (sin cerrarla ni parpadear).
    categoriasPromise.then(function (mapa) {
      if (mapa && currentKey && currentEl && isOpen()) {
        showMaterial(currentEl, { silent: true });
      }
    });

    // El listener existente en reciclar.js ya alterna .active; aquí
    // solo añadimos la apertura de la ventana, sin interferir.
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

    // ── Controles de la ventana ──
    prevBtn.addEventListener("click", function () { goToOffset(-1); });
    nextBtn.addEventListener("click", function () { goToOffset(1); });
    closeBtn.addEventListener("click", closeOverlay);
    // Clic fuera de la ventana (sobre el fondo oscurecido) la cierra.
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay();
    });
    // Flechas ← → para cambiar de material, Escape para cerrar.
    // Se ignora si el foco está en un campo de texto (ej. la
    // calculadora de impacto) para no interferir con esos inputs.
    document.addEventListener("keydown", function (e) {
      if (!isOpen()) return;
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeOverlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToOffset(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToOffset(-1);
      }
    });

    // ── API pública (capa aditiva) ──
    // Permite que otros scripts (ej. reciclar-scanner.js, el escáner
    // con IA) reutilicen esta misma base de datos y la misma ventana
    // de info sin duplicar contenido ni reconstruir el HTML por su cuenta.
    window.recoMaterialInfo = {
      keys: Object.keys(MATERIALS_RESPALDO),
      has: function (key) { return !!MATERIALS_RESPALDO[key]; },
      getLabel: function (key) {
        var el = document.querySelector('.rc-material[data-material="' + key + '"]');
        return el ? getMaterialLabel(el) : key;
      },
      // Abre la ventana con el material indicado, marcando también
      // ".active" en su botón de la grilla, igual que un clic manual.
      showByKey: function (key, opts) {
        var el = document.querySelector('.rc-material[data-material="' + key + '"]');
        if (!el || !MATERIALS_RESPALDO[key]) return false;
        document.querySelectorAll(".rc-material").forEach(function (x) {
          x.classList.remove("active");
        });
        el.classList.add("active");
        showMaterial(el, opts);
        return true;
      },
      // Cierra la ventana si está abierta.
      close: function () { closeOverlay(); },
      // Devuelve el material actualmente mostrado en la ventana (o
      // null si aún no se ha mostrado ninguno), sin exponer el
      // HTMLElement interno — solo la clave, útil para que otros
      // scripts sepan a qué material referirse sin acoplarse al DOM.
      getCurrentKey: function () { return currentKey; },
      // Devuelve el bloque de HTML de UNA sola sección ("reciclable",
      // "categoria", "preparar" o "lugares") para una clave de
      // material dada, tal cual se ve dentro de la ventana principal —
      // pensado para reusarse en otros contenedores (ej. el panel
      // del escáner) sin duplicar la lógica de buildPanelHTML ni la
      // fuente de datos (Supabase / respaldo local).
      getSectionHTML: function (key, sectionKey) {
        var data = getMaterialData(key);
        if (!data) return "";
        var el = document.querySelector('.rc-material[data-material="' + key + '"]');
        var label = el ? getMaterialLabel(el) : key;

        if (sectionKey === "reciclable") {
          var badgeClass = data.warn ? "rc-minfo__badge warn" : "rc-minfo__badge";
          var badgeIcon = data.warn
            ? '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" width="11" height="11"><path d="M10 3l8 14H2L10 3z"/><line x1="10" y1="8.5" x2="10" y2="12"/><circle cx="10" cy="14.5" r="0.6" fill="currentColor"/></svg>'
            : '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M4 10l4 4 8-8"/></svg>';
          var mensaje = data.mensaje || (data.warn ? "⚠️ Esto se recicla, pero necesita un punto especial." : "✅ Esto se recicla.");
          return (
            '<div class="rc-minfo__head">' +
              "<div>" +
                '<div class="rc-minfo__title">' + label + "</div>" +
                '<span class="' + badgeClass + '">' + badgeIcon + data.badge + "</span>" +
              "</div>" +
            "</div>" +
            '<p class="rc-minfo__mensaje">' + mensaje + "</p>" +
            (data.alertaSeguridad ? '<p class="rc-minfo__alerta">⚠️ ' + data.alertaSeguridad + "</p>" : "")
          );
        }

        if (sectionKey === "categoria") {
          var tieneCompuestos = data.materialesCompuestos && data.materialesCompuestos.length > 0;
          var out =
            (data.tipoObjeto ? '<div class="rc-minfo__categoria"><strong>Tipo de objeto:</strong> ' + data.tipoObjeto + "</div>" : "") +
            (tieneCompuestos ? '<div class="rc-minfo__compuestos"><strong>Materiales que lo componen:</strong> ' + data.materialesCompuestos.join(", ") + "</div>" : "") +
            (data.tiempoDescomposicion ? '<div class="rc-minfo__descomp"><strong>Tiempo de descomposición:</strong> ' + data.tiempoDescomposicion + "</div>" : "");
          return out || '<p class="rc-minfo__categoria">Sin datos de categoría para este material todavía.</p>';
        }

        if (sectionKey === "preparar") {
          return "<ul>" + renderList(data.preparacion) + "</ul>";
        }

        if (sectionKey === "tipsextra") {
          var tieneTipsExtra = data.tipsExtra && data.tipsExtra.length > 0;
          return tieneTipsExtra ? "<ul>" + renderList(data.tipsExtra) + "</ul>" : "";
        }

        if (sectionKey === "lugares") {
          return '<div class="rc-minfo__points">' + renderLugares(data.lugares) + "</div>";
        }

        return "";
      }
    };
  });
})();
