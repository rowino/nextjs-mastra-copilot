# Better Auth Research

## Overview

Better Auth is a comprehensive authentication framework for TypeScript. It supports various adapters, including Drizzle ORM and Cloudflare D1.

## Integration with Cloudflare D1

To use Better Auth with Cloudflare D1, the recommended approach is to use the Drizzle ORM adapter.

### Dependencies

- `better-auth`
- `drizzle-orm`
- `drizzle-kit`
- `@better-auth/cli`

### Configuration

1.  **Database Setup**:
    - Define Drizzle schema for `user`, `session`, `account`, `verification`.
    - Configure `drizzle.config.ts`.
    - Bind D1 database in `wrangler.jsonc` (already done: `mastra-db`).

2.  **Auth Instance (`auth.ts`)**:

    ```typescript
    import { betterAuth } from "better-auth";
    import { drizzleAdapter } from "better-auth/adapters/drizzle";
    import { db } from "@/db"; // Drizzle instance

    export const auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "sqlite", // D1 is SQLite-compatible
      }),
      emailAndPassword: {
        enabled: true,
      },
      plugins: [
        emailOTP({
          async sendVerificationOTP({ email, otp, type }) {
            // Implement email sending logic here
          },
        }),
      ],
      socialProviders: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      },
    });
    ```

3.  **API Route**:
    - Create `src/app/api/auth/[...all]/route.ts` to handle requests.
    - Use `toNextJsHandler` (or Cloudflare specific handler if needed, but Next.js adapter works with OpenNext).

## Email OTP Plugin

- Requires `emailOTP` plugin.
- Must implement `sendVerificationOTP` function to actually send the email (e.g., using Resend, SendGrid, or Mastra's email tools if available).
- Client-side: `signIn.emailOtp()`, `verifyEmail()`, etc.

## Social Authentication

- Supported providers: Google, GitHub, etc.
- Requires `clientId` and `clientSecret` in environment variables.
- Redirect URI: `/api/auth/callback/[provider]`.

## Next Steps for Implementation

1.  Install `better-auth` and Drizzle dependencies.
2.  Set up Drizzle schema and client.
3.  Configure Better Auth with Drizzle adapter.
4.  Implement Email OTP and Social providers.
5.  Create API routes and client helper.
