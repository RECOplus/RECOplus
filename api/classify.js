/**
 * api/classify.js
 * ---------------------------------------------------------------
 * Función serverless (Vercel) que recibe una foto desde
 * reciclar-scanner.js (botón "✨ Verificar con IA"), se la manda a
 * Gemini y devuelve la categoría ya validada contra la tabla
 * `categorias` de Supabase (la misma fuente de verdad que usa el
 * escáner local en reciclar-scanner.js).
 *
 * Por qué existe este archivo (y no se llama a Gemini directo desde
 * el navegador): la API key de Gemini NO puede vivir en JS que corre
 * en el cliente — cualquiera que abra "Ver código fuente" se la
 * lleva. Esta función corre en el servidor de Vercel; la key solo
 * existe ahí, leída de una variable de entorno.
 *
 * Requisito en Vercel:
 *   Project Settings → Environment Variables → GEMINI_API_KEY
 *   (con tu key de https://aistudio.google.com/apikey)
 *
 * Convención de Vercel: cualquier archivo .js dentro de /api se
 * vuelve un endpoint automáticamente. Este queda en:
 *   POST /api/classify
 *
 * Body esperado (JSON):
 *   { "image": "<string base64, con o sin el prefijo data:image/...;base64,>" }
 *
 * Respuesta (JSON):
 *   { "id": "plastico", "confianza": "alta", "razon": "botella de agua",
 *     "mensaje": "✅ Esto se recicla...", "reciclable": true,
 *     "requierePuntoEspecial": false }
 *   Si Gemini no logra identificar el objeto con ninguna categoría:
 *   { "id": null, "confianza": "baja", "razon": "..." }
 * ---------------------------------------------------------------
 */

// URL y anon key de Supabase: son las MISMAS que ya están públicas en
// supabase-config.js (una anon key está pensada para exponerse — el
// acceso real lo controla Row Level Security). Se usan aquí para leer
// la tabla `categorias` por REST en vez de agregar la dependencia
// @supabase/supabase-js, manteniendo este archivo sin dependencias
// externas de npm (igual que estaba).
const SUPABASE_URL = 'https://eephwthybxjwleajrvnl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcGh3dGh5Ynhqd2xlYWpydm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5Njc0NzQsImV4cCI6MjA5OTU0MzQ3NH0.k8fnOuX9RJ-VEvFBSCU_Uwuqiybk9K_KuZyqMmTqekw';

// Respaldo local por si Supabase no responde (sin internet momentáneo,
// mantenimiento, etc.): el escaneo preciso debe poder seguir
// funcionando aunque sea con la guía "congelada" en el código. Si
// agregas o quitas una categoría en Supabase, esto queda desactualizado
// pero solo se usa como último recurso.
const CATEGORIAS_RESPALDO = [
  { id: 'plastico', descripcion_ia: 'envases, botellas, bolsas y objetos de plástico en general', reciclable: true, requiere_punto_especial: false, mensaje_escaner: '✅ Esto se recicla. Es plástico: enjuágalo y llévalo a un contenedor de reciclaje.' },
  { id: 'vidrio', descripcion_ia: 'botellas, frascos y envases de vidrio', reciclable: true, requiere_punto_especial: false, mensaje_escaner: '✅ Esto se recicla. Es vidrio: enjuágalo y llévalo a un contenedor de reciclaje.' },
  { id: 'metal', descripcion_ia: 'latas, ollas, utensilios y objetos metálicos', reciclable: true, requiere_punto_especial: false, mensaje_escaner: '✅ Esto se recicla. Es metal: llévalo a un contenedor de reciclaje.' },
  { id: 'papel', descripcion_ia: 'hojas, sobres, empaques de papel o cartón', reciclable: true, requiere_punto_especial: false, mensaje_escaner: '✅ Esto se recicla. Es papel: llévalo a un contenedor de reciclaje.' },
  { id: 'libros', descripcion_ia: 'libros y revistas', reciclable: true, requiere_punto_especial: false, mensaje_escaner: '♻️ Esto se reutiliza. Es un libro: dónalo o llévalo a un punto de acopio de papel.' },
  { id: 'electronicos', descripcion_ia: 'laptops, monitores, electrodomésticos, cables, impresoras', reciclable: true, requiere_punto_especial: true, mensaje_escaner: '⚠️ Esto se recicla, pero necesita un punto especial. Es un electrónico: llévalo a un centro de acopio electrónico.' },
  { id: 'celulares', descripcion_ia: 'teléfonos móviles y tablets', reciclable: true, requiere_punto_especial: true, mensaje_escaner: '⚠️ Esto se recicla, pero necesita un punto especial. Es un celular: llévalo a un punto de recolección de operadoras.' },
  { id: 'ropa', descripcion_ia: 'prendas de vestir, zapatos, accesorios textiles', reciclable: true, requiere_punto_especial: false, mensaje_escaner: '✅ Esto se recicla o dona. Es ropa: dónala si está en buen estado, o llévala a un punto de acopio textil.' },
  { id: 'muebles', descripcion_ia: 'sillas, mesas, estantes y mobiliario en general', reciclable: true, requiere_punto_especial: false, mensaje_escaner: '♻️ Esto se reutiliza. Es un mueble: dónalo si está en buen estado.' },
  { id: 'juguetes', descripcion_ia: 'juguetes de cualquier material', reciclable: true, requiere_punto_especial: false, mensaje_escaner: '♻️ Esto se reutiliza. Es un juguete: dónalo si está en buen estado.' },
  { id: 'baterias', descripcion_ia: 'pilas y baterías sueltas o recargables', reciclable: true, requiere_punto_especial: true, mensaje_escaner: '⚠️ Esto se recicla, pero necesita un punto especial. Es una batería: NUNCA la tires a la basura común.' },
  { id: 'bombillos', descripcion_ia: 'bombillos y focos de cualquier tipo', reciclable: true, requiere_punto_especial: true, mensaje_escaner: '⚠️ Esto se recicla, pero necesita un punto especial. Es un bombillo: llévalo a un punto de acopio de residuos especiales.' },
];

// Cache en memoria: en Vercel, una misma instancia "caliente" de la
// función puede atender varias requests seguidas. Evita golpear
// Supabase en cada foto — las categorías casi nunca cambian. Se
// refresca cada 5 minutos.
let cacheCategorias = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function obtenerCategorias() {
  const ahora = Date.now();
  if (cacheCategorias && (ahora - cacheTimestamp) < CACHE_TTL_MS) {
    return cacheCategorias;
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/categorias?select=id,descripcion_ia,reciclable,requiere_punto_especial,mensaje_escaner`;
    const respuesta = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!respuesta.ok) {
      throw new Error(`Supabase respondió ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    if (!Array.isArray(datos) || datos.length === 0) {
      throw new Error('Supabase devolvió una lista vacía de categorías');
    }

    cacheCategorias = datos;
    cacheTimestamp = ahora;
    return datos;
  } catch (err) {
    console.warn('[api/classify] No se pudieron cargar categorías de Supabase, usando respaldo local:', err.message);
    return CATEGORIAS_RESPALDO;
  }
}

const MODELO_GEMINI = 'gemini-flash-latest'; // alias de Google al flash estable más reciente
const ENDPOINT_GEMINI =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI}:generateContent`;

function construirPrompt(categorias) {
  const guia = categorias.map((c) => `- ${c.id}: ${c.descripcion_ia}`).join('\n');
  const ids = categorias.map((c) => c.id).join('\n- ');

  return `Eres un clasificador de residuos para una app de reciclaje llamada RECO+.
Se te muestra una foto de UN objeto. Debes decidir a cuál de estas categorías pertenece
el material PRINCIPAL del objeto (el material del que está hecho o su tipo, no su contenido):

${guia}

Reglas:
- Responde SOLO con un objeto JSON, sin texto antes ni después, sin backticks de markdown.
- Si el objeto encaja claramente en una categoría, "id" debe ser EXACTAMENTE uno de estos valores
  (en minúsculas, tal como está escrito): ${ids}
- Si el objeto no encaja claramente en ninguna categoría, o la imagen no es clara,
  usa "id": null.
- "confianza" debe ser "alta", "media" o "baja".
- "razon" es una descripción breve (máximo 8 palabras) en español de qué viste.

Formato exacto de respuesta:
{"id": "plastico", "confianza": "alta", "razon": "botella de agua transparente"}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METODO_NO_PERMITIDO', mensaje: 'Usa POST.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY_NO_CONFIGURADA',
      mensaje: 'Falta configurar GEMINI_API_KEY en las variables de entorno del proyecto en Vercel.',
    });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: 'JSON_INVALIDO', mensaje: 'El body no es JSON válido.' });
      return;
    }
  }

  const imagenBase64 = body && body.image;
  if (!imagenBase64 || typeof imagenBase64 !== 'string') {
    res.status(400).json({ error: 'FALTA_IMAGEN', mensaje: 'Envía { "image": "<base64>" } en el body.' });
    return;
  }

  const base64Limpio = imagenBase64.replace(/^data:image\/\w+;base64,/, '');

  try {
    const categorias = await obtenerCategorias();
    const promptSistema = construirPrompt(categorias);

    const respuestaGemini = await fetch(ENDPOINT_GEMINI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptSistema },
              { inline_data: { mime_type: 'image/jpeg', data: base64Limpio } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!respuestaGemini.ok) {
      const detalle = await respuestaGemini.text();
      console.error('[api/classify] Gemini respondió con error:', respuestaGemini.status, detalle);
      res.status(502).json({
        error: 'GEMINI_ERROR',
        mensaje: 'Gemini no pudo procesar la imagen.',
        status: respuestaGemini.status,
      });
      return;
    }

    const datos = await respuestaGemini.json();
    const textoRespuesta = datos?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textoRespuesta) {
      console.error('[api/classify] Respuesta de Gemini sin texto utilizable:', JSON.stringify(datos));
      res.status(502).json({ error: 'GEMINI_RESPUESTA_VACIA', mensaje: 'Gemini no devolvió una clasificación.' });
      return;
    }

    let clasificacion;
    try {
      clasificacion = JSON.parse(textoRespuesta);
    } catch {
      console.error('[api/classify] Gemini no devolvió JSON válido:', textoRespuesta);
      res.status(502).json({ error: 'GEMINI_JSON_INVALIDO', mensaje: 'Gemini no devolvió un JSON parseable.' });
      return;
    }

    // Nunca se confía a ciegas en que Gemini respetó el enum pedido:
    // se valida contra las categorías reales antes de devolver algo a
    // la UI. Si no calza, se devuelve null (no una categoría
    // inventada) para que el frontend lo trate igual que un "no
    // reconocido" local.
    const categoriaEncontrada = categorias.find((c) => c.id === clasificacion.id);
    const idValido = categoriaEncontrada ? categoriaEncontrada.id : null;

    res.status(200).json({
      id: idValido,
      confianza: ['alta', 'media', 'baja'].includes(clasificacion.confianza)
        ? clasificacion.confianza
        : 'media',
      razon: typeof clasificacion.razon === 'string' ? clasificacion.razon.slice(0, 120) : '',
      mensaje: categoriaEncontrada ? categoriaEncontrada.mensaje_escaner : null,
      reciclable: categoriaEncontrada ? !!categoriaEncontrada.reciclable : null,
      requierePuntoEspecial: categoriaEncontrada ? !!categoriaEncontrada.requiere_punto_especial : null,
    });
  } catch (err) {
    console.error('[api/classify] Error inesperado llamando a Gemini:', err);
    res.status(500).json({ error: 'ERROR_INESPERADO', mensaje: err.message });
  }
};
