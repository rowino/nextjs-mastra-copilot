import { authenticateRequest } from "@/lib/api-auth";
import { getOrgScopedDb, generateId } from "@/mastra/tools/shared/org-scoped-db";
import { invitation, member, user, organization } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { NextRequest } from "next/server";

const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// POST /api/invitations/accept - Accept invitation
export async function POST(req: NextRequest) {
  try {
    const authContext = await authenticateRequest();
    const body = await req.json();
    const { token } = acceptInvitationSchema.parse(body);

    const db = getOrgScopedDb();

    // Find invitation by token
    const invitationRecord = await db
      .select()
      .from(invitation)
      .where(eq(invitation.token, token))
      .get();

    if (!invitationRecord) {
      return Response.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitationRecord.status !== "pending") {
      return Response.json(
        { error: `This invitation has been ${invitationRecord.status}` },
        { status: 400 }
      );
    }

    if (new Date() > invitationRecord.expiresAt) {
      // Mark as expired
      await db
        .update(invitation)
        .set({ status: "expired" })
        .where(eq(invitation.id, invitationRecord.id));

      return Response.json(
        { error: "This invitation has expired" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, authContext.userId))
      .get();

    if (!currentUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Verify email matches invitation
    if (currentUser.email !== invitationRecord.email) {
      return Response.json(
        {
          error: `This invitation was sent to ${invitationRecord.email}. Please sign in with that email address.`,
        },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMembership = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, invitationRecord.organizationId),
          eq(member.userId, authContext.userId)
        )
      )
      .get();

    if (existingMembership) {
      return Response.json(
        { error: "You are already a member of this organization" },
        { status: 409 }
      );
    }

    // Add user as member
    const memberId = generateId("mem");
    await db.insert(member).values({
      id: memberId,
      organizationId: invitationRecord.organizationId,
      userId: authContext.userId,
      role: invitationRecord.role,
      createdAt: new Date(),
    });

    // Mark invitation as accepted
    await db
      .update(invitation)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
      })
      .where(eq(invitation.id, invitationRecord.id));

    // Get organization details to return
    const org = await db
      .select()
      .from(organization)
      .where(eq(organization.id, invitationRecord.organizationId))
      .get();

    return Response.json(
      {
        success: true,
        message: "Invitation accepted successfully",
        organization: {
          id: org!.id,
          name: org!.name,
          slug: org!.slug,
          role: invitationRecord.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error accepting invitation:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to accept invitation",
      },
      { status: 500 }
    );
  }
}
