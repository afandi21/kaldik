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

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL atau DIRECT_URL belum dikonfigurasi.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: connectionString.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : undefined,
  connectionTimeoutMillis: 15000
});

try {
  await client.connect();
  await client.query(fs.readFileSync("supabase/schema.sql", "utf8"));
  console.log("schema_applied");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Schema setup failed.");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
