import { authenticateRequest } from "@/lib/api-auth";
import {
  getOrgScopedDb,
  requireAdminRole,
  validateOrgOwnership,
  OrgPermissionError,
} from "@/mastra/tools/shared/org-scoped-db";
import { organization, member } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";
import { NextRequest } from "next/server";

const updateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  logo: z.string().url().nullable().optional(),
});

type RouteContext = {
  params: Promise<{ orgId: string }>;
};

// GET /api/organization/[orgId] - Get organization details
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

    // Get organization details
    const org = await db
      .select()
      .from(organization)
      .where(eq(organization.id, orgId))
      .get();

    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 });
    }

    return Response.json({
      ...org,
      role: membership.role,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

// PATCH /api/organization/[orgId] - Update organization (admin only)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const authContext = await authenticateRequest();
    requireAdminRole();
    const { orgId } = await context.params;
    const body = await req.json();
    const updates = updateOrgSchema.parse(body);

    const db = getOrgScopedDb();

    // Verify user is admin member of this organization
    const membership = await db
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

    if (!membership) {
      return Response.json(
        { error: "Access denied: Admin role required" },
        { status: 403 }
      );
    }

    // Check if slug is being updated and if it's unique
    if (updates.slug) {
      const existingOrg = await db
        .select()
        .from(organization)
        .where(eq(organization.slug, updates.slug))
        .get();

      if (existingOrg && existingOrg.id !== orgId) {
        return Response.json(
          { error: "Organization slug already exists" },
          { status: 409 }
        );
      }
    }

    // Update organization
    await db
      .update(organization)
      .set({
        ...updates,
        metadata: null, // Preserve existing metadata if not updated
      })
      .where(eq(organization.id, orgId));

    // Fetch updated organization
    const updatedOrg = await db
      .select()
      .from(organization)
      .where(eq(organization.id, orgId))
      .get();

    return Response.json(updatedOrg);
  } catch (error) {
    console.error("Error updating organization:", error);

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
      { error: error instanceof Error ? error.message : "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE /api/organization/[orgId] - Delete organization (admin only)
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const authContext = await authenticateRequest();
    requireAdminRole();
    const { orgId } = await context.params;
    const db = getOrgScopedDb();

    // Verify user is admin member of this organization
    const membership = await db
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

    if (!membership) {
      return Response.json(
        { error: "Access denied: Admin role required" },
        { status: 403 }
      );
    }

    // Check if user has other organizations to switch to
    const userOrgsCount = await db
      .select({ count: count() })
      .from(member)
      .where(eq(member.userId, authContext.userId))
      .get();

    if (userOrgsCount && userOrgsCount.count <= 1) {
      return Response.json(
        { error: "Cannot delete your only organization" },
        { status: 400 }
      );
    }

    // Delete organization (cascades to all related data)
    await db.delete(organization).where(eq(organization.id, orgId));

    return Response.json({ success: true, message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);

    if (error instanceof OrgPermissionError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete organization" },
      { status: 500 }
    );
  }
}
