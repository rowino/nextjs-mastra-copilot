# Mastra + CopilotKit Starter with Authentication

This is a **production-ready starter template** for building AI-powered applications using [Mastra](https://mastra.ai) and [CopilotKit](https://copilotkit.ai). It demonstrates best practices for integrating Better-Auth with a Laravel Sanctum backend API, featuring profile management, settings, and an AI-enhanced dashboard.

## Features

- ✅ **Authentication**: Better-Auth integration with custom Laravel Sanctum provider
- ✅ **User Management**: Profile editing, avatar upload, password management
- ✅ **Settings**: Theme, language, timezone, and notification preferences
- ✅ **Dashboard**: Stats, widgets, and activity tracking with AI insights
- ✅ **AI Agents**: Mastra-powered profile assistant and dashboard agent via CopilotKit
- ✅ **Type-Safe**: Full TypeScript with Zod validation at all boundaries
- ✅ **Modern Stack**: Next.js 15.5+, React 19, Tailwind CSS, GraphQL with urql

## Architecture

```
┌──────────────────────────────┐
│  Next.js Frontend            │
│  - Better-Auth (sessions)    │
│  - Mastra Agents             │
│  - CopilotKit UI             │
└──────────┬───────────────────┘
           │ HTTPS + JWT
           ▼
┌──────────────────────────────┐
│  Laravel Backend API         │
│  - Sanctum (authentication)  │
│  - GraphQL API               │
│  - PostgreSQL/MySQL          │
└──────────────────────────────┘
```

## Prerequisites

- **Node.js 18+**
- **pnpm** (recommended package manager)
- **Laravel Backend**: A separate Laravel API with Sanctum authentication
  - See [Laravel API Setup](#laravel-backend-setup) below
- **API Keys**:
  - OpenAI API key OR OpenRouter API key (for Mastra agents)

> **Note:** This repository ignores lock files to avoid conflicts. Generate your own lock file with `pnpm install`, then remove it from `.gitignore` if you want to commit it.

## Quick Start

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd mastra

# Install dependencies
pnpm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
```

Required environment variables:

```env
# Laravel Backend API
NEXT_PUBLIC_LARAVEL_GRAPHQL_URL=http://localhost:8000/graphql

# Frontend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Provider (choose one)
OPENAI_API_KEY=sk-...
# OR
OPENROUTER_API_KEY=sk-or-...

# Optional: Logging
LOG_LEVEL=debug  # debug, info, warn, error
```

### 3. Start Development Server

```bash
# Start both Next.js and Mastra servers
pnpm dev

# Or with debug logging
pnpm dev:debug
```

The application will be available at `http://localhost:3000`

### 4. Laravel Backend Setup

This frontend requires a **Laravel backend with Sanctum authentication**. The backend should provide:

**Required GraphQL Endpoints**:
- `POST /graphql` - Main GraphQL endpoint
- Auth mutations: `login`, `register`, `logout`, `refreshToken`
- Profile queries/mutations: `profile`, `updateProfile`, `uploadAvatar`
- Settings queries/mutations: `settings`, `updateSettings`, `resetSettings`
- Dashboard query: `dashboard` (stats, widgets, recent activity)

**Expected Laravel Setup**:
```bash
# In your Laravel project
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate

# Install GraphQL (Lighthouse recommended)
composer require nuwave/lighthouse
php artisan vendor:publish --tag=lighthouse-schema
```

**Environment (.env in Laravel)**:
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000
```

See `specs/001-create-a-simple/api.md` for complete GraphQL schema reference.

## Available Scripts

```bash
# Development
pnpm dev           # Start with info logging
pnpm dev:debug     # Start with debug logging
pnpm codegen       # Generate GraphQL types from schema

# Production
pnpm build         # Build for production
pnpm start         # Start production server

# Code Quality
pnpm lint          # Run ESLint
```

## Project Structure

```
mastra/
├── src/
│   ├── app/                          # Next.js app router
│   │   ├── (auth)/                   # Auth pages (login, register, etc.)
│   │   ├── dashboard/                # Protected dashboard pages
│   │   ├── components/               # React components
│   │   │   ├── auth/                 # Auth forms
│   │   │   ├── profile/              # Profile components
│   │   │   ├── settings/             # Settings components
│   │   │   ├── dashboard/            # Dashboard widgets
│   │   │   └── ui/                   # Shared UI components
│   │   ├── api/                      # API routes
│   │   │   ├── auth/[...better-auth]/  # Better-Auth handler
│   │   │   └── copilotkit/           # CopilotKit bridge to Mastra
│   │   ├── contracts/                # Zod schemas for API contracts
│   │   └── layout.tsx                # Root layout with CopilotKit
│   ├── lib/                          # Shared utilities
│   │   ├── auth/                     # Better-Auth setup
│   │   │   ├── client.ts             # useAuth hook
│   │   │   ├── server.ts             # Server-side auth utils
│   │   │   └── providers/sanctum.ts  # Laravel Sanctum provider
│   │   ├── api/                      # API client functions
│   │   │   ├── client.ts             # Base GraphQL client (urql)
│   │   │   ├── profile.ts            # Profile API functions
│   │   │   ├── settings.ts           # Settings API functions
│   │   │   └── dashboard.ts          # Dashboard API functions
│   │   └── graphql/                  # GraphQL operations
│   │       ├── operations.ts         # Queries and mutations
│   │       └── generated/            # Auto-generated types
│   ├── mastra/                       # Mastra configuration
│   │   ├── agents/                   # AI agent definitions
│   │   │   └── index.ts              # profileAssistantAgent, dashboardAgent
│   │   ├── tools/                    # Mastra tools
│   │   │   └── index.ts              # Profile analysis tools
│   │   └── index.ts                  # Mastra instance
│   └── middleware.ts                 # Auth middleware
├── specs/                            # Feature specifications
│   └── 001-create-a-simple/
│       ├── spec.md                   # Feature spec
│       ├── plan.md                   # Implementation plan
│       ├── tasks.md                  # Task breakdown
│       ├── research.md               # Tech decisions
│       ├── data-model.md             # Data model
│       ├── api.md                    # API contracts
│       └── quickstart.md             # Manual test scenarios
├── graphql/                          # GraphQL schema (for codegen)
│   └── schema.graphql                # Backend GraphQL schema
├── .env.example                      # Example environment variables
├── codegen.ts                        # GraphQL codegen config
├── CLAUDE.md                         # Claude Code project docs
└── README.md                         # This file
```

## Key Concepts

### Better-Auth + Laravel Sanctum Integration

This project uses a **custom auth provider pattern** to bridge Better-Auth (frontend) with Laravel Sanctum (backend):

**Frontend (`src/lib/auth/client.ts`)**:
```typescript
import { useAuth } from '@/lib/auth/client'

export function MyComponent() {
  const { user, session, signIn, signOut } = useAuth()
  // user: { id, email, name, emailVerified }
  // session: { token, expiresAt }
}
```

**Custom Provider (`src/lib/auth/providers/sanctum.ts`)**:
- Implements Better-Auth's `AuthProvider` interface
- Calls Laravel API endpoints (`/api/auth/login`, `/api/auth/register`, etc.)
- Validates responses with Zod schemas
- Returns auth data in Better-Auth format

**Benefits**:
- ✅ Best DX from Better-Auth hooks
- ✅ Backend flexibility (easy to swap Laravel for Firebase/Supabase)
- ✅ Type-safe with Zod validation
- ✅ Automatic token refresh
- ✅ httpOnly cookies for security

See `specs/001-create-a-simple/research.md` for detailed architecture decisions.

### GraphQL with Type Generation

All API communication uses GraphQL with **automatic TypeScript type generation**:

**1. Define operations** (`src/lib/graphql/operations.ts`):
```typescript
import { graphql } from './generated'

export const PROFILE_QUERY = graphql(`
  query Profile {
    profile {
      id
      name
      email
      bio
      avatarUrl
    }
  }
`)
```

**2. Generate types**:
```bash
pnpm codegen
```

**3. Use in components**:
```typescript
import { useQuery } from 'urql'
import { PROFILE_QUERY } from '@/lib/graphql/operations'

const [result] = useQuery({ query: PROFILE_QUERY })
// result.data.profile is fully typed!
```

### Mastra Agents + CopilotKit

AI features are powered by **Mastra agents** exposed via **CopilotKit**:

**Agent Definition** (`src/mastra/agents/index.ts`):
```typescript
export const profileAssistantAgent = new Agent({
  name: "Profile Assistant",
  tools: { getProfileCompletionTool, suggestBioImprovementsTool },
  model: openrouter("gpt-4o"),
  instructions: "You are a helpful profile assistant...",
})
```

**CopilotKit Bridge** (`src/app/api/copilotkit/route.ts`):
```typescript
const runtime = new CopilotRuntime({
  agents: MastraAgent.getLocalAgents({ mastra }),
})
```

**Frontend Usage** (`src/app/dashboard/profile/page.tsx`):
```typescript
useCopilotAction({
  name: 'get-profile-completion',
  available: 'frontend',
  render: ({ result, status }) => {
    if (status === 'complete') {
      return <ProfileInsights data={result} />
    }
  },
})
```

## Testing

### Manual Testing

Follow the test scenarios in `specs/001-create-a-simple/quickstart.md`:
1. User registration & email verification
2. Login flow
3. Protected route access
4. Profile management (edit, avatar upload, password change)
5. Settings (theme, language, notifications)
6. Dashboard widgets
7. Account deletion
8. Token expiration & refresh

### Running Tests

```bash
# Unit tests (when implemented)
pnpm test

# E2E tests with Playwright (when implemented)
pnpm test:e2e
```

**Note**: Contract tests (validating Laravel API) and E2E tests require a running Laravel backend.

## Deployment

### Frontend (Vercel/Netlify)

```bash
# Build for production
pnpm build

# Environment variables to set:
# - NEXT_PUBLIC_LARAVEL_GRAPHQL_URL (production Laravel API)
# - NEXT_PUBLIC_APP_URL (production frontend URL)
# - OPENAI_API_KEY or OPENROUTER_API_KEY
```

### Backend (Laravel)

See your Laravel project's deployment documentation. Ensure:
- Sanctum is configured with correct `STATEFUL_DOMAINS`
- CORS allows requests from frontend domain
- GraphQL endpoint is accessible at `/graphql`

## Troubleshooting

### "Invalid credentials" on login
- **Check**: Laravel backend is running (`php artisan serve`)
- **Check**: `NEXT_PUBLIC_LARAVEL_GRAPHQL_URL` points to correct backend
- **Check**: User exists in Laravel database

### "Network error" on API calls
- **Check**: CORS configured in Laravel (`config/cors.php`)
- **Check**: Laravel `.env` has `FRONTEND_URL=http://localhost:3000`
- **Check**: Sanctum domains configured correctly

### Mastra agents not working
- **Check**: `OPENAI_API_KEY` or `OPENROUTER_API_KEY` is set
- **Check**: Run with `LOG_LEVEL=debug` to see agent logs
- **Check**: CopilotKit UI is visible (bottom-right of page)

### Build errors
- **Check**: Run `pnpm codegen` to regenerate GraphQL types
- **Check**: All required env vars are set
- **Check**: Node.js version is 18+

## Documentation

- **Project Docs**: See `specs/001-create-a-simple/` for complete feature documentation
- **Mastra Documentation**: [mastra.ai/en/docs](https://mastra.ai/en/docs)
- **CopilotKit Documentation**: [docs.copilotkit.ai](https://docs.copilotkit.ai)
- **Better-Auth Documentation**: [better-auth.com/docs](https://better-auth.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

## Contributing

Contributions are welcome! Please:
1. Follow the existing code style
2. Add Zod schemas for all external data
3. Update documentation in `specs/`
4. Test manually using `quickstart.md` scenarios

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with** ❤️ **using Mastra, CopilotKit, Next.js, and Better-Auth**