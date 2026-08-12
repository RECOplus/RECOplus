-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Migración: convertir campanas.estado a ENUM de Postgres
-- ═══════════════════════════════════════════════════════════════
-- Mismo motivo que supabase-migrar-estado-aliados-enum.sql: `estado`
-- era texto libre con un CHECK constraint, y Supabase Table Editor
-- no muestra dropdown para eso — solo para columnas ENUM reales.
-- Con esto, al abrir una fila de `campanas` en el Table Editor, la
-- celda "estado" se vuelve un selector con pendiente/aprobado/rechazado.
--
-- Ya se aplicó en el proyecto (eephwthybxjwleajrvnl) el 11 ago 2026.
-- Este archivo queda como referencia / para reaplicar en otro entorno.
--
-- Diferencia clave vs. la migración de `aliados`: la policy pública
-- de SELECT de `campanas` ("Cualquiera puede leer campañas aprobadas
-- y activas") compara directamente contra la columna `estado`, así
-- que Postgres no deja cambiar el tipo de columna mientras esa policy
-- exista. Por eso acá se dropea la policy antes del ALTER y se
-- recrea igual después (comparar un enum contra el texto 'aprobado'
-- sigue funcionando sin tocar nada más).
-- ═══════════════════════════════════════════════════════════════

-- 1. Crear el tipo enum (si no existe ya)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_campana') then
    create type estado_campana as enum ('pendiente', 'aprobado', 'rechazado');
  end if;
end$$;

-- 2. Quitar temporalmente la policy que depende de la columna `estado`
drop policy if exists "Cualquiera puede leer campañas aprobadas y activas" on campanas;

-- 3. Quitar el default viejo (texto) y el check constraint viejo
alter table campanas alter column estado drop default;
alter table campanas drop constraint if exists campanas_estado_check;

-- 4. Cambiar el tipo de columna de text al nuevo enum, conservando los valores existentes
alter table campanas
  alter column estado type estado_campana using estado::estado_campana;

-- 5. Restablecer el default con el tipo nuevo
alter table campanas
  alter column estado set default 'pendiente'::estado_campana;

-- 6. Recrear la policy de SELECT pública exactamente igual que antes
create policy "Cualquiera puede leer campañas aprobadas y activas"
  on campanas for select
  to anon, authenticated
  using (estado = 'aprobado' and activa = true);

-- Nota: el resto de las policies de `campanas` (insert/update/delete)
-- no dependen de `estado`, así que no hizo falta tocarlas — siguen
-- funcionando exactamente igual con el enum.
