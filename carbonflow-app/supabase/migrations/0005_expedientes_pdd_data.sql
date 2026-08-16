-- PDD estructurado de formulación (resumen, problemática, análisis, etc.)
alter table expedientes
  add column if not exists pdd_data jsonb;
