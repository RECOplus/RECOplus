-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Migración: convertir aliados.estado a ENUM de Postgres
-- ═══════════════════════════════════════════════════════════════
-- Por qué: ahora mismo `estado` es texto libre con un CHECK
-- constraint. Supabase Table Editor NO muestra un dropdown para eso
-- — solo lo hace con columnas de tipo ENUM real. Con esta migración,
-- al abrir una fila de `aliados` en el Table Editor, la celda de
-- `estado` se vuelve un selector con las 3 opciones (pendiente /
-- aprobado / rechazado), sin escribir SQL cada vez que apruebes o
-- rechaces una empresa.
--
-- Cómo aplicarla:
-- 1. Entra a tu proyecto en supabase.com/dashboard
-- 2. Ve a "SQL Editor" en el menú lateral
-- 3. Pega TODO este archivo y dale a "Run"
-- 4. Ve a "Table Editor" → tabla `aliados` → abre cualquier fila:
--    el campo "estado" ahora es un dropdown.
--
-- Es seguro correrla aunque ya tengas filas con datos: el `using`
-- del paso 3 convierte los valores existentes sin perderlos.
-- ═══════════════════════════════════════════════════════════════

-- 1. Crear el tipo enum (si no existe ya)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_aliado') then
    create type estado_aliado as enum ('pendiente', 'aprobado', 'rechazado');
  end if;
end$$;

-- 2. Quitar el check constraint viejo que validaba el texto libre
--    (este es el nombre que Postgres le da automáticamente al
--    check definido inline en el create table original)
alter table aliados drop constraint if exists aliados_estado_check;

-- 3. Cambiar el tipo de columna de text al nuevo enum, conservando
--    los valores que ya tengan las filas existentes
alter table aliados
  alter column estado type estado_aliado using estado::estado_aliado;

-- 4. El default se pierde al cambiar de tipo, así que se vuelve a fijar
alter table aliados
  alter column estado set default 'pendiente'::estado_aliado;

-- Nota: las policies de RLS que ya tienes (`using (estado = 'aprobado')`,
-- etc.) siguen funcionando exactamente igual — Postgres compara el
-- enum contra el texto 'aprobado' sin problema, no hay que tocarlas.
