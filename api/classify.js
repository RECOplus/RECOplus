/**
 * api/classify.js
 * ---------------------------------------------------------------
 * Función serverless (Vercel) que recibe una foto desde
 * reciclar-scanner.js (botón "✨ Verificar con IA"), se la manda a
 * Gemini y devuelve la categoría ya validada contra las mismas 12
 * categorías que usa reciclar-material-info.js.
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
 *   { "id": "plastico", "confianza": "alta", "razon": "botella de agua" }
 *   Si Gemini no logra identificar el objeto con ninguna de las 12
 *   categorías: { "id": null, "confianza": "baja", "razon": "..." }
 * ---------------------------------------------------------------
 */

// Las MISMAS 12 categorías que existen en reciclar-material-info.js
// (objeto MATERIALS). Si algún día agregas o quitas una categoría
// allá, actualiza esta lista también — se duplica a propósito en vez
// de importarse, porque este archivo corre en Node/CommonJS en
// Vercel y reciclar-material-info.js es un IIFE pensado para
// <script> en el navegador; mezclar ambos sin un paso de build
// agrega un punto de fallo innecesario.
const CATEGORIAS_VALIDAS = [
  'plastico', 'vidrio', 'metal', 'papel', 'libros', 'electronicos',
  'celulares', 'ropa', 'muebles', 'juguetes', 'baterias', 'bombillos',
];

const MODELO_GEMINI = 'gemini-flash-latest'; // alias de Google al flash estable más reciente
const ENDPOINT_GEMINI =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI}:generateContent`;

const PROMPT_SISTEMA = `Eres un clasificador de residuos para una app de reciclaje llamada RECO+.
Se te muestra una foto de UN objeto. Debes decidir a cuál de estas categorías pertenece
el material PRINCIPAL del objeto (el material del que está hecho o su tipo, no su contenido):

${CATEGORIAS_VALIDAS.map((c) => `- ${c}`).join('\n')}

Guía rápida de cada categoría:
- plastico: envases, botellas, bolsas y objetos de plástico en general
- vidrio: botellas, frascos y envases de vidrio
- metal: latas, ollas, utensilios y objetos metálicos
- papel: hojas, sobres, empaques de papel o cartón
- libros: libros y revistas
- electronicos: laptops, monitores, electrodomésticos, cables, impresoras
- celulares: teléfonos móviles y tablets
- ropa: prendas de vestir, zapatos, accesorios textiles
- muebles: sillas, mesas, estantes y mobiliario en general
- juguetes: juguetes de cualquier material
- baterias: pilas y baterías sueltas o recargables
- bombillos: bombillos y focos de cualquier tipo

Reglas:
- Responde SOLO con un objeto JSON, sin texto antes ni después, sin backticks de markdown.
- Si el objeto encaja claramente en una categoría, "id" debe ser EXACTAMENTE uno de los
  valores de la lista de arriba (en minúsculas, tal como está escrito).
- Si el objeto no encaja claramente en ninguna categoría, o la imagen no es clara,
  usa "id": null.
- "confianza" debe ser "alta", "media" o "baja".
- "razon" es una descripción breve (máximo 8 palabras) en español de qué viste.

Formato exacto de respuesta:
{"id": "plastico", "confianza": "alta", "razon": "botella de agua transparente"}`;

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
              { text: PROMPT_SISTEMA },
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
    // se valida contra la lista real antes de devolver algo a la UI.
    // Si no calza, se devuelve null (no una categoría inventada) para
    // que el frontend lo trate igual que un "no reconocido" local.
    const idValido = CATEGORIAS_VALIDAS.includes(clasificacion.id) ? clasificacion.id : null;

    res.status(200).json({
      id: idValido,
      confianza: ['alta', 'media', 'baja'].includes(clasificacion.confianza)
        ? clasificacion.confianza
        : 'media',
      razon: typeof clasificacion.razon === 'string' ? clasificacion.razon.slice(0, 120) : '',
    });
  } catch (err) {
    console.error('[api/classify] Error inesperado llamando a Gemini:', err);
    res.status(500).json({ error: 'ERROR_INESPERADO', mensaje: err.message });
  }
};
