import { authenticateRequest } from "@/lib/api-auth";
import { getOrgScopedDb } from "@/mastra/tools/shared/org-scoped-db";
import { invitation, organization, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const authContext = await authenticateRequest();
    const db = getOrgScopedDb();

    const invitations = await db
      .select({
        id: invitation.id,
        organizationId: invitation.organizationId,
        organizationName: organization.name,
        role: invitation.role,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        inviterName: user.name,
        inviterEmail: user.email,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.organizationId, organization.id))
      .innerJoin(user, eq(invitation.invitedBy, user.id))
      .where(
        and(
          eq(invitation.email, authContext.email),
          eq(invitation.status, "pending")
        )
      )
      .all();

    return Response.json({ invitations });
  } catch (error) {
    console.error("Error fetching user invitations:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch invitations",
      },
      { status: 500 }
    );
  }
}
