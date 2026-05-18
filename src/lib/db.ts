import "server-only";
import pg, { Pool } from "pg";
import type { AcademicYear, CalendarEvent, Category } from "@/lib/types";

declare global {
  var pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum dikonfigurasi.");
}

const pool = globalThis.pgPool || new Pool({
  connectionString,
  max: 4,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 20000,
  ssl: { rejectUnauthorized: false }
});

if (process.env.NODE_ENV !== "production") {
  globalThis.pgPool = pool;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function normalizeDate(value: unknown) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return String(value).match(/^(\d{4})-(\d{2})-(\d{2})/u)?.[0] ?? "";
}

function mapYear(row: Record<string, unknown>): AcademicYear {
  return {
    id: String(row.id),
    name: String(row.name),
    startDate: normalizeDate(row.start_date),
    endDate: normalizeDate(row.end_date),
    isActive: Boolean(row.is_active)
  };
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    nameAr: String(row.name_ar),
    nameId: String(row.name_id),
    color: String(row.color)
  };
}

function mapEvent(row: Record<string, unknown>): CalendarEvent {
  const category =
    row.category_id && row.category_name_ar
      ? {
          id: String(row.category_id),
          nameAr: String(row.category_name_ar),
          nameId: String(row.category_name_id),
          color: String(row.category_color)
        }
      : null;

  return {
    id: String(row.id),
    academicYearId: String(row.academic_year_id),
    categoryId: row.category_id ? String(row.category_id) : null,
    titleAr: String(row.title_ar),
    titleId: String(row.title_id),
    descriptionAr: row.description_ar ? String(row.description_ar) : null,
    descriptionId: row.description_id ? String(row.description_id) : null,
    startDate: normalizeDate(row.start_date),
    endDate: row.end_date ? normalizeDate(row.end_date) : null,
    isImportant: Boolean(row.is_important),
    category
  };
}

export async function getCalendarData() {
  try {
    const selectedYear = await pool.query(
      `select *
       from academic_years
       order by is_active desc, start_date desc, created_at desc
       limit 1`
    );
    const year = selectedYear.rows[0] ? mapYear(selectedYear.rows[0]) : null;
    if (!year) {
      throw new Error("Tabel academic_years kosong. Tambahkan minimal satu tahun akademik.");
    }
    if (!isUuid(year.id)) {
      throw new Error(
        `ID tahun akademik tidak valid (${year.id}). Restart dev server untuk memuat kode terbaru dan pastikan tidak ada fallback data lama.`
      );
    }

    const [categories, events, settings] = await Promise.all([
      pool.query("select * from categories order by name_id asc"),
      pool.query(
        `select
          e.*,
          c.name_ar as category_name_ar,
          c.name_id as category_name_id,
          c.color as category_color
        from events e
        left join categories c on c.id = e.category_id
        where e.academic_year_id = $1
        order by e.start_date asc, e.title_id asc`,
        [year.id]
      ),
      pool.query("select value from system_settings where key = 'HIJRI_OFFSET'")
    ]);

    const hijriOffset = parseInt(settings.rows[0]?.value ?? "0", 10);

    return {
      academicYear: year,
      categories: categories.rows.map(mapCategory),
      events: events.rows.map(mapEvent),
      hijriOffset
    };
  } catch (error) {
    console.error("Failed to load calendar data", error);
    throw error;
  }
}

export async function getAdminData() {
  try {
    const yearsResult = await pool.query(
      "select * from academic_years order by start_date desc, created_at desc"
    );
    const academicYears = yearsResult.rows.map(mapYear);
    const activeYear = academicYears.find((year) => year.isActive) ?? academicYears[0] ?? null;
    if (!activeYear) {
      throw new Error("Tabel academic_years kosong. Tambahkan data tahun akademik terlebih dulu.");
    }
    if (!isUuid(activeYear.id)) {
      throw new Error(
        `ID tahun akademik tidak valid (${activeYear.id}). Restart dev server untuk memuat kode terbaru dan pastikan tidak ada fallback data lama.`
      );
    }

    const [categories, events, settings] = await Promise.all([
      pool.query("select * from categories order by name_id asc"),
      pool.query(
        `select
          e.*,
          c.name_ar as category_name_ar,
          c.name_id as category_name_id,
          c.color as category_color
        from events e
        left join categories c on c.id = e.category_id
        where e.academic_year_id = $1
        order by e.start_date asc, e.title_id asc`,
        [activeYear.id]
      ),
      pool.query("select value from system_settings where key = 'HIJRI_OFFSET'")
    ]);

    const hijriOffset = parseInt(settings.rows[0]?.value ?? "0", 10);

    return {
      academicYears,
      activeYear,
      categories: categories.rows.map(mapCategory),
      events: events.rows.map(mapEvent),
      hijriOffset
    };
  } catch (error) {
    console.error("Failed to load admin data", error);
    throw error;
  }
}

export async function queryDatabase<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  values: Array<string | boolean | null> = []
) {
  const result = await pool.query<T>(text, values);
  return result.rows;
}
