-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Campañas e iniciativas de empresas aliadas
-- ═══════════════════════════════════════════════════════════════
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de supabase-setup.sql
-- (usa auth.users y la tabla `aliados` que ese archivo crea).
--
-- Cada fila es una campaña de reciclaje o donación publicada por
-- una empresa aliada. Solo empresas con estado = 'aprobado' en
-- `aliados` pueden publicar (se valida en el frontend antes de
-- abrir el formulario, y se refuerza acá con una policy de INSERT
-- que revisa el estado del aliado dueño).
-- ═══════════════════════════════════════════════════════════════

create table if not exists campanas (
  id bigint generated always as identity primary key,
  aliado_id bigint not null references aliados (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Tipo de campaña: decide qué campos de "objetivo" aplican
  -- (materiales si es reciclaje, categorias_donacion si es donacion)
  tipo text not null check (tipo in ('reciclaje', 'donacion')),

  -- Datos generales
  titulo text not null,
  descripcion text not null,
  banner_url text,

  -- Fechas de vigencia de la campaña
  fecha_inicio date not null,
  fecha_fin date not null,

  -- Ubicación (mismo patrón que `aliados`)
  provincia text not null,
  distrito text not null,
  direccion text not null,
  lat double precision,
  lng double precision,

  -- Objetivo según tipo (mismos ids canónicos que `categorias` /
  -- `aliados.materiales` — ver material-map.js)
  materiales text[] not null default '{}',           -- solo si tipo = 'reciclaje'
  categorias_donacion text[] not null default '{}',  -- solo si tipo = 'donacion'

  -- Meta opcional de la campaña (ej. "500" + "kg", o "200" + "articulos")
  meta_cantidad numeric,
  meta_unidad text,

  -- Estado de moderación (mismo patrón que `aliados`): una campaña
  -- nueva entra como 'pendiente' y no aparece en donar.html hasta
  -- que se apruebe a mano desde el Table Editor de Supabase.
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),

  -- Estado propio de vigencia, independiente de fecha_fin, para
  -- poder cerrar una campaña manualmente antes de tiempo o marcarla
  -- como finalizada sin borrarla (queda visible en el historial).
  activa boolean not null default true,

  created_at timestamptz not null default now()
);

alter table campanas enable row level security;

-- Cualquiera puede leer campañas APROBADAS y ACTIVAS (para
-- mostrarlas en donar.html / alianzas.html sin necesitar login).
create policy "Cualquiera puede leer campañas aprobadas y activas"
  on campanas for select
  to anon, authenticated
  using (estado = 'aprobado' and activa = true);

-- Un aliado autenticado puede leer TODAS sus propias campañas
-- (incluidas pendientes, rechazadas o inactivas) para poder
-- gestionarlas desde su panel.
create policy "Un aliado puede leer sus propias campañas"
  on campanas for select
  to authenticated
  using (auth.uid() = user_id);

-- Solo puede insertar una campaña un usuario autenticado que sea
-- DUEÑO de la fila de aliado referenciada Y cuyo aliado esté
-- 'aprobado'. Esto es el refuerzo a nivel de base de datos de la
-- regla "solo empresas aprobadas publican campañas" — aunque el
-- frontend ya oculta el formulario si no corresponde, RLS evita que
-- alguien la salte llamando a la API directamente.
create policy "Solo un aliado aprobado puede crear sus campañas"
  on campanas for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from aliados
      where aliados.id = campanas.aliado_id
        and aliados.user_id = auth.uid()
        and aliados.estado = 'aprobado'
    )
  );

-- Un aliado puede editar sus propias campañas (ej. cerrar una
-- campaña activa, actualizar la descripción, cambiar el banner).
create policy "Un aliado puede actualizar sus propias campañas"
  on campanas for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Un aliado puede borrar sus propias campañas.
create policy "Un aliado puede borrar sus propias campañas"
  on campanas for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_campanas_estado_activa on campanas (estado, activa);
create index if not exists idx_campanas_tipo on campanas (tipo);
create index if not exists idx_campanas_user_id on campanas (user_id);
create index if not exists idx_campanas_fecha_fin on campanas (fecha_fin);


-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Storage para banners de campañas
-- ═══════════════════════════════════════════════════════════════
-- Bucket PÚBLICO, mismo patrón que el bucket 'aliados': cada
-- archivo se guarda bajo una carpeta con el id del usuario dueño
-- (ej. "3fa8.../banner-171234.jpg"), y las policies solo dejan
-- subir/editar/borrar dentro de la PROPIA carpeta.

insert into storage.buckets (id, name, public)
  values ('campanas', 'campanas', true)
  on conflict (id) do nothing;

create policy "Cualquiera puede ver banners de campañas"
  on storage.objects for select
  to public
  using (bucket_id = 'campanas');

create policy "Un aliado puede subir banners en su propia carpeta"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'campanas' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Un aliado puede actualizar banners en su propia carpeta"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'campanas' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Un aliado puede borrar banners en su propia carpeta"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'campanas' and (storage.foldername(name))[1] = auth.uid()::text);
