/**
 * Better Auth Client
 *
 * Client-side auth instance for React components.
 * Use this in client components and providers.
 */

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "",
  plugins: [adminClient()],
});
