-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Configuración de Supabase para puntos sugeridos
-- ═══════════════════════════════════════════════════════════════
-- Instrucciones:
-- 1. Entra a tu proyecto en supabase.com/dashboard
-- 2. Ve a "SQL Editor" en el menú lateral
-- 3. Pega TODO este archivo y dale a "Run"
-- 4. Listo: la tabla, seguridad y permisos quedan configurados.
-- ═══════════════════════════════════════════════════════════════

-- Tabla de puntos sugeridos por la comunidad
create table if not exists puntos_sugeridos (
  id bigint generated always as identity primary key,
  name text not null,
  type text not null check (type in ('reciclaje', 'donacion', 'acopio')),
  address text not null,
  lat double precision not null,
  lng double precision not null,
  materials text[] not null default '{}',
  material_icons text[] not null default '{}',
  comments text default '',
  approx_location boolean default false,
  rating numeric default 0,
  review_count integer default 0,
  created_at timestamptz not null default now()
);

-- Habilitar Row Level Security (RLS): control fino de qué puede
-- hacer cada visitante del sitio (que usa la "anon key" pública).
alter table puntos_sugeridos enable row level security;

-- Permitir que CUALQUIERA pueda LEER los puntos (para que se vean
-- en el mapa de todos los visitantes, sin necesitar login).
create policy "Cualquiera puede leer puntos"
  on puntos_sugeridos for select
  to anon
  using (true);

-- Permitir que CUALQUIERA pueda INSERTAR nuevos puntos (para que el
-- modal "Sugerir un punto" funcione sin necesitar login). Nota: esto
-- significa que cualquier visitante puede añadir puntos directamente,
-- igual que en el diseño actual del sitio (no hay panel de admin ni
-- moderación previa). Si más adelante quieres revisar antes de
-- publicar, se puede añadir una columna "aprobado boolean default false"
-- y cambiar la policy de lectura para filtrar por "aprobado = true".
create policy "Cualquiera puede sugerir puntos"
  on puntos_sugeridos for insert
  to anon
  with check (true);

-- Índice para ordenar por fecha de sugerencia rápidamente
create index if not exists idx_puntos_created_at on puntos_sugeridos (created_at desc);


-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Escáner inteligente: registro de escaneos
-- ═══════════════════════════════════════════════════════════════
-- Guarda el RESULTADO de cada escaneo (qué categoría se detectó,
-- con qué confianza y cuándo). La imagen del usuario NUNCA se sube
-- ni se guarda: el reconocimiento ocurre por completo en su propio
-- navegador (ver reciclar-scanner.js), esto solo registra el
-- resultado para poder mostrar estadísticas de impacto a futuro.

create table if not exists escaneos (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  material_key text,               -- ej. 'plastico', 'vidrio'... null si no se reconoció
  label_detected text,              -- etiqueta cruda del modelo (en inglés), útil para depurar/mejorar el mapeo
  confidence numeric,                -- 0.0 a 1.0
  created_at timestamptz not null default now()
);

alter table escaneos enable row level security;

-- Cualquiera (con o sin sesión) puede registrar un escaneo. No se
-- permite LEER la tabla directamente con la anon key (así el
-- historial de escaneos de cada usuario no queda expuesto
-- públicamente); solo se lee a través de la vista de conteo de
-- abajo, o el propio usuario autenticado podría consultar su
-- historial si más adelante agregas una policy de "select" con
-- `using (auth.uid() = user_id)`.
create policy "Cualquiera puede registrar un escaneo"
  on escaneos for insert
  to anon, authenticated
  with check (true);

create index if not exists idx_escaneos_created_at on escaneos (created_at desc);
create index if not exists idx_escaneos_material on escaneos (material_key);

-- Vista pública de SOLO conteo total (opcional). Permite mostrar en
-- el sitio algo como "12,340 objetos escaneados por la comunidad"
-- sin exponer filas individuales (las vistas corren con los
-- permisos de quien las creó, no de quien las consulta, por lo que
-- pueden agregar datos de una tabla con RLS restrictiva sin
-- filtrarla fila por fila). Si no quieres este contador público,
-- simplemente no ejecutes este bloque.
create or replace view escaneos_stats as
  select count(*) as total_escaneos
  from escaneos;

grant select on escaneos_stats to anon, authenticated;


-- ══════════════════════════════════════════════════════════════
-- RECO+ — Alianzas: registro de empresas/centros aliados
-- ═══════════════════════════════════════════════════════════
-- Usada por el formulario de 9 pasos de alianzas.html
-- (alianzas-registro-modal.js). Cada fila representa una empresa,
-- centro de reciclaje o punto de acopio registrado como aliado,
-- vinculada 1 a 1 con su cuenta de auth.users (creada con
-- window.recoAuth.signUp en el último paso del formulario).

create table if not exists aliados (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references auth.users (id) on delete cascade,

  -- Paso 1 — Información de la empresa
  nombre_empresa text not null,
  nombre_comercial text,
  ruc text not null,
  tipo_empresa text not null,
  anio_fundacion integer,
  descripcion text not null,
  logo_url text,

  -- Paso 2 — Contacto
  email text not null,
  telefono text not null,
  whatsapp text,
  sitio_web text,

  -- Paso 3 — Ubicación
  provincia text not null,
  distrito text not null,
  direccion text not null,
  lat double precision not null,
  lng double precision not null,

  -- Paso 4/5 — Materiales y servicios (mismos ids que `categorias`
  -- y los filtros del mapa — ver material-map.js)
  materiales text[] not null default '{}',
  servicios text[] not null default '{}',

  -- Paso 6 — Horarios
  dias_atencion text[] not null default '{}',
  hora_apertura time not null,
  hora_cierre time not null,

  -- Paso 7 — Información operativa
  acepta_particulares boolean not null default true,
  acepta_empresas boolean not null default true,
  cantidad_minima numeric not null default 0,
  cantidad_maxima numeric,
  paga_materiales boolean not null default false,
  metodos_pago text[] not null default '{}',

  -- Paso 9 — Información opcional
  redes_sociales jsonb not null default '{}',
  fotos_urls text[] not null default '{}',
  video_presentacion text,
  areas_cobertura text[] not null default '{}',
  residuos_mensuales_kg numeric,
  mision text,
  vision text,

  -- Moderación: un aliado nuevo entra como "pendiente" y no aparece
  -- públicamente hasta que alguien lo revise y lo pase a 'aprobado'
  -- (a mano desde el Table Editor de Supabase, por ahora — no hay
  -- panel de admin en el sitio todavía).
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),

  created_at timestamptz not null default now()
);

alter table aliados enable row level security;

-- Cualquiera puede leer los aliados YA APROBADOS (para mostrarlos en
-- "Aliados destacados" y futuros listados públicos).
create policy "Cualquiera puede leer aliados aprobados"
  on aliados for select
  to anon, authenticated
  using (estado = 'aprobado');

-- Un aliado autenticado también puede leer SU PROPIA fila aunque
-- todavía esté pendiente de aprobación (para que pueda ver su
-- propio perfil después de registrarse).
create policy "Un aliado puede leer su propia fila"
  on aliados for select
  to authenticated
  using (auth.uid() = user_id);

-- Solo se puede insertar la fila que corresponde al propio usuario
-- recién autenticado (justo después del signUp en el paso final del
-- formulario).
create policy "Un usuario autenticado puede registrar su propio aliado"
  on aliados for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Un aliado puede editar su propio perfil más adelante (para cuando
-- se agregue una pantalla de "editar mi perfil de aliado").
create policy "Un aliado puede actualizar su propia fila"
  on aliados for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_aliados_estado on aliados (estado);
create index if not exists idx_aliados_provincia on aliados (provincia);


-- ═══════════════════════════════════════════════════════════
-- RECO+ — Alianzas: Storage para logo y fotos de aliados
-- ════════════════════════════════════════════════════════
-- Bucket PÚBLICO (para poder mostrar el logo/fotos en el sitio sin
-- login). Cada archivo se guarda bajo una carpeta con el id del
-- usuario dueño (ej. "3fa8.../logo-171234.jpg"), y las policies de
-- abajo solo dejan subir/editar/borrar dentro de la PROPIA carpeta.

insert into storage.buckets (id, name, public)
  values ('aliados', 'aliados', true)
  on conflict (id) do nothing;

create policy "Cualquiera puede ver logos y fotos de aliados"
  on storage.objects for select
  to public
  using (bucket_id = 'aliados');

create policy "Un aliado puede subir archivos en su propia carpeta"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'aliados' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Un aliado puede actualizar archivos en su propia carpeta"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'aliados' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Un aliado puede borrar archivos en su propia carpeta"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'aliados' and (storage.foldername(name))[1] = auth.uid()::text);