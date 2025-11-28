import { weatherTool } from "@/mastra/tools";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from "zod";
import type { MastraStorage } from "@mastra/core";

export const AgentState = z.object({
    proverbs: z.array(z.string()).default([]),
});

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

export function getWeatherAgent(storage: MastraStorage) {
    return new Agent({
        name: "Weather Agent",
        tools: { weatherTool },
        model: openrouter("gpt-5.1"),
        instructions: "You are a helpful assistant.",
        memory: new Memory({
            storage,
            options: {
                workingMemory: {
                    enabled: true,
                    schema: AgentState,
                },
            },
        }),
    });
}
