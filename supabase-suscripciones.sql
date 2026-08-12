-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Sistema de suscripciones (planes Gratis / Básico / Premium)
-- ═══════════════════════════════════════════════════════════════
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de supabase-setup.sql
-- y supabase-campanas.sql (usa auth.users, `aliados` y `campanas`).
--
-- QUÉ RESUELVE:
-- Cualquier usuario con sesión (individuo o empresa aliada) puede
-- suscribirse a un plan. NO hay pasarela de pago real todavía: el
-- botón "Suscribirme" del frontend (suscripcion-modal.js) inserta o
-- actualiza directamente la fila en `suscripciones`, simulando el
-- cobro. El día que se integre Stripe/otra pasarela, solo hay que
-- reemplazar ESE insert por un webhook que haga lo mismo — el resto
-- del sistema (límites, RLS, "aliados destacados") no cambia.
--
-- Los 3 planes (mismos ids en TODO el sitio — ver suscripcion-planes.js
-- en el frontend, que es la ÚNICA otra fuente de verdad de sus
-- nombres/precios/beneficios "de cara al usuario"):
--   'gratis'   → 10 escaneos IA/día, 1 campaña activa, máx. 3 días de vigencia
--   'basico'   → 50 escaneos IA/día, 3 campañas activas, máx. 7 días de vigencia
--   'premium'  → escaneos IA ilimitados, campañas ilimitadas, máx. 30 días,
--                además aparece en "Aliados destacados" de alianzas.html
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1) TABLA `suscripciones` — una fila por usuario (1 a 1 con
--    auth.users). Si un usuario nunca se suscribió, simplemente NO
--    tiene fila aquí: el frontend y las funciones de abajo tratan
--    "sin fila" exactamente igual que plan = 'gratis'.
-- ─────────────────────────────────────────────────────────────
create table if not exists suscripciones (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references auth.users (id) on delete cascade,

  plan text not null default 'gratis' check (plan in ('gratis', 'basico', 'premium')),

  -- Vigencia del plan de pago. NULL en 'gratis' (no vence). Se usa
  -- para que un plan pago expirado se trate como 'gratis' sin tener
  -- que borrar la fila (así se conserva el historial de qué tuvo).
  vigente_hasta timestamptz,

  -- Simulación de cobro: por ahora siempre 'simulado' (sin pasarela
  -- real). Deja el campo listo para cuando se integre Stripe u otra
  -- pasarela ('stripe', 'paypal', etc.), sin tener que migrar el
  -- esquema de nuevo.
  metodo_pago text not null default 'simulado',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table suscripciones enable row level security;

-- Un usuario puede leer SU PROPIA suscripción (para pintar "Mi plan"
-- en Ajustes y aplicar límites en el cliente).
create policy "Un usuario puede leer su propia suscripcion"
  on suscripciones for select
  to authenticated
  using (auth.uid() = user_id);

-- Lectura pública mínima: SOLO para que alianzas-destacados.js pueda
-- filtrar qué aliados están en plan 'premium' sin exponer el resto
-- de columnas de cada usuario. Nota: esta policy expone plan y
-- vigente_hasta de CUALQUIER usuario a cualquier visitante (no email
-- ni datos sensibles) — es intencional, es lo mínimo necesario para
-- la barra de destacados sin necesitar una Edge Function aparte.
create policy "Cualquiera puede leer el plan (para destacados)"
  on suscripciones for select
  to anon, authenticated
  using (true);

-- Un usuario autenticado puede crear/actualizar SU PROPIA fila (el
-- botón "Suscribirme" del modal hace upsert sobre user_id).
create policy "Un usuario puede crear su propia suscripcion"
  on suscripciones for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Un usuario puede actualizar su propia suscripcion"
  on suscripciones for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_suscripciones_plan on suscripciones (plan);
create index if not exists idx_suscripciones_vigente_hasta on suscripciones (vigente_hasta);

-- Mantiene updated_at al día en cada cambio de plan.
create or replace function suscripciones_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_suscripciones_updated_at on suscripciones;
create trigger trg_suscripciones_updated_at
  before update on suscripciones
  for each row execute function suscripciones_set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 2) FUNCIÓN `plan_efectivo(uid)` — devuelve el plan REAL vigente
--    de un usuario ('gratis' | 'basico' | 'premium'), tratando un
--    plan pago ya vencido (vigente_hasta < now()) como 'gratis'.
--    SECURITY DEFINER: puede leer `suscripciones` sin depender de
--    que quien la llama tenga permiso de SELECT sobre esa fila
--    ajena (se usa desde otras policies, ej. el límite de campañas).
-- ─────────────────────────────────────────────────────────────
create or replace function plan_efectivo(uid uuid)
returns text as $$
  select case
    when s.plan is null then 'gratis'
    when s.plan = 'gratis' then 'gratis'
    when s.vigente_hasta is not null and s.vigente_hasta < now() then 'gratis'
    else s.plan
  end
  from (select 1) as _dummy
  left join suscripciones s on s.user_id = uid
  limit 1;
$$ language sql stable security definer set search_path = public;

grant execute on function plan_efectivo(uuid) to anon, authenticated;


-- ─────────────────────────────────────────────────────────────
-- 3) LÍMITE DE CAMPAÑAS ACTIVAS SIMULTÁNEAS — se refuerza a nivel
--    de RLS (además de la validación en el frontend en
--    campanas-modal.js), reemplazando la policy de INSERT que ya
--    existía en supabase-campanas.sql por una versión que agrega el
--    tope según el plan del aliado dueño.
--    Topes: gratis = 1, basico = 3, premium = sin límite.
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Solo un aliado aprobado puede crear sus campañas" on campanas;

create policy "Solo un aliado aprobado y dentro de su limite de plan puede crear campañas"
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
    and (
      plan_efectivo(auth.uid()) = 'premium'
      or (
        select count(*) from campanas c2
        where c2.user_id = auth.uid()
          and c2.activa = true
          and c2.estado in ('pendiente', 'aprobado')
      ) < (case plan_efectivo(auth.uid()) when 'basico' then 3 else 1 end)
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 4) DURACIÓN MÁXIMA POR CAMPAÑA — igual que el punto anterior:
--    refuerzo en RLS de lo que ya valida el frontend. Topes:
--    gratis = 3 días, basico = 7 días, premium = 30 días.
--    (Reemplaza la MISMA policy de insert de arriba: se combinan
--    ambas reglas en una sola policy para no tener dos policies de
--    insert que Postgres tendría que evaluar con OR en vez de AND.)
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Solo un aliado aprobado y dentro de su limite de plan puede crear campañas" on campanas;

create policy "Solo un aliado aprobado, dentro de su limite y duracion de plan, crea campañas"
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
    and (fecha_fin - fecha_inicio) <= (
      case plan_efectivo(auth.uid())
        when 'premium' then 30
        when 'basico' then 7
        else 3
      end
    )
    and (
      plan_efectivo(auth.uid()) = 'premium'
      or (
        select count(*) from campanas c2
        where c2.user_id = auth.uid()
          and c2.activa = true
          and c2.estado in ('pendiente', 'aprobado')
      ) < (case plan_efectivo(auth.uid()) when 'basico' then 3 else 1 end)
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 5) ESCANEOS IA — conteo diario para el límite del plan.
--    Reutiliza la tabla `escaneos` que ya existe (supabase-setup.sql),
--    agregando una columna para distinguir un escaneo LOCAL gratis
--    (MobileNet, siempre ilimitado) de un escaneo con IA (Gemini,
--    vía /api/classify — el que sí tiene límite diario por plan).
-- ─────────────────────────────────────────────────────────────
alter table escaneos add column if not exists via_ia boolean not null default false;
create index if not exists idx_escaneos_user_via_ia_created on escaneos (user_id, via_ia, created_at);

-- Cuenta cuántos escaneos CON IA hizo un usuario hoy (desde
-- medianoche, hora del servidor). SECURITY DEFINER porque la policy
-- de SELECT de `escaneos` no permite leer filas ajenas — pero aquí
-- solo se cuenta, nunca se devuelven filas, así que es seguro
-- exponerla a cualquier usuario autenticado consultando SU PROPIO id.
create or replace function escaneos_ia_hoy(uid uuid)
returns integer as $$
  select count(*)::integer
  from escaneos
  where user_id = uid
    and via_ia = true
    and created_at >= date_trunc('day', now());
$$ language sql stable security definer set search_path = public;

grant execute on function escaneos_ia_hoy(uuid) to authenticated;

-- Límite diario según plan, para que el frontend (reciclar-scanner.js)
-- solo tenga que llamar a UNA función y comparar "usados < limite"
-- sin tener que conocer los números de cada plan por su cuenta.
-- Devuelve -1 para "ilimitado" (plan premium).
create or replace function limite_escaneos_ia(uid uuid)
returns integer as $$
  select case plan_efectivo(uid)
    when 'premium' then -1
    when 'basico' then 50
    else 10
  end;
$$ language sql stable security definer set search_path = public;

grant execute on function limite_escaneos_ia(uuid) to authenticated;
