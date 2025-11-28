import { authenticateRequest } from "@/lib/api-auth";
import {
  getOrgScopedDb,
  requireAdminRole,
  OrgPermissionError,
} from "@/mastra/tools/shared/org-scoped-db";
import { invitation, member, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

// GET /api/organization/[orgId]/invitations - List pending invitations (admin only)
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const authContext = await authenticateRequest();
    requireAdminRole();
    const { orgId } = await context.params;
    const db = getOrgScopedDb();

    // Verify requester is admin member of this organization
    const requesterMembership = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, orgId),
          eq(member.userId, authContext.userId),
          eq(member.role, "admin")
        )
      )
      .get();

    if (!requesterMembership) {
      return Response.json(
        { error: "Access denied: Admin role required" },
        { status: 403 }
      );
    }

    // Get all pending invitations with inviter details
    const invitations = await db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitedBy: user.name,
        invitedByEmail: user.email,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
      })
      .from(invitation)
      .innerJoin(user, eq(invitation.invitedBy, user.id))
      .where(
        and(
          eq(invitation.organizationId, orgId),
          eq(invitation.status, "pending")
        )
      )
      .all();

    return Response.json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);

    if (error instanceof OrgPermissionError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

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

// DELETE /api/organization/[orgId]/invitations?invitationId=xxx - Cancel invitation (admin only)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const authContext = await authenticateRequest();
    requireAdminRole();
    const { orgId } = await context.params;
    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("invitationId");

    if (!invitationId) {
      return Response.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    const db = getOrgScopedDb();

    // Verify requester is admin member of this organization
    const requesterMembership = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, orgId),
          eq(member.userId, authContext.userId),
          eq(member.role, "admin")
        )
      )
      .get();

    if (!requesterMembership) {
      return Response.json(
        { error: "Access denied: Admin role required" },
        { status: 403 }
      );
    }

    // Get invitation
    const invitationRecord = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.id, invitationId),
          eq(invitation.organizationId, orgId)
        )
      )
      .get();

    if (!invitationRecord) {
      return Response.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invitationRecord.status !== "pending") {
      return Response.json(
        { error: "Can only cancel pending invitations" },
        { status: 400 }
      );
    }

    // Mark invitation as expired (soft delete)
    await db
      .update(invitation)
      .set({ status: "expired" })
      .where(eq(invitation.id, invitationId));

    return Response.json({
      success: true,
      message: "Invitation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling invitation:", error);

    if (error instanceof OrgPermissionError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel invitation",
      },
      { status: 500 }
    );
  }
}
