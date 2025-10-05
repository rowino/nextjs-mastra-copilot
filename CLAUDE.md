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

## Better-Auth Integration

This project uses **Better-Auth** with a **custom Laravel Sanctum provider** for authentication. This pattern provides excellent DX while maintaining full control over the backend.

### Architecture

```
Frontend (Better-Auth) → Custom Provider → Laravel Sanctum API
    ↓                          ↓                    ↓
Cookie Storage          Zod Validation        MySQL/PostgreSQL
```

### Custom Provider Pattern

**Provider Implementation** (`src/lib/auth/providers/sanctum.ts`):
```typescript
import { z } from 'zod'

const LoginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    emailVerifiedAt: z.string().nullable(),
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
})

export const sanctumProvider = {
  async signIn(credentials: { email: string; password: string }) {
    const response = await fetch(`${LARAVEL_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error('Invalid credentials')
    }

    const data = await response.json()
    const validated = LoginResponseSchema.parse(data) // Runtime validation!

    return {
      user: {
        id: validated.user.id,
        email: validated.user.email,
        name: validated.user.name,
        emailVerified: !!validated.user.emailVerifiedAt,
      },
      session: {
        token: validated.accessToken,
        expiresAt: validated.expiresAt,
      },
    }
  },
  // ... signUp, signOut, refreshToken
}
```

**Client Setup** (`src/lib/auth/client.ts`):
```typescript
import { useAuth as useBetterAuth } from '@/lib/auth/client'

export function useAuth() {
  const { session, user, isAuthenticated, signIn, signUp, signOut } = useBetterAuth()

  // session.token - JWT from Laravel Sanctum
  // user - { id, email, name, emailVerified }

  return { session, user, isAuthenticated, signIn, signUp, signOut }
}
```

### Using Authentication

**In Components**:
```typescript
'use client'

import { useAuth } from '@/lib/auth/client'

export function ProfilePage() {
  const { user, session, isAuthenticated, signOut } = useAuth()

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <button onClick={signOut}>Log Out</button>
    </div>
  )
}
```

**In Middleware** (`src/middleware.ts`):
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('auth_session')

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/settings/:path*'],
}
```

### Making Authenticated API Calls

**GraphQL with Authentication**:
```typescript
import { createClient } from 'urql'

function createAuthenticatedClient(token: string) {
  return createClient({
    url: process.env.NEXT_PUBLIC_LARAVEL_GRAPHQL_URL!,
    fetchOptions: {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  })
}

// Usage in components
const { session } = useAuth()
const client = createAuthenticatedClient(session.token)
const [result] = useQuery({ query: PROFILE_QUERY }, { client })
```

### Session Management

**Automatic Token Refresh**:
- Better-Auth detects token expiration
- Calls `sanctumProvider.refreshToken()` automatically
- Updates httpOnly cookie with new token
- Transparent to the user

**Token Storage**:
- Access tokens stored in httpOnly cookies (secure against XSS)
- Never exposed to client JavaScript
- Automatically included in requests by Better-Auth

**Session Validation**:
```typescript
// Server-side session check
import { getSession } from '@/lib/auth/server'

export async function GET(request: Request) {
  const session = await getSession(request)

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  // session.token - Use for Laravel API calls
  // session.user - User data
}
```

### Best Practices

**DO**:
- ✅ Always use `useAuth()` hook for auth state
- ✅ Validate Laravel API responses with Zod schemas
- ✅ Handle token expiration gracefully (auto-refresh)
- ✅ Use middleware for route protection
- ✅ Store tokens in httpOnly cookies only

**DON'T**:
- ❌ Access tokens directly in client components
- ❌ Store tokens in localStorage (XSS vulnerable)
- ❌ Skip Zod validation of API responses
- ❌ Implement manual token refresh logic
- ❌ Hardcode API URLs (use env vars)

### Swapping Auth Providers

To swap from Laravel Sanctum to another backend (Firebase, Supabase, etc.):

1. Create new provider in `src/lib/auth/providers/your-provider.ts`
2. Implement same interface: `signIn`, `signUp`, `signOut`, `refreshToken`
3. Update import in `src/lib/auth/client.ts`
4. No other code changes needed!

**Example - Firebase Provider**:
```typescript
// src/lib/auth/providers/firebase.ts
export const firebaseProvider = {
  async signIn({ email, password }) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return {
      user: {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userCredential.user.displayName!,
        emailVerified: userCredential.user.emailVerified,
      },
      session: {
        token: await userCredential.user.getIdToken(),
        expiresAt: Date.now() + 3600000,
      },
    }
  },
  // ... rest of methods
}
```

## Configuration

### Environment Variables

Required:
- `NEXT_PUBLIC_LARAVEL_GRAPHQL_URL` - Laravel GraphQL API endpoint
- `NEXT_PUBLIC_APP_URL` - Frontend application URL
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
