import { authenticateRequest } from "@/lib/api-auth";

// GET /api/organization/current - Get current organization context
export async function GET() {
  try {
    const context = await authenticateRequest();

    return Response.json({
      userId: context.userId,
      email: context.email,
      orgId: context.orgId,
      roles: context.roles,
    });
  } catch (error) {
    console.error("Error fetching current organization:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to fetch current organization" },
      { status: 500 }
    );
  }
}
