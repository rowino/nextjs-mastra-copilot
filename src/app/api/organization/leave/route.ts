import { authenticateRequest } from "@/lib/api-auth";
import { getOrgScopedDb } from "@/mastra/tools/shared/org-scoped-db";
import { member } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

const leaveOrgSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const authContext = await authenticateRequest();
    const body = await req.json();
    const { orgId } = leaveOrgSchema.parse(body);

    const db = getOrgScopedDb();

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
        { error: "You are not a member of this organization" },
        { status: 404 }
      );
    }

    if (membership.role === "admin") {
      const adminCount = await db
        .select({ count: count() })
        .from(member)
        .where(
          and(eq(member.organizationId, orgId), eq(member.role, "admin"))
        )
        .get();

      if (adminCount && adminCount.count <= 1) {
        return Response.json(
          {
            error:
              "Cannot leave organization as you are the only admin. Please promote another member to admin first.",
          },
          { status: 400 }
        );
      }
    }

    await db
      .delete(member)
      .where(
        and(
          eq(member.id, membership.id),
          eq(member.userId, authContext.userId)
        )
      );

    return Response.json({
      success: true,
      message: "Successfully left the organization",
    });
  } catch (error) {
    console.error("Error leaving organization:", error);

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
            : "Failed to leave organization",
      },
      { status: 500 }
    );
  }
}
