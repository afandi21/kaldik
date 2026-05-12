import "server-only";
import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

/**
 * Returns a shared connection pool.
 * Both `db.ts` and `auth.ts` should use this to avoid creating duplicate pools.
 * Returns `null` when `DATABASE_URL` is not configured (graceful fallback).
 */
export function getPool(): pg.Pool | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("supabase.co")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
}
