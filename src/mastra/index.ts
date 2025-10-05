import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { weatherAgent, profileAssistantAgent, dashboardAgent } from "./agents";
import { ConsoleLogger, LogLevel } from "@mastra/core/logger";

const LOG_LEVEL = process.env.LOG_LEVEL as LogLevel || "info";

export const mastra = new Mastra({
  agents: {
    weatherAgent,
    profileAssistantAgent,
    dashboardAgent,
  },
  storage: new LibSQLStore({
    url: ":memory:"
  }),
  logger: new ConsoleLogger({
    level: LOG_LEVEL,
  }),
});