import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

function loadEnvFile(path) {
  if (!fs.existsSync(path)) {
    return;
  }

  const content = fs.readFileSync(path, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);

    if (!match || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL belum dikonfigurasi.");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : undefined,
  connectionTimeoutMillis: 15000
});

try {
  await client.connect();
  const result = await client.query(`
    select
      (select count(*) from academic_years) as academic_years,
      (select count(*) from categories) as categories,
      (select count(*) from events) as events
  `);
  const counts = result.rows[0];

  console.log(
    `database_ok academic_years=${counts.academic_years} categories=${counts.categories} events=${counts.events}`
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : "Database check failed.");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
