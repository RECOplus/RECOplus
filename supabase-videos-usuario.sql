-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Videos de la comunidad (subir-video-modal.js / videos.html)
-- ═══════════════════════════════════════════════════════════════
-- Ejecutar en el SQL Editor de Supabase. No depende de otras tablas
-- de RECO+ (solo de auth.users), así que se puede correr en
-- cualquier momento.
--
-- Cualquier usuario con sesión iniciada puede compartir un video
-- (por link externo o subiendo un archivo) desde guia.html o
-- videos.html. Cada video entra como 'pendiente' y solo se mezcla
-- en la biblioteca (videos.html, vía videos-supabase.js) una vez
-- que se aprueba a mano desde el Table Editor de Supabase — mismo
-- patrón de moderación que `aliados` y `campanas`.
-- ═══════════════════════════════════════════════════════════════

create table if not exists videos_usuario (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Nombre del autor al momento de publicar (snapshot, mismo patrón
  -- que `testimonios.autor_nombre`), para no depender de un join
  -- contra auth.users al listar videos aprobados.
  autor_nombre text,

  titulo text not null,
  descripcion text,

  -- Mismas categorías canónicas que usa la biblioteca de videos
  -- (ver videos-data.js / RECO_VIDEOS_DATA.categories).
  categoria text not null check (categoria in ('reciclaje', 'donacion', 'sostenibilidad', 'comunidad')),

  -- Cómo se compartió el video: enlace externo (YouTube, Vimeo, URL
  -- directa a un archivo) o archivo subido al bucket 'videos-usuario'.
  tipo text not null check (tipo in ('link', 'archivo')),

  -- Si tipo = 'link': la URL que pegó el usuario.
  -- Si tipo = 'archivo': la URL pública del archivo en Storage.
  video_url text not null,

  -- Estado de moderación (mismo patrón que `aliados` / `campanas`):
  -- un video nuevo entra como 'pendiente' y no aparece en
  -- videos.html hasta que se aprueba a mano.
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),

  created_at timestamptz not null default now()
);

alter table videos_usuario enable row level security;

-- Cualquiera puede leer videos APROBADOS (para mezclarlos en
-- videos.html sin necesitar login).
create policy "Cualquiera puede leer videos aprobados"
  on videos_usuario for select
  to anon, authenticated
  using (estado = 'aprobado');

-- Un usuario autenticado puede leer TODOS sus propios videos
-- (incluidos pendientes o rechazados), para un futuro "mis videos".
create policy "Un usuario puede leer sus propios videos"
  on videos_usuario for select
  to authenticated
  using (auth.uid() = user_id);

-- Solo un usuario con sesión iniciada puede publicar un video, y
-- solo a nombre de sí mismo.
create policy "Un usuario autenticado puede compartir un video"
  on videos_usuario for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Un usuario puede editar sus propios videos (ej. corregir el
-- título o descripción mientras está pendiente de revisión).
create policy "Un usuario puede actualizar sus propios videos"
  on videos_usuario for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Un usuario puede borrar sus propios videos.
create policy "Un usuario puede borrar sus propios videos"
  on videos_usuario for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_videos_usuario_estado on videos_usuario (estado);
create index if not exists idx_videos_usuario_categoria on videos_usuario (categoria);
create index if not exists idx_videos_usuario_user_id on videos_usuario (user_id);
create index if not exists idx_videos_usuario_created_at on videos_usuario (created_at);


-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Storage para videos subidos como archivo
-- ═══════════════════════════════════════════════════════════════
-- Bucket PÚBLICO, mismo patrón que 'campanas' / 'aliados': cada
-- archivo se guarda bajo una carpeta con el id del usuario dueño
-- (ej. "3fa8.../1719000000-mi-video.mp4"), y las policies solo
-- dejan subir/editar/borrar dentro de la PROPIA carpeta.

insert into storage.buckets (id, name, public, file_size_limit)
  values ('videos-usuario', 'videos-usuario', true, 104857600) -- 100MB
  on conflict (id) do nothing;

create policy "Cualquiera puede ver videos de la comunidad"
  on storage.objects for select
  to public
  using (bucket_id = 'videos-usuario');

create policy "Un usuario puede subir videos en su propia carpeta"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'videos-usuario' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Un usuario puede actualizar videos en su propia carpeta"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'videos-usuario' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Un usuario puede borrar videos en su propia carpeta"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'videos-usuario' and (storage.foldername(name))[1] = auth.uid()::text);
