import "server-only";
import pg from "pg";
import type { AcademicYear, CalendarEvent, Category } from "@/lib/types";
import { sampleCategories, sampleEvents, sampleYear } from "@/lib/sample-data";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("supabase.co")
      ? { rejectUnauthorized: false }
      : undefined
  });

  return pool;
}

function mapYear(row: Record<string, unknown>): AcademicYear {
  return {
    id: String(row.id),
    name: String(row.name),
    startDate: String(row.start_date).slice(0, 10),
    endDate: String(row.end_date).slice(0, 10),
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
    startDate: String(row.start_date).slice(0, 10),
    endDate: row.end_date ? String(row.end_date).slice(0, 10) : null,
    isImportant: Boolean(row.is_important),
    category
  };
}

export async function getCalendarData() {
  const client = getPool();

  if (!client) {
    return {
      academicYear: sampleYear,
      categories: sampleCategories,
      events: sampleEvents,
      usingSampleData: true
    };
  }

  try {
    const activeYear = await client.query(
      "select * from academic_years where is_active = true order by created_at desc limit 1"
    );
    const year = activeYear.rows[0] ? mapYear(activeYear.rows[0]) : sampleYear;

    const [categories, events] = await Promise.all([
      client.query("select * from categories order by name_id asc"),
      client.query(
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
      )
    ]);

    return {
      academicYear: year,
      categories: categories.rows.map(mapCategory),
      events: events.rows.map(mapEvent),
      usingSampleData: false
    };
  } catch (error) {
    console.error("Failed to load calendar data", error);
    return {
      academicYear: sampleYear,
      categories: sampleCategories,
      events: sampleEvents,
      usingSampleData: true
    };
  }
}

export async function getAdminData() {
  const client = getPool();

  if (!client) {
    return {
      academicYears: [sampleYear],
      activeYear: sampleYear,
      categories: sampleCategories,
      events: sampleEvents,
      usingSampleData: true
    };
  }

  try {
    const yearsResult = await client.query(
      "select * from academic_years order by start_date desc, created_at desc"
    );
    const academicYears = yearsResult.rows.map(mapYear);
    const activeYear = academicYears.find((year) => year.isActive) ?? academicYears[0] ?? sampleYear;

    const [categories, events] = await Promise.all([
      client.query("select * from categories order by name_id asc"),
      client.query(
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
      )
    ]);

    return {
      academicYears,
      activeYear,
      categories: categories.rows.map(mapCategory),
      events: events.rows.map(mapEvent),
      usingSampleData: false
    };
  } catch (error) {
    console.error("Failed to load admin data", error);
    return {
      academicYears: [sampleYear],
      activeYear: sampleYear,
      categories: sampleCategories,
      events: sampleEvents,
      usingSampleData: true
    };
  }
}

export async function queryDatabase<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  values: Array<string | boolean | null> = []
) {
  const client = getPool();

  if (!client) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  const result = await client.query<T>(text, values);
  return result.rows;
}
