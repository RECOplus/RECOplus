/**
 * api/translate-video.js
 * ---------------------------------------------------------------
 * Función serverless (Vercel) que traduce al inglés el título y la
 * descripción de videos de la comunidad (tabla `videos_usuario`),
 * usando Gemini — mismo patrón que api/classify.js (la API key de
 * Gemini nunca se expone en el navegador, vive solo en esta función).
 *
 * POR QUÉ EXISTE: el título/descripción de un video de la comunidad
 * es texto libre que escribió quien lo subió (normalmente en
 * español). i18n.js solo traduce textos FIJOS de la interfaz — no
 * puede traducir contenido que no conoce de antemano. Este endpoint
 * cubre ese hueco: cuando el sitio está en inglés, guia-hero-videos.js
 * y videos-supabase.js le mandan los videos que todavía no tienen
 * traducción en caché (localStorage, ver ambos archivos) y este
 * endpoint devuelve una versión en inglés.
 *
 * Requisito en Vercel (ya deberías tenerlo configurado para el
 * escáner): Project Settings → Environment Variables → GEMINI_API_KEY
 *
 * POST /api/translate-video
 * Body: { "items": [{ "id": "12", "titulo": "...", "descripcion": "..." }, ...] }
 * Respuesta: { "items": [{ "id": "12", "titulo": "...", "descripcion": "..." }, ...] }
 *   Siempre responde 200 con "items", incluso si Gemini falla: en ese
 *   caso "items" trae el texto ORIGINAL sin traducir (nunca un error
 *   que le complique la vida al que llama — mostrar el video en su
 *   idioma original es preferible a romper el render).
 * ---------------------------------------------------------------
 */

const MODELO_GEMINI = 'gemini-flash-latest'; // alias de Google al flash estable más reciente
const ENDPOINT_GEMINI =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI}:generateContent`;

// Límite defensivo por llamada: evita prompts gigantes si algún día
// se manda de una sola vez toda la biblioteca de videos.html. Los
// llamadores (guia-hero-videos.js / videos-supabase.js) ya trocean en
// lotes de este mismo tamaño, así que en el uso normal nunca se llega
// a este límite — es un segundo seguro del lado del servidor.
const MAX_ITEMS_POR_LLAMADA = 12;

function construirPrompt(items) {
  const lista = items
    .map(
      (it, i) =>
        `${i}. título: ${JSON.stringify(it.titulo || '')}\n   descripción: ${JSON.stringify(it.descripcion || '')}`
    )
    .join('\n');

  return `Traduce al inglés el título y la descripción de estos videos de una app de reciclaje y donación. Son videos reales subidos por usuarios de la comunidad, escritos en español.

${lista}

Reglas:
- Responde SOLO con un array JSON, sin texto antes ni después, sin backticks de markdown.
- Debe tener EXACTAMENTE ${items.length} elementos, en el mismo orden que la lista de arriba.
- Cada elemento: {"titulo": "...", "descripcion": "..."} con la traducción al inglés.
- Si un campo original está vacío, el traducido también debe quedar vacío ("").
- Traduce el contenido tal cual es: no inventes ni agregues información que no esté en el original.
- Mantén nombres propios, marcas y menciones de lugares tal cual (no los traduzcas).`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METODO_NO_PERMITIDO', mensaje: 'Usa POST.' });
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

  const items = Array.isArray(body && body.items) ? body.items.slice(0, MAX_ITEMS_POR_LLAMADA) : null;
  if (!items || items.length === 0) {
    res.status(400).json({ error: 'FALTA_ITEMS', mensaje: 'Envía { "items": [{ "id", "titulo", "descripcion" }] }.' });
    return;
  }

  // Respaldo: el texto original sin traducir para cada ítem. Se usa
  // cuando Gemini falla o la API key no está configurada, en vez de
  // devolver un error — el video simplemente se ve en su idioma
  // original, que es el comportamiento que había antes de este
  // endpoint (nunca peor que eso).
  const respaldo = items.map((it) => ({ id: it.id, titulo: it.titulo || '', descripcion: it.descripcion || '' }));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[api/translate-video] Falta GEMINI_API_KEY, devolviendo texto original sin traducir.');
    res.status(200).json({ items: respaldo });
    return;
  }

  try {
    const promptSistema = construirPrompt(items);

    const respuestaGemini = await fetch(ENDPOINT_GEMINI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptSistema }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!respuestaGemini.ok) {
      const detalle = await respuestaGemini.text();
      console.error('[api/translate-video] Gemini respondió con error:', respuestaGemini.status, detalle);
      res.status(200).json({ items: respaldo });
      return;
    }

    const datos = await respuestaGemini.json();
    const textoRespuesta = datos?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textoRespuesta) {
      console.error('[api/translate-video] Respuesta de Gemini sin texto utilizable:', JSON.stringify(datos));
      res.status(200).json({ items: respaldo });
      return;
    }

    let traducciones;
    try {
      traducciones = JSON.parse(textoRespuesta);
    } catch {
      console.error('[api/translate-video] Gemini no devolvió JSON válido:', textoRespuesta);
      res.status(200).json({ items: respaldo });
      return;
    }

    if (!Array.isArray(traducciones) || traducciones.length !== items.length) {
      console.error('[api/translate-video] Gemini devolvió una forma inesperada:', textoRespuesta);
      res.status(200).json({ items: respaldo });
      return;
    }

    const resultado = items.map((it, i) => {
      const t = traducciones[i];
      return {
        id: it.id,
        titulo: t && typeof t.titulo === 'string' && t.titulo.trim() ? t.titulo.trim() : it.titulo || '',
        descripcion: t && typeof t.descripcion === 'string' ? t.descripcion.trim() : it.descripcion || '',
      };
    });

    res.status(200).json({ items: resultado });
  } catch (err) {
    console.error('[api/translate-video] Error inesperado llamando a Gemini:', err);
    res.status(200).json({ items: respaldo });
  }
};
