-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Moderación automática de videos de la comunidad (IA)
-- ═══════════════════════════════════════════════════════════════
-- Ejecutar en el SQL Editor de Supabase, DESPUÉS de haber corrido
-- supabase-videos-usuario.sql (esta migración solo agrega columnas
-- a la tabla `videos_usuario` que ya debe existir).
--
-- Estas dos columnas dejan rastro de qué decidió la función
-- serverless api/moderate-video.js (o un humano, en el Table Editor)
-- al cambiar el `estado` de un video, para poder auditar los
-- veredictos de la IA y revertirlos a mano si se equivoca.
-- ═══════════════════════════════════════════════════════════════

alter table videos_usuario
  add column if not exists moderado_por text not null default 'humano'
    check (moderado_por in ('humano', 'ia')),
  add column if not exists moderacion_razon text;
