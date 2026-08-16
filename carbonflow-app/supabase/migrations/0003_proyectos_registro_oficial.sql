-- Catalogo de consulta de proyectos en registros oficiales (demo / ficticio).
-- Ejecutar en el SQL Editor de Supabase si la tabla aun no existe.

create table if not exists proyectos_registro_oficial (
  id uuid primary key default gen_random_uuid(),
  registro text not null check (registro in ('Verra', 'Gold Standard', 'RENARE')),
  nombre text not null,
  desarrollador text,
  departamento text not null,
  municipio text,
  estado text not null,
  tipo_proyecto text not null default 'forestal-conservacion',
  area_hectareas numeric,
  vintage integer,
  enlace_oficial text,
  created_at timestamptz not null default now(),
  unique (registro, nombre)
);

alter table proyectos_registro_oficial enable row level security;

drop policy if exists "proyectos_registro_read_all" on proyectos_registro_oficial;
create policy "proyectos_registro_read_all"
  on proyectos_registro_oficial
  for select
  using (true);

insert into proyectos_registro_oficial
  (registro, nombre, desarrollador, departamento, municipio, estado, tipo_proyecto, area_hectareas, vintage, enlace_oficial)
values
  ('Verra', 'REDD+ Corazón del Amazonas', 'Fundación Bosques del Sur', 'Amazonas', 'Leticia', 'Registrado', 'forestal-conservacion', 42800, 2022, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Conservación del Darién antioqueño', 'Alianza Verde Urabá', 'Antioquia', 'Turbo', 'En validación', 'forestal-conservacion', 18650, 2024, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Restauración de la serranía de La Macarena', 'Colectivo Meta Vivo', 'Meta', 'La Macarena', 'En verificación', 'forestal-conservacion', 31200, 2023, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'REDD+ Caquetá Piedemonte', 'Cooperativa Forestal Andaquí', 'Caquetá', 'Florencia', 'Registrado', 'forestal-conservacion', 27400, 2021, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Bosques del Pacífico chocano', 'Consejo Comunitario Mayor', 'Chocó', 'Quibdó', 'Registrado', 'forestal-conservacion', 22100, 2022, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Custodia forestal del Guaviare', 'Asociación Campesina del Guaviare', 'Guaviare', 'San José del Guaviare', 'En validación', 'forestal-conservacion', 19870, 2024, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Selva de Putumayo: evitación de deforestación', 'Resguardo Inga Condagua', 'Putumayo', 'Mocoa', 'Registrado', 'forestal-conservacion', 15420, 2023, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Corredor biológico del Vaupés', 'Organización Indígena del Vaupés', 'Vaupés', 'Mitú', 'En validación', 'forestal-conservacion', 33600, 2025, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Sabanas y bosques de Vichada', 'Fondo Orinoquia Sostenible', 'Vichada', 'Puerto Carreño', 'Registrado', 'forestal-conservacion', 40150, 2022, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Guainía: bosques de transición amazónica', 'Corporación Río Inírida', 'Guainía', 'Inírida', 'En verificación', 'forestal-conservacion', 28900, 2023, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Páramo y bosque altoandino nariñense', 'Asociación de Acueductos Rurales', 'Nariño', 'Pasto', 'Registrado', 'forestal-conservacion', 8420, 2021, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Macizo colombiano — Cauca', 'Red de Reservas del Cauca', 'Cauca', 'Popayán', 'En validación', 'forestal-conservacion', 12180, 2024, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Sierra Nevada — Cesar', 'Pueblo Arhuaco — cabildo local', 'Cesar', 'Valledupar', 'Registrado', 'forestal-conservacion', 16750, 2022, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Bosque seco del Magdalena', 'Fundación Ciénaga Grande', 'Magdalena', 'Aracataca', 'En verificación', 'forestal-conservacion', 9340, 2023, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Catatumbo forestal', 'Corporación Norte Sostenible', 'Norte de Santander', 'Tibú', 'En validación', 'forestal-conservacion', 14300, 2025, 'https://registry.verra.org/app/search/VCS'),
  ('Gold Standard', 'Restauración de manglares del Caribe', 'Fundación Costa Viva', 'Atlántico', 'Barranquilla', 'Certified', 'forestal-conservacion', 2180, 2023, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Corredor del Canal del Dique', 'Alianza Humedales de Bolívar', 'Bolívar', 'Mahates', 'Listed', 'forestal-conservacion', 4560, 2024, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Bosque andino de Caldas', 'Manizales Agua y Bosque', 'Caldas', 'Manizales', 'Design certified', 'forestal-conservacion', 3120, 2022, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Morichales de Casanare', 'Hatos Aliados del Casanare', 'Casanare', 'Yopal', 'Certified', 'forestal-conservacion', 18740, 2021, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Restauración del Sinú medio', 'Asociación de Reforestadores de Córdoba', 'Córdoba', 'Montería', 'Listed', 'forestal-conservacion', 6780, 2024, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Cuenca alta del Magdalena — Huila', 'Comité de Cafeteros del Huila', 'Huila', 'Neiva', 'Certified', 'forestal-conservacion', 5290, 2023, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Bosque seco de La Guajira', 'Wayuu Territorio Verde', 'La Guajira', 'Riohacha', 'Listed', 'forestal-conservacion', 8910, 2025, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Eje cafetero — Quindío', 'Reservas Naturales del Quindío', 'Quindío', 'Salento', 'Certified', 'forestal-conservacion', 1840, 2022, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Restauración de laderas en Risaralda', 'Pereira Cuenca Viva', 'Risaralda', 'Pereira', 'Design certified', 'forestal-conservacion', 2460, 2024, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Manglares de San Andrés y Providencia', 'CORALINA comunitaria', 'San Andrés y Providencia', 'San Andrés', 'Listed', 'forestal-conservacion', 620, 2025, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Serranía de los Yariguíes', 'Santander Bosque Vivo', 'Santander', 'San Vicente de Chucurí', 'Certified', 'forestal-conservacion', 11240, 2023, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Montes de María forestal', 'Red Campesina de Sucre', 'Sucre', 'Sincelejo', 'Listed', 'forestal-conservacion', 3870, 2024, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Bosque húmedo del Valle del Cauca', 'Cali Región Verde', 'Valle del Cauca', 'Buenaventura', 'Certified', 'forestal-conservacion', 9650, 2022, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Cerros orientales — restauración urbana', 'Observatorio Ambiental de Bogotá', 'Bogotá D.C.', 'Bogotá', 'Design certified', 'forestal-conservacion', 740, 2024, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Arauca: galería riparia del Lipa', 'Fundación Llanos del Norte', 'Arauca', 'Arauca', 'Listed', 'forestal-conservacion', 7340, 2025, 'https://registry.goldstandard.org/projects'),
  ('RENARE', 'Conservación predial Sumapaz', 'Asociación de Predios de Cundinamarca', 'Cundinamarca', 'Cabrera', 'Implementación', 'forestal-conservacion', 4120, 2023, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Páramo de Pisba — Boyacá', 'Acueductos Veredales de Boyacá', 'Boyacá', 'Socotá', 'Formulación', 'forestal-conservacion', 5680, 2024, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Cuenca del Combeima', 'Tolima Restaura', 'Tolima', 'Ibagué', 'Factibilidad', 'forestal-conservacion', 2910, 2025, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Iniciativa comunitaria Leticia rural', 'Cabildo Ticuna de Nazareth', 'Amazonas', 'Puerto Nariño', 'Implementación', 'forestal-conservacion', 10340, 2022, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Bosques de Occidente — Antioquia', 'AMVA Naturaleza', 'Antioquia', 'Ciudad Bolívar', 'Formulación', 'forestal-conservacion', 7760, 2024, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Altillanura Meta — restauración', 'Gremio Ganadero Sostenible del Meta', 'Meta', 'Puerto Gaitán', 'Factibilidad', 'forestal-conservacion', 22480, 2025, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Andaquí — fase nacional', 'Gobernación de Caquetá', 'Caquetá', 'Belén de los Andaquíes', 'Implementación', 'forestal-conservacion', 15890, 2023, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Pacífico medio — Chocó', 'IIAP comunitario', 'Chocó', 'Istmina', 'Formulación', 'forestal-conservacion', 13450, 2024, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Piedemonte nariñense', 'Resguardo Awá', 'Nariño', 'Barbacoas', 'Implementación', 'forestal-conservacion', 9870, 2022, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Ciénaga Grande — fase MRV', 'Pescadores de Pueblo Viejo', 'Magdalena', 'Pueblo Viejo', 'Cierre', 'forestal-conservacion', 2610, 2020, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Farallones y cuenca del Cali', 'CVC comunitaria', 'Valle del Cauca', 'Cali', 'Factibilidad', 'forestal-conservacion', 3540, 2025, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Serranía del Perijá', 'Campesinos del Cesar', 'Cesar', 'La Jagua de Ibirico', 'Formulación', 'forestal-conservacion', 6420, 2024, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Humedales de la Mojana', 'Asociación de Pescadores de Sucre', 'Sucre', 'Majagual', 'Factibilidad', 'forestal-conservacion', 5180, 2025, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('RENARE', 'Bosque de niebla de Santander', 'Red de Reservas de la Sociedad Civil', 'Santander', 'Charalá', 'Implementación', 'forestal-conservacion', 4290, 2023, 'https://www.minambiente.gov.co/mercados-de-carbono/iniciativas-de-mitigacion/'),
  ('Verra', 'Restauración del cañón del Chicamocha', 'Santander Carbono Neutral', 'Santander', 'Piedecuesta', 'En validación', 'forestal-conservacion', 3810, 2025, 'https://registry.verra.org/app/search/VCS'),
  ('Verra', 'Valle: corredor del Farallón', 'Buenaventura Forest Partners', 'Valle del Cauca', 'Dagua', 'Registrado', 'forestal-conservacion', 7120, 2023, 'https://registry.verra.org/app/search/VCS'),
  ('Gold Standard', 'Amazonas: restauración de várzea', 'Leticia Restaura', 'Amazonas', 'Leticia', 'Listed', 'forestal-conservacion', 5640, 2024, 'https://registry.goldstandard.org/projects'),
  ('Gold Standard', 'Antioquia: bosques de Sonsón', 'Cooperativa Cafetera del Oriente', 'Antioquia', 'Sonsón', 'Certified', 'forestal-conservacion', 2980, 2022, 'https://registry.goldstandard.org/projects')
on conflict (registro, nombre) do nothing;
