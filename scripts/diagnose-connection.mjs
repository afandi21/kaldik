/**
 * Diagnostic script for Supabase connection issues.
 * Checks: DNS resolution, TCP connectivity, SSL, authentication, and table existence.
 * Usage: node scripts/diagnose-connection.mjs
 */
import fs from "node:fs";
import dns from "node:dns/promises";
import net from "node:net";
import pg from "pg";

const { Client } = pg;

// ── Load env ──────────────────────────────────────────────────────────
function loadEnvFile(path) {
  if (!fs.existsSync(path)) return;
  const content = fs.readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL belum dikonfigurasi di .env.local atau .env");
  process.exit(1);
}

// Parse URL
let parsed;
try {
  parsed = new URL(url);
  console.log("✅ URL format valid");
  console.log(`   Host : ${parsed.hostname}`);
  console.log(`   Port : ${parsed.port || 5432}`);
  console.log(`   User : ${parsed.username}`);
  console.log(`   DB   : ${parsed.pathname.slice(1)}`);
} catch {
  console.error("❌ DATABASE_URL format tidak valid:", url);
  process.exit(1);
}

// ── Step 1: DNS Resolution ────────────────────────────────────────────
console.log("\n── Step 1: DNS Resolution ──");
try {
  const addresses = await dns.resolve4(parsed.hostname);
  console.log(`✅ DNS resolved: ${addresses.join(", ")}`);
} catch (err) {
  console.error(`❌ DNS gagal resolve ${parsed.hostname}: ${err.message}`);
  console.error("   → Periksa koneksi internet Anda");
  process.exit(1);
}

// ── Step 2: TCP Connectivity ──────────────────────────────────────────
console.log("\n── Step 2: TCP Connectivity ──");
const port = parseInt(parsed.port || "5432", 10);
await new Promise((resolve) => {
  const socket = net.createConnection({ host: parsed.hostname, port, timeout: 10000 });
  socket.on("connect", () => {
    console.log(`✅ TCP terhubung ke ${parsed.hostname}:${port}`);
    socket.destroy();
    resolve();
  });
  socket.on("timeout", () => {
    console.error(`❌ TCP timeout ke ${parsed.hostname}:${port} (10s)`);
    console.error("   → Port mungkin diblokir oleh ISP/Firewall");
    console.error("   → Atau Supabase project sedang paused");
    console.error("   → Coba buka https://supabase.com/dashboard dan restore project");
    socket.destroy();
    process.exit(1);
  });
  socket.on("error", (err) => {
    console.error(`❌ TCP error ke ${parsed.hostname}:${port}: ${err.message}`);
    socket.destroy();
    process.exit(1);
  });
});

// ── Step 3: PostgreSQL Authentication ─────────────────────────────────
console.log("\n── Step 3: PostgreSQL Authentication ──");
const client = new Client({
  connectionString: url,
  ssl: url.includes("supabase.co") ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();
  console.log("✅ Autentikasi PostgreSQL berhasil");

  const versionResult = await client.query("SELECT version()");
  console.log(`   Server: ${versionResult.rows[0].version.split(",")[0]}`);
} catch (err) {
  console.error(`❌ Autentikasi gagal: ${err.message}`);
  if (err.message.includes("password")) {
    console.error("   → Password database salah. Reset di Supabase Dashboard → Project Settings → Database");
  } else if (err.message.includes("timeout")) {
    console.error("   → Connection timeout. Supabase project mungkin paused.");
  }
  process.exit(1);
}

// ── Step 4: Check Tables ──────────────────────────────────────────────
console.log("\n── Step 4: Cek Tabel ──");
const requiredTables = ["academic_years", "categories", "events"];
try {
  const tablesResult = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  const existingTables = tablesResult.rows.map((r) => r.table_name);

  for (const table of requiredTables) {
    if (existingTables.includes(table)) {
      const countResult = await client.query(`SELECT count(*) FROM "${table}"`);
      console.log(`✅ ${table} (${countResult.rows[0].count} rows)`);
    } else {
      console.log(`❌ ${table} — BELUM ADA. Jalankan: npm run db:setup`);
    }
  }

  const extraTables = existingTables.filter((t) => !requiredTables.includes(t));
  if (extraTables.length > 0) {
    console.log(`\n   Tabel lain yang ditemukan: ${extraTables.join(", ")}`);
  }
} catch (err) {
  console.error(`❌ Gagal cek tabel: ${err.message}`);
}

await client.end().catch(() => undefined);

console.log("\n══════════════════════════════════════════");
console.log("✅ Semua pengecekan selesai — koneksi database OK!");
console.log("══════════════════════════════════════════\n");
