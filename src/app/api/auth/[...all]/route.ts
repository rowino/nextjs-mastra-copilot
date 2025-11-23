import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function GET(req: Request) {
    const { env } = await getCloudflareContext();
    const auth = getAuth(env.D1Database);
    const handler = toNextJsHandler(auth);
    return handler.GET(req);
}

export async function POST(req: Request) {
    const { env } = await getCloudflareContext();
    const auth = getAuth(env.D1Database);
    const handler = toNextJsHandler(auth);
    return handler.POST(req);
}