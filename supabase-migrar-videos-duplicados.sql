-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Detección de videos duplicados (subir-video-modal.js)
-- ═══════════════════════════════════════════════════════════════
-- Ejecutar en el SQL Editor de Supabase, DESPUÉS de haber corrido
-- supabase-videos-usuario.sql (esta migración solo agrega columnas
-- e índices a la tabla `videos_usuario` que ya debe existir).
--
-- Antes de insertar un video nuevo, subir-video-modal.js ahora
-- consulta si ya existe uno con la misma URL (modo "link") o el
-- mismo contenido de archivo (modo "archivo", vía hash SHA-256), y
-- si es así no deja continuar con el envío. Estas dos columnas
-- soportan esa verificación:
--
--   • video_url_normalizada: la URL del video en una forma
--     canónica (minúsculas, sin "www.", sin slash final, sin
--     querystring de tracking) para poder comparar
--     "youtube.com/watch?v=X" contra "https://www.youtube.com/
--     watch?v=X&feature=share" como el mismo video.
--
--   • archivo_hash: hash SHA-256 (hex) del CONTENIDO del archivo
--     subido, calculado en el navegador antes de subirlo. Dos
--     archivos con nombres distintos pero el mismo contenido byte a
--     byte comparten hash, así que sirve para detectar re-subidas
--     del mismo video como archivo. NULL para videos tipo "link".
-- ═══════════════════════════════════════════════════════════════

alter table videos_usuario
  add column if not exists video_url_normalizada text,
  add column if not exists archivo_hash text;

create index if not exists idx_videos_usuario_url_normalizada on videos_usuario (video_url_normalizada);
create index if not exists idx_videos_usuario_archivo_hash on videos_usuario (archivo_hash);
