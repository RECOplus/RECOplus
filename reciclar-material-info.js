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
 * un respaldo local (MATERIALS_RESPALDO) traducido vía el sistema
 * i18n del sitio (i18n.js: función global t() + namespace
 * "rminfo.*"), para que el panel nunca se muestre vacío y respete
 * el idioma activo (ES/EN). En cuanto los datos de Supabase llegan,
 * si la ventana ya está abierta, su contenido se refresca solo con
 * la versión más actualizada. Si el idioma cambia mientras la
 * ventana está abierta (evento "reco:langchange" que dispara
 * i18n.js), también se refresca en el sitio.
 *
 * Cárgalo DESPUÉS de i18n.js y de reciclar.js:
 * <script src="i18n.js"></script>
 * ...
 * <script src="reciclar.js"></script>
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

  // Traducción segura: usa el helper global t() de i18n.js si ya
  // está cargado; si por algún motivo no lo está, devuelve la
  // propia clave para no romper el render (mejor una clave visible
  // que un panel vacío).
  function tr(key) {
    return (typeof window.t === "function") ? window.t(key) : key;
  }

  // Idioma activo del sitio, leído igual que i18n.js (misma clave de
  // localStorage: "reco-lang"). Se usa para elegir, de los datos que
  // llegan de Supabase, las columnas en español (por defecto) o las
  // columnas "_en" (cuando el usuario tiene el sitio en inglés) —
  // así la tarjeta de info de material respeta el idioma activo
  // también cuando el contenido viene de la base de datos y no del
  // respaldo local traducido vía tr().
  function isEnglish() {
    return (typeof window.localStorage !== "undefined") &&
      window.localStorage.getItem("reco-lang") === "en";
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
  // falla. Cada campo traducible guarda la CLAVE i18n (namespace
  // "rminfo.*" en i18n.js) en vez del texto ya resuelto, para que
  // getMaterialData() lo traduzca en el idioma activo en cada
  // render (ver tr() más abajo). Las claves "detalleKey" de
  // "lugares" apuntan a etiquetas genéricas reutilizadas entre
  // materiales (ej. "rminfo.lugar.recomendado").
  // warn: true/false controla el badge (verde "Reciclable" / ámbar
  // "Requiere punto especial").
  var MATERIALS_RESPALDO = {
    electronicos: {
      badgeKey: "rminfo.mat.electronicos.badge",
      warn: true,
      prepKeys: ["rminfo.mat.electronicos.prep1", "rminfo.mat.electronicos.prep2", "rminfo.mat.electronicos.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.electronicos.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.electronicos.lugar2", detalleKey: "rminfo.lugar.segunFabricante" }, { nombreKey: "rminfo.mat.electronicos.lugar3", detalleKey: "rminfo.lugar.temporales" }],
      obtieneKeys: ["rminfo.mat.electronicos.obt1", "rminfo.mat.electronicos.obt2", "rminfo.mat.electronicos.obt3"],
      impactoKey: "rminfo.mat.electronicos.impacto"
    },
    celulares: {
      badgeKey: "rminfo.mat.celulares.badge",
      warn: true,
      prepKeys: ["rminfo.mat.celulares.prep1", "rminfo.mat.celulares.prep2", "rminfo.mat.celulares.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.celulares.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.celulares.lugar2", detalleKey: "rminfo.lugar.alternativa" }],
      obtieneKeys: ["rminfo.mat.celulares.obt1", "rminfo.mat.celulares.obt2", "rminfo.mat.celulares.obt3"],
      impactoKey: "rminfo.mat.celulares.impacto"
    },
    plastico: {
      badgeKey: "rminfo.mat.plastico.badge",
      warn: false,
      prepKeys: ["rminfo.mat.plastico.prep1", "rminfo.mat.plastico.prep2", "rminfo.mat.plastico.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.plastico.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.plastico.lugar2", detalleKey: "rminfo.lugar.mayorVolumen" }],
      obtieneKeys: ["rminfo.mat.plastico.obt1", "rminfo.mat.plastico.obt2", "rminfo.mat.plastico.obt3"],
      impactoKey: "rminfo.mat.plastico.impacto"
    },
    metal: {
      badgeKey: "rminfo.mat.metal.badge",
      warn: false,
      prepKeys: ["rminfo.mat.metal.prep1", "rminfo.mat.metal.prep2", "rminfo.mat.metal.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.metal.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.metal.lugar2", detalleKey: "rminfo.lugar.mayorVolumen" }],
      obtieneKeys: ["rminfo.mat.metal.obt1", "rminfo.mat.metal.obt2", "rminfo.mat.metal.obt3"],
      impactoKey: "rminfo.mat.metal.impacto"
    },
    papel: {
      badgeKey: "rminfo.mat.papel.badge",
      warn: false,
      prepKeys: ["rminfo.mat.papel.prep1", "rminfo.mat.papel.prep2", "rminfo.mat.papel.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.papel.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.papel.lugar2", detalleKey: "rminfo.lugar.mayorVolumen" }],
      obtieneKeys: ["rminfo.mat.papel.obt1", "rminfo.mat.papel.obt2", "rminfo.mat.papel.obt3"],
      impactoKey: "rminfo.mat.papel.impacto"
    },
    vidrio: {
      badgeKey: "rminfo.mat.vidrio.badge",
      warn: false,
      prepKeys: ["rminfo.mat.vidrio.prep1", "rminfo.mat.vidrio.prep2", "rminfo.mat.vidrio.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.vidrio.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.vidrio.lugar2", detalleKey: "rminfo.lugar.mayorVolumen" }],
      obtieneKeys: ["rminfo.mat.vidrio.obt1", "rminfo.mat.vidrio.obt2", "rminfo.mat.vidrio.obt3"],
      impactoKey: "rminfo.mat.vidrio.impacto"
    },
    ropa: {
      badgeKey: "rminfo.mat.ropa.badge",
      warn: false,
      prepKeys: ["rminfo.mat.ropa.prep1", "rminfo.mat.ropa.prep2", "rminfo.mat.ropa.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.ropa.lugar1", detalleKey: "rminfo.lugar.siBuenEstado" }, { nombreKey: "rminfo.mat.ropa.lugar2", detalleKey: "rminfo.lugar.ropaDaniada" }],
      obtieneKeys: ["rminfo.mat.ropa.obt1", "rminfo.mat.ropa.obt2", "rminfo.mat.ropa.obt3"],
      impactoKey: "rminfo.mat.ropa.impacto"
    },
    muebles: {
      badgeKey: "rminfo.mat.muebles.badge",
      warn: false,
      prepKeys: ["rminfo.mat.muebles.prep1", "rminfo.mat.muebles.prep2", "rminfo.mat.muebles.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.muebles.lugar1", detalleKey: "rminfo.lugar.siBuenEstado" }, { nombreKey: "rminfo.mat.muebles.lugar2", detalleKey: "rminfo.lugar.mueblesDaniados" }],
      obtieneKeys: ["rminfo.mat.muebles.obt1", "rminfo.mat.muebles.obt2", "rminfo.mat.muebles.obt3"],
      impactoKey: "rminfo.mat.muebles.impacto"
    },
    libros: {
      badgeKey: "rminfo.mat.libros.badge",
      warn: false,
      prepKeys: ["rminfo.mat.libros.prep1", "rminfo.mat.libros.prep2", "rminfo.mat.libros.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.libros.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.libros.lugar2", detalleKey: "rminfo.lugar.muyDeteriorados" }],
      obtieneKeys: ["rminfo.mat.libros.obt1", "rminfo.mat.libros.obt2", "rminfo.mat.libros.obt3"],
      impactoKey: "rminfo.mat.libros.impacto"
    },
    juguetes: {
      badgeKey: "rminfo.mat.juguetes.badge",
      warn: false,
      prepKeys: ["rminfo.mat.juguetes.prep1", "rminfo.mat.juguetes.prep2", "rminfo.mat.juguetes.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.juguetes.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.juguetes.lugar2", detalleKey: "rminfo.lugar.juguetesDaniados" }],
      obtieneKeys: ["rminfo.mat.juguetes.obt1", "rminfo.mat.juguetes.obt2", "rminfo.mat.juguetes.obt3"],
      impactoKey: "rminfo.mat.juguetes.impacto"
    },
    baterias: {
      badgeKey: "rminfo.mat.baterias.badge",
      warn: true,
      prepKeys: ["rminfo.mat.baterias.prep1", "rminfo.mat.baterias.prep2", "rminfo.mat.baterias.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.baterias.lugar1", detalleKey: "rminfo.lugar.obligatorio" }, { nombreKey: "rminfo.mat.baterias.lugar2", detalleKey: "rminfo.lugar.alternativa" }],
      obtieneKeys: ["rminfo.mat.baterias.obt1", "rminfo.mat.baterias.obt2", "rminfo.mat.baterias.obt3"],
      impactoKey: "rminfo.mat.baterias.impacto"
    },
    bombillos: {
      badgeKey: "rminfo.mat.bombillos.badge",
      warn: true,
      prepKeys: ["rminfo.mat.bombillos.prep1", "rminfo.mat.bombillos.prep2", "rminfo.mat.bombillos.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.bombillos.lugar1", detalleKey: "rminfo.lugar.obligatorio" }, { nombreKey: "rminfo.mat.bombillos.lugar2", detalleKey: "rminfo.lugar.alternativa" }],
      obtieneKeys: ["rminfo.mat.bombillos.obt1", "rminfo.mat.bombillos.obt2", "rminfo.mat.bombillos.obt3"],
      impactoKey: "rminfo.mat.bombillos.impacto"
    },
    carton: {
      badgeKey: "rminfo.mat.carton.badge",
      warn: false,
      prepKeys: ["rminfo.mat.carton.prep1", "rminfo.mat.carton.prep2", "rminfo.mat.carton.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.carton.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.carton.lugar2", detalleKey: "rminfo.lugar.mayorVolumen" }],
      obtieneKeys: ["rminfo.mat.carton.obt1", "rminfo.mat.carton.obt2", "rminfo.mat.carton.obt3"],
      impactoKey: "rminfo.mat.carton.impacto",
      tipKeys: ["rminfo.mat.carton.tip1", "rminfo.mat.carton.tip2"]
    },
    tetrapak: {
      badgeKey: "rminfo.mat.tetrapak.badge",
      warn: false,
      prepKeys: ["rminfo.mat.tetrapak.prep1", "rminfo.mat.tetrapak.prep2", "rminfo.mat.tetrapak.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.tetrapak.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.tetrapak.lugar2", detalleKey: "rminfo.lugar.mayorVolumen" }],
      obtieneKeys: ["rminfo.mat.tetrapak.obt1", "rminfo.mat.tetrapak.obt2", "rminfo.mat.tetrapak.obt3"],
      impactoKey: "rminfo.mat.tetrapak.impacto",
      tipKeys: ["rminfo.mat.tetrapak.tip1", "rminfo.mat.tetrapak.tip2"]
    },
    aceite: {
      badgeKey: "rminfo.mat.aceite.badge",
      warn: true,
      prepKeys: ["rminfo.mat.aceite.prep1", "rminfo.mat.aceite.prep2", "rminfo.mat.aceite.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.aceite.lugar1", detalleKey: "rminfo.lugar.obligatorio" }, { nombreKey: "rminfo.mat.aceite.lugar2", detalleKey: "rminfo.lugar.alternativa" }],
      obtieneKeys: ["rminfo.mat.aceite.obt1", "rminfo.mat.aceite.obt2", "rminfo.mat.aceite.obt3"],
      impactoKey: "rminfo.mat.aceite.impacto",
      tipKeys: ["rminfo.mat.aceite.tip1", "rminfo.mat.aceite.tip2"]
    },
    tela: {
      badgeKey: "rminfo.mat.tela.badge",
      warn: false,
      prepKeys: ["rminfo.mat.tela.prep1", "rminfo.mat.tela.prep2", "rminfo.mat.tela.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.tela.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.tela.lugar2", detalleKey: "rminfo.lugar.alternativa" }],
      obtieneKeys: ["rminfo.mat.tela.obt1", "rminfo.mat.tela.obt2", "rminfo.mat.tela.obt3"],
      impactoKey: "rminfo.mat.tela.impacto",
      tipKeys: ["rminfo.mat.tela.tip1", "rminfo.mat.tela.tip2"]
    },
    cuero: {
      badgeKey: "rminfo.mat.cuero.badge",
      warn: false,
      prepKeys: ["rminfo.mat.cuero.prep1", "rminfo.mat.cuero.prep2", "rminfo.mat.cuero.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.cuero.lugar1", detalleKey: "rminfo.lugar.siBuenEstado" }, { nombreKey: "rminfo.mat.cuero.lugar2", detalleKey: "rminfo.lugar.retazosReparacion" }],
      obtieneKeys: ["rminfo.mat.cuero.obt1", "rminfo.mat.cuero.obt2", "rminfo.mat.cuero.obt3"],
      impactoKey: "rminfo.mat.cuero.impacto",
      tipKeys: ["rminfo.mat.cuero.tip1", "rminfo.mat.cuero.tip2"]
    },
    utilesescolares: {
      badgeKey: "rminfo.mat.utilesescolares.badge",
      warn: false,
      prepKeys: ["rminfo.mat.utilesescolares.prep1", "rminfo.mat.utilesescolares.prep2", "rminfo.mat.utilesescolares.prep3"],
      lugares: [{ nombreKey: "rminfo.mat.utilesescolares.lugar1", detalleKey: "rminfo.lugar.recomendado" }, { nombreKey: "rminfo.mat.utilesescolares.lugar2", detalleKey: "rminfo.lugar.alternativa" }],
      obtieneKeys: ["rminfo.mat.utilesescolares.obt1", "rminfo.mat.utilesescolares.obt2", "rminfo.mat.utilesescolares.obt3"],
      impactoKey: "rminfo.mat.utilesescolares.impacto",
      tipKeys: ["rminfo.mat.utilesescolares.tip1", "rminfo.mat.utilesescolares.tip2"]
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
      .select("id, badge, requiere_punto_especial, mensaje_escaner, preparacion, lugares, obtienes, impacto, tipo_objeto, materiales_compuestos, tiempo_descomposicion, tips_extra, alerta_seguridad, dato_curioso, badge_en, mensaje_escaner_en, preparacion_en, lugares_en, obtienes_en, impacto_en, tipo_objeto_en, materiales_compuestos_en, tiempo_descomposicion_en, tips_extra_en, alerta_seguridad_en, dato_curioso_en")
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
   *  cayendo al respaldo local (traducido al idioma activo vía
   *  tr()) si aún no está listo o falló. */
  function getMaterialData(materialKey) {
    var fila = categoriasCache && categoriasCache[materialKey];
    if (fila) {
      // Si el sitio está en inglés, se priorizan las columnas "_en"
      // (traducción guardada en Supabase); si alguna viniera vacía
      // (ej. categoría nueva aún sin traducir), se cae de regreso a
      // la columna en español correspondiente para no dejar el panel
      // con huecos.
      var en = isEnglish();
      return {
        badge: (en && fila.badge_en) || fila.badge,
        warn: !!fila.requiere_punto_especial,
        mensaje: (en ? (fila.mensaje_escaner_en || fila.mensaje_escaner) : fila.mensaje_escaner) || "",
        preparacion: (en && Array.isArray(fila.preparacion_en) && fila.preparacion_en.length) ? fila.preparacion_en : (Array.isArray(fila.preparacion) ? fila.preparacion : []),
        lugares: (en && Array.isArray(fila.lugares_en) && fila.lugares_en.length) ? fila.lugares_en : (Array.isArray(fila.lugares) ? fila.lugares : []),
        obtienes: (en && Array.isArray(fila.obtienes_en) && fila.obtienes_en.length) ? fila.obtienes_en : (Array.isArray(fila.obtienes) ? fila.obtienes : []),
        impacto: ((en ? (fila.impacto_en || fila.impacto) : fila.impacto)) || "",
        tipoObjeto: ((en ? (fila.tipo_objeto_en || fila.tipo_objeto) : fila.tipo_objeto)) || "",
        materialesCompuestos: (en && Array.isArray(fila.materiales_compuestos_en) && fila.materiales_compuestos_en.length) ? fila.materiales_compuestos_en : (Array.isArray(fila.materiales_compuestos) ? fila.materiales_compuestos : []),
        tiempoDescomposicion: ((en ? (fila.tiempo_descomposicion_en || fila.tiempo_descomposicion) : fila.tiempo_descomposicion)) || "",
        tipsExtra: (en && Array.isArray(fila.tips_extra_en) && fila.tips_extra_en.length) ? fila.tips_extra_en : (Array.isArray(fila.tips_extra) ? fila.tips_extra : []),
        alertaSeguridad: ((en ? (fila.alerta_seguridad_en || fila.alerta_seguridad) : fila.alerta_seguridad)) || "",
        datoCurioso: ((en ? (fila.dato_curioso_en || fila.dato_curioso) : fila.dato_curioso)) || ""
      };
    }
    var respaldo = MATERIALS_RESPALDO[materialKey];
    if (!respaldo) return null;
    return {
      badge: tr(respaldo.badgeKey),
      warn: respaldo.warn,
      mensaje: "",
      preparacion: respaldo.prepKeys.map(tr),
      lugares: respaldo.lugares.map(function (l) {
        return { nombre: tr(l.nombreKey), detalle: tr(l.detalleKey) };
      }),
      obtienes: respaldo.obtieneKeys.map(tr),
      impacto: tr(respaldo.impactoKey),
      tipoObjeto: "",
      materialesCompuestos: [],
      tiempoDescomposicion: "",
      tipsExtra: Array.isArray(respaldo.tipKeys) ? respaldo.tipKeys.map(tr) : [],
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
          (data.tipoObjeto ? '<div class="rc-minfo__categoria"><strong>' + tr("rminfo.tipoObjeto") + '</strong> ' + data.tipoObjeto + "</div>" : "") +
          (tieneCompuestos
            ? '<div class="rc-minfo__compuestos"><strong>' + tr("rminfo.materialesCompuestos") + '</strong> ' + data.materialesCompuestos.join(", ") + "</div>"
            : "") +
          (data.tiempoDescomposicion ? '<div class="rc-minfo__descomp"><strong>' + tr("rminfo.tiempoDescomposicion") + '</strong> ' + data.tiempoDescomposicion + "</div>" : "") +
        "</div>" +

        '<div class="rc-minfo__grid">' +
          '<div class="rc-minfo__block" data-minfo-section="preparar">' +
            '<div class="rc-minfo__block-head">' + ICONS.prep + "<span>" + tr("rminfo.comoPrepararlo") + "</span></div>" +
            "<ul>" + renderList(data.preparacion) + "</ul>" +
          "</div>" +

          '<div class="rc-minfo__block" data-minfo-section="lugares">' +
            '<div class="rc-minfo__block-head">' + ICONS.lugar + "<span>" + tr("rminfo.dondeLlevarlo") + "</span></div>" +
            '<div class="rc-minfo__points">' + renderLugares(data.lugares) + "</div>" +
          "</div>" +

          '<div class="rc-minfo__block">' +
            '<div class="rc-minfo__block-head">' + ICONS.obtienes + "<span>" + tr("rminfo.queSeObtiene") + "</span></div>" +
            "<ul>" + renderList(data.obtienes) + "</ul>" +
          "</div>" +

          (tieneTipsExtra
            ? '<div class="rc-minfo__block rc-minfo__block--tips" data-minfo-section="tipsextra">' +
                '<div class="rc-minfo__block-head">' + ICONS.prep + "<span>" + tr("rminfo.tipsExtra") + "</span></div>" +
                "<ul>" + renderList(data.tipsExtra) + "</ul>" +
              "</div>"
            : "") +
        "</div>" +

        (data.datoCurioso ? '<p class="rc-minfo__curioso">💡 <strong>' + tr("rminfo.sabiasQue") + '</strong> ' + data.datoCurioso + "</p>" : "") +

        '<div class="rc-minfo__footer">' +
          '<span class="rc-minfo__impact">' + ICONS.obtienes + '<strong>' + tr("rminfo.impacto") + '</strong>&nbsp;' + data.impacto + "</span>" +
          '<a class="rc-minfo__cta" href="mapa.html?material=' + encodeURIComponent(materialKey) + '">' +
            ICONS.mapa + "<span>" + tr("rminfo.verEnMapa") + "</span>" +
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
          '<button type="button" class="rc-minfo__close" id="rcMinfoClose" aria-label="' + tr("rminfo.cerrar") + '">' +
            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          "</button>" +
          '<div class="rc-minfo__scrollbody" id="rcMinfoBody" aria-live="polite"></div>' +
          '<div class="rc-minfo__nav">' +
            '<button type="button" class="rc-minfo__navbtn rc-minfo__navbtn--prev" id="rcMinfoPrev" aria-label="' + tr("rminfo.anterior") + '">' +
              '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M12 4l-6 6 6 6"/></svg>' +
              "<span>" + tr("rminfo.anterior") + "</span>" +
            "</button>" +
            '<span class="rc-minfo__navcount" id="rcMinfoCount"></span>' +
            '<button type="button" class="rc-minfo__navbtn rc-minfo__navbtn--next" id="rcMinfoNext" aria-label="' + tr("rminfo.siguiente") + '">' +
              "<span>" + tr("rminfo.siguiente") + "</span>" +
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

    // Refresca los textos fijos de la ventana (botones Anterior/
    // Siguiente, aria-labels) según el idioma activo — se llama al
    // crear la ventana y cada vez que cambia el idioma.
    function refreshChromeTexts() {
      closeBtn.setAttribute("aria-label", tr("rminfo.cerrar"));
      prevBtn.setAttribute("aria-label", tr("rminfo.anterior"));
      nextBtn.setAttribute("aria-label", tr("rminfo.siguiente"));
      var prevSpan = prevBtn.querySelector("span");
      var nextSpan = nextBtn.querySelector("span");
      if (prevSpan) prevSpan.textContent = tr("rminfo.anterior");
      if (nextSpan) nextSpan.textContent = tr("rminfo.siguiente");
    }

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

    // Cuando el usuario cambia de idioma (toggle ES/EN del navbar,
    // evento disparado por i18n.js), refresca tanto los textos fijos
    // de la ventana como el contenido del material actualmente
    // mostrado, para que la traducción se aplique sin cerrar el modal.
    document.addEventListener("reco:langchange", function () {
      refreshChromeTexts();
      if (currentKey && currentEl && isOpen()) {
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
          var mensaje = data.mensaje || (data.warn ? tr("rminfo.puntoEspecial") : tr("rminfo.esReciclable"));
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
            (data.tipoObjeto ? '<div class="rc-minfo__categoria"><strong>' + tr("rminfo.tipoObjeto") + '</strong> ' + data.tipoObjeto + "</div>" : "") +
            (tieneCompuestos ? '<div class="rc-minfo__compuestos"><strong>' + tr("rminfo.materialesCompuestos") + '</strong> ' + data.materialesCompuestos.join(", ") + "</div>" : "") +
            (data.tiempoDescomposicion ? '<div class="rc-minfo__descomp"><strong>' + tr("rminfo.tiempoDescomposicion") + '</strong> ' + data.tiempoDescomposicion + "</div>" : "");
          return out || '<p class="rc-minfo__categoria">' + tr("rminfo.sinCategoria") + "</p>";
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
