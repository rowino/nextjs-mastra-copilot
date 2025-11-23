import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from 'drizzle-orm/d1';

export async function db() {
    const { env } = await getCloudflareContext();

    return drizzle(env.D1Database);
}

