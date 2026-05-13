create extension if not exists "pgcrypto";

create table if not exists academic_years (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint academic_years_end_after_start check (end_date >= start_date)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_id text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references academic_years(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  title_ar text not null,
  title_id text not null,
  description_ar text,
  description_id text,
  start_date date not null,
  end_date date,
  is_important boolean not null default false,
  created_at timestamptz not null default now(),
  constraint events_end_after_start check (end_date is null or end_date >= start_date)
);

create unique index if not exists academic_years_single_active_idx
  on academic_years(is_active)
  where is_active = true;

create index if not exists academic_years_start_created_idx
  on academic_years(start_date desc, created_at desc);

create index if not exists categories_name_id_idx on categories(name_id);
create index if not exists events_academic_year_start_title_idx
  on events(academic_year_id, start_date, title_id);
create index if not exists events_is_important_idx on events(is_important);

alter table academic_years enable row level security;
alter table categories enable row level security;
alter table events enable row level security;

drop policy if exists "Public can read academic years" on academic_years;
create policy "Public can read academic years"
on academic_years
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read categories" on categories;
create policy "Public can read categories"
on categories
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read events" on events;
create policy "Public can read events"
on events
for select
to anon, authenticated
using (true);

-- Admin writes from Server Actions use DATABASE_URL (postgres role), so RLS
-- policies below are only needed if write operations move to Supabase client.
drop policy if exists "Authenticated can write academic years" on academic_years;
create policy "Authenticated can write academic years"
on academic_years
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can write categories" on categories;
create policy "Authenticated can write categories"
on categories
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can write events" on events;
create policy "Authenticated can write events"
on events
for all
to authenticated
using (true)
with check (true);
