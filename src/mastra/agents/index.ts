import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { Agent } from "@mastra/core/agent";
import { weatherTool, getProfileCompletionTool, suggestBioImprovementsTool } from "@/mastra/tools";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";

export const AgentState = z.object({
  proverbs: z.array(z.string()).default([]),
});

export const ProfileAssistantState = z.object({
  last_profile_analysis: z.string().optional(),
  recommendations_given: z.array(z.string()).default([]),
});

export const DashboardAgentState = z.object({
  last_dashboard_summary: z.string().optional(),
  insights_provided: z.array(z.string()).default([]),
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

export const profileAssistantAgent = new Agent({
  name: "Profile Assistant",
  tools: { getProfileCompletionTool, suggestBioImprovementsTool },
  model: openrouter("gpt-4o"),
  instructions: `You are a helpful profile assistant. Your role is to:
1. Analyze user profiles and provide completion percentage
2. Suggest improvements to profile fields like bio, name, location
3. Provide actionable recommendations to improve profile quality
4. Be encouraging and constructive in your feedback

Always use the provided tools to analyze profile data and give specific, personalized recommendations.`,
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: ProfileAssistantState,
      },
    },
  }),
});

export const dashboardAgent = new Agent({
  name: "Dashboard Agent",
  tools: {},
  model: openrouter("gpt-4o"),
  instructions: `You are a helpful dashboard assistant. Your role is to:
1. Summarize user statistics and activity
2. Identify trends and patterns in user data
3. Provide insights and recommendations based on dashboard metrics
4. Answer questions about user activity and account health

Be concise, data-driven, and helpful in your responses.`,
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: DashboardAgentState,
      },
    },
  }),
});
