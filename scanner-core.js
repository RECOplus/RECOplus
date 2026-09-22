/**
 * scanner-core.js
 * ---------------------------------------------------------------
 * Escáner de objetos reciclables para RECO+.
 * - Usa ml5.js (MobileNet) para clasificar lo que ve la cámara.
 * - Traduce el resultado a un material de RECO+ (material-map.js).
 * - Maneja el ciclo de vida completo evitando condiciones de carrera:
 *   el modelo y la cámara se inicializan en paralelo mediante
 *   promesas explícitas, y la clasificación NUNCA arranca hasta
 *   que AMBOS estén listos (ver `iniciar()`).
 *
 * Dependencias externas (cárgalas en el HTML antes de este archivo):
 *   <script src="https://unpkg.com/ml5@1/dist/ml5.js"></script>
 *
 * No usa frameworks. Exporta una clase que puedes instanciar en
 * cualquier página.
 * ---------------------------------------------------------------
 */

import { resolverMaterialDesdePredicciones, MATERIALES } from './material-map.js';

/**
 * Categorías reales desde la tabla `categorias` de Supabase.
 * -------------------------------------------------------------
 * Fuente de verdad de "¿es reciclable?", el badge (Reciclable /
 * Reutilizable / Requiere punto especial) y el mensaje que ve el
 * usuario. MATERIALES (material-map.js) solo aporta color/icono y
 * sirve de respaldo si esta carga falla o aún no ha terminado.
 *
 * Se carga UNA sola vez por sesión de página (son datos de
 * referencia que casi nunca cambian), en paralelo a todo lo demás,
 * usando el cliente global window.recoSupabase que ya expone
 * supabase-config.js. Si ese script no corrió (página sin Supabase
 * configurado) o la consulta falla, se cae silenciosamente al
 * respaldo local en MATERIALES — el escáner nunca debe quedar sin
 * poder mostrar un resultado por esto.
 */
let _categoriasSupabasePromise = null;

// Idioma activo del sitio (misma clave de localStorage que usa
// i18n.js y reciclar-scanner.js). Se usa para elegir, de los datos de
// Supabase, las columnas "_en" cuando el sitio está en inglés.
function _isEnglish() {
  return (typeof window !== 'undefined') &&
    typeof window.localStorage !== 'undefined' &&
    window.localStorage.getItem('reco-lang') === 'en';
}

function _cargarCategoriasSupabase() {
  if (_categoriasSupabasePromise) return _categoriasSupabasePromise;

  if (typeof window === 'undefined' || !window.recoSupabase) {
    _categoriasSupabasePromise = Promise.resolve(null);
    return _categoriasSupabasePromise;
  }

  _categoriasSupabasePromise = window.recoSupabase
    .from('categorias')
    .select('id, nombre, reciclable, requiere_punto_especial, badge, mensaje_escaner, nombre_en, badge_en, mensaje_escaner_en')
    .then((res) => {
      if (res.error || !res.data) {
        console.warn('[RecoScanner] No se pudieron cargar categorías de Supabase, usando respaldo local:', res.error && res.error.message);
        return null;
      }
      const mapa = {};
      res.data.forEach((fila) => { mapa[fila.id] = fila; });
      return mapa;
    })
    .catch((err) => {
      console.warn('[RecoScanner] Error consultando categorías de Supabase, usando respaldo local:', err);
      return null;
    });

  return _categoriasSupabasePromise;
}

/**
 * Enriquece un material ya resuelto (por MobileNet o por Gemini) con
 * los datos reales de Supabase, si ya están disponibles: badge,
 * mensaje_escaner y si requiere punto especial. Si Supabase todavía
 * no respondió o la fila no existe, el material se devuelve tal cual
 * (con su color/icono/nombre de respaldo de MATERIALES).
 */
function _enriquecerConCategoriaSupabase(material, categoriasMapa) {
  if (!material || !categoriasMapa) return material;
  const fila = categoriasMapa[material.id];
  if (!fila) return material;
  const en = _isEnglish();
  return {
    ...material,
    nombre: (en && fila.nombre_en) || fila.nombre || material.nombre,
    badge: (en && fila.badge_en) || fila.badge || material.badge,
    mensaje: (en ? (fila.mensaje_escaner_en || fila.mensaje_escaner) : fila.mensaje_escaner) || material.mensaje,
    reciclable: fila.reciclable !== false,
    requierePuntoEspecial: !!fila.requiere_punto_especial,
  };
}

/**
 * Región (en píxeles nativos de una fuente de video/foto) que
 * corresponde al marco guía que el usuario ve superpuesto en pantalla
 * (.reco-scanner__visor-marco en scanner-widget.css). Enviar a Gemini
 * solo esta región, en vez del frame completo, recorta el fondo/
 * desorden alrededor del objeto que el usuario ya está centrando
 * visualmente — mismo objeto, menos ambigüedad para la IA.
 *
 * OJO: estas dos constantes deben coincidir con el CSS real. Si se
 * cambia el aspect-ratio de .reco-scanner__stage o el tamaño de
 * .reco-scanner__visor-marco, hay que actualizarlas aquí también.
 */
const ASPECTO_STAGE = 4 / 3; // .reco-scanner__stage { aspect-ratio: 4/3 }
const FRACCION_MARCO = 0.62; // .reco-scanner__visor-marco { width/height: 62% }

function _calcularRegionMarco(anchoFuente, altoFuente) {
  if (!anchoFuente || !altoFuente) {
    // Fuente sin dimensiones válidas todavía: no se puede calcular
    // nada sensato, se devuelve el frame completo tal cual para no
    // romper la captura (mejor una foto sin recortar que ninguna foto).
    return { x: 0, y: 0, width: anchoFuente || 0, height: altoFuente || 0 };
  }

  const aspectoFuente = anchoFuente / altoFuente;

  // 1) Recorte tipo "cover" que hace el <video> para llenar el stage
  //    4:3 (mismo resultado que object-fit:cover, calculado en
  //    píxeles en vez de CSS): la dimensión que sobra se recorta
  //    simétricamente de cada lado.
  let visW = anchoFuente;
  let visH = altoFuente;
  if (aspectoFuente > ASPECTO_STAGE) {
    visW = altoFuente * ASPECTO_STAGE; // fuente más ancha: se recortan los costados
  } else if (aspectoFuente < ASPECTO_STAGE) {
    visH = anchoFuente / ASPECTO_STAGE; // fuente más alta: se recorta arriba/abajo
  }
  const visX = (anchoFuente - visW) / 2;
  const visY = (altoFuente - visH) / 2;

  // 2) El marco guía es el 62% central de esa región visible (mismo
  //    porcentaje y mismo centrado que .reco-scanner__visor-marco).
  const marcoW = visW * FRACCION_MARCO;
  const marcoH = visH * FRACCION_MARCO;
  return {
    x: visX + (visW - marcoW) / 2,
    y: visY + (visH - marcoH) / 2,
    width: marcoW,
    height: marcoH,
  };
}

/**
 * Mide brillo y nitidez aproximada de un canvas ya capturado, para
 * decidir si vale la pena mandarlo a Gemini o pedirle al usuario que
 * vuelva a intentar (cámara tapada, poca luz, mano temblando).
 *
 * Se reescala a un ancho pequeño (anchoAnalisis) antes de analizar:
 * ni el brillo promedio ni la nitidez relativa (comparada contra un
 * umbral fijo) necesitan la resolución completa, y así el análisis es
 * prácticamente instantáneo incluso con fotos de varios megapíxeles.
 *
 * - brillo: promedio de luminancia (0-255). Bajo = imagen oscura.
 * - nitidez: varianza del Laplaciano (kernel de bordes de 4 vecinos)
 *   sobre la imagen en escala de grises — la técnica clásica de
 *   "variance of Laplacian" para detectar desenfoque: una foto
 *   nítida tiene muchos bordes marcados (varianza alta), una borrosa
 *   los suaviza todos (varianza baja).
 */
function _medirCalidadImagen(canvasOrigen, anchoAnalisis) {
  const alto = Math.max(1, Math.round(canvasOrigen.height * (anchoAnalisis / canvasOrigen.width)));
  const mini = document.createElement('canvas');
  mini.width = anchoAnalisis;
  mini.height = alto;
  const ctxMini = mini.getContext('2d', { willReadFrequently: true });
  ctxMini.drawImage(canvasOrigen, 0, 0, anchoAnalisis, alto);

  const { data } = ctxMini.getImageData(0, 0, anchoAnalisis, alto);
  const gris = new Float32Array(anchoAnalisis * alto);
  let sumaBrillo = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // Luminancia perceptual (ITU-R BT.601), misma fórmula que usan la
    // mayoría de conversores a escala de grises.
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gris[p] = g;
    sumaBrillo += g;
  }
  const brillo = sumaBrillo / gris.length;

  // Varianza del Laplaciano (kernel de 4 vecinos), ignorando el borde
  // de 1px para no salirse del arreglo.
  let sumaLap = 0;
  let sumaLap2 = 0;
  let n = 0;
  for (let y = 1; y < alto - 1; y++) {
    for (let x = 1; x < anchoAnalisis - 1; x++) {
      const idx = y * anchoAnalisis + x;
      const lap =
        4 * gris[idx] -
        gris[idx - 1] -
        gris[idx + 1] -
        gris[idx - anchoAnalisis] -
        gris[idx + anchoAnalisis];
      sumaLap += lap;
      sumaLap2 += lap * lap;
      n++;
    }
  }
  const mediaLap = n ? sumaLap / n : 0;
  const nitidez = n ? sumaLap2 / n - mediaLap * mediaLap : 0;

  return { brillo, nitidez };
}

/**
 * Estados posibles del escáner, útiles para pintar la UI.
 */
export const ESTADOS = {
  INACTIVO: 'inactivo',
  SOLICITANDO_CAMARA: 'solicitando_camara',
  CARGANDO_MODELO: 'cargando_modelo',
  LISTO: 'listo',
  ESCANEANDO: 'escaneando',
  ERROR: 'error',
};

const CONFIG_DEFECTO = {
  // Reintentos de carga del modelo. En redes lentas o con Live Server
  // bloqueando el CDN, la primera carga puede fallar sin razón aparente.
  intentosMaxModelo: 3,
  esperaEntreIntentosMs: 1500,

  // Timeout duro: si el modelo no carga en este tiempo, se considera error
  // en vez de dejar al usuario esperando indefinidamente.
  timeoutModeloMs: 20000,

  // Cada cuánto se re-clasifica el frame de video (ms)
  intervaloClasificacionMs: 900,

  // Cuántas predicciones top-N pedir al modelo
  numeroPredicciones: 5,

  // Confianza mínima para considerar el resultado "confiable".
  // MobileNet reparte probabilidad entre 1000 clases, así que incluso
  // una detección CORRECTA suele rondar 15-30% de confianza; un umbral
  // alto aquí descarta detecciones válidas antes de que lleguen a
  // votar. El filtro de ruido principal es la votación de abajo, no
  // este umbral — este umbral solo debe cortar el caso extremo de
  // "el modelo no tiene ninguna pista" (cámara tapada, imagen negra).
  confianzaMinima: 0.08,

  // --- Suavizado temporal (reduce el "parpadeo" entre categorías) ---
  // En vez de reportar cada frame individual, se acumula una ventana
  // de las últimas N clasificaciones y solo se reporta el material que
  // más se repite dentro de esa ventana. Esto evita que un frame aislado
  // mal clasificado cambie el resultado mostrado, sin hacer esperar
  // demasiado al usuario para ver el primer resultado.
  tamanoVentanaVotacion: 4,

  // De la ventana, cuántas coincidencias mínimas del mismo material se
  // necesitan para reportarlo como resultado estable. Con ventana=4 y
  // minimoVotos=2 alcanza con que 2 de los últimos 4 frames coincidan
  // (primer resultado posible en ~1.8s en vez de ~2.7s).
  minimoVotosParaReportar: 2,

  // Cuántos frames seguidos pueden fallar antes de considerar que el
  // escáner está realmente roto (en vez de un glitch puntual)
  maxFallosConsecutivos: 5,

  // Resolución solicitada a la cámara. Antes era 480x360 (pensada
  // para que MobileNet clasificara rápido en el bucle en vivo), pero
  // ese resultado en vivo ya no se pinta en la UI (ver onResultado en
  // scanner-demo.html: descarta todo lo que no venga de Gemini), así
  // que ya no hay razón para limitar la cámara a esa resolución tan
  // baja. Se sube a 720p (ideal, no exacto: se degrada solo en
  // cámaras/webcams que no lo soporten) porque de ahí sale también la
  // foto que se manda a Gemini en escanearPreciso() — más detalle acá
  // ayuda directamente a que la IA reconozca mejor el objeto.
  video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },

  // Endpoint del backend (función serverless en Vercel) que esconde
  // la API key de Gemini y clasifica una foto. Solo se usa cuando se
  // llama a escanearPreciso(); el escaneo en vivo con MobileNet sigue
  // funcionando sin esto (y sin necesidad de internet salvo la carga
  // inicial del modelo).
  endpointClasificacionIA: '/api/classify',

  // Calidad JPEG (0-1) del frame que se manda a Gemini. Más bajo =
  // sube más rápido y consume menos cuota de red, pero peor detalle
  // para objetos pequeños o con poco contraste.
  calidadCapturaIA: 0.85,

  // --- Chequeo de calidad de la foto antes de mandarla a Gemini ---
  // Evita gastar una llamada (y darle al usuario un resultado "no
  // identificado") cuando la foto en sí ya viene mal: muy oscura o
  // borrosa por temblor de mano. Se puede desactivar con
  // chequeoCalidadFoto:false si en la práctica da demasiados falsos
  // positivos.
  chequeoCalidadFoto: true,

  // Ancho (px) al que se reescala la foto para medir brillo/nitidez.
  // No hace falta el tamaño completo para esto, así que el análisis
  // es prácticamente gratis incluso con fotos de varios megapíxeles.
  anchoAnalisisCalidad: 160,

  // Brillo promedio mínimo (0-255, luminancia) para considerar que
  // hay suficiente luz. Calibrado de forma conservadora (bastante
  // bajo) para no rechazar fotos en interiores con luz normal; ajusta
  // este número si en la práctica deja pasar fotos muy oscuras o
  // rechaza fotos que en realidad se ven bien.
  umbralBrilloMinimo: 35,

  // Varianza mínima del Laplaciano para considerar la foto "nítida"
  // (técnica clásica de "variance of Laplacian" para detectar
  // desenfoque). Umbral empírico: valores típicos rondan varios
  // cientos en fotos nítidas y caen por debajo de 50-80 en fotos
  // claramente borrosas. Puede necesitar ajuste con cámaras reales.
  umbralNitidezMinima: 60,
};

export class RecoScanner {
  /**
   * @param {Object} opciones
   * @param {HTMLVideoElement} opciones.videoEl - elemento <video> ya en el DOM
   * @param {Function} [opciones.onEstado] - callback(estado, detalle)
   * @param {Function} [opciones.onResultado] - callback(materialResuelto, prediccionesCrudas)
   * @param {Function} [opciones.onError] - callback(error, contexto)
   * @param {Object} [opciones.config] - overrides de CONFIG_DEFECTO
   */
  constructor({ videoEl, onEstado, onResultado, onError, config = {} } = {}) {
    if (!videoEl) {
      throw new Error('RecoScanner requiere un elemento <video> (videoEl).');
    }
    this.videoEl = videoEl;
    this.onEstado = onEstado || (() => {});
    this.onResultado = onResultado || (() => {});
    this.onError = onError || (() => {});
    this.config = { ...CONFIG_DEFECTO, ...config };

    this.clasificador = null;
    this.stream = null;
    this.intervaloId = null;
    this.destruido = false;

    // Ventana deslizante de las últimas clasificaciones, para suavizado
    // temporal por votación (ver _procesarResultados).
    this._ventanaVotacion = [];
    this._ultimoMaterialReportado = null;

    // Dispara la carga de categorías reales (tabla `categorias` de
    // Supabase) ya mismo, en paralelo a cámara/modelo: para cuando el
    // usuario tenga el primer resultado, lo normal es que esto ya haya
    // resuelto. _categoriasMapa se rellena cuando la promesa resuelve;
    // mientras tanto queda null y se usa el respaldo de MATERIALES.
    this._categoriasMapa = null;
    _cargarCategoriasSupabase().then((mapa) => {
      this._categoriasMapa = mapa;
    });

    this._setEstado(ESTADOS.INACTIVO);
  }

  _setEstado(estado, detalle) {
    this.estadoActual = estado;
    this.onEstado(estado, detalle);
  }

  /**
   * Punto de entrada único. Lanza cámara y modelo EN PARALELO
   * pero solo empieza a clasificar cuando ambos han resuelto.
   * Esto es lo que elimina la condición de carrera típica de
   * "el modelo intenta leer un video que aún no tiene frames".
   */
  async iniciar() {
    if (this.estadoActual === ESTADOS.ESCANEANDO) return;

    try {
      const [ , ] = await Promise.all([
        this._iniciarCamara(),
        this._cargarModeloConReintentos(),
      ]);

      // Verificación extra anti-race-condition: algunos navegadores
      // resuelven getUserMedia antes de que el video tenga dimensiones
      // reales. Esperamos explícitamente a 'loadeddata'.
      await this._esperarVideoListo();

      if (this.destruido) return;

      this._setEstado(ESTADOS.LISTO);
      this._empezarBucleClasificacion();
    } catch (error) {
      this._manejarError(error, 'iniciar');
    }
  }

  async _iniciarCamara() {
    this._setEstado(ESTADOS.SOLICITANDO_CAMARA);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('CAMARA_NO_SOPORTADA');
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: this.config.video,
        audio: false,
      });
    } catch (err) {
      // Traducimos errores comunes de permisos a mensajes claros
      if (err.name === 'NotAllowedError') throw new Error('CAMARA_PERMISO_DENEGADO');
      if (err.name === 'NotFoundError') throw new Error('CAMARA_NO_ENCONTRADA');
      if (err.name === 'NotReadableError') throw new Error('CAMARA_EN_USO');
      throw new Error('CAMARA_ERROR_DESCONOCIDO: ' + err.message);
    }

    this.videoEl.srcObject = this.stream;
    this.videoEl.setAttribute('playsinline', ''); // iOS
    this.videoEl.muted = true;
    await this.videoEl.play();

    // Espejo SOLO si la cámara activa es realmente la frontal.
    // config.video pide 'environment' (trasera) por defecto -- la que
    // usan casi todos los celulares -- y ahí espejar hace que el
    // mundo real se vea invertido de lado a lado. Las webcams de
    // escritorio casi siempre son frontales y normalmente NO declaran
    // facingMode en getSettings(): por eso, si el navegador no lo
    // reporta, se asume frontal (mismo comportamiento visual que había
    // antes de este fix, que sólo cambia el caso confirmado de trasera).
    const pista = this.stream.getVideoTracks()[0];
    const facingMode = pista && pista.getSettings ? pista.getSettings().facingMode : null;
    const esTrasera = facingMode === 'environment';
    this.videoEl.classList.toggle('reco-scanner__video--espejo', !esTrasera);
  }

  _esperarVideoListo() {
    return new Promise((resolve, reject) => {
      if (this.videoEl.readyState >= 2 && this.videoEl.videoWidth > 0) {
        return resolve();
      }
      const timeoutId = setTimeout(() => {
        reject(new Error('VIDEO_TIMEOUT'));
      }, 8000);

      this.videoEl.addEventListener(
        'loadeddata',
        () => {
          clearTimeout(timeoutId);
          resolve();
        },
        { once: true }
      );
    });
  }

  /**
   * Carga MobileNet con reintentos y timeout.
   * Diagnostica la causa más probable de fallo (red lenta, CORS/CSP
   * bloqueado por Live Server, o error del propio runtime de ml5).
   */
  async _cargarModeloConReintentos() {
    this._setEstado(ESTADOS.CARGANDO_MODELO);

    if (typeof ml5 === 'undefined') {
      throw new Error(
        'ML5_NO_CARGADO: la librería ml5.js no está disponible. ' +
        'Verifica que el <script src="...ml5.js"> esté ANTES de este módulo ' +
        'y que no esté bloqueado por CSP/adblock/CORS (revisa la consola de Network).'
      );
    }

    let ultimoError = null;

    for (let intento = 1; intento <= this.config.intentosMaxModelo; intento++) {
      try {
        this.clasificador = await this._cargarModeloConTimeout();
        return; // éxito
      } catch (err) {
        ultimoError = err;
        console.warn(
          `[RecoScanner] Intento ${intento}/${this.config.intentosMaxModelo} de carga del modelo falló:`,
          err
        );
        if (intento < this.config.intentosMaxModelo) {
          await this._esperar(this.config.esperaEntreIntentosMs);
        }
      }
    }

    throw new Error(
      'MODELO_NO_CARGO: fallaron todos los intentos. Causas típicas: ' +
      '(1) red lenta/CDN inaccesible, (2) Live Server sirviendo con CSP que bloquea unpkg.com, ' +
      '(3) el modelo se pidió antes de que el <script> de ml5 terminara de evaluarse. ' +
      'Detalle: ' + (ultimoError ? ultimoError.message : 'desconocido')
    );
  }

  _cargarModeloConTimeout() {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout de ' + this.config.timeoutModeloMs + 'ms cargando MobileNet'));
      }, this.config.timeoutModeloMs);

      try {
        const modelo = ml5.imageClassifier('MobileNet', () => {
          clearTimeout(timeoutId);
          resolve(modelo);
        });
      } catch (errSincrono) {
        clearTimeout(timeoutId);
        reject(errSincrono);
      }
    });
  }

  _esperar(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  _empezarBucleClasificacion() {
    this._setEstado(ESTADOS.ESCANEANDO);
    this._clasificarFrame(); // primera clasificación inmediata
    this.intervaloId = setInterval(
      () => this._clasificarFrame(),
      this.config.intervaloClasificacionMs
    );
  }

  _clasificarFrame() {
    if (!this.clasificador || this.destruido) return;
    if (this.videoEl.readyState < 2) return; // frame aún no disponible
    if (this._clasificando) return; // evita solapar llamadas si un frame tarda más que el intervalo

    this._clasificando = true;

    try {
      this._invocarClassify();
    } catch (errSincrono) {
      // Algunas versiones de ml5/TF.js lanzan de forma síncrona
      // (ej. tensor con shape inválido) en vez de llamar al callback
      // con error. Sin este try/catch, esto rompería el intervalo
      // silenciosamente sin loguear nada.
      this._clasificando = false;
      console.error('[RecoScanner] Excepción síncrona en classify():', errSincrono);
      this._fallosConsecutivos = (this._fallosConsecutivos || 0) + 1;
      if (this._fallosConsecutivos >= this.config.maxFallosConsecutivos) {
        this._manejarError(
          new Error('CLASIFICACION_FALLO: ' + errSincrono.message),
          'clasificar'
        );
      }
    }
  }

  _invocarClassify() {
    this.clasificador.classify(
      this.videoEl,
      this.config.numeroPredicciones,
      (a, b) => {
        this._clasificando = false;
        if (this.destruido) return;

        // ml5.js 1.3.1 NO usa la firma clásica de Node (error, resultados)
        // de forma consistente: en éxito llama al callback con UN SOLO
        // argumento (el array de predicciones), y en fallo lo llama con
        // el error como primer argumento. Si asumimos ciegamente
        // "el primer argumento es el error", un array de resultados
        // válido se interpreta como fallo (esto es justo lo que estaba
        // pasando: "errores" que en realidad eran predicciones correctas).
        //
        // Por eso aquí se detecta el caso por LA FORMA del dato, no por
        // su posición:
        const resultados = Array.isArray(a) ? a : Array.isArray(b) ? b : null;
        const error = !Array.isArray(a) && a ? a : null;

        if (resultados) {
          this._fallosConsecutivos = 0;
          this._procesarResultados(resultados);
          return;
        }

        if (error) {
          // Se loguea el objeto de error COMPLETO (no solo .message, que
          // puede venir undefined si ml5/TF.js rechaza con algo que no es
          // un Error estándar). Esto es lo que hay que mirar en la consola
          // del navegador para saber la causa real.
          console.error('[RecoScanner] Fallo clasificando un frame. Error crudo:', error);

          this._fallosConsecutivos = (this._fallosConsecutivos || 0) + 1;

          // Un fallo aislado (frame corrupto, resize a mitad de camino, etc.)
          // NO debe apagar el escáner: se descarta ese frame y se sigue
          // en el siguiente tick del intervalo.
          if (this._fallosConsecutivos < this.config.maxFallosConsecutivos) {
            return;
          }

          // Solo si fallan muchos frames SEGUIDOS asumimos que algo está
          // realmente roto (ej. el modelo quedó en estado inválido).
          const detalleError = error && error.message ? error.message : JSON.stringify(error);
          this._manejarError(
            new Error('CLASIFICACION_FALLO: ' + detalleError),
            'clasificar'
          );
          return;
        }

        // Ni resultados ni error reconocibles: se ignora silenciosamente
        // este frame en vez de tratarlo como fallo grave.
        console.warn('[RecoScanner] Callback de classify() sin forma reconocible:', a, b);
      }
    );
  }

  _procesarResultados(resultadosCrudos) {
    if (!resultadosCrudos || resultadosCrudos.length === 0) return;

    const material = resolverMaterialDesdePredicciones(resultadosCrudos, {
      confianzaMinima: this.config.confianzaMinima,
    });

    // --- Suavizado temporal por votación ---
    // Se agrega esta clasificación a la ventana deslizante y solo se
    // reporta hacia afuera (onResultado) cuando un material junta
    // suficientes votos dentro de la ventana. Esto evita que la UI
    // "parpadee" entre categorías cuando un frame aislado se confunde.
    this._ventanaVotacion.push({ material, resultadosCrudos });
    if (this._ventanaVotacion.length > this.config.tamanoVentanaVotacion) {
      this._ventanaVotacion.shift();
    }

    // Conteo de votos por id de material dentro de la ventana actual
    const conteo = new Map();
    for (const entrada of this._ventanaVotacion) {
      const id = entrada.material.id;
      conteo.set(id, (conteo.get(id) || 0) + 1);
    }

    // Material con más votos en la ventana
    let idGanador = null;
    let votosGanador = 0;
    for (const [id, votos] of conteo) {
      if (votos > votosGanador) {
        idGanador = id;
        votosGanador = votos;
      }
    }

    // Aún no hay suficiente consenso. Mientras la ventana no esté llena,
    // esto es normal (se sigue acumulando, primer resultado en camino).
    // Pero si la ventana YA está llena y aun así nadie alcanza el
    // mínimo de votos, quedarse callado indefinidamente se siente como
    // que el escáner "dejó de funcionar" — en vez de eso, se reporta el
    // material que va ganando aunque no haya alcanzado el mínimo ideal,
    // dejando claro que es una lectura de baja certeza.
    const ventanaLlena = this._ventanaVotacion.length >= this.config.tamanoVentanaVotacion;
    if (votosGanador < this.config.minimoVotosParaReportar) {
      if (!ventanaLlena || !idGanador) return;
      // hay ganador parcial y la ventana ya está llena: se deja pasar
      // marcado explícitamente como confianzaBaja más abajo.
    }

    // Evita disparar onResultado repetidamente con el mismo material ya
    // reportado (solo se reporta cuando hay un cambio real de consenso).
    if (idGanador === this._ultimoMaterialReportado) {
      return;
    }

    // Se toma la entrada más reciente que coincide con el material
    // ganador, para mostrar sus predicciones crudas asociadas.
    const entradaGanadora = [...this._ventanaVotacion]
      .reverse()
      .find((e) => e.material.id === idGanador);

    this._ultimoMaterialReportado = idGanador;
    const esGanadorParcial = votosGanador < this.config.minimoVotosParaReportar;
    const materialFinal = _enriquecerConCategoriaSupabase(
      { ...entradaGanadora.material, confianzaBaja: entradaGanadora.material.confianzaBaja || esGanadorParcial },
      this._categoriasMapa
    );
    this.onResultado(
      materialFinal,
      entradaGanadora.resultadosCrudos,
      { votos: votosGanador, deVentana: this._ventanaVotacion.length, parcial: esGanadorParcial }
    );
  }

  /**
   * Limpia la ventana de votación. Útil para "resetear" el consenso
   * manualmente, por ejemplo si el usuario retira el objeto de cámara
   * y quiere escanear otro distinto sin esperar a que la ventana se
   * llene naturalmente con el nuevo objeto.
   */
  reiniciarVotacion() {
    this._ventanaVotacion = [];
    this._ultimoMaterialReportado = null;
  }

  /**
   * Captura el frame actual del video y lo manda a la función
   * serverless (/api/classify) que a su vez consulta a Gemini.
   *
   * A diferencia del bucle de MobileNet (continuo, local, gratis y
   * sin límite), esto es una llamada puntual a la nube: más precisa
   * porque Gemini entiende contexto en vez de 1000 clases fijas de
   * ImageNet, pero cuesta ~1-2s, requiere internet en cada llamada y
   * está limitada por la cuota gratuita de Gemini. Por eso es un
   * método aparte que el usuario dispara a demanda (ej. botón
   * "Escaneo preciso"), no algo que reemplaza el bucle continuo.
   *
   * No usa this.onResultado con la firma normal porque un escaneo IA
   * no tiene "votos" (es una sola muestra, no una ventana deslizante).
   * Se le pasa meta.fuente = 'gemini' para que la UI lo distinga del
   * resultado de MobileNet si quiere.
   *
   * @returns {Promise<void>} resuelve cuando termina (éxito o error
   *   ya reportado por onError). No relanza la excepción: el bucle de
   *   MobileNet en vivo debe poder seguir corriendo aunque esto falle.
   */
  async escanearPreciso() {
    if (this._escaneandoIA) return; // evita solicitudes duplicadas en paralelo
    if (!this.videoEl.videoWidth) {
      this.onError(new Error('SIN_VIDEO_PARA_CAPTURAR'), 'escaneoPreciso');
      return;
    }

    // El bucle local (MobileNet, cada intervaloClasificacionMs) sigue
    // corriendo salvo que lo pausemos explícitamente: si no se pausa,
    // puede reportar un nuevo consenso MIENTRAS esperamos la respuesta
    // de Gemini y pisar visualmente ese resultado en cuanto llega (el
    // usuario ve "parpadear" el resultado). Por eso el escaneo preciso
    // pausa el bucle local ANTES de capturar el frame, y lo deja
    // pausado incluso después de terminar: el resultado de la IA debe
    // quedar estable en pantalla hasta que el usuario pida explícitamente
    // reanudar (ver reanudar() / botón "Volver a escanear" en la UI).
    const bucleLocalEstabaActivo = !!this.intervaloId;
    this.pausar();

    this._escaneandoIA = true;
    this._setEstadoIA('capturando');

    try {
      const base64 = await this._capturarFrameComoBase64();
      this._setEstadoIA('consultando');

      const respuesta = await fetch(this.config.endpointClasificacionIA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, idioma: _isEnglish() ? 'en' : 'es' }),
      });

      const datos = await respuesta.json().catch(() => null);

      // Solo es un FALLO real de la llamada si la respuesta no fue 200 o
      // no vino ningún body parseable. datos.id === null con
      // respuesta.ok es un resultado VÁLIDO de api/classify.js: Gemini
      // no logró identificar el objeto con confianza suficiente (foto
      // borrosa, mal encuadrada, objeto no reconocible, etc.), y en ese
      // caso el backend sí manda datos.sugerencia con un consejo
      // accionable. Antes esto se trataba igual que un error y se
      // perdía esa sugerencia, mostrando solo un mensaje genérico.
      if (!respuesta.ok || !datos) {
        const mensaje = (datos && (datos.mensaje || datos.error)) || `HTTP_${respuesta.status}`;
        throw new Error('IA_CLASIFICACION_FALLO: ' + mensaje);
      }

      // Sin id: se usa 'sin_confianza' (no 'no_reciclable') porque el
      // mensaje correcto para el usuario es "acércate más / mejora la
      // luz", no "esto no se recicla" (ver material-map.js).
      // Se guarda la respuesta cruda para poder re-emitir el mismo
      // resultado más adelante en otro idioma (ver
      // relocalizarUltimoResultadoIA), sin volver a consultar a Gemini.
      this._ultimoDatosIA = datos;
      const material = this._materialDesdeDatosIA(datos);

      this.onResultado(material, [{ label: datos.razon || '', confidence: 1 }], {
        fuente: 'gemini',
        confianza: datos.confianza,
      });
      // Éxito: el bucle local se queda pausado a propósito (no se
      // reanuda aquí). Se avisa a la UI vía subEstadoIA='pausado_tras_resultado'
      // para que muestre el botón "Volver a escanear" en vez de que el
      // usuario vea el resultado de la IA cambiar solo unos segundos
      // después por culpa del bucle local.
      this._pausadoPorIA = true;
    } catch (error) {
      console.error('[RecoScanner] Fallo en escaneo preciso (IA):', error);
      this.onError(error, 'escaneoPreciso');

      // Si el escaneo IA falla, no tiene sentido dejar el bucle local
      // pausado y sin resultado nuevo que mostrar: se reanuda solo si
      // ya estaba corriendo antes de este intento.
      if (bucleLocalEstabaActivo) {
        this.reanudar();
      }
    } finally {
      this._escaneandoIA = false;
      this._setEstadoIA(this._pausadoPorIA ? 'pausado_tras_resultado' : null);
    }
  }

  /** Notifica un sub-estado del escaneo IA sin tocar la máquina de estados principal (ESTADOS). */
  _setEstadoIA(subEstado) {
    this.onEstado(this.estadoActual, { subEstadoIA: subEstado });
  }

  /**
   * Construye el objeto `material` (para onResultado) a partir de la
   * respuesta cruda de /api/classify (Gemini), combinando el respaldo
   * local de MATERIALES con el enriquecimiento en vivo de Supabase
   * (_categoriasMapa) -- SIEMPRE evaluado con el idioma ACTUAL del
   * sitio (_isEnglish()), sin importar en qué idioma se le pidió
   * originalmente la clasificación a Gemini. Factorizado aparte de
   * escanearPreciso() para poder reusarlo también al re-localizar un
   * resultado ya mostrado cuando el usuario cambia de idioma después
   * de escanear (ver relocalizarUltimoResultadoIA).
   *
   * `datos.mensaje/reciclable/requierePuntoEspecial` (que sí vienen
   * fijos en el idioma que se pidió a Gemini en su momento) solo se
   * usan como respaldo si Supabase no tiene fila para ese id --
   * nunca pisan un valor ya recalculado en el idioma actual, para no
   * volver a dejar el mensaje pegado en el idioma viejo.
   */
  _materialDesdeDatosIA(datos) {
    const base = (datos.id && MATERIALES[datos.id]) || MATERIALES.sin_confianza;
    const nombreBase = (_isEnglish() && base.nombre_en) || base.nombre;
    const materialCrudo = {
      ...base,
      nombre: nombreBase,
      labelOriginal: datos.razon || '',
      coincidenciaKeyword: datos.razon || null,
      confianzaBaja: datos.confianza === 'baja',
      // Consejo accionable que Gemini devuelve SOLO cuando id es null
      // o la confianza es baja (ver construirPrompt en api/classify.js):
      // texto libre generado por la IA en el idioma que se le pidió en
      // su momento -- es la única parte que NO se puede re-traducir sin
      // volver a consultar a Gemini, así que se deja tal cual quedó si
      // el usuario cambia de idioma después.
      sugerencia: datos.sugerencia || null,
    };
    const material = _enriquecerConCategoriaSupabase(materialCrudo, this._categoriasMapa);
    // Respaldo SOLO si Supabase no tenía fila para este id (entonces
    // material.mensaje/reciclable/requierePuntoEspecial quedan sin
    // definir tras el enriquecimiento): se completa con lo que ya
    // trajo el backend en su momento, aunque quede en el idioma viejo
    // -- mejor eso que dejarlo vacío.
    if (!material.mensaje && datos.mensaje) material.mensaje = datos.mensaje;
    if (typeof material.reciclable !== 'boolean' && typeof datos.reciclable === 'boolean') material.reciclable = datos.reciclable;
    if (typeof material.requierePuntoEspecial !== 'boolean' && typeof datos.requierePuntoEspecial === 'boolean') material.requierePuntoEspecial = datos.requierePuntoEspecial;
    return material;
  }

  /**
   * Vuelve a emitir onResultado() para el ÚLTIMO resultado de escaneo
   * preciso (IA) ya mostrado, recalculando nombre/badge/mensaje en el
   * idioma ACTUALMENTE activo -- sin volver a llamar a Gemini. Pensado
   * para refrescar la tarjeta de resultado cuando el usuario cambia de
   * idioma DESPUÉS de ya tener un resultado final en pantalla (ver
   * evento 'reco:langchange' en scanner-demo.html): antes, ese texto
   * se quedaba pegado en el idioma en que se pidió originalmente el
   * escaneo. No hace nada si todavía no hay ningún resultado de IA
   * guardado en esta sesión del escáner.
   */
  relocalizarUltimoResultadoIA() {
    if (!this._ultimoDatosIA) return;
    const material = this._materialDesdeDatosIA(this._ultimoDatosIA);
    this.onResultado(material, [{ label: this._ultimoDatosIA.razon || '', confidence: 1 }], {
      fuente: 'gemini',
      confianza: this._ultimoDatosIA.confianza,
    });
  }

  /**
   * true si ya hay un resultado de escaneo preciso (IA) guardado en esta
   * sesión del escáner (es decir, si relocalizarUltimoResultadoIA() tiene
   * algo que re-emitir). Pensado para que la UI (scanner-demo.html) sepa,
   * al cambiar de idioma, si debe re-traducir manualmente los textos
   * ESTÁTICOS por defecto de la tarjeta de resultado ("Vista previa en
   * vivo" / "Esperando objeto...") -- que ya no llevan data-i18n a
   * propósito, ver el comentario en scanner-demo.html -- o si en cambio
   * corresponde re-traducir el resultado real vía relocalizarUltimoResultadoIA().
   */
  tieneResultadoIA() {
    return !!this._ultimoDatosIA;
  }

  /**
   * Obtiene la mejor foto posible del objeto y la devuelve como base64
   * JPEG (sin el prefijo "data:image/jpeg;base64,").
   *
   * Intenta primero con ImageCapture.takePhoto(), que en los
   * navegadores que lo soportan (Chrome/Edge/Android) puede devolver
   * una foto en la resolución NATIVA del sensor de la cámara — casi
   * siempre más alta que la resolución negociada para el stream de
   * video en vivo (config.video), incluso ahora que esa se subió a
   * 720p. Si no está disponible (Safari, Firefox) o falla por lo que
   * sea, se cae al método de siempre: dibujar el frame actual del
   * <video> en un canvas. Cualquiera de los dos caminos siempre
   * reencoda a JPEG antes de devolver el base64, así que el backend
   * (api/classify.js) no necesita saber cuál se usó.
   */
  async _capturarFrameComoBase64() {
    const canvas = await this._obtenerCanvasRecortado();
    this._verificarCalidadFoto(canvas);
    // toDataURL incluye el prefijo "data:image/jpeg;base64,"; el backend
    // ya sabe recortarlo, pero se recorta aquí también para mandar menos bytes.
    return canvas.toDataURL('image/jpeg', this.config.calidadCapturaIA).split(',')[1];
  }

  /** Obtiene el canvas ya recortado al marco guía, probando primero ImageCapture y cayendo al <video> si falla. */
  async _obtenerCanvasRecortado() {
    if (typeof ImageCapture !== 'undefined' && this.stream) {
      try {
        return await this._capturarConImageCapture();
      } catch (err) {
        console.warn(
          '[RecoScanner] ImageCapture.takePhoto() falló, se usa el frame del <video> como respaldo:',
          err
        );
      }
    }
    return this._capturarFrameDesdeVideo();
  }

  /** Foto en la resolución nativa del sensor, vía la Image Capture API, ya recortada al marco guía. */
  async _capturarConImageCapture() {
    const track = this.stream.getVideoTracks()[0];
    if (!track) throw new Error('Sin track de video disponible para ImageCapture');

    const imageCapture = new ImageCapture(track);
    const blob = await imageCapture.takePhoto();
    const bitmap = await createImageBitmap(blob);

    return this._recortarACanvas(bitmap, bitmap.width, bitmap.height);
  }

  /** Respaldo: dibuja el frame actual del <video>, ya recortado al marco guía. */
  _capturarFrameDesdeVideo() {
    return this._recortarACanvas(this.videoEl, this.videoEl.videoWidth, this.videoEl.videoHeight);
  }

  /**
   * Recorta `fuente` (un <video> o un ImageBitmap) a la región del
   * marco guía (ver _calcularRegionMarco) y devuelve el CANVAS
   * resultante (todavía sin codificar a JPEG, para poder analizar su
   * calidad antes de decidir si vale la pena mandarlo). Mandar solo
   * esa región a Gemini, en vez del frame completo, es lo que de
   * verdad mejora el reconocimiento: se quita el fondo/desorden que
   * rodea al objeto, dejando solo lo que el usuario ya centró
   * visualmente dentro del marco en pantalla.
   */
  _recortarACanvas(fuente, anchoFuente, altoFuente) {
    const region = _calcularRegionMarco(anchoFuente, altoFuente);
    const canvas = document.createElement('canvas');
    canvas.width = region.width;
    canvas.height = region.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      fuente,
      region.x, region.y, region.width, region.height,
      0, 0, region.width, region.height
    );
    return canvas;
  }

  /**
   * Revisa brillo y nitidez del canvas ya recortado (ver
   * _medirCalidadImagen) y aborta ANTES de gastar una llamada a
   * Gemini si la foto claramente no sirve (muy oscura o borrosa por
   * temblor de mano): mejor pedirle al usuario que reintente en el
   * momento que esperar ~1-2s por una respuesta que de todos modos
   * iba a salir mal.
   */
  _verificarCalidadFoto(canvas) {
    if (!this.config.chequeoCalidadFoto) return;

    const { brillo, nitidez } = _medirCalidadImagen(canvas, this.config.anchoAnalisisCalidad);

    if (brillo < this.config.umbralBrilloMinimo) {
      throw new Error('FOTO_OSCURA');
    }
    if (nitidez < this.config.umbralNitidezMinima) {
      throw new Error('FOTO_BORROSA');
    }
  }

  _manejarError(error, contexto) {
    this._setEstado(ESTADOS.ERROR, { mensaje: error.message, contexto });
    this.onError(error, contexto);
    this.detener();
  }

  /** Pausa la clasificación pero mantiene cámara y modelo cargados */
  pausar() {
    if (this.intervaloId) {
      clearInterval(this.intervaloId);
      this.intervaloId = null;
    }
  }

  /** Reanuda tras pausar() sin recargar nada */
  reanudar() {
    if (!this.intervaloId && this.clasificador && this.estadoActual !== ESTADOS.ERROR) {
      this._empezarBucleClasificacion();
    }
  }

  /**
   * Reactiva el bucle local después de que quedó pausado por un
   * escaneo preciso (IA) exitoso. Pensado para conectarse al botón
   * "Volver a escanear" de la UI: limpia el flag _pausadoPorIA, avisa
   * el cambio de sub-estado, reinicia la ventana de votación (para no
   * arrastrar votos del objeto anterior) y reanuda la clasificación.
   */
  volverAEscanear() {
    this._pausadoPorIA = false;
    this.reiniciarVotacion();
    this.reanudar();
    this._setEstadoIA(null);
  }

  /** Libera cámara y detiene el bucle. El modelo permanece en memoria. */
  detener() {
    this.pausar();
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }
    if (this.estadoActual !== ESTADOS.ERROR) {
      this._setEstado(ESTADOS.INACTIVO);
    }
  }

  /** Limpieza total (llamar en beforeunload o al desmontar la vista) */
  destruir() {
    this.destruido = true;
    this.detener();
    this.clasificador = null;
  }
}

/**
 * Traduce los códigos de error internos a mensajes listos para
 * mostrar al usuario final, en el idioma activo del sitio (misma
 * detección que usa el resto de este archivo vía _isEnglish(), que
 * lee la clave de localStorage 'reco-lang' que también usa i18n.js).
 * Antes esto era un mapa fijo en español; como scanner-demo.html
 * llama a esta función directamente (sin pasar por window.t()), el
 * mensaje se quedaba en español aunque el resto de la página ya
 * estuviera en inglés.
 */
export function mensajeErrorLegible(error) {
  const codigo = error.message.split(':')[0];
  const en = _isEnglish();

  const mapaEs = {
    CAMARA_NO_SOPORTADA: 'Tu navegador no soporta acceso a cámara. Prueba con Chrome o Firefox actualizados.',
    CAMARA_PERMISO_DENEGADO: 'Necesitamos permiso de cámara para escanear. Revisa los permisos del sitio en tu navegador.',
    CAMARA_NO_ENCONTRADA: 'No se detectó ninguna cámara en este dispositivo.',
    CAMARA_EN_USO: 'La cámara está siendo usada por otra aplicación. Ciérrala e intenta de nuevo.',
    VIDEO_TIMEOUT: 'La cámara tardó demasiado en responder. Intenta recargar la página.',
    ML5_NO_CARGADO: 'No se pudo cargar la librería de reconocimiento (ml5.js). Revisa tu conexión a internet.',
    MODELO_NO_CARGO: 'No se pudo cargar el modelo de reconocimiento tras varios intentos. Revisa tu conexión.',
    CLASIFICACION_FALLO: 'Ocurrió un error analizando la imagen. Reintentando automáticamente.',
    SIN_VIDEO_PARA_CAPTURAR: 'La cámara todavía no está lista para capturar una foto.',
    IA_CLASIFICACION_FALLO: 'No se pudo consultar el escaneo preciso. Intenta de nuevo en unos segundos.',
    FOTO_OSCURA: 'La foto salió muy oscura. Acércate a una fuente de luz e inténtalo de nuevo.',
    FOTO_BORROSA: 'La foto salió borrosa. Mantén el teléfono firme, a unos 15-20cm del objeto, e inténtalo de nuevo.',
  };

  const mapaEn = {
    CAMARA_NO_SOPORTADA: 'Your browser does not support camera access. Try an updated version of Chrome or Firefox.',
    CAMARA_PERMISO_DENEGADO: 'We need camera permission to scan. Check the site permissions in your browser.',
    CAMARA_NO_ENCONTRADA: 'No camera was detected on this device.',
    CAMARA_EN_USO: 'The camera is being used by another application. Close it and try again.',
    VIDEO_TIMEOUT: 'The camera took too long to respond. Try reloading the page.',
    ML5_NO_CARGADO: 'Could not load the recognition library (ml5.js). Check your internet connection.',
    MODELO_NO_CARGO: 'Could not load the recognition model after several attempts. Check your connection.',
    CLASIFICACION_FALLO: 'An error occurred analyzing the image. Retrying automatically.',
    SIN_VIDEO_PARA_CAPTURAR: 'The camera is not ready yet to capture a photo.',
    IA_CLASIFICACION_FALLO: 'Could not reach the precise scan. Try again in a few seconds.',
    FOTO_OSCURA: 'The photo came out too dark. Move closer to a light source and try again.',
    FOTO_BORROSA: 'The photo came out blurry. Hold your phone steady, about 15-20cm from the object, and try again.',
  };

  const mapa = en ? mapaEn : mapaEs;
  return mapa[codigo] || (en ? 'An unexpected error occurred with the scanner.' : 'Ocurrió un error inesperado con el escáner.');
}