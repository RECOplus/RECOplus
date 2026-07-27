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

  // Resolución solicitada a la cámara
  video: { width: 480, height: 360, facingMode: 'environment' },

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
    this.onResultado(
      { ...entradaGanadora.material, confianzaBaja: entradaGanadora.material.confianzaBaja || esGanadorParcial },
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

    this._escaneandoIA = true;
    this._setEstadoIA('capturando');

    try {
      const base64 = this._capturarFrameComoBase64();
      this._setEstadoIA('consultando');

      const respuesta = await fetch(this.config.endpointClasificacionIA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok || !datos || !datos.id) {
        const mensaje = (datos && (datos.mensaje || datos.error)) || `HTTP_${respuesta.status}`;
        throw new Error('IA_CLASIFICACION_FALLO: ' + mensaje);
      }

      const base = MATERIALES[datos.id] || MATERIALES.no_reciclable;
      const material = {
        ...base,
        nombre: base.nombre,
        labelOriginal: datos.razon || '',
        coincidenciaKeyword: datos.razon || null,
        confianzaBaja: datos.confianza === 'baja',
      };

      this.onResultado(material, [{ label: datos.razon || '', confidence: 1 }], {
        fuente: 'gemini',
        confianza: datos.confianza,
      });
    } catch (error) {
      console.error('[RecoScanner] Fallo en escaneo preciso (IA):', error);
      this.onError(error, 'escaneoPreciso');
    } finally {
      this._escaneandoIA = false;
      this._setEstadoIA(null);
    }
  }

  /** Notifica un sub-estado del escaneo IA sin tocar la máquina de estados principal (ESTADOS). */
  _setEstadoIA(subEstado) {
    this.onEstado(this.estadoActual, { subEstadoIA: subEstado });
  }

  /** Dibuja el frame actual del <video> en un canvas oculto y lo devuelve como base64 JPEG. */
  _capturarFrameComoBase64() {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoEl.videoWidth;
    canvas.height = this.videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);
    // toDataURL incluye el prefijo "data:image/jpeg;base64,"; el backend
    // ya sabe recortarlo, pero se recorta aquí también para mandar menos bytes.
    return canvas.toDataURL('image/jpeg', this.config.calidadCapturaIA).split(',')[1];
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
 * Traduce los códigos de error internos a mensajes en español
 * listos para mostrar al usuario final.
 */
export function mensajeErrorLegible(error) {
  const codigo = error.message.split(':')[0];
  const mapa = {
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
  };
  return mapa[codigo] || 'Ocurrió un error inesperado con el escáner.';
}