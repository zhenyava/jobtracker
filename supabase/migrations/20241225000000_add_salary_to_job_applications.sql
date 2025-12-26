alter table job_applications
add column if not exists salary_min numeric,
add column if not exists salary_max numeric,
add column if not exists salary_currency text,
add column if not exists salary_type text,
add column if not exists salary_period text;
