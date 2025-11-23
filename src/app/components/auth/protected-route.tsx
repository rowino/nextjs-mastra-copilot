/**
 * Protected Route Wrapper
 *
 * Server component that checks authentication status and redirects if needed.
 * Use this component to wrap protected pages or sections.
 */

import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export async function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { env } = await getCloudflareContext();
  const auth = getAuth(env.D1Database);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}
