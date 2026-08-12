-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Tabla: campana_inscripciones
-- ═══════════════════════════════════════════════════════════════
-- Guarda las inscripciones de usuarios a campañas de reciclaje o
-- donación de empresas aliadas (tabla `campanas`). Se llena desde
-- el modal de detalle de campaña en donar.html (ver
-- donar-campanas.js → renderInscribirZona / enviarInscripcion).
--
-- Ya se aplicó en el proyecto (eephwthybxjwleajrvnl) el 11 ago 2026.
-- Este archivo queda como referencia / para reaplicar en otro entorno.
-- ═══════════════════════════════════════════════════════════════

create table if not exists campana_inscripciones (
  id bigint generated always as identity primary key,
  campana_id bigint not null references campanas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null,
  telefono text,
  mensaje text,
  created_at timestamptz not null default now(),
  -- Un usuario solo puede inscribirse una vez por campaña.
  unique (campana_id, user_id)
);

alter table campana_inscripciones enable row level security;

-- Solo se puede inscribir a campañas aprobadas y activas (mismo
-- criterio que la policy pública de SELECT en `campanas`), y solo
-- a nombre de uno mismo (no se puede inscribir "por" otro usuario).
create policy "Un usuario puede inscribirse a una campaña aprobada"
  on campana_inscripciones for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from campanas c
      where c.id = campana_inscripciones.campana_id
        and c.estado = 'aprobado'
        and c.activa = true
    )
  );

-- Un usuario ve sus propias inscripciones...
create policy "Un usuario puede ver sus propias inscripciones"
  on campana_inscripciones for select
  to authenticated
  using (auth.uid() = user_id);

-- ...y el aliado dueño de la campaña ve quién se inscribió a ella
-- (para poder contactar a los inscritos, futuro panel de aliado).
create policy "El aliado dueño de la campaña puede ver sus inscritos"
  on campana_inscripciones for select
  to authenticated
  using (
    exists (
      select 1 from campanas c
      where c.id = campana_inscripciones.campana_id
        and c.user_id = auth.uid()
    )
  );

-- Un usuario puede darse de baja de una campaña ("Cancelar inscripción").
create policy "Un usuario puede cancelar su propia inscripcion"
  on campana_inscripciones for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_campana_inscripciones_campana on campana_inscripciones(campana_id);
