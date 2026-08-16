/**
 * api/moderate-video.js
 * ---------------------------------------------------------------
 * Función serverless (Vercel) que Supabase llama automáticamente
 * cada vez que se inserta una fila en `videos_usuario` (ver
 * "Database Webhooks" en el Dashboard de Supabase: Database →
 * Webhooks → INSERT en videos_usuario → HTTP Request a esta URL).
 *
 * Le pregunta a Gemini si el título/descripción/categoría del video
 * que compartió el usuario son coherentes con reciclaje, donación o
 * sostenibilidad (temas de la comunidad RECO+), y solo actualiza
 * `estado` cuando la confianza de Gemini es "alta" — en cualquier
 * otro caso (confianza media/baja, o error) el video se queda en
 * 'pendiente' para que lo revises a mano desde el Table Editor,
 * exactamente como funcionaba antes de agregar esto.
 *
 * Por qué existe este archivo (y no se llama a Gemini directo desde
 * subir-video-modal.js): la API key de Gemini y la Service Role Key
 * de Supabase NO pueden vivir en JS que corre en el navegador —
 * cualquiera que abra "Ver código fuente" se las llevaría. Esta
 * función corre en el servidor de Vercel; ambas keys solo existen
 * ahí, leídas de variables de entorno.
 *
 * Requisitos en Vercel (Project Settings → Environment Variables):
 *   GEMINI_API_KEY            (la misma que ya usa api/classify.js)
 *   SUPABASE_SERVICE_ROLE_KEY (Supabase → Project Settings → API →
 *                               "service_role" — NUNCA la anon key)
 *   MODERATE_WEBHOOK_SECRET   (inventa un string largo y random;
 *                               el mismo valor va en el header
 *                               personalizado del Database Webhook)
 *
 * Requisito en Supabase: haber corrido
 * supabase-migrar-moderacion-videos.sql (agrega las columnas
 * moderado_por / moderacion_razon a videos_usuario).
 *
 * Convención de Vercel: cualquier archivo .js dentro de /api se
 * vuelve un endpoint automáticamente. Este queda en:
 *   POST /api/moderate-video
 *
 * Body esperado (el que manda Supabase Database Webhooks):
 *   { "type": "INSERT", "table": "videos_usuario", "record": { ... } }
 * ---------------------------------------------------------------
 */

const SUPABASE_URL = 'https://eephwthybxjwleajrvnl.supabase.co';

const MODELO_GEMINI = 'gemini-flash-latest'; // alias de Google al flash estable más reciente
const ENDPOINT_GEMINI =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI}:generateContent`;

function construirPrompt(row) {
  return `Eres un moderador de contenido para RECO+, una app de reciclaje y donación.
Un usuario compartió este video con la comunidad:

Título: ${row.titulo}
Descripción: ${row.descripcion || '(sin descripción)'}
Categoría que eligió: ${row.categoria}

Evalúa si el CONTENIDO DESCRITO trata realmente sobre reciclaje, donación,
reutilización, sostenibilidad o temas afines de una comunidad ecológica —
y no sobre algo sin relación, publicidad ajena, spam o contenido inapropiado.

No estás viendo el video en sí, solo el texto que escribió el usuario, así
que sé conservador: si el texto es vago, ambiguo o insuficiente para estar
seguro, usa "confianza": "baja" en vez de adivinar.

Responde SOLO con un objeto JSON, sin texto antes ni después, sin backticks
de markdown, con este formato exacto:
{"relevante": true, "confianza": "alta", "razon": "explica en máximo 12 palabras"}

"relevante" es true o false. "confianza" debe ser "alta", "media" o "baja".`;
}

async function actualizarEstado(id, campos, serviceKey) {
  const respuesta = await fetch(
    `${SUPABASE_URL}/rest/v1/videos_usuario?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(campos),
    }
  );
  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Supabase PATCH ${respuesta.status}: ${detalle}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METODO_NO_PERMITIDO', mensaje: 'Usa POST.' });
    return;
  }

  // ── Verifica que el llamado venga realmente del Database Webhook
  // de Supabase (y no de cualquiera que descubra la URL) ──
  const secretoConfigurado = process.env.MODERATE_WEBHOOK_SECRET;
  const secretoRecibido = req.headers['x-moderate-secret'];
  if (!secretoConfigurado || secretoRecibido !== secretoConfigurado) {
    res.status(401).json({ error: 'NO_AUTORIZADO', mensaje: 'Falta o no coincide x-moderate-secret.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !serviceKey) {
    res.status(500).json({
      error: 'ENV_NO_CONFIGURADA',
      mensaje: 'Falta GEMINI_API_KEY o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del proyecto en Vercel.',
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

  const row = body && body.record;
  if (!row || !row.id) {
    res.status(400).json({ error: 'FALTA_REGISTRO', mensaje: 'Falta record.id en el body.' });
    return;
  }

  // Idempotencia: si el webhook reintenta, o si el video ya fue
  // moderado por otra vía mientras tanto, no lo volvemos a tocar.
  if (row.estado !== 'pendiente') {
    res.status(200).json({ omitido: true, motivo: 'estado ya no es pendiente' });
    return;
  }

  try {
    const respuestaGemini = await fetch(ENDPOINT_GEMINI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: construirPrompt(row) }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!respuestaGemini.ok) {
      const detalle = await respuestaGemini.text();
      console.error('[api/moderate-video] Gemini respondió con error:', respuestaGemini.status, detalle);
      // No tocamos el estado: el video se queda 'pendiente' para revisión manual.
      res.status(200).json({ omitido: true, motivo: 'error de Gemini, queda pendiente' });
      return;
    }

    const datos = await respuestaGemini.json();
    const textoRespuesta = datos?.candidates?.[0]?.content?.parts?.[0]?.text;

    let veredicto = null;
    if (textoRespuesta) {
      try {
        veredicto = JSON.parse(textoRespuesta);
      } catch {
        console.error('[api/moderate-video] Gemini no devolvió JSON válido:', textoRespuesta);
      }
    }

    // Política de decisión: SOLO se automatiza en confianza "alta".
    // Confianza media/baja, o cualquier respuesta rara de Gemini,
    // deja el video como estaba ('pendiente') para revisión humana.
    const confianzasValidas = ['alta', 'media', 'baja'];
    const confianza = veredicto && confianzasValidas.includes(veredicto.confianza) ? veredicto.confianza : null;
    const razon = veredicto && typeof veredicto.razon === 'string' ? veredicto.razon.slice(0, 200) : null;

    let nuevoEstado = null;
    if (confianza === 'alta') {
      nuevoEstado = veredicto.relevante === true ? 'aprobado' : 'rechazado';
    }

    if (nuevoEstado) {
      await actualizarEstado(
        row.id,
        { estado: nuevoEstado, moderado_por: 'ia', moderacion_razon: razon },
        serviceKey
      );
    } else if (razon) {
      // Aunque no se decida nada, dejamos la razón de la IA anotada
      // (sin tocar 'estado') para que la revisión manual tenga contexto.
      await actualizarEstado(row.id, { moderacion_razon: razon }, serviceKey);
    }

    res.status(200).json({
      id: row.id,
      confianza,
      nuevoEstado: nuevoEstado || 'sigue pendiente (revisión manual)',
    });
  } catch (err) {
    console.error('[api/moderate-video] Error inesperado:', err);
    // Cualquier error deja el video 'pendiente' — nunca se aprueba
    // ni se rechaza por accidente ante una falla.
    res.status(200).json({ omitido: true, motivo: 'error inesperado, queda pendiente', error: err.message });
  }
};
