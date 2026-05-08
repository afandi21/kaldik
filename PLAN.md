# Create `implementation.md`

## Summary
- Tambahkan file `implementation.md` di root proyek.
- Isi file harus menjadi instruksi kerja lengkap untuk AI agent junior agar bisa membangun aplikasi kalender akademik tanpa mengambil keputusan produk baru.
- Dokumen ditulis dalam Bahasa Indonesia, dengan langkah implementasi teknis yang eksplisit.

## File Content
Buat `implementation.md` dengan isi berikut:

```md
# Implementation Guide: Kalender Akademik Bilingual

## Tujuan
Bangun aplikasi web kalender akademik bilingual menggunakan Next.js, Supabase Postgres, dan Better Auth.

Aplikasi harus memiliki landing page publik yang menampilkan kalender akademik satu tahun, default bahasa Arab, dengan toggle ke Bahasa Indonesia. Admin login menggunakan Google untuk mengelola data.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Better Auth
- Google OAuth
- Vercel-ready deployment

## Fitur Publik
- Route `/` adalah landing page publik.
- Saat pertama dibuka, bahasa default adalah Arab.
- Sediakan toggle Arab/Indonesia.
- Kalender menampilkan satu tahun akademik aktif.
- Minggu dimulai dari:
  - Sabtu
  - Ahad
  - Senin
  - Selasa
  - Rabu
  - Kamis
  - Jum'at
- Tampilan Arab menggunakan RTL.
- Tampilan Indonesia menggunakan LTR.
- Tanggal Masehi tampil besar.
- Tanggal Hijri tampil kecil di bawah tanggal Masehi dengan opacity rendah.
- Event individual dan event range tampil di kalender.
- Klik angka tanggal membuka modal atau panel detail event pada tanggal tersebut.
- Sorotan event penting tampil di bagian atas landing.

## Fitur Admin
- Route `/admin/login` untuk login Google.
- Route `/admin` untuk dashboard admin.
- Hanya email `afandi.ahmad21@gmail.com` yang boleh mengakses admin.
- Jangan implementasikan password `admin123`; auth yang dipakai adalah Google-only.
- Admin bisa:
  - membuat tahun akademik;
  - mengatur tahun akademik aktif;
  - membuat event;
  - mengedit event;
  - menghapus event;
  - membuat kategori;
  - mengedit kategori;
  - menghapus kategori;
  - menandai event sebagai penting.

## Database
Gunakan Supabase Postgres.

Buat tabel aplikasi berikut:

### `academic_years`
- `id` uuid primary key
- `name` text not null
- `start_date` date not null
- `end_date` date not null
- `is_active` boolean not null default false
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

### `categories`
- `id` uuid primary key
- `name_ar` text not null
- `name_id` text not null
- `color` text not null
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

### `events`
- `id` uuid primary key
- `academic_year_id` uuid references `academic_years(id)` on delete cascade
- `category_id` uuid references `categories(id)` on delete set null
- `title_ar` text not null
- `title_id` text not null
- `description_ar` text
- `description_id` text
- `start_date` date not null
- `end_date` date
- `is_important` boolean not null default false
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

## Auth
- Configure Better Auth dengan Google provider.
- Mount handler di `/api/auth/[...all]`.
- Gunakan `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, dan `DATABASE_URL`.
- Admin email disimpan di env `ADMIN_EMAIL`, default `afandi.ahmad21@gmail.com`.
- Semua mutation admin harus memvalidasi session server-side dan mencocokkan email admin.

## UI Guidelines
- Gunakan desain dashboard rapi, bersih, dan mudah dipindai.
- Jangan buat landing marketing.
- Landing langsung menampilkan kalender dan tanggal penting.
- Gunakan warna kategori untuk event.
- Kalender harus responsif desktop dan mobile.
- Detail tanggal di mobile memakai modal full-width/bottom sheet; desktop boleh panel samping.

## Hijri
- Input utama admin adalah tanggal Masehi.
- Hitung Hijri otomatis secara tabular untuk tampilan.
- Hijri hanya informasi visual: kecil, redup, di bawah angka Masehi.
- Tidak perlu field Hijri manual di versi awal.

## Acceptance Criteria
- `/` bisa dibuka tanpa login.
- Default bahasa adalah Arab.
- Toggle bahasa bekerja.
- Kalender mulai dari Sabtu.
- Event bilingual tampil sesuai bahasa aktif.
- Event range muncul di semua tanggal dalam rentang.
- Klik tanggal membuka detail event.
- Event penting tampil di sorotan.
- `/admin` tidak bisa dibuka oleh user tanpa login.
- User Google selain `afandi.ahmad21@gmail.com` tidak bisa mengakses admin.
- Build berhasil untuk Vercel.

## Deployment Notes
- Jangan commit `.env.local`.
- Sediakan `.env.example`.
- Pastikan project bisa dijalankan dengan:
  - `npm install`
  - `npm run dev`
  - `npm run build`
```

## Test Plan
- Setelah file dibuat, pastikan nama file tepat: `implementation.md`.
- Pastikan isi dokumen lengkap dan tidak menyebut instruksi yang bertentangan dengan keputusan produk.
- Pastikan dokumen menegaskan bahwa password `admin123` tidak dipakai karena auth final adalah Google-only.
