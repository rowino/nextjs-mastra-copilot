import { authenticateRequest, setActiveOrganization } from "@/lib/api-auth";
import { setAuthContext } from "@/lib/auth-context";
import { getOrgScopedDb } from "@/mastra/tools/shared/org-scoped-db";
import { member } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { NextRequest } from "next/server";

const switchOrgSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
});

// POST /api/organization/switch - Switch active organization
export async function POST(req: NextRequest) {
  try {
    const context = await authenticateRequest();
    const body = await req.json();
    const { orgId } = switchOrgSchema.parse(body);

    const db = getOrgScopedDb();

    // Verify user is member of target organization
    const membership = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, orgId),
          eq(member.userId, context.userId)
        )
      )
      .get();

    if (!membership) {
      return Response.json(
        { error: "Access denied: Not a member of this organization" },
        { status: 403 }
      );
    }

    // Update cookie to persist organization selection
    await setActiveOrganization(orgId);

    // Update auth context with new organization
    setAuthContext({
      userId: context.userId,
      email: context.email,
      orgId: orgId,
      roles: [membership.role],
    });

    return Response.json({
      success: true,
      orgId: orgId,
      role: membership.role,
      message: "Organization switched successfully",
    });
  } catch (error) {
    console.error("Error switching organization:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to switch organization" },
      { status: 500 }
    );
  }
}
