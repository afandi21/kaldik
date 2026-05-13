import "server-only";
import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

/**
 * Returns a shared connection pool.
 * Prefer DATABASE_URL (pooler) for runtime stability.
 * Returns `null` when neither DATABASE_URL nor DIRECT_URL is configured.
 */
export function getPool(): pg.Pool | null {
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

  if (!connectionString) {
    return null;
  }

  pool ??= new Pool({
    connectionString,
    ssl: connectionString.includes("supabase.co")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
}
