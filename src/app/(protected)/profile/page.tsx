/**
 * Profile Page
 *
 * Protected page for managing user profile settings.
 * Uses better-auth-ui SettingsCards for profile management.
 */

import { AccountSettingsCards } from "@daveyplate/better-auth-ui";
import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const runtime = "edge";

export default async function ProfilePage() {
  const { env } = await getCloudflareContext();
  const auth = getAuth(env.D1Database);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <AccountSettingsCards />
    </div>
  );
}
