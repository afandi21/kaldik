alter table academic_years
  drop column if exists updated_at;

alter table categories
  drop column if exists updated_at;

alter table events
  drop column if exists updated_at;

drop trigger if exists academic_years_updated_at on academic_years;
drop trigger if exists categories_updated_at on categories;
drop trigger if exists events_updated_at on events;
drop function if exists set_updated_at();

alter table academic_years
  drop constraint if exists academic_years_end_after_start;

alter table academic_years
  add constraint academic_years_end_after_start check (end_date >= start_date);

alter table events
  drop constraint if exists events_end_after_start;

alter table events
  add constraint events_end_after_start check (end_date is null or end_date >= start_date);

drop index if exists events_academic_year_id_idx;
drop index if exists events_start_date_idx;

with ranked_active_years as (
  select
    id,
    row_number() over (order by created_at desc, start_date desc, id desc) as active_rank
  from academic_years
  where is_active = true
)
update academic_years
set is_active = false
where id in (
  select id
  from ranked_active_years
  where active_rank > 1
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
