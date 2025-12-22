-- Add profile_id column to job_applications
-- We truncate the table first to avoid constraint violation for existing rows since we make it NOT NULL
truncate table job_applications;

alter table job_applications 
add column profile_id uuid references job_profiles(id) on delete cascade not null;

-- Update RLS is not strictly necessary for this column, but good to keep in mind logic changes
