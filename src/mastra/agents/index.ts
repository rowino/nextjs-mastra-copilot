import { openai } from "@ai-sdk/openai";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "@/mastra/tools";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";

export const AgentState = z.object({
  proverbs: z.array(z.string()).default([]),
});

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
export const weatherAgent = new Agent({
  name: "Weather Agent",
  tools: { weatherTool },
  model: openrouter("gpt-4o"),
  instructions: "You are a helpful assistant.",
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: AgentState,
      },
    },
  }),
});
