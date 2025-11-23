/**
 * Better Auth Configuration
 *
 * Factory function creates auth instance per-request with D1 database binding.
 * Configured with:
 * - Email/password authentication
 * - OAuth providers (Google, GitHub)
 * - Account linking
 * - Email verification (non-blocking)
 * - Password reset
 * - RBAC with admin plugin
 * - Rate limiting
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { admin } from "better-auth/plugins";
import * as schema from "@/lib/db/schema";
import { passwordValidationHooks } from "./hooks";

export function getAuth(d1Database: D1Database) {
  const db = drizzle(d1Database, { schema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
      },
    },

    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
      allowDifferentEmails: false,
    },

    emailVerification: {
      enabled: true,
      sendVerificationEmail: async ({ user, url }) => {
        // TODO: Replace with Resend integration
        console.log(`
🔐 Email Verification
───────────────────
To: ${user.email}
Subject: Verify your email address

Please verify your email by clicking the link below:
${url}

This link will expire in 24 hours.
        `);
      },
    },

    resetPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        // TODO: Replace with Resend integration
        console.log(`
🔑 Password Reset
───────────────────
To: ${user.email}
Subject: Reset your password

You requested a password reset. Click the link below to reset your password:
${url}

This link will expire in 1 hour.
If you didn't request this, please ignore this email.
        `);
      },
      resetPasswordTokenExpiresIn: 3600, // 1 hour
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day - refresh session after this
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },

    rateLimit: {
      enabled: true,
      window: 10, // 10 seconds
      max: 3, // 3 requests per window
      customIpHeader: "cf-connecting-ip", // Cloudflare header
    },

    plugins: [
      admin({
        defaultRole: "user",
      }),
    ],

    hooks: passwordValidationHooks(),

    advanced: {
      generateId: () => {
        return crypto.randomUUID();
      },
    },
  });
}

export type Auth = ReturnType<typeof getAuth>;
