import pg from "pg";
import fs from "fs";

// Load env
const content = fs.readFileSync(".env.local", "utf8");
content.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if(match) {
    let val = match[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[match[1]] = val;
  }
});

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log("Connecting to", url.split('@')[1]);
    await client.connect();
    console.log("Connected.");
    
    await client.query(`
      create table if not exists system_settings (
        id uuid primary key default gen_random_uuid(),
        key text unique not null,
        value text not null default '0',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
      
      insert into system_settings (key, value) values ('HIJRI_OFFSET', '0') on conflict (key) do nothing;
    `);
    
    console.log("Table system_settings created and seeded successfully.");
  } catch(e) {
    console.error("Migration error:", e);
    // If DIRECT_URL failed, let's try DATABASE_URL
    if (url === process.env.DIRECT_URL && process.env.DATABASE_URL) {
       console.log("Falling back to DATABASE_URL...");
       const fallbackClient = new pg.Client({
         connectionString: process.env.DATABASE_URL,
         ssl: { rejectUnauthorized: false }
       });
       try {
         await fallbackClient.connect();
         await fallbackClient.query(`
            create table if not exists system_settings (
              id uuid primary key default gen_random_uuid(),
              key text unique not null,
              value text not null default '0',
              created_at timestamptz not null default now(),
              updated_at timestamptz not null default now()
            );
            
            insert into system_settings (key, value) values ('HIJRI_OFFSET', '0') on conflict (key) do nothing;
         `);
         console.log("Table system_settings created and seeded successfully via fallback.");
       } catch (err2) {
         console.error("Fallback error:", err2);
       } finally {
         await fallbackClient.end();
       }
    }
  } finally {
    await client.end();
  }
}
run();
