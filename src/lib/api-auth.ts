import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuth } from "@/lib/auth";
import { setAuthContext } from "@/lib/auth-context";
import { getDb } from "@/db";
import { member, organization } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { headers, cookies } from "next/headers";
import { generateId } from "@/mastra/tools/shared/org-scoped-db";

type AuthResult = {
  userId: string;
  email: string;
  orgId: string;
  roles: ("admin" | "user")[];
};

const ACTIVE_ORG_COOKIE = "active_org_id";

/**
 * Authenticate the request and set auth context for API routes
 * Auto-creates organization on first login if none exists
 * Persists selected organization via cookie
 */
export async function authenticateRequest(): Promise<AuthResult> {
  const { env } = getCloudflareContext();
  const d1Database = env.D1Database;

  if (!d1Database) {
    throw new Error("D1Database binding not found");
  }

  const auth = getAuth(d1Database);
  const headersList = await headers();

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("API Auth - Headers:", Object.fromEntries(headersList.entries()));
  }

  const session = await auth.api.getSession({ headers: headersList });

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("API Auth - Session:", session ? "Found" : "Not found");
  }

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const db = getDb(d1Database);
  const cookieStore = await cookies();
  const savedOrgId = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

  // Try to get the saved organization membership first
  let activeMembership = null;

  if (savedOrgId) {
    activeMembership = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, savedOrgId)
        )
      )
      .get();
  }

  // Fall back to most recent membership if saved org not found
  if (!activeMembership) {
    activeMembership = await db
      .select()
      .from(member)
      .where(eq(member.userId, session.user.id))
      .orderBy(desc(member.createdAt))
      .limit(1)
      .get();
  }

  // Auto-create organization on first login if none exists
  if (!activeMembership) {
    console.log("No organization found for user, creating default organization");

    const orgId = generateId("org");
    const memberId = generateId("mem");
    const userName = session.user.name || session.user.email.split("@")[0];

    // Create organization
    await db.insert(organization).values({
      id: orgId,
      name: `${userName}'s Organization`,
      slug: `${userName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      logo: null,
      createdAt: new Date(),
      metadata: null,
    });

    // Add user as admin
    await db.insert(member).values({
      id: memberId,
      organizationId: orgId,
      userId: session.user.id,
      role: "admin",
      createdAt: new Date(),
    });

    // Fetch the newly created membership
    activeMembership = await db
      .select()
      .from(member)
      .where(eq(member.id, memberId))
      .get();
  }

  if (!activeMembership) {
    throw new Error("Failed to create organization");
  }

  const authContext: AuthResult = {
    userId: session.user.id,
    email: session.user.email,
    orgId: activeMembership.organizationId,
    roles: [activeMembership.role],
  };

  // Set auth context for AsyncLocalStorage
  setAuthContext(authContext);

  // Update cookie if it doesn't match current org
  if (savedOrgId !== activeMembership.organizationId) {
    cookieStore.set(ACTIVE_ORG_COOKIE, activeMembership.organizationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return authContext;
}

/**
 * Set the active organization cookie
 */
export async function setActiveOrganization(orgId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
