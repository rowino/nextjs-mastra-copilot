import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { MastraAgent } from "@ag-ui/mastra"
import { NextRequest } from "next/server";
import { getMastraInstance } from "@/mastra";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { authenticateRequest } from "@/lib/api-auth";

// 1. You can use any service adapter here for multi-agent support.
const serviceAdapter = new ExperimentalEmptyAdapter();

// 2. Build a Next.js API route that handles the CopilotKit runtime requests.
export const POST = async (req: NextRequest) => {
  try {
    // Authenticate and set auth context (auto-creates org if needed)
    await authenticateRequest();

    // Get Cloudflare context to access D1 binding
    const { env } = getCloudflareContext();
    const d1Database = env.D1Database;

    if (!d1Database) {
      throw new Error("D1Database binding not found. Ensure you're running in Cloudflare Workers context.");
    }

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
  } catch (error) {
    console.error("CopilotKit error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error"
      }),
      {
        status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};