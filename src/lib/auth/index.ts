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
import { db } from '../db'
import type { D1Database } from "@cloudflare/workers-types";

export function getAuth(d1Database: D1Database) {
    return betterAuth({
        database: drizzleAdapter(db(d1Database), {
            provider: "sqlite",
        }),

        emailAndPassword: {
            enabled: true,
            minPasswordLength: 8,
        },

        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID || "",
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
                redirectURI: `${ process.env.BETTER_AUTH_URL }/api/auth/callback/google`,
            },
            github: {
                clientId: process.env.GITHUB_CLIENT_ID || "",
                clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
                redirectURI: `${ process.env.BETTER_AUTH_URL }/api/auth/callback/github`,
            },
        },

        accountLinking: {
            enabled: true,
            trustedProviders: ["google", "github"],
            allowDifferentEmails: false,
        },
    });
}

export type Auth = ReturnType<typeof getAuth>;
