# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **starter template** for building AI agents using Mastra and CopilotKit with Next.js. The architecture demonstrates AI-native development patterns where Mastra agents provide backend AI capabilities and CopilotKit provides the frontend conversational UI.

## Development Commands

```bash
# Start development (runs both Next.js and Mastra dev servers concurrently)
pnpm dev

# Start with debug logging enabled
pnpm dev:debug
# Or set LOG_LEVEL manually
LOG_LEVEL=debug pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint
pnpm lint
```

## Architecture

### Three-Layer Integration Model

1. **Mastra Layer** (`src/mastra/`)
   - **Central Instance**: `src/mastra/index.ts` - Single Mastra instance configured with agents, storage (LibSQLStore), and logger
   - **Agents**: `src/mastra/agents/index.ts` - Agent definitions with tools, model config, instructions, and memory
   - **Tools**: `src/mastra/tools/index.ts` - Tool implementations using `createTool()` with Zod schemas for input/output validation

2. **CopilotKit Bridge** (`src/app/api/copilotkit/route.ts`)
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

**Agent Definition Pattern**:
```typescript
// Define state schema for working memory
export const AgentState = z.object({
  // Agent's persistent state shape
});

export const myAgent = new Agent({
  name: "Agent Name",
  tools: { toolName },
  model: openrouter("model-name"), // or openai("model-name")
  instructions: "System prompt",
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

### Storage

- Default: In-memory LibSQL (`:memory:` or `file::memory:`)
- For persistence: Change LibSQLStore URL to file path or remote database
- Storage is configured in two places:
  - Main Mastra instance: `src/mastra/index.ts`
  - Per-agent memory: `src/mastra/agents/index.ts`

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

## Common Patterns

### Unsaved Changes Warning
When implementing forms (profile, settings, etc.), use this pattern to warn users before navigation:

```typescript
// Example: Profile edit form with unsaved changes detection
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      e.returnValue = '' // Chrome requires returnValue to be set
    }
  }

  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [hasUnsavedChanges])

// For Next.js router navigation
useEffect(() => {
  const handleRouteChange = () => {
    if (hasUnsavedChanges && !confirm('You have unsaved changes. Discard changes?')) {
      router.events.emit('routeChangeError')
      throw 'Route change aborted'
    }
  }

  router.events.on('routeChangeStart', handleRouteChange)
  return () => router.events.off('routeChangeStart', handleRouteChange)
}, [hasUnsavedChanges, router])
```

**Applies to**: Profile forms (FR-011), Settings forms (FR-018), and any user-editable content.

## Project Constitution

This project follows constitutional principles defined in `.specify/memory/constitution.md`:

1. **AI-First Development** - Features must use Mastra agents/tools, not raw LLM calls
2. **Type-Safe Contracts** - Zod schemas required at all external boundaries
3. **Developer Experience First** - Out-of-box functionality, clear docs, migration guides
4. **Observable AI Systems** - Debug logging via LOG_LEVEL, structured traces
5. **Progressive Enhancement** - Server-first rendering, client enhancement

See constitution for full governance rules and quality gates.
