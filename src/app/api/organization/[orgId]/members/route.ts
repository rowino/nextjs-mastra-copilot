import { authenticateRequest } from "@/lib/api-auth";
import {
  getOrgScopedDb,
  requireAdminRole,
  generateId,
  OrgPermissionError,
} from "@/mastra/tools/shared/org-scoped-db";
import { member, user, organization, invitation } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";
import { NextRequest } from "next/server";
import { sendInvitationEmail } from "@/lib/email";

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user"], { required_error: "Role is required" }),
});

const updateMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  role: z.enum(["admin", "user"], { required_error: "Role is required" }),
});

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

// GET /api/organization/[orgId]/members - List organization members
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const authContext = await authenticateRequest();
    const { orgId } = await context.params;
    const db = getOrgScopedDb();

    // Verify user is member of this organization
    const membership = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, orgId),
          eq(member.userId, authContext.userId)
        )
      )
      .get();

    if (!membership) {
      return Response.json(
        { error: "Access denied: Not a member of this organization" },
        { status: 403 }
      );
    }

    // Get all members with user details
    const members = await db
      .select({
        id: member.id,
        userId: member.userId,
        name: user.name,
        email: user.email,
        role: member.role,
        createdAt: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, orgId))
      .all();

    return Response.json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST /api/organization/[orgId]/members - Invite member (admin only)
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const authContext = await authenticateRequest();
    requireAdminRole();
    const { orgId } = await context.params;
    const body = await req.json();
    const { email, role } = inviteMemberSchema.parse(body);

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

    // Find user by email
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .get();

    if (!targetUser) {
      // User doesn't exist - send invitation email instead
      const token = crypto.randomUUID();
      const expirationDays = parseInt(process.env.INVITE_EXPIRATION_DAYS || "7");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      // Check if user already has pending invitation
      const existingInvite = await db
        .select()
        .from(invitation)
        .where(
          and(
            eq(invitation.organizationId, orgId),
            eq(invitation.email, email),
            eq(invitation.status, "pending")
          )
        )
        .get();

      if (existingInvite) {
        return Response.json(
          { error: "User already has a pending invitation" },
          { status: 409 }
        );
      }

      const invitationId = generateId("inv");

      await db.insert(invitation).values({
        id: invitationId,
        organizationId: orgId,
        email,
        role,
        invitedBy: authContext.userId,
        token,
        status: "pending",
        expiresAt,
        createdAt: new Date(),
      });

      // Get organization name and inviter name
      const org = await db
        .select()
        .from(organization)
        .where(eq(organization.id, orgId))
        .get();
      const inviter = await db
        .select()
        .from(user)
        .where(eq(user.id, authContext.userId))
        .get();

      await sendInvitationEmail({
        to: email,
        organizationName: org!.name,
        inviterName: inviter!.name || inviter!.email,
        role,
        token,
        expiresAt,
      });

      return Response.json(
        {
          message: "Invitation sent successfully",
          invitationId,
        },
        { status: 201 }
      );
    }

    // Check if user is already a member
    const existingMembership = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, orgId),
          eq(member.userId, targetUser.id)
        )
      )
      .get();

    if (existingMembership) {
      return Response.json(
        { error: "User is already a member of this organization" },
        { status: 409 }
      );
    }

    // Check if user already has pending invitation (for existing users)
    const existingInvite = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.organizationId, orgId),
          eq(invitation.email, targetUser.email),
          eq(invitation.status, "pending")
        )
      )
      .get();

    if (existingInvite) {
      return Response.json(
        { error: "User already has a pending invitation" },
        { status: 409 }
      );
    }

    // Add user as member
    const memberId = generateId("mem");
    await db.insert(member).values({
      id: memberId,
      organizationId: orgId,
      userId: targetUser.id,
      role: role,
      createdAt: new Date(),
    });

    return Response.json(
      {
        id: memberId,
        userId: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: role,
        createdAt: new Date().toISOString(),
        message: "Member added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inviting member:", error);

    if (error instanceof OrgPermissionError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to invite member" },
      { status: 500 }
    );
  }
}

// PATCH /api/organization/[orgId]/members - Update member role (admin only)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const authContext = await authenticateRequest();
    requireAdminRole();
    const { orgId } = await context.params;
    const body = await req.json();
    const { memberId, role } = updateMemberSchema.parse(body);

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

    // Get target member
    const targetMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.id, memberId),
          eq(member.organizationId, orgId)
        )
      )
      .get();

    if (!targetMember) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    // Prevent changing own role
    if (targetMember.userId === authContext.userId) {
      return Response.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // If downgrading from admin, check if they're the last admin
    if (targetMember.role === "admin" && role === "user") {
      const adminCount = await db
        .select({ count: count() })
        .from(member)
        .where(
          and(
            eq(member.organizationId, orgId),
            eq(member.role, "admin")
          )
        )
        .get();

      if (adminCount && adminCount.count <= 1) {
        return Response.json(
          { error: "Cannot remove the last admin from organization" },
          { status: 400 }
        );
      }
    }

    // Update member role
    await db
      .update(member)
      .set({ role: role })
      .where(eq(member.id, memberId));

    // Fetch updated member with user details
    const updatedMember = await db
      .select({
        id: member.id,
        userId: member.userId,
        name: user.name,
        email: user.email,
        role: member.role,
        createdAt: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.id, memberId))
      .get();

    return Response.json({
      ...updatedMember,
      message: "Member role updated successfully",
    });
  } catch (error) {
    console.error("Error updating member:", error);

    if (error instanceof OrgPermissionError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE /api/organization/[orgId]/members - Remove member (admin only or self)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const authContext = await authenticateRequest();
    const { orgId } = await context.params;
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return Response.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const db = getOrgScopedDb();

    // Get target member
    const targetMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.id, memberId),
          eq(member.organizationId, orgId)
        )
      )
      .get();

    if (!targetMember) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    const isSelf = targetMember.userId === authContext.userId;

    // If not self-removal, require admin role
    if (!isSelf) {
      requireAdminRole();

      // Verify requester is admin
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
    }

    // Check if member is last admin
    if (targetMember.role === "admin") {
      const adminCount = await db
        .select({ count: count() })
        .from(member)
        .where(
          and(
            eq(member.organizationId, orgId),
            eq(member.role, "admin")
          )
        )
        .get();

      if (adminCount && adminCount.count <= 1) {
        return Response.json(
          { error: "Cannot remove the last admin from organization" },
          { status: 400 }
        );
      }
    }

    // Remove member
    await db.delete(member).where(eq(member.id, memberId));

    return Response.json({
      success: true,
      message: isSelf ? "You have left the organization" : "Member removed successfully",
    });
  } catch (error) {
    console.error("Error removing member:", error);

    if (error instanceof OrgPermissionError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to remove member" },
      { status: 500 }
    );
  }
}
