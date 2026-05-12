"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/admin";
import { adminEmail, adminPassword } from "@/lib/auth";

function safeCompare(input: string, expected: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);

  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const isValidEmail = email === adminEmail;
  const isValidPassword = safeCompare(password, adminPassword);

  if (!isValidEmail || !isValidPassword) {
    redirect("/admin/login?error=invalid-credentials");
  }

  await createAdminSession(email);
  redirect("/admin");
}
