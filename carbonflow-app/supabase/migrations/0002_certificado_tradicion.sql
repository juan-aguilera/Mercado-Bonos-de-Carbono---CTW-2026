-- CarbonFlow - campos extraidos del Certificado de Tradicion y Libertad (CTL)
-- Ejecutar en el SQL editor de Supabase o via `supabase db push`.

alter table predios add column if not exists codigo_catastral text;
alter table predios add column if not exists departamento text;
alter table predios add column if not exists municipio text;
