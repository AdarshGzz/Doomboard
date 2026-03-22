-- 0. CLEANUP (Drop existing if any)
drop table if exists auth_otps cascade;
drop table if exists jobs cascade;
drop table if exists resumes cascade;
drop extension if exists "uuid-ossp" cascade;

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. RESUMES TABLE
create table resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  name text not null,
  file_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. JOBS TABLE
create table jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  normalized_url text not null,
  title text,
  company text,
  description text,
  skills text[],
  status text default 'collected',
  resume_used_id uuid references resumes(id),
  is_deleted boolean default false,
  source text,
  location text,
  salary text,
  posted_at text,
  work_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for duplicate prevention logic PER USER
create unique index jobs_normalized_url_user_unique_idx on jobs (normalized_url, user_id) where (is_deleted = false);

-- 4. AUTH OTPS TABLE (Custom OTP System)
create table auth_otps (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  otp_hash text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index auth_otps_email_idx on auth_otps(email);

-- 5. SECURITY (RLS)
alter table resumes enable row level security;
alter table jobs enable row level security;
alter table auth_otps enable row level security;

-- Policies for Jobs & Resumes (User Access)
create policy "Users can perform all actions on their own jobs" on jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can perform all actions on their own resumes" on resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6. REALTIME & REPLICATION
-- Enable Realtime for the jobs table
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table jobs;
commit;
