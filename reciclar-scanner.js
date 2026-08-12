/**
 * reciclar-scanner.js — Escáner inteligente de objetos reciclables
 * ============================================================
 * Capa 100% aditiva: no modifica reciclar.js ni reciclar-material-info.js.
 *
 * CÓMO FUNCIONA (y por qué así):
 * -------------------------------------------------------------
 * En vez de depender de una API de pago externa (OpenAI/Gemini/Claude
 * vision), este escáner corre un modelo de reconocimiento de imágenes
 * (MobileNet) DIRECTAMENTE en el navegador del visitante, usando
 * TensorFlow.js. Ventajas para este proyecto:
 *
 *   - Gratis y sin límites de uso: no necesitas una API key ni pagar
 *     por cada escaneo.
 *   - Sin backend nuevo que mantener: no hace falta una Edge Function
 *     de Supabase ni un servidor propio.
 *   - Privado: la foto del usuario nunca sale de su navegador; solo
 *     se guarda (opcionalmente) el resultado de la clasificación.
 *   - Funciona con la infraestructura que ya tienes (sitio estático +
 *     Supabase para datos).
 *
 * El modelo (MobileNet, entrenado con ImageNet) reconoce ~1000 tipos
 * de objetos cotidianos. Este archivo traduce esas ~1000 etiquetas en
 * inglés a las 12 categorías que YA existen en reciclar-material-info.js
 * (plástico, metal, vidrio, papel, electrónicos, etc.) mediante
 * MATERIAL_KEYWORDS. Esto es heurístico, no perfecto: dos categorías
 * (baterías, bombillos) no tienen una clase directa y equivalente en
 * ImageNet, así que casi nunca se detectarán automáticamente — el
 * usuario siempre puede elegirlas a mano en la lista de materiales.
 * Si en el futuro quieres más precisión (ej. distinguir tipos de
 * plástico #1-#7), lo ideal sería entrenar un modelo propio con fotos
 * reales de tus centros de acopio, o migrar a una API de visión con
 * IA generativa vía una Edge Function de Supabase (para no exponer la
 * API key en el cliente).
 *
 * FUENTE DE VERDAD DE "¿ES RECICLABLE?" (tabla `categorias`):
 * -------------------------------------------------------------
 * El badge (Reciclable / Reutilizable / Requiere punto especial) y el
 * mensaje explícito que ve el usuario ya NO están hardcodeados aquí:
 * se cargan una vez, al iniciar la página, desde la tabla `categorias`
 * de Supabase (misma fuente que usa api/classify.js para el escaneo
 * preciso con IA). Si Supabase no responde a tiempo (sin internet,
 * error temporal), se usa un respaldo local mínimo para que el
 * escáner nunca se quede sin poder mostrar un resultado.
 *
 * Requiere (ya presentes en reciclar.html tras esta integración):
 *   <script src="reciclar-scanner.js"></script>
 * Debe cargarse DESPUÉS de reciclar-material-info.js (para poder usar
 * window.recoMaterialInfo) y, si existen, auth.js / supabase-config.js
 * (para el registro opcional de escaneos y la carga de categorías).
 */
(function () {
  "use strict";

  var TFJS_URL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js";
  var MOBILENET_URL = "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js";
  var MAX_FILE_MB = 10;
  var MIN_CONFIDENCE = 0.15; // por debajo de esto, se avisa "baja confianza"

  // Endpoint de la función serverless (Vercel) que esconde la API key
  // de Gemini. Ver /api/classify.js. Es una capa 100% opcional: si el
  // backend no está desplegado, el escáner local con MobileNet sigue
  // funcionando exactamente igual, solo el botón "Verificar con IA"
  // no serviría (mostraría un error contenido, sin afectar lo demás).
  var CLASSIFY_ENDPOINT = "/api/classify";

  // Última foto analizada localmente (dataUrl completo, con el
  // prefijo "data:image/...;base64,"). Se guarda para que el botón
  // "Verificar con IA" pueda reusarla sin obligar al usuario a subir
  // la imagen otra vez.
  var lastPhotoDataUrl = null;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* ──────────────────────────────────────────────────────────
     Diccionario: etiqueta de MobileNet/ImageNet → categoría RECO+
     Cada clave debe existir en MATERIALS (reciclar-material-info.js).
     Las palabras se buscan como substring dentro de la etiqueta
     completa que devuelve el modelo (en inglés, en minúsculas).
     ────────────────────────────────────────────────────────── */
  var MATERIAL_KEYWORDS = {
    plastico: [
      "water bottle", "pop bottle", "soda bottle", "pill bottle",
      "plastic bag", "bucket", "pail", "shopping basket"
    ],
    vidrio: [
      "wine bottle", "beer bottle", "beer glass", "vase", "goblet"
    ],
    metal: [
      "milk can", "tin can", "barrel", "cask", "can opener",
      "frying pan", "wok"
    ],
    papel: [
      "envelope", "packet", "paper towel", "toilet tissue",
      "menu", "paper bag"
    ],
    carton: [
      "carton", "crate"
    ],
    // OJO: la clase de ImageNet "notebook, notebook computer" es en
    // realidad una laptop, no un cuaderno de papel — por eso NO se
    // incluye aquí (evita falsos positivos "libro" con computadoras).
    libros: [
      "book jacket", "comic book"
    ],
    electronicos: [
      "laptop", "desktop computer", "monitor", "computer keyboard",
      "mouse, computer mouse", "modem", "remote control", "cassette player",
      "tape player", "radio, wireless", "television", "hard disc",
      "printer", "scanner", "space heater", "hair dryer", "microwave",
      "dishwasher", "washer, automatic washer", "electric fan",
      "vacuum, vacuum cleaner", "iron, smoothing iron", "toaster",
      "joystick"
    ],
    celulares: [
      "cellular telephone", "ipod", "hand-held computer"
    ],
    ropa: [
      "jersey, t-shirt", "sweatshirt", "cardigan", "kimono", "poncho",
      "jean, blue jean, denim", "pajama", "trench coat", "suit, suit of clothes",
      "swimming trunks", "maillot", "military uniform", "running shoe",
      "loafer", "sandal", "cowboy boot", "sock", "brassiere", "miniskirt",
      "gown", "cloak", "apron"
    ],
    cuero: [
      "purse", "wallet", "backpack", "holster", "saddle", "belt buckle"
    ],
    muebles: [
      "studio couch", "rocking chair", "folding chair", "wardrobe, closet",
      "file, file cabinet", "desk", "dining table", "four-poster",
      "crib, cot", "bookcase", "chiffonier, commode", "china cabinet"
    ],
    juguetes: [
      "teddy, teddy bear", "toyshop", "jigsaw puzzle", "yo-yo",
      "rubik's cube", "balloon", "kite", "punching bag"
    ],
    // Sin cobertura fiable de ImageNet — se dejan vacías a propósito.
    // El usuario siempre puede seleccionarlas manualmente en la lista.
    baterias: [],
    bombillos: [],
    tetrapak: [],
    aceite: [],
    tela: [],
    utilesescolares: []
  };

  /* ──────────────────────────────────────────────────────────
     Categorías desde Supabase (tabla `categorias`)
     -------------------------------------------------------------
     Se cargan UNA sola vez al abrir la página (no en cada escaneo:
     son datos de referencia que casi nunca cambian). Mientras tanto,
     o si falla la carga, se usa un respaldo mínimo local para que el
     escáner nunca se quede sin badge/mensaje que mostrar.
     ────────────────────────────────────────────────────────── */
  var BADGE_INFO_RESPALDO = {
    plastico: { badge: "Reciclable", warn: false, mensaje_escaner: "" },
    vidrio: { badge: "Reciclable", warn: false, mensaje_escaner: "" },
    metal: { badge: "Reciclable", warn: false, mensaje_escaner: "" },
    papel: { badge: "Reciclable", warn: false, mensaje_escaner: "" },
    libros: { badge: "Reutilizable", warn: false, mensaje_escaner: "" },
    ropa: { badge: "Reciclable / Donable", warn: false, mensaje_escaner: "" },
    muebles: { badge: "Reutilizable", warn: false, mensaje_escaner: "" },
    juguetes: { badge: "Reutilizable", warn: false, mensaje_escaner: "" },
    electronicos: { badge: "Requiere punto especial", warn: true, mensaje_escaner: "" },
    celulares: { badge: "Requiere punto especial", warn: true, mensaje_escaner: "" },
    baterias: { badge: "Requiere punto especial", warn: true, mensaje_escaner: "" },
    bombillos: { badge: "Requiere punto especial", warn: true, mensaje_escaner: "" },
    carton: { badge: "Reciclable", warn: false, mensaje_escaner: "" },
    tetrapak: { badge: "Reciclable", warn: false, mensaje_escaner: "" },
    aceite: { badge: "Requiere punto especial", warn: true, mensaje_escaner: "" },
    tela: { badge: "Reciclable / Donable", warn: false, mensaje_escaner: "" },
    cuero: { badge: "Reutilizable", warn: false, mensaje_escaner: "" },
    utilesescolares: { badge: "Reutilizable", warn: false, mensaje_escaner: "" }
  };

  var categoriasCache = null; // se llena con loadCategorias(); null mientras carga o si falló
  var categoriasPromise = null;

  function loadCategorias() {
    if (categoriasPromise) return categoriasPromise;

    if (!window.recoSupabase) {
      categoriasPromise = Promise.resolve(null);
      return categoriasPromise;
    }

    categoriasPromise = window.recoSupabase
      .from("categorias")
      .select("id, nombre, reciclable, requiere_punto_especial, badge, mensaje_escaner")
      .then(function (res) {
        if (res.error || !res.data) {
          console.warn("[RECO+ escáner] No se pudieron cargar categorías de Supabase, usando respaldo local:", res.error && res.error.message);
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
        console.warn("[RECO+ escáner] Error consultando categorías de Supabase, usando respaldo local:", err);
        return null;
      });

    return categoriasPromise;
  }

  // Dispara la carga inmediatamente (no espera al DOM: solo depende
  // de que supabase-config.js ya haya corrido, y ese script va antes
  // que este en reciclar.html).
  loadCategorias();

  /* Devuelve { badge, warn, mensaje, reciclable, requierePuntoEspecial }
     para una clave de material, priorizando los datos ya cargados de
     Supabase y cayendo al respaldo local si aún no están listos. */
  function getInfoCategoria(key) {
    var fila = categoriasCache && categoriasCache[key];
    if (fila) {
      return {
        badge: fila.badge,
        warn: !!fila.requiere_punto_especial,
        mensaje: fila.mensaje_escaner || "",
        reciclable: fila.reciclable !== false,
        requierePuntoEspecial: !!fila.requiere_punto_especial
      };
    }
    var respaldo = BADGE_INFO_RESPALDO[key] || { badge: "", warn: false, mensaje_escaner: "" };
    return {
      badge: respaldo.badge,
      warn: respaldo.warn,
      mensaje: "",
      reciclable: true,
      requierePuntoEspecial: respaldo.warn
    };
  }

  /* ──────────────────────────────────────────────────────────
     Estado del módulo
     ────────────────────────────────────────────────────────── */
  var modelPromise = null; // cachea el modelo cargado para no recargarlo cada vez

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("No se pudo cargar " + src)); };
      document.head.appendChild(s);
    });
  }

  function getModel() {
    if (modelPromise) return modelPromise;

    modelPromise = Promise.resolve()
      .then(function () {
        if (typeof window.tf === "undefined") return loadScript(TFJS_URL);
      })
      .then(function () {
        if (typeof window.mobilenet === "undefined") return loadScript(MOBILENET_URL);
      })
      .then(function () {
        return window.mobilenet.load({ version: 2, alpha: 1.0 });
      })
      .catch(function (err) {
        modelPromise = null; // permite reintentar si falló
        throw err;
      });

    return modelPromise;
  }

  /* Busca, en orden de confianza, la primera predicción que calce
     con alguna categoría conocida. */
  function mapPredictions(predictions) {
    for (var i = 0; i < predictions.length; i++) {
      var name = predictions[i].className.toLowerCase();
      for (var key in MATERIAL_KEYWORDS) {
        var kws = MATERIAL_KEYWORDS[key];
        for (var j = 0; j < kws.length; j++) {
          if (name.indexOf(kws[j]) !== -1) {
            return { key: key, rawLabel: predictions[i].className, probability: predictions[i].probability };
          }
        }
      }
    }
    return null;
  }

  function fileToImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () { resolve({ img: img, dataUrl: reader.result }); };
        img.onerror = function () { reject(new Error("Imagen inválida")); };
        img.src = reader.result;
      };
      reader.onerror = function () { reject(new Error("No se pudo leer el archivo")); };
      reader.readAsDataURL(file);
    });
  }

  /* ──────────────────────────────────────────────────────────
     Registro opcional en Supabase (para estadísticas de impacto).
     Falla en silencio si no hay Supabase configurado: el escáner
     debe seguir funcionando igual aunque esto no esté disponible.
     ────────────────────────────────────────────────────────── */
  function logScan(materialKey, rawLabel, probability, viaIA) {
    if (!window.recoSupabase) return;

    var userIdPromise = (window.recoAuth && typeof window.recoAuth.getSession === "function")
      ? window.recoAuth.getSession().then(function (session) {
          return session && session.user ? session.user.id : null;
        }).catch(function () { return null; })
      : Promise.resolve(null);

    userIdPromise.then(function (userId) {
      window.recoSupabase.from("escaneos").insert({
        user_id: userId,
        material_key: materialKey || null,
        label_detected: rawLabel || null,
        confidence: typeof probability === "number" ? probability : null,
        // Distingue un escaneo local (MobileNet, siempre gratis) de uno
        // con IA (Gemini, viá /api/classify) — es la columna que cuenta
        // la función escaneos_ia_hoy() del límite diario por plan (ver
        // supabase-suscripciones.sql).
        via_ia: !!viaIA
      }).then(function (res) {
        if (res && res.error) {
          console.warn("[RECO+ escáner] No se pudo registrar el escaneo:", res.error.message);
        }
      });
    });
  }

  /* ────────────────────────────────────────────────
     Cuota diaria de escaneos con IA (según el plan del usuario)
     -------------------------------------------------------------
     Se consulta justo antes de llamar a /api/classify (Gemini gasta
     cuota de la API, a diferencia del reconocimiento local con
     MobileNet, que es y seguirá siendo ilimitado). Usa las mismas
     capas de suscripcion-planes.js / suscripcion-modal.js que el
     resto del sitio (ver supabase-suscripciones.sql para el límite
     real, reforzado del lado del servidor con la función
     escaneos_ia_hoy()). Si esas capas no están cargadas en la página,
     o la consulta falla, se deja pasar (mismo comportamiento que
     antes de este sistema de planes).
     ──────────────────────────────────────────────── */
  function verificarCuotaIA() {
    if (!window.recoSupabase || !window.recoAuth || !window.recoSuscripcion || !window.recoPlanes) {
      return Promise.resolve({ permitido: true });
    }

    return window.recoAuth.getVerifiedSession().then(function (sesion) {
      var userId = sesion && sesion.user && sesion.user.id;
      // Sin sesión: el escaneo IA se sigue permitiendo (se registra
      // como anónimo); el límite por plan solo aplica a cuentas.
      if (!userId) return { permitido: true };

      return window.recoSuscripcion.getPlanActual().then(function (planId) {
        var plan = window.recoPlanes.getPlan(planId);
        if (plan.escaneosIaPorDia === -1) return { permitido: true };

        return window.recoSupabase.rpc("escaneos_ia_hoy", { uid: userId }).then(function (res) {
          var usados = (res && !res.error && typeof res.data === "number") ? res.data : 0;
          return {
            permitido: usados < plan.escaneosIaPorDia,
            nombrePlan: plan.nombre,
            limite: plan.escaneosIaPorDia
          };
        }).catch(function () { return { permitido: true }; });
      });
    }).catch(function () { return { permitido: true }; });
  }

  /* ──────────────────────────────────────────────────────────
     Escaneo preciso con IA (Gemini, vía /api/classify)
     -------------------------------------------------------------
     Capa opcional sobre el resultado local de MobileNet: reusa la
     MISMA foto ya cargada (lastPhotoDataUrl) y la manda al backend
     para una segunda opinión más precisa (Gemini entiende contexto,
     no solo ~1000 clases fijas de ImageNet). No reemplaza el
     resultado local — se muestra aparte, así el usuario puede
     comparar. Si el backend no está desplegado o falla, el resto
     del escáner sigue funcionando normal.
     ────────────────────────────────────────────────────────── */
  function runIAScan(iaBox, iaBtn) {
    if (!lastPhotoDataUrl) return;

    iaBtn.disabled = true;
    iaBtn.textContent = "Verificando tu cuota…";

    verificarCuotaIA().then(function (cuota) {
      if (!cuota.permitido) {
        iaBtn.disabled = true;
        iaBtn.textContent = "Límite diario alcanzado";
        iaBox.className = "rc-scan-ia-result rc-scan-ia-result--nomatch";
        iaBox.innerHTML =
          '<div class="rc-scan-result__body">' +
            '<div class="rc-scan-result__title">Alcanzaste tu límite diario de escaneos con IA</div>' +
            '<p class="rc-scan-result__hint">Tu plan ' + cuota.nombrePlan + ' incluye ' + cuota.limite + ' escaneos con IA al día. Mejora tu plan para escanear sin límites.</p>' +
            '<button type="button" class="rc-scan-ia-btn" data-abrir-suscripcion style="margin-top:8px">Ver planes →</button>' +
          '</div>';
        return;
      }
      ejecutarConsultaIA(iaBox, iaBtn);
    });
  }

  function ejecutarConsultaIA(iaBox, iaBtn) {
    var base64 = lastPhotoDataUrl.replace(/^data:image\/\w+;base64,/, "");

    iaBtn.disabled = true;
    iaBtn.textContent = "Consultando IA…";
    iaBox.className = "rc-scan-ia-result rc-scan-ia-result--busy";
    iaBox.innerHTML =
      '<div class="rc-scan-result__spinner" aria-hidden="true"></div>' +
      "<p>Consultando el escaneo preciso con IA…</p>";

    fetch(CLASSIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64 })
    })
      .then(function (res) {
        return res.json().catch(function () { return null; }).then(function (datos) {
          if (!res.ok || !datos) {
            var msg = (datos && (datos.mensaje || datos.error)) || ("HTTP " + res.status);
            throw new Error(msg);
          }
          return datos;
        });
      })
      .then(function (datos) {
        var key = datos.id;
        var esValido = key && window.recoMaterialInfo && window.recoMaterialInfo.has(key);

        if (esValido) {
          var label = window.recoMaterialInfo.getLabel(key);
          var etiquetaConfianza = { alta: "Confianza alta", media: "Confianza media", baja: "Confianza baja" }[datos.confianza] || "IA";
          iaBox.className = "rc-scan-ia-result rc-scan-ia-result--match";
          iaBox.innerHTML =
            '<div class="rc-scan-result__body">' +
              '<span class="rc-scan-result__eyebrow">Escaneo preciso (IA) detectó</span>' +
              '<div class="rc-scan-result__title">' + label + "</div>" +
              '<span class="rc-minfo__badge">' + etiquetaConfianza + "</span>" +
              (datos.mensaje ? '<p class="rc-scan-result__hint rc-scan-result__hint--ok">' + datos.mensaje + "</p>" : "") +
              (datos.razon ? '<p class="rc-scan-result__hint">' + datos.razon + "</p>" : "") +
            "</div>";
          window.recoMaterialInfo.showByKey(key);
          logScan(key, "[IA] " + (datos.razon || ""), null, true);
        } else {
          iaBox.className = "rc-scan-ia-result rc-scan-ia-result--nomatch";
          iaBox.innerHTML =
            '<div class="rc-scan-result__body">' +
              '<div class="rc-scan-result__title">La IA tampoco pudo identificarlo con seguridad</div>' +
              '<p class="rc-scan-result__hint">Prueba con más luz o un encuadre más cercano, o elige el material manualmente arriba.</p>' +
            "</div>";
          logScan(null, "[IA] " + (datos.razon || ""), null, true);
        }
      })
      .catch(function (err) {
        console.error("[RECO+ escáner IA]", err);
        iaBox.className = "rc-scan-ia-result rc-scan-ia-result--error";
        iaBox.innerHTML =
          '<div class="rc-scan-result__body">' +
            '<div class="rc-scan-result__title">No se pudo consultar el escaneo preciso</div>' +
            '<p class="rc-scan-result__hint">Intenta de nuevo en unos segundos.</p>' +
          "</div>";
      })
      .then(function () {
        iaBtn.disabled = false;
        iaBtn.textContent = "✨ Verificar con IA (más preciso)";
      });
  }

  /* ──────────────────────────────────────────────────────────
     UI
     ────────────────────────────────────────────────────────── */
  ready(function () {
    var drop = document.getElementById("rcScannerDrop");
    var input = document.getElementById("rcScanInput");
    var panel = drop ? drop.closest(".rc-panel") : null;
    if (!drop || !input || !panel) return;

    // Contenedor de resultados: se inserta justo después de
    // .rc-scanner__features (o después de .rc-scanner__drop si no
    // existe), dentro del mismo panel.
    var result = document.getElementById("rcScanResult");
    if (!result) {
      result = document.createElement("div");
      result.id = "rcScanResult";
      result.className = "rc-scan-result";
      result.setAttribute("role", "region");
      result.setAttribute("aria-live", "polite");
      var features = panel.querySelector(".rc-scanner__features");
      if (features && features.parentElement) {
        features.parentElement.insertBefore(result, features);
      } else {
        panel.appendChild(result);
      }
    }

    // Botón "Verificar con IA" + su propio contenedor de resultado.
    // Empiezan ocultos/deshabilitados: solo tienen sentido una vez
    // que ya se analizó una foto localmente (processFile los activa).
    var iaBtn = document.getElementById("rcScanIABtn");
    if (!iaBtn) {
      iaBtn = document.createElement("button");
      iaBtn.id = "rcScanIABtn";
      iaBtn.type = "button";
      iaBtn.className = "rc-scan-ia-btn";
      iaBtn.textContent = "✨ Verificar con IA (más preciso)";
      iaBtn.disabled = true;
      iaBtn.hidden = true;
      result.insertAdjacentElement("afterend", iaBtn);
    }

    var iaBox = document.getElementById("rcScanIAResult");
    if (!iaBox) {
      iaBox = document.createElement("div");
      iaBox.id = "rcScanIAResult";
      iaBox.className = "rc-scan-ia-result";
      iaBox.setAttribute("role", "region");
      iaBox.setAttribute("aria-live", "polite");
      iaBtn.insertAdjacentElement("afterend", iaBox);
    }

    iaBtn.addEventListener("click", function () {
      runIAScan(iaBox, iaBtn);
    });

    // i18n.js define t(key) como función global (window.t). Si por
    // algún motivo no está cargada, usamos el texto en español como
    // respaldo para que el escáner nunca se quede sin texto.
    function tr(key, fallback) {
      if (typeof window.t !== "function") return fallback;
      var val = window.t(key);
      return (val && val !== key) ? val : fallback;
    }

    function renderLoadingModel() {
      result.className = "rc-scan-result rc-scan-result--busy";
      result.innerHTML =
        '<div class="rc-scan-result__spinner" aria-hidden="true"></div>' +
        '<p>' + tr("reciclar.escaner.cargandoModelo", "Preparando el motor de reconocimiento (solo la primera vez)…") + '</p>';
    }

    function renderAnalyzing(dataUrl) {
      result.className = "rc-scan-result rc-scan-result--busy";
      result.innerHTML =
        '<img class="rc-scan-result__thumb" src="' + dataUrl + '" alt="">' +
        '<div class="rc-scan-result__busy-text">' +
          '<div class="rc-scan-result__spinner" aria-hidden="true"></div>' +
          '<p>' + tr("reciclar.escaner.analizando", "Analizando la imagen…") + '</p>' +
        '</div>';
    }

    function renderMatch(dataUrl, match) {
      var label = (window.recoMaterialInfo && window.recoMaterialInfo.has(match.key))
        ? window.recoMaterialInfo.getLabel(match.key)
        : match.key;
      var data = getInfoCategoria(match.key);
      var pct = Math.round(match.probability * 100);
      var lowConfidence = match.probability < MIN_CONFIDENCE;

      // Mensaje explícito de reciclable/no reciclable: prioriza el
      // texto que viene de Supabase (mensaje_escaner); si todavía no
      // cargó, se arma uno equivalente con el badge del respaldo local.
      var mensajeReciclable = data.mensaje
        || (data.requierePuntoEspecial
          ? "⚠️ Esto se recicla, pero necesita un punto especial."
          : "✅ Esto se recicla.");

      result.className = "rc-scan-result rc-scan-result--match";
      result.innerHTML =
        '<img class="rc-scan-result__thumb" src="' + dataUrl + '" alt="">' +
        '<div class="rc-scan-result__body">' +
          '<span class="rc-scan-result__eyebrow">' + tr("reciclar.escaner.detectamos", "Detectamos") + '</span>' +
          '<div class="rc-scan-result__title">' + label + '</div>' +
          '<span class="' + (data.warn ? "rc-minfo__badge warn" : "rc-minfo__badge") + '">' + data.badge + '</span>' +
          '<p class="rc-scan-result__hint rc-scan-result__hint--ok">' + mensajeReciclable + '</p>' +
          '<div class="rc-scan-result__confidence">' +
            '<div class="rc-scan-result__confidence-bar"><span style="width:' + pct + '%"></span></div>' +
            '<small>' + tr("reciclar.escaner.confianza", "Confianza") + ': ' + pct + '%</small>' +
          '</div>' +
          (lowConfidence
            ? '<p class="rc-scan-result__hint">' + tr("reciclar.escaner.bajaConfianza", "No estamos muy seguros. Si no coincide, prueba con otra foto o elige el material manualmente arriba.") + '</p>'
            : '<p class="rc-scan-result__hint">' + tr("reciclar.escaner.verAbajo", "Mira los detalles completos en el panel de abajo ↓") + '</p>'
          ) +
        '</div>';
    }

    function renderNoMatch(dataUrl) {
      result.className = "rc-scan-result rc-scan-result--nomatch";
      result.innerHTML =
        '<img class="rc-scan-result__thumb" src="' + dataUrl + '" alt="">' +
        '<div class="rc-scan-result__body">' +
          '<div class="rc-scan-result__title">' + tr("reciclar.escaner.noReconocido", "No pudimos identificar el objeto con seguridad") + '</div>' +
          '<p class="rc-scan-result__hint">' + tr("reciclar.escaner.sugerencia", "Prueba con más luz, acerca el objeto o enfócalo mejor. También puedes elegir la categoría manualmente en la lista de arriba.") + '</p>' +
        '</div>';
    }

    function renderError(message) {
      result.className = "rc-scan-result rc-scan-result--error";
      result.innerHTML =
        '<div class="rc-scan-result__body">' +
          '<div class="rc-scan-result__title">' + tr("reciclar.escaner.error", "No pudimos analizar la imagen") + '</div>' +
          '<p class="rc-scan-result__hint">' + message + '</p>' +
        '</div>';
    }

    function processFile(file) {
      if (!file) return;

      if (!/^image\//.test(file.type)) {
        renderError(tr("reciclar.escaner.errorTipo", "Ese archivo no es una imagen. Sube una foto en JPG, PNG o WEBP."));
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        renderError(tr("reciclar.escaner.errorTamano", "La imagen pesa demasiado. El máximo es 10MB."));
        return;
      }

      fileToImage(file).then(function (loaded) {
        // Se guarda ya (antes de saber si MobileNet acierta) para que
        // el botón de IA pueda usar la misma foto sin pedir subirla
        // de nuevo, incluso si el resultado local fue "no reconocido".
        lastPhotoDataUrl = loaded.dataUrl;
        iaBtn.hidden = false;
        iaBtn.disabled = false;
        iaBtn.textContent = "✨ Verificar con IA (más preciso)";
        iaBox.className = "rc-scan-ia-result"; // oculta cualquier resultado de IA de una foto anterior

        var firstLoad = !modelPromise;
        if (firstLoad) renderLoadingModel();
        else renderAnalyzing(loaded.dataUrl);

        // Se espera también a que las categorías de Supabase estén
        // listas (normalmente ya lo están: la carga arrancó al abrir
        // la página, mucho antes de que el usuario suba una foto).
        // Si tarda o falla, igual se sigue: renderMatch cae al
        // respaldo local automáticamente.
        return Promise.all([getModel(), categoriasPromise]).then(function (resultados) {
          var model = resultados[0];
          if (firstLoad) renderAnalyzing(loaded.dataUrl);
          return model.classify(loaded.img, 5);
        }).then(function (predictions) {
          var match = mapPredictions(predictions);
          if (match) {
            renderMatch(loaded.dataUrl, match);
            if (window.recoMaterialInfo) {
              window.recoMaterialInfo.showByKey(match.key);
            }
            logScan(match.key, match.rawLabel, match.probability);
          } else {
            renderNoMatch(loaded.dataUrl);
            var top = predictions && predictions[0];
            logScan(null, top ? top.className : null, top ? top.probability : null);
          }
        });
      }).catch(function (err) {
        console.error("[RECO+ escáner]", err);
        renderError(tr("reciclar.escaner.errorGeneral", "Ocurrió un problema al analizar la imagen. Verifica tu conexión e inténtalo de nuevo."));
      });
    }

    /* ---- Selección desde el input de archivo ---- */
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      processFile(file);
      input.value = ""; // permite volver a subir el mismo archivo si se repite
    });

    /* ---- Arrastrar y soltar sobre la zona del escáner ---- */
    ["dragenter", "dragover"].forEach(function (evt) {
      drop.addEventListener(evt, function (e) {
        e.preventDefault();
        drop.classList.add("is-dragover");
      });
    });
    ["dragleave", "dragend"].forEach(function (evt) {
      drop.addEventListener(evt, function () {
        drop.classList.remove("is-dragover");
      });
    });
    drop.addEventListener("drop", function (e) {
      e.preventDefault();
      drop.classList.remove("is-dragover");
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      processFile(file);
    });
  });
})();
