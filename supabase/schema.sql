create extension if not exists "pgcrypto";

create table if not exists academic_years (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_id text not null,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  updated_at timestamptz not null default now(),
  constraint events_end_after_start check (end_date is null or end_date >= start_date)
);

create index if not exists events_academic_year_id_idx on events(academic_year_id);
create index if not exists events_start_date_idx on events(start_date);
create index if not exists events_is_important_idx on events(is_important);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists academic_years_updated_at on academic_years;
create trigger academic_years_updated_at
before update on academic_years
for each row execute function set_updated_at();

drop trigger if exists categories_updated_at on categories;
create trigger categories_updated_at
before update on categories
for each row execute function set_updated_at();

drop trigger if exists events_updated_at on events;
create trigger events_updated_at
before update on events
for each row execute function set_updated_at();
