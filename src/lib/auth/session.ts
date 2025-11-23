/**
 * Session Validation Helpers
 *
 * Reusable server-side session validation utilities.
 */

import { getAuth } from "./index";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

export async function getServerSession() {
  const { env } = await getCloudflareContext();
  const auth = getAuth(env.D1Database);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
