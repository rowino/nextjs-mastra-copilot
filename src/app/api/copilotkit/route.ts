import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { MastraAgent } from "@ag-ui/mastra"
import { NextRequest } from "next/server";
import { getMastraInstance } from "@/mastra";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuth } from "@/lib/auth";
import { setAuthContext } from "@/lib/auth-context";
import { getDb } from "@/db";
import { member } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

// 1. You can use any service adapter here for multi-agent support.
const serviceAdapter = new ExperimentalEmptyAdapter();

// 2. Build a Next.js API route that handles the CopilotKit runtime requests.
export const POST = async (req: NextRequest) => {
  // Get Cloudflare context to access D1 binding
  const { env } = getCloudflareContext();
  const d1Database = env.D1Database;

  if (!d1Database) {
    throw new Error("D1Database binding not found. Ensure you're running in Cloudflare Workers context.");
  }

  // Authenticate and set auth context
  const auth = getAuth(d1Database);
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = getDb(d1Database);
  const activeMembership = await db
    .select()
    .from(member)
    .where(eq(member.userId, session.user.id))
    .orderBy(desc(member.createdAt))
    .limit(1)
    .get();

  if (!activeMembership) {
    return new Response(
      JSON.stringify({ error: "No organization membership found" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  setAuthContext({
    userId: session.user.id,
    email: session.user.email,
    orgId: activeMembership.organizationId,
    roles: [activeMembership.role],
  });

  // Get Mastra instance with D1 storage
  const mastra = getMastraInstance(d1Database);

  // 3. Create the CopilotRuntime instance and utilize the Mastra AG-UI
  //    integration to get the remote agents. Cache this for performance.
  const runtime = new CopilotRuntime({
    agents: MastraAgent.getLocalAgents({ mastra }),
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};