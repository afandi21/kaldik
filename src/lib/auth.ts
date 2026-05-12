import { betterAuth } from "better-auth";
import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const hasGoogleAuth = Boolean(googleClientId && googleClientSecret);
const socialProviders = hasGoogleAuth
  ? {
      google: {
        clientId: googleClientId!,
        clientSecret: googleClientSecret!
      }
    }
  : undefined;

export const adminEmail =
  process.env.ADMIN_EMAIL?.toLowerCase() ?? "afandi.ahmad21@gmail.com";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "development-only-secret-change-this-before-deploy",
  database: databaseUrl
    ? new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes("supabase.co")
          ? { rejectUnauthorized: false }
          : undefined
      })
    : undefined,
  socialProviders,
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"]
});
