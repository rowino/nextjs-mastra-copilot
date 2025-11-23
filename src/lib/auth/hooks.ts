/**
 * Better Auth Custom Hooks
 *
 * Password validation hook enforces strong password requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */

import { PasswordSchema } from "./schemas";
import type { BetterAuthOptions } from "better-auth";

const PASSWORD_ENDPOINTS = [
  "/sign-up/email",
  "/change-password",
  "/reset-password",
];

export function passwordValidationHooks(): BetterAuthOptions["hooks"] {
  return {
    before: [
      {
        matcher: (ctx) => {
          return PASSWORD_ENDPOINTS.some((endpoint) =>
            ctx.path?.includes(endpoint)
          );
        },
        handler: async (ctx) => {
          const body = await ctx.request.json();
          const password = body.password || body.newPassword;

          if (!password) {
            return {
              ...ctx,
              error: {
                status: 400,
                message: "Password is required",
              },
            };
          }

          const validation = PasswordSchema.safeParse(password);

          if (!validation.success) {
            const firstError = validation.error.errors[0];
            return {
              ...ctx,
              error: {
                status: 400,
                message: firstError.message,
              },
            };
          }

          return ctx;
        },
      },
    ],
  };
}
