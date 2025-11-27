import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

function validateD1Database(db: unknown): D1Database {
  if (!db || typeof db !== "object") {
    throw new Error("D1Database is not available in environment");
  }

  const d1 = db as Record<string, unknown>;
  if (typeof d1.prepare !== "function") {
    throw new Error("D1Database does not have required 'prepare' method");
  }

  return db as D1Database;
}

export const POST = async (req: Request) => {
  try {
    const { env } = await getCloudflareContext();
    const db = validateD1Database(env.D1Database);
    const auth = getAuth(db);
    return auth.handler(req);
  } catch (error) {
    console.error("Auth route error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    const { env } = await getCloudflareContext();
    const db = validateD1Database(env.D1Database);
    const auth = getAuth(db);
    return auth.handler(req);
  } catch (error) {
    console.error("Auth route error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
