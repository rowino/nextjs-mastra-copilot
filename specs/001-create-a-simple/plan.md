# Implementation Plan: Modular Starter Kit with Better-Auth + Laravel Sanctum

**Branch**: `001-create-a-simple` | **Date**: 2025-10-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-create-a-simple/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → SUCCESS: Spec loaded with clarifications resolved
2. Fill Technical Context
   → ARCHITECTURE: Better-Auth frontend with Laravel Sanctum backend provider
   → Hybrid approach: Better-Auth handles frontend auth logic, Laravel Sanctum backend
3. Fill Constitution Check section
   → Based on constitution v1.1.0
4. Evaluate Constitution Check section
   → Modularity validated (Better-Auth + custom Sanctum provider)
   → Update Progress Tracking: Initial Constitution Check ✓
5. Execute Phase 0 → research.md
   → Research Better-Auth custom providers, Laravel Sanctum integration
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → Design Sanctum provider contracts, Better-Auth configuration
7. Re-evaluate Constitution Check section
   → Verify type-safety, modularity, observability
8. Plan Phase 2 → Describe task generation approach
9. STOP - Ready for /tasks command
```

## Summary

Build a modular authentication and user management system using **Better-Auth on the frontend with Laravel Sanctum as a custom backend provider**. This architecture combines:

- **Better-Auth Client**: Provides type-safe auth state management, React hooks, and session handling on the frontend
- **Laravel Sanctum Backend**: Handles actual authentication, token generation, and user management
- **Custom Sanctum Provider**: Bridges Better-Auth to Laravel Sanctum API endpoints
- **Modular Design**: Can swap Sanctum provider for other backends (Firebase, Supabase, etc.) without changing frontend code

**Key Benefits**:
1. **Type-Safe**: Better-Auth provides full TypeScript support with Zod validation
2. **Modular**: Custom provider pattern allows easy backend switching
3. **Best of Both Worlds**: Better-Auth's excellent DX + Laravel's robust backend
4. **Production-Ready**: Better-Auth handles token refresh, persistence, and edge cases

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 15.5+, React 19
**Primary Dependencies**:
- `better-auth` (^1.0.0) - Frontend auth framework
- `@better-auth/react` (^1.0.0) - React hooks for Better-Auth
- `@mastra/core` (0.19.1) - Agent framework
- `@copilotkit/react-core` (1.10.5) - AI UI components
- `zod` (3.25.0) - Runtime validation
- `ky` or `axios` - HTTP client for Laravel API calls

**Backend**: Laravel API with Sanctum authentication (separate project)
**Storage**: No local database - Better-Auth state management with Laravel backend
**Testing**: Vitest for unit tests, Playwright for E2E, MSW for API mocking
**Target Platform**: Web (browser), Vercel/Node.js deployment
**Project Type**: Frontend web application with Better-Auth + Laravel Sanctum backend

**Performance Goals**:
- Dashboard load: <3s on broadband
- Auth operations: <500ms (dependent on Laravel API)
- Token refresh: <200ms
- Concurrent users: 1,000+ (handled by Laravel backend)

**Constraints**:
- **Custom Provider**: Implement Better-Auth provider interface for Laravel Sanctum
- **Type-safe contracts**: Zod schemas for all Laravel API responses
- **Modular architecture**: Provider swappable (SOLID principles)
- **Better-Auth patterns**: Follow Better-Auth conventions for hooks and state management

**Scale/Scope**:
- Custom Sanctum provider (1 provider implementation)
- 4 feature areas (auth, profile, settings, dashboard)
- ~15-20 pages/routes
- ~30 React components using Better-Auth hooks
- ~10 Laravel API endpoints via Sanctum provider
- Better-Auth configuration and session management

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. AI-First Development ✅
**Status**: COMPLIANT - Mastra agents enhance UX
- Dashboard uses Mastra agents for personalized insights
- Profile updates leverage AI-powered suggestions
- Settings include AI-powered recommendations
- CopilotKit provides conversational UI layer
- Better-Auth provides clean state for agents to consume

### II. Type-Safe Contracts ✅
**Status**: COMPLIANT - Zod schemas throughout
- Better-Auth enforces type-safe auth state
- Custom Sanctum provider uses Zod for API responses
- All Laravel API responses validated with Zod
- Form inputs validated with Zod
- Better-Auth session schema defined with Zod

### III. Developer Experience First ✅
**Status**: COMPLIANT - Better-Auth provides excellent DX
- Better-Auth works out-of-box with sensible defaults
- React hooks (`useSession`, `useAuth`) provide clean API
- Custom provider documented with examples
- Easy switch between providers (change configuration)
- Clear error messages from Better-Auth

### IV. Observable AI Systems ✅
**Status**: COMPLIANT - Debug logging via LOG_LEVEL
- Better-Auth auth events logged
- Provider API calls logged (request/response)
- Session management logged (create, refresh, expire)
- Agent interactions logged
- Errors include full context

### V. Progressive Enhancement ✅
**Status**: COMPLIANT - Server-first where possible
- Better-Auth supports server-side session management
- Profile/settings forms use Server Actions
- Dashboard renders server-side (RSC)
- Client components use Better-Auth hooks for auth state
- CopilotKit adds conversational layer

**Constitution Version**: 1.1.0

## Project Structure

### Documentation (this feature)
```
specs/001-create-a-simple/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Better-Auth + Sanctum integration research
├── data-model.md        # Laravel API data contracts
├── quickstart.md        # Manual test scenarios
├── contracts/           # Zod schemas for Laravel API
│   ├── auth.ts         # Sanctum auth endpoints
│   ├── profile.ts      # Profile endpoints
│   ├── settings.ts     # Settings endpoints
│   └── dashboard.ts    # Dashboard endpoints
└── tasks.md             # Implementation tasks (/tasks command)
```

### Source Code (repository root)
```
src/
├── mastra/
│   ├── index.ts                    # Mastra instance
│   ├── agents/
│   │   ├── index.ts
│   │   ├── profile-assistant.ts
│   │   └── dashboard-agent.ts
│   └── tools/
│       ├── index.ts
│       └── profile-tools.ts
│
├── lib/
│   ├── auth/
│   │   ├── client.ts               # Better-Auth client configuration
│   │   ├── provider.ts             # Custom Laravel Sanctum provider
│   │   ├── hooks.ts                # Better-Auth React hooks re-exports
│   │   └── server.ts               # Server-side Better-Auth setup
│   ├── utils.ts                     # cn() utility
│   └── validation.ts                # Zod schemas
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...better-auth]/
│   │   │       └── route.ts        # Better-Auth API route handler
│   │   └── copilotkit/
│   │       └── route.ts            # CopilotKit bridge
│   │
│   ├── (auth)/                      # Auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/                 # Protected route group
│   │   ├── layout.tsx              # Dashboard layout with auth check
│   │   ├── page.tsx                # Dashboard home
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── security/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── appearance/
│   │       │   └── page.tsx
│   │       └── account/
│   │           └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui
│   │   ├── auth/
│   │   │   ├── login-form.tsx       # Uses Better-Auth hooks
│   │   │   ├── register-form.tsx
│   │   │   └── auth-provider.tsx    # Better-Auth context provider
│   │   ├── profile/
│   │   │   ├── profile-form.tsx
│   │   │   └── avatar-upload.tsx
│   │   ├── settings/
│   │   │   ├── theme-toggle.tsx
│   │   │   └── language-selector.tsx
│   │   └── dashboard/
│   │       ├── stat-card.tsx
│   │       └── chart-widget.tsx
│   │
│   ├── hooks/
│   │   ├── use-profile.ts           # Profile data with Better-Auth session
│   │   ├── use-settings.ts          # Settings data
│   │   └── use-dashboard.ts         # Dashboard data
│   │
│   ├── services/
│   │   ├── api-client.ts            # Base HTTP client (uses Better-Auth tokens)
│   │   ├── profile-api.ts
│   │   ├── settings-api.ts
│   │   └── dashboard-api.ts
│   │
│   └── constants/
│       ├── api-routes.ts            # Laravel API endpoints
│       └── defaults.ts
│
tests/
├── integration/
│   ├── auth.test.ts                 # Better-Auth + Sanctum integration
│   ├── profile.test.ts
│   ├── settings.test.ts
│   └── dashboard.test.ts
└── e2e/
    ├── auth-flow.spec.ts
    └── profile-update.spec.ts
```

**Structure Decision**: Next.js application with Better-Auth client + custom Laravel Sanctum provider. Key characteristics:

- **Better-Auth Layer**: Handles all frontend auth state, hooks, and session management
- **Custom Provider**: Bridges Better-Auth to Laravel Sanctum API
- **API Route Handler**: Next.js API route (`/api/auth/[...better-auth]`) handles Better-Auth callbacks
- **Type-Safe**: Zod validation throughout Better-Auth and provider
- **Modular**: Can swap Sanctum provider for different backend with minimal changes

## Phase 0: Outline & Research

**Research Tasks** (to be documented in research.md):

1. **Better-Auth Custom Provider Pattern**
   - Research: Better-Auth provider interface and lifecycle
   - Study: Existing providers (Firebase, Supabase) as reference
   - Criteria: Type-safety, error handling, token management
   - Deliverable: Custom provider implementation guide

2. **Laravel Sanctum Integration**
   - Research: Sanctum token-based authentication flow
   - Study: CSRF protection, token types (SPA vs API tokens)
   - Criteria: Security, session handling, CORS setup
   - Deliverable: Sanctum endpoint mapping for Better-Auth

3. **Better-Auth Configuration**
   - Research: Session strategies, token storage options
   - Study: Server-side vs client-side session management
   - Criteria: Security, performance, SSR compatibility
   - Deliverable: Better-Auth config for Next.js App Router

4. **Token Storage Strategy**
   - Research: httpOnly cookies vs localStorage vs Better-Auth built-in
   - Study: Better-Auth's session persistence options
   - Criteria: XSS protection, CSRF protection, ease of use
   - Deliverable: Secure token storage approach

5. **Laravel API Integration Pattern**
   - Research: Better-Auth hooks for API calls
   - Study: Token injection in requests
   - Criteria: Automatic token refresh, error handling
   - Deliverable: API client with Better-Auth integration

6. **Testing Strategy with Better-Auth**
   - Research: Mocking Better-Auth sessions in tests
   - Study: Testing custom providers
   - Criteria: Unit testability, E2E with Playwright
   - Deliverable: Testing patterns for Better-Auth apps

**Output**: research.md documenting all decisions

## Phase 1: Design & Contracts

### 1. Data Model (data-model.md)

**Better-Auth Session Schema**:
```typescript
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  emailVerified: z.boolean(),
  image: z.string().url().nullable(),
})

export const SessionSchema = z.object({
  user: UserSchema,
  token: z.string(),
  expiresAt: z.number(),
})
```

**Laravel API Response Types** (from Sanctum):
- `User`: id, email, name, email_verified_at, created_at, updated_at
- `Profile`: id, user_id, name, avatar_url, bio
- `Settings`: id, user_id, theme, language, timezone, notification_preferences
- `SanctumToken`: accessToken, tokenType, expiresIn

### 2. Custom Sanctum Provider (`src/lib/auth/provider.ts`)

**Provider Implementation**:
```typescript
import type { AuthProvider } from 'better-auth'
import { z } from 'zod'

export const sanctumProvider: AuthProvider = {
  id: 'sanctum',
  name: 'Laravel Sanctum',

  // Called when user logs in
  async signIn({ email, password }) {
    const response = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error('Invalid credentials')
    }

    const data = await response.json()
    const validated = LoginResponseSchema.parse(data)

    return {
      user: {
        id: validated.user.id,
        email: validated.user.email,
        name: validated.user.name,
        emailVerified: !!validated.user.email_verified_at,
      },
      session: {
        token: validated.accessToken,
        expiresAt: Date.now() + validated.expiresIn * 1000,
      },
    }
  },

  // Called when user registers
  async signUp({ email, password, name }) {
    const response = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    const data = await response.json()
    return RegisterResponseSchema.parse(data)
  },

  // Called to refresh token
  async refreshToken({ token }) {
    const response = await fetch(`${process.env.LARAVEL_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    const validated = RefreshResponseSchema.parse(data)

    return {
      token: validated.accessToken,
      expiresAt: Date.now() + validated.expiresIn * 1000,
    }
  },

  // Called on logout
  async signOut({ token }) {
    await fetch(`${process.env.LARAVEL_API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
}
```

### 3. Better-Auth Client Configuration (`src/lib/auth/client.ts`)

```typescript
import { createAuthClient } from 'better-auth/client'
import { sanctumProvider } from './provider'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  provider: sanctumProvider,
  session: {
    cookieName: 'auth-session',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
})

// Export hooks
export const { useSession, useSignIn, useSignUp, useSignOut } = authClient
```

### 4. Next.js API Route Handler (`src/app/api/auth/[...better-auth]/route.ts`)

```typescript
import { betterAuth } from 'better-auth'
import { sanctumProvider } from '@/lib/auth/provider'

const auth = betterAuth({
  provider: sanctumProvider,
})

export const { GET, POST } = auth.handler
```

### 5. API Contracts (contracts/)

**Auth Contracts** (`contracts/auth.ts`):
```typescript
// POST {LARAVEL_API_URL}/api/auth/login
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    email_verified_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
})

// POST {LARAVEL_API_URL}/api/auth/register
export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
})

export const RegisterResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
})

// POST {LARAVEL_API_URL}/api/auth/refresh
export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number(),
})
```

**Profile/Settings/Dashboard Contracts**: Same as before, but accessed via Better-Auth authenticated API client

### 6. Quickstart Guide (quickstart.md)

**Manual Test Scenarios** (with Better-Auth + Sanctum):
1. Configure `.env` with `LARAVEL_API_URL`
2. Start dev server → Better-Auth initialized
3. Register new user → Sanctum provider calls Laravel API
4. Better-Auth stores session → Available via `useSession` hook
5. Access dashboard → Better-Auth provides auth state
6. Profile/settings use Better-Auth token for API calls
7. Logout → Better-Auth clears session, calls Sanctum logout

### 7. Component Example with Better-Auth Hooks

**Login Form** (`src/app/components/auth/login-form.tsx`):
```typescript
'use client'

import { useSignIn } from '@/lib/auth/client'
import { useState } from 'react'

export function LoginForm() {
  const { signIn, isPending, error } = useSignIn()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    await signIn({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      {error && <p>{error.message}</p>}
      <button disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
```

**Protected Layout** (`src/app/(dashboard)/layout.tsx`):
```typescript
import { useSession } from '@/lib/auth/client'
import { redirect } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect('/login')
  }

  return <div>{children}</div>
}
```

**Output**:
- data-model.md (Better-Auth session + Laravel API shapes)
- contracts/ with Zod schemas for Laravel Sanctum API
- Custom Sanctum provider implementation
- Better-Auth client configuration
- Next.js API route handler
- quickstart.md with Better-Auth + Sanctum scenarios
- Updated CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

1. **Load tasks-template.md** as base

2. **Generate from Phase 1 artifacts**:
   - Custom Sanctum provider implementation
   - Better-Auth client setup
   - API route handler
   - React hooks integration
   - Components with Better-Auth hooks
   - Laravel API endpoint contracts

3. **Task Categories**:
   - **[P] Better-Auth Setup**: Client config, provider, API routes
   - **[P] Sanctum Provider**: Custom provider implementation and testing
   - **Auth UI**: Login/register forms using Better-Auth hooks
   - **Protected Routes**: Middleware and layout guards
   - **Profile Implementation**: Using Better-Auth session
   - **Settings Implementation**: With auth state
   - **Dashboard Implementation**: Auth-aware components
   - **UI Components**: Using Better-Auth hooks (parallel)
   - **Mastra Agents**: Profile assistant, dashboard agent
   - **Integration Tests**: Better-Auth + Sanctum integration
   - **Documentation**: Setup guide, provider documentation

4. **Ordering Strategy**:
   - **Phase 1**: Better-Auth setup (client, provider stub)
   - **Phase 2**: Sanctum provider implementation
   - **Phase 3**: API route handler and testing
   - **Phase 4**: Auth UI (login, register) with hooks
   - **Phase 5**: Protected routes and middleware
   - **Phase 6**: Profile, settings, dashboard (parallel)
   - **Phase 7**: UI components with Better-Auth (parallel)
   - **Phase 8**: Mastra agents (parallel)
   - **Phase 9**: Integration tests
   - **Phase 10**: Documentation

5. **Estimated Task Count**: 40-45 tasks
   - Better-Auth setup: 4 tasks
   - Sanctum provider: 6 tasks
   - Auth UI: 4 tasks
   - Protected routes: 3 tasks
   - Profile: 5 tasks
   - Settings: 5 tasks
   - Dashboard: 4 tasks
   - Components: 10 tasks [P]
   - Agents: 2 tasks [P]
   - Tests: 5 tasks
   - Documentation: 3 tasks

**Dependency Examples**:
- Sanctum provider must exist before Better-Auth client testing
- Better-Auth client must work before components
- Auth flows must work before protected pages
- Protected layouts depend on Better-Auth hooks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation
**Phase 5**: Validation

## Complexity Tracking

| Item | Justification | Alternative Considered |
|------|---------------|------------------------|
| Better-Auth with custom provider | Best of both worlds: Better-Auth DX + Laravel backend | Direct Laravel API integration (rejected - reinventing Better-Auth features) |
| Custom Sanctum provider | Modular, can swap backends easily | Hardcoded Laravel API calls (rejected - not modular) |

## Progress Tracking

**Phase Status**:
- [ ] Phase 0: Research complete
- [ ] Phase 1: Design complete
- [ ] Phase 2: Task planning described
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS (modularity via Better-Auth provider pattern)
- [ ] Post-Design Constitution Check: PASS (pending Phase 1)
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v1.1.0 - See `.specify/memory/constitution.md`*

**Key Architectural Decisions**:
1. ✅ Better-Auth for frontend auth state management and hooks
2. ✅ Custom Laravel Sanctum provider (modular, swappable)
3. ✅ Type-safe with Zod validation throughout
4. ✅ Next.js API routes handle Better-Auth callbacks
5. ✅ React hooks (`useSession`, `useSignIn`, etc.) for components
6. ✅ Automatic token refresh via Better-Auth
7. ✅ Server-side session validation supported
