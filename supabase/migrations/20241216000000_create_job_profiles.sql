create table public.job_profiles (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone not null default now(),
  constraint job_profiles_pkey primary key (id)
);

alter table public.job_profiles enable row level security;

create policy "Users can perform all actions on their own profiles"
on public.job_profiles
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
