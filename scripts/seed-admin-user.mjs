import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL ?? "afandi.ahmad21@gmail.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

try {
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = listData.users.find((user) => user.email?.toLowerCase() === adminEmail.toLowerCase());

  if (!existing) {
    const { error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });
    if (createError) throw createError;
    console.log(`admin_user_created email=${adminEmail}`);
  } else {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password: adminPassword,
      email_confirm: true
    });
    if (updateError) throw updateError;
    console.log(`admin_user_updated email=${adminEmail}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Seed admin user gagal.");
  process.exit(1);
}
