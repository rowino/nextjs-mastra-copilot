import { authenticateRequest, setActiveOrganization } from "@/lib/api-auth";
import { getOrgScopedDb, generateId } from "@/mastra/tools/shared/org-scoped-db";
import { organization, member, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { NextRequest } from "next/server";

const createOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().optional(),
  logo: z.string().url().optional(),
});

// GET /api/organization - List user's organizations
export async function GET() {
  try {
    const context = await authenticateRequest();
    const db = getOrgScopedDb();

    // Get all organizations where user is a member
    const memberships = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        role: member.role,
        createdAt: organization.createdAt,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(member.userId, context.userId))
      .all();

    return Response.json({ organizations: memberships });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

// POST /api/organization - Create new organization
export async function POST(req: NextRequest) {
  try {
    const context = await authenticateRequest();
    const body = await req.json();
    const { name, slug, logo } = createOrgSchema.parse(body);

    const db = getOrgScopedDb();
    const orgId = generateId("org");
    const memberId = generateId("mem");

    // Generate slug from name if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check if slug already exists
    const existingOrg = await db
      .select()
      .from(organization)
      .where(eq(organization.slug, finalSlug))
      .get();

    if (existingOrg) {
      return Response.json(
        { error: "Organization slug already exists" },
        { status: 409 }
      );
    }

    // Insert organization
    await db.insert(organization).values({
      id: orgId,
      name,
      slug: finalSlug,
      logo: logo || null,
      createdAt: new Date(),
      metadata: null,
    });

    // Add user as admin member
    await db.insert(member).values({
      id: memberId,
      organizationId: orgId,
      userId: context.userId,
      role: "admin",
      createdAt: new Date(),
    });

    // Set as active organization
    await setActiveOrganization(orgId);

    return Response.json(
      {
        id: orgId,
        name,
        slug: finalSlug,
        logo,
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating organization:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create organization" },
      { status: 500 }
    );
  }
}
