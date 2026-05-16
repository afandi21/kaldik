import { getPool } from "./src/lib/pool.js";
import fs from "fs";

// Load env
const content = fs.readFileSync(".env.local", "utf8");
content.split("\n").forEach(line => {
  const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if(match) process.env[match[1]] = match[2].replace(/^"|"$/g, '');
});

async function run() {
  const pool = getPool();
  try {
    await pool.query(`
      create table if not exists system_settings (
        key text primary key,
        value text not null,
        updated_at timestamptz not null default now()
      );
      insert into system_settings (key, value) values ('HIJRI_OFFSET', '0') on conflict (key) do nothing;
    `);
    console.log("Success");
  } catch(e) {
    console.error(e);
  }
}
run();
