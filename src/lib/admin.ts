import "server-only";
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminEmail, auth } from "@/lib/auth";

const adminSessionCookie = "kaldik_admin_session";
const adminSessionMaxAge = 60 * 60 * 8;

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.BETTER_AUTH_SECRET ??
    "development-only-secret-change-this-before-deploy"
  );
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function createAdminSession(email: string) {
  const issuedAt = Date.now();
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase(), issuedAt })).toString(
    "base64url"
  );
  const signature = sign(payload);

  (await cookies()).set(adminSessionCookie, `${payload}.${signature}`, {
    httpOnly: true,
    maxAge: adminSessionMaxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

async function getCredentialSession() {
  const cookie = (await cookies()).get(adminSessionCookie)?.value;

  if (!cookie) {
    return null;
  }

  const [payload, signature] = cookie.split(".");

  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string;
      issuedAt?: number;
    };
    const isExpired =
      typeof session.issuedAt !== "number" ||
      Date.now() - session.issuedAt > adminSessionMaxAge * 1000;

    if (session.email !== adminEmail || isExpired) {
      return null;
    }

    return {
      user: {
        email: session.email
      }
    };
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const credentialSession = await getCredentialSession();

  if (credentialSession) {
    return credentialSession;
  }

  try {
    return await auth.api.getSession({
      headers: await headers()
    });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getCurrentSession();
  const email = session?.user?.email?.toLowerCase();

  if (email !== adminEmail) {
    redirect("/admin/login");
  }

  return session;
}
