import { Mastra } from "@mastra/core/mastra";
import { D1Store } from "@mastra/cloudflare-d1";
import { LibSQLStore } from "@mastra/libsql";
import { getWeatherAgent } from "./agents";
import { ConsoleLogger, LogLevel } from "@mastra/core/logger";
import type { D1Database } from "@cloudflare/workers-types";

const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel || "info";

// CLI mode: In-memory storage for testing
const cliStorage = new LibSQLStore({ url: ":memory:" });

export const mastra = new Mastra({
  agents: {
    weatherAgent: getWeatherAgent(cliStorage)
  },
  storage: cliStorage,
  logger: new ConsoleLogger({
    level: LOG_LEVEL,
  }),
});

// Production mode: D1 persistent storage
export function getMastraInstance(d1Database: D1Database) {
  const d1Storage = new D1Store({ binding: d1Database });

  return new Mastra({
    agents: {
      weatherAgent: getWeatherAgent(d1Storage)
    },
    storage: d1Storage,
    logger: new ConsoleLogger({
      level: LOG_LEVEL,
    }),
  });
}