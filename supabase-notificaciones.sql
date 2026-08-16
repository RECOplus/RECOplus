-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Sistema de notificaciones (notificaciones.js/css)
-- ═══════════════════════════════════════════════════════════════
-- Ejecutar en el SQL Editor de Supabase. No depende de otras
-- migraciones para existir, pero los triggers opcionales del final
-- sí asumen que `videos_usuario`, `testimonios` y `aliados` ya
-- existen (mismo patrón que el resto del proyecto).
--
-- Cada fila es UNA notificación para UN usuario. El campo `tipo`
-- controla qué ícono/color pinta notificaciones.js y a qué URL
-- navega al hacer click (ver NOTIF_TIPOS en ese archivo).
-- ═══════════════════════════════════════════════════════════════

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_notificacion') then
    create type tipo_notificacion as enum (
      'empresa_aprobada',
      'empresa_rechazada',
      'video_aprobado',
      'video_rechazado',
      'nuevo_comentario',
      'nueva_alianza',
      'interes_donacion',
      'donacion_completada',
      'nueva_campana',
      'sistema'
    );
  end if;
end$$;

create table if not exists notificaciones (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,

  tipo tipo_notificacion not null default 'sistema',

  -- Textos ya resueltos en español (snapshot al momento de crear la
  -- notificación, mismo patrón que autor_nombre en testimonios /
  -- videos_usuario). El front puede re-traducir por `tipo` si hay
  -- clave i18n para ese caso, y usar este texto como fallback.
  titulo text not null,
  mensaje text,

  -- A dónde navega el click sobre la notificación (ej.
  -- "donaciones.html", "videos.html?tab=mis-videos"). Puede ser
  -- null para notificaciones puramente informativas.
  enlace text,

  -- Referencia libre a la fila que originó la notificación (id de
  -- video, de comentario, de publicación de donación, etc.) para
  -- que un handler futuro pueda hacer lookups sin parsear el link.
  entidad_tipo text,
  entidad_id text,

  leida boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notificaciones enable row level security;

-- Un usuario solo puede leer sus propias notificaciones.
create policy "Un usuario puede leer sus propias notificaciones"
  on notificaciones for select
  to authenticated
  using (auth.uid() = user_id);

-- Un usuario solo puede marcar como leídas (o borrar) sus propias
-- notificaciones. No hay policy de INSERT para 'authenticated': las
-- notificaciones las crea el propio backend/triggers con el rol de
-- servicio, nunca el cliente directamente (evita que un usuario se
-- mande notificaciones falsas a sí mismo o a otros).
create policy "Un usuario puede actualizar sus propias notificaciones"
  on notificaciones for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Un usuario puede borrar sus propias notificaciones"
  on notificaciones for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_notificaciones_user_id on notificaciones (user_id);
create index if not exists idx_notificaciones_leida on notificaciones (leida);
create index if not exists idx_notificaciones_created_at on notificaciones (created_at desc);

-- ── REALTIME ──
-- Habilita que notificaciones.js reciba INSERTs nuevos vía
-- supabase.channel(...).on('postgres_changes', ...) sin hacer polling.
alter publication supabase_realtime add table notificaciones;


-- ═══════════════════════════════════════════════════════════════
-- Helper: crear una notificación desde SQL (usado por los triggers
-- de abajo y reusable a mano desde el SQL Editor para pruebas).
-- SECURITY DEFINER: corre con permisos del dueño de la función
-- (no del usuario autenticado), así puede insertar en `notificaciones`
-- aunque no exista policy de INSERT para 'authenticated'.
-- ═══════════════════════════════════════════════════════════════
create or replace function reco_notificar(
  p_user_id uuid,
  p_tipo tipo_notificacion,
  p_titulo text,
  p_mensaje text default null,
  p_enlace text default null,
  p_entidad_tipo text default null,
  p_entidad_id text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notificaciones (user_id, tipo, titulo, mensaje, enlace, entidad_tipo, entidad_id)
  values (p_user_id, p_tipo, p_titulo, p_mensaje, p_enlace, p_entidad_tipo, p_entidad_id);
end;
$$;


-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS OPCIONALES — descomentar/ejecutar solo si esas tablas
-- ya existen en tu proyecto. Cubren los casos donde el cambio de
-- estado lo hace un admin desde el Table Editor (UPDATE directo),
-- que es el patrón de moderación que ya usas para aliados/videos.
-- ═══════════════════════════════════════════════════════════════

-- Video aprobado / rechazado (videos_usuario.estado cambia de
-- 'pendiente' a 'aprobado' o 'rechazado' desde el Table Editor).
create or replace function reco_notificar_video_moderado() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.estado = 'aprobado' and old.estado is distinct from 'aprobado' then
    perform reco_notificar(
      new.user_id, 'video_aprobado',
      '¡Tu video fue aprobado!',
      'Tu video "' || new.titulo || '" ya está visible en la biblioteca comunitaria.',
      'videos.html', 'video', new.id::text
    );
  elsif new.estado = 'rechazado' and old.estado is distinct from 'rechazado' then
    perform reco_notificar(
      new.user_id, 'video_rechazado',
      'Tu video no fue aprobado',
      'Tu video "' || new.titulo || '" no cumplió con las guías de la comunidad.',
      'videos.html', 'video', new.id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notificar_video_moderado on videos_usuario;
create trigger trg_notificar_video_moderado
  after update on videos_usuario
  for each row
  execute function reco_notificar_video_moderado();


-- Empresa aprobada / rechazada (aliados.estado cambia desde el
-- Table Editor). Usa `nombre_empresa`, la columna real de la tabla
-- `aliados` (ver alianzas-registro-modal.js → enviarRegistroFinal).
create or replace function reco_notificar_empresa_moderada() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.estado = 'aprobado' and old.estado is distinct from 'aprobado' then
    perform reco_notificar(
      new.user_id, 'empresa_aprobada',
      '¡Tu empresa fue aprobada!',
      'Tu empresa "' || new.nombre_empresa || '" ya aparece en Alianzas.',
      'alianzas.html', 'aliado', new.id::text
    );
  elsif new.estado = 'rechazado' and old.estado is distinct from 'rechazado' then
    perform reco_notificar(
      new.user_id, 'empresa_rechazada',
      'Tu registro de empresa no fue aprobado',
      'Revisa los datos de "' || new.nombre_empresa || '" e inténtalo de nuevo.',
      'alianzas.html', 'aliado', new.id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notificar_empresa_moderada on aliados;
create trigger trg_notificar_empresa_moderada
  after update on aliados
  for each row
  execute function reco_notificar_empresa_moderada();
