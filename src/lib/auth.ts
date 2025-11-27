import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, magicLink, twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { getDb } from "@/db";
import type { D1Database } from "@cloudflare/workers-types";

export const getAuth = (d1: D1Database) => {
  const db = getDb(d1);

  const enableEmailOTP = process.env.NEXT_PUBLIC_ENABLE_EMAIL_OTP === "true";
  const enableMagicLink = process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINK === "true";
  const enable2FA = process.env.NEXT_PUBLIC_ENABLE_2FA === "true";
  const enablePasskey = process.env.NEXT_PUBLIC_ENABLE_PASSKEY === "true";

  const plugins = [];

  if (enableEmailOTP) {
    plugins.push(
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          // @claude-todo: Implement actual email sending (Resend, SendGrid, etc.)
          if (process.env.NODE_ENV === "development") {
            console.log(`[Email OTP] Sending ${type} OTP to ${email}: ${otp}`);
          }
        },
      })
    );
  }

  if (enableMagicLink) {
    plugins.push(
      magicLink({
        async sendMagicLink({ email, url }) {
          // @claude-todo: Implement actual email sending (Resend, SendGrid, etc.)
          if (process.env.NODE_ENV === "development") {
            console.log(`[Magic Link] Sending magic link to ${email}: ${url}`);
          }
        },
      })
    );
  }

  if (enable2FA) {
    plugins.push(
      twoFactor({
        otpOptions: {
          async sendOTP({ user, otp }) {
            // @claude-todo: Implement actual email/SMS sending
            if (process.env.NODE_ENV === "development") {
              console.log(`[2FA OTP] Sending OTP to ${user.email}: ${otp}`);
            }
          },
        },
      })
    );
  }

  if (enablePasskey) {
    const rpID = process.env.NODE_ENV === "development"
      ? "localhost"
      : process.env.PASSKEY_RP_ID;
    const origin = process.env.NODE_ENV === "development"
      ? process.env.BETTER_AUTH_URL || "http://localhost:8788"
      : process.env.PASSKEY_ORIGIN;

    if (!rpID || !origin) {
      throw new Error("Passkey configuration error: PASSKEY_RP_ID and PASSKEY_ORIGIN must be set for production");
    }

    plugins.push(
      passkey({
        rpName: "Mastra Starter",
        rpID,
        origin,
      })
    );
  }

  return betterAuth({
    appName: "Mastra Starter",
    trustedOrigins: ["http://localhost:3000", "http://localhost:8787"],
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_EMAIL_PASSWORD === "true",
      async sendResetPassword({ user, url }) {
        // @claude-todo: Implement actual email sending
        if (process.env.NODE_ENV === "development") {
          console.log(`[Password Reset] Sending reset link to ${user.email}: ${url}`);
        }
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        // @claude-todo: Implement actual email sending
        if (process.env.NODE_ENV === "development") {
          console.log(`[Email Verification] Sending verification to ${user.email}: ${url}`);
        }
      },
    },
    socialProviders: {
      ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? {
            github: {
              clientId: process.env.GITHUB_CLIENT_ID,
              clientSecret: process.env.GITHUB_CLIENT_SECRET,
            },
          }
        : {}),
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
    },
    plugins,
  });
};
