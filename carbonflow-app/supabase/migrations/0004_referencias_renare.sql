-- Referencias RENARE declaradas por el usuario (no hay integración oficial).

create table if not exists referencias_renare (
  id uuid primary key default gen_random_uuid(),
  predio_id uuid not null references predios(id) on delete cascade unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  estado text not null default 'no_iniciado',
  referencia_id text,
  url_publica text,
  observaciones text,
  updated_at timestamptz not null default now()
);

alter table referencias_renare enable row level security;

create policy "referencias_renare_owner_all" on referencias_renare
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
