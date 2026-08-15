-- CarbonFlow - esquema inicial del hackathon (PRD seccion 15)
-- Ejecutar en el SQL editor de Supabase o via `supabase db push`.

create extension if not exists "pgcrypto";

-- Predios / proyectos ---------------------------------------------------

create table if not exists predios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  tipo_proyecto text not null default 'forestal-conservacion',
  geometria jsonb not null,
  area_hectareas numeric not null,
  ubicacion_display text,
  uso_del_suelo text,
  tenencia_declarada text,
  objetivo_intervencion text,
  created_at timestamptz not null default now()
);

create table if not exists diagnosticos (
  id uuid primary key default gen_random_uuid(),
  predio_id uuid not null references predios(id) on delete cascade,
  score integer not null,
  factores jsonb not null,
  co2e_por_anio numeric not null,
  co2e_horizonte numeric not null,
  horizonte_anios integer not null,
  fuentes jsonb not null,
  created_at timestamptz not null default now()
);

-- Formulacion / expedientes ----------------------------------------------

create table if not exists expedientes (
  id uuid primary key default gen_random_uuid(),
  predio_id uuid not null references predios(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  linea_base text,
  adicionalidad text,
  riesgos_permanencia text,
  salvaguardas text,
  cronograma text,
  presupuesto text,
  estado text not null default 'borrador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Certificacion (chatbot + busqueda en registros) ------------------------

create table if not exists conversaciones_certificacion (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid references expedientes(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  rol text not null check (rol in ('user', 'assistant')),
  contenido text not null,
  created_at timestamptz not null default now()
);

create table if not exists consultas_registro (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid references expedientes(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  termino_busqueda text not null,
  registro text not null,
  resultado jsonb,
  enlace_oficial text,
  created_at timestamptz not null default now()
);

-- Marketplace -------------------------------------------------------------

create table if not exists publicaciones_marketplace (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid references expedientes(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  tipo_proyecto text not null,
  pais text default 'Colombia',
  estandar text,
  vintage integer,
  co_beneficios text,
  precio_orientativo numeric,
  volumen_toneladas numeric,
  estado text not null default 'disponible',
  created_at timestamptz not null default now()
);

create table if not exists solicitudes_cotizacion (
  id uuid primary key default gen_random_uuid(),
  publicacion_id uuid not null references publicaciones_marketplace(id) on delete cascade,
  comprador_id uuid not null references auth.users(id) on delete cascade,
  mensaje text,
  estado text not null default 'pendiente',
  respuesta_simulada text,
  respondido_en timestamptz,
  created_at timestamptz not null default now()
);

-- Bonos verdes --------------------------------------------------------------

create table if not exists perfiles_bonos_verdes (
  id uuid primary key default gen_random_uuid(),
  expediente_id uuid references expedientes(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  monto_requerido numeric,
  uso_de_recursos text,
  data_room_urls jsonb,
  estado text not null default 'disponible',
  created_at timestamptz not null default now()
);

create table if not exists solicitudes_conexion_financiera (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfiles_bonos_verdes(id) on delete cascade,
  inversor_id uuid not null references auth.users(id) on delete cascade,
  mensaje text,
  estado text not null default 'pendiente',
  respuesta_simulada text,
  respondido_en timestamptz,
  created_at timestamptz not null default now()
);

-- RLS: cada usuario ve y edita lo suyo; el catalogo de marketplace/bonos
-- verdes es de lectura publica para cualquier usuario autenticado.

alter table predios enable row level security;
alter table diagnosticos enable row level security;
alter table expedientes enable row level security;
alter table conversaciones_certificacion enable row level security;
alter table consultas_registro enable row level security;
alter table publicaciones_marketplace enable row level security;
alter table solicitudes_cotizacion enable row level security;
alter table perfiles_bonos_verdes enable row level security;
alter table solicitudes_conexion_financiera enable row level security;

create policy "predios_owner_all" on predios for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "diagnosticos_owner_all" on diagnosticos for all using (
  exists (select 1 from predios p where p.id = predio_id and p.owner_id = auth.uid())
) with check (
  exists (select 1 from predios p where p.id = predio_id and p.owner_id = auth.uid())
);
create policy "expedientes_owner_all" on expedientes for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "chat_owner_all" on conversaciones_certificacion for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "registro_owner_all" on consultas_registro for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "marketplace_read_all" on publicaciones_marketplace for select using (true);
create policy "marketplace_owner_write" on publicaciones_marketplace for insert with check (auth.uid() = owner_id);
create policy "marketplace_owner_update" on publicaciones_marketplace for update using (auth.uid() = owner_id);

create policy "cotizaciones_comprador_or_owner" on solicitudes_cotizacion for select using (
  auth.uid() = comprador_id or exists (
    select 1 from publicaciones_marketplace m where m.id = publicacion_id and m.owner_id = auth.uid()
  )
);
create policy "cotizaciones_comprador_insert" on solicitudes_cotizacion for insert with check (auth.uid() = comprador_id);

create policy "bonos_read_all" on perfiles_bonos_verdes for select using (true);
create policy "bonos_owner_write" on perfiles_bonos_verdes for insert with check (auth.uid() = owner_id);
create policy "bonos_owner_update" on perfiles_bonos_verdes for update using (auth.uid() = owner_id);

create policy "conexion_inversor_or_owner" on solicitudes_conexion_financiera for select using (
  auth.uid() = inversor_id or exists (
    select 1 from perfiles_bonos_verdes b where b.id = perfil_id and b.owner_id = auth.uid()
  )
);
create policy "conexion_inversor_insert" on solicitudes_conexion_financiera for insert with check (auth.uid() = inversor_id);
