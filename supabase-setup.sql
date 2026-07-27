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