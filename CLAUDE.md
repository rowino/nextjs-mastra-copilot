# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **starter template** for building AI agents using Mastra and CopilotKit with Next.js. The architecture demonstrates AI-native development patterns where Mastra agents provide backend AI capabilities and CopilotKit provides the frontend conversational UI.

## Development Commands

### Fast Development with Full D1 Access (Recommended)
```bash
# Start Next.js dev server with hot reload + Cloudflare context
# Access at http://localhost:3000
# Features: HMR, D1 database, auth, agent memory
pnpm dev

# With debug logging
pnpm dev:debug
```

**What you get:**
- ✅ Instant hot module replacement (< 1 second updates)
- ✅ Full D1 database access for auth and agent memory
- ✅ All Cloudflare bindings available
- ✅ Next.js Turbopack for fastest builds

### Production-Like Testing
```bash
# Build and run with Cloudflare Workers (for production parity)
# Requires rebuild on code changes (no HMR)
# Access at http://localhost:8787
pnpm dev:cf
```

Use this only when you need to test the exact production build before deploying.

### Testing Agents in CLI Playground
```bash
# Start Mastra CLI playground with agent testing UI
pnpm mastra:dev

# Access Swagger UI at http://localhost:4111/swagger-ui
# Access Mastra Studio at http://localhost:4111
```

**Note:** Uses in-memory storage - data resets on restart. For persistent testing with D1, use `pnpm dev`.

### Production Commands
```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Deploy to Cloudflare
pnpm deploy

# Generate Cloudflare types
pnpm cf-typegen

# Lint
pnpm lint
```

### Development Workflow

**Daily development:** Use `pnpm dev` for everything - you get instant HMR with full D1/auth/agent functionality.

**Pre-deployment testing:** Use `pnpm dev:cf` or `pnpm preview` to verify the production build works correctly before deploying.

## Architecture

### Three-Layer Integration Model

1. **Mastra Layer** (`src/mastra/`)
   - **Central Instance**: `src/mastra/index.ts` - Factory function creates Mastra instance with D1 storage from Cloudflare context
   - **Agents**: `src/mastra/agents/index.ts` - Agent factory functions with tools, model config, instructions, and memory
   - **Tools**: `src/mastra/tools/index.ts` - Tool implementations using `createTool()` with Zod schemas for input/output validation

2. **CopilotKit Bridge** (`src/app/api/copilotkit/route.ts`)
   - Retrieves D1 binding via `getCloudflareContext().env.D1Database`
   - Creates Mastra instance per-request with D1 storage
   - Connects Mastra agents to CopilotKit runtime via `MastraAgent.getLocalAgents({ mastra })`
   - All Mastra agents automatically become available to the frontend through this single endpoint
   - Uses `ExperimentalEmptyAdapter` as service adapter

3. **Frontend Layer** (`src/app/`)
   - **Layout**: Wraps entire app with `<CopilotKit runtimeUrl="/api/copilotkit" agent="weatherAgent">`
   - **Pages**: Use CopilotKit hooks:
     - `useCoAgent<T>()` - Shared state between frontend and agent (working memory)
     - `useCopilotAction()` - Define frontend actions and generative UI render functions
     - Actions with `available: "frontend"` can render custom UI when agent calls tools

### Key Patterns

**Agent Factory Pattern**:
```typescript
// Define state schema for working memory
export const AgentState = z.object({
  // Agent's persistent state shape
});

export function getMyAgent(storage: MastraStorage) {
  return new Agent({
    name: "Agent Name",
    tools: { toolName },
    model: openrouter("model-name"), // or openai("model-name")
    instructions: "System prompt",
    memory: new Memory({
      storage, // D1Store passed from request context
      options: {
        workingMemory: {
          enabled: true,
          schema: AgentState,
        },
      },
    }),
  });
}
```

**Tool Definition Pattern**:
```typescript
export const myTool = createTool({
  id: 'tool-id',
  description: 'What the tool does',
  inputSchema: z.object({ /* Zod schema */ }),
  outputSchema: z.object({ /* Zod schema */ }),
  execute: async ({ context }) => {
    // context contains validated input matching inputSchema
    // Return value must match outputSchema
  },
});
```

**Generative UI Pattern**:
```typescript
useCopilotAction({
  name: "toolName", // Must match Mastra tool id
  available: "frontend",
  render: ({ args, result, status }) => {
    // args: tool input parameters
    // result: tool output (when status === "complete")
    // status: "inProgress" | "executing" | "complete"
    return <CustomUIComponent />;
  },
});
```

## Configuration

### Environment Variables

Required:
- `OPENAI_API_KEY` or `OPENROUTER_API_KEY` - LLM provider credentials

Optional:
- `LOG_LEVEL` - Controls Mastra logger verbosity (`debug`, `info`, `warn`, `error`)

### Storage - Cloudflare D1

This template uses **Cloudflare D1** (serverless SQL database) for persistent storage.

**Setup Steps:**
1. Create D1 database: `pnpm wrangler d1 create mastra-db`
2. Copy database ID from output
3. Update `wrangler.jsonc` with the database ID
4. Generate types: `pnpm cf-typegen`

**Key Files:**
- `wrangler.jsonc` - D1 database binding configuration
- `src/mastra/index.ts` - Factory function creates D1Store from request context
- `src/app/api/copilotkit/route.ts` - Retrieves D1 binding via `getCloudflareContext()`

**Storage Flow:**
1. Request arrives → `getCloudflareContext().env.D1Database` retrieves binding
2. D1 binding passed to `getMastraInstance(d1Database)`
3. D1Store created and shared across agents
4. All memory persisted to D1 database

## Type Safety Requirements

**ALL external boundaries MUST use Zod schemas**:
- Tool inputs/outputs
- Agent state definitions
- API route request/response validation
- Frontend action parameters

TypeScript types alone are insufficient - runtime validation is required because:
- LLM outputs are unpredictable
- External API responses may not match types
- Client input requires validation

## Adding Features

### New Agent
1. Define in `src/mastra/agents/index.ts`
2. Export and add to `mastra` instance in `src/mastra/index.ts`
3. Agent automatically available via CopilotKit bridge
4. Set `agent="agentName"` prop in `<CopilotKit>` to connect frontend

### New Tool
1. Create in `src/mastra/tools/index.ts` with Zod schemas
2. Add to agent's `tools` object
3. Optionally add `useCopilotAction()` with matching name for custom UI rendering

### New Frontend Action
1. Use `useCopilotAction()` in page component
2. Agent can call this action from backend
3. Handler runs in browser with access to client state

## Project Constitution

This project follows constitutional principles defined in `.specify/memory/constitution.md`:

1. **AI-First Development** - Features must use Mastra agents/tools, not raw LLM calls
2. **Type-Safe Contracts** - Zod schemas required at all external boundaries
3. **Developer Experience First** - Out-of-box functionality, clear docs, migration guides
4. **Observable AI Systems** - Debug logging via LOG_LEVEL, structured traces
5. **Progressive Enhancement** - Server-first rendering, client enhancement

See constitution for full governance rules and quality gates.
