import { Mastra } from "@mastra/core/mastra";
import { D1Store } from "@mastra/cloudflare-d1";
import { getWeatherAgent } from "./agents";
import { ConsoleLogger, LogLevel } from "@mastra/core/logger";
import type { D1Database } from "@cloudflare/workers-types";

const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel || "info";

export function getMastraInstance(d1Database?: D1Database) {
  if (!d1Database) {
    throw new Error("D1Database is required. Use wrangler dev for local development or deploy to Cloudflare.");
  }

  const storage = new D1Store({ binding: d1Database });

  return new Mastra({
    agents: {
      weatherAgent: getWeatherAgent(storage)
    },
    storage,
    logger: new ConsoleLogger({
      level: LOG_LEVEL,
    }),
  });
}

// Export for Mastra CLI - uses in-memory storage for dev tools
export const mastra = new Mastra({
  agents: {},
  logger: new ConsoleLogger({
    level: LOG_LEVEL,
  }),
});