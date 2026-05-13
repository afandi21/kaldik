-- Tambahkan setidaknya satu tahun akademik ke tabel academic_years.
-- Jalankan file ini menggunakan psql, Supabase SQL editor, atau migrasi manual.

insert into academic_years (id, name, start_date, end_date, is_active)
values (
  gen_random_uuid(),
  'Tahun Akademik 2025/2026',
  '2025-07-01',
  '2026-06-30',
  true
);
