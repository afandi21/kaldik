import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return;

  const content = fs.readFileSync(path, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    // Support optional `export KEY=VALUE` and allow `=` in value
    const match = line.match(/^(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    let val = match[2];

    // remove surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL or DIRECT_URL is not configured.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: connectionString.includes("supabase.co") ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 15000
});

async function main() {
  try {
    await client.connect();

    const schemaPath = "supabase/schema.sql";
    if (!fs.existsSync(schemaPath)) {
      console.error(`Schema file not found: ${schemaPath}`);
      process.exitCode = 1;
      return;
    }

    const sql = fs.readFileSync(schemaPath, "utf8");
    await client.query(sql);
    console.log("schema_applied");
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Schema setup failed.");
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

// Run
main();
