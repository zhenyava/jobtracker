create table if not exists job_applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  company_name text not null,
  industry text,
  job_url text not null,
  description text not null,
  location text,
  work_type text check (work_type in ('remote', 'office', 'hybrid')) not null,
  
  -- Status flow
  status text default 'hr_screening' not null, -- Values: 'hr_screening', 'offer', 'rejected', 'not_responded' + user custom
  
  -- Dates
  applied_at timestamptz default now() not null,
  next_action_at timestamptz,
  
  -- Meta
  rejection_reason text,
  notes text,
  match_score integer,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table job_applications enable row level security;

create policy "Users can view their own applications"
  on job_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own applications"
  on job_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own applications"
  on job_applications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own applications"
  on job_applications for delete
  using (auth.uid() = user_id);
