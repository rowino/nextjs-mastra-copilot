import { getOrgScopedDb } from "@/mastra/tools/shared/org-scoped-db";
import { invitation, organization } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return Response.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const db = getOrgScopedDb();

    const invite = await db
      .select({
        email: invitation.email,
        organizationName: organization.name,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.organizationId, organization.id))
      .where(eq(invitation.token, token))
      .get();

    if (!invite) {
      return Response.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (invite.status !== "pending") {
      return Response.json(
        { error: `Invitation has already been ${invite.status}` },
        { status: 400 }
      );
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return Response.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    return Response.json(invite);
  } catch (error) {
    console.error("Error looking up invitation:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to lookup invitation",
      },
      { status: 500 }
    );
  }
}
