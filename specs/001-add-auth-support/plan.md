# Implementation Plan: Authentication System

**Branch**: `001-add-auth-support` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-add-auth-support/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Implement comprehensive authentication system using better-auth library with Cloudflare D1 storage. The system will support email/password authentication, OAuth (Google/GitHub), role-based access control, email verification, password reset, and profile management. UI built with shadcn components, email delivery via Resend (deferred for now - use console logging).

**Key Technical Decisions**:
- **better-auth**: TypeScript-first auth framework with excellent D1 support via Drizzle ORM
- **Account Linking**: Auto-link same email across providers
- **Password Requirements**: 12+ chars, uppercase, lowercase, number, special character (custom hook)
- **Email Verification**: Required but non-blocking (users can login immediately with limited access)
- **Rate Limiting**: Progressive delay with exponential backoff (custom client-side implementation)
- **RBAC**: Multiple custom roles with granular permissions using admin plugin
- **UI Components**: @daveyplate/better-auth-ui for shadcn-based authentication interfaces

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+
**Primary Dependencies**:
- better-auth (authentication framework)
- drizzle-orm (ORM for D1)
- @daveyplate/better-auth-ui (shadcn UI components)
- @opennextjs/cloudflare (Cloudflare Workers adapter)
- zod (schema validation)

**Storage**: Cloudflare D1 (SQLite-compatible serverless database)
**Testing**: Vitest (unit/integration tests matching Next.js ecosystem)
**Target Platform**: Cloudflare Workers (via OpenNext.js)
**Project Type**: Web application (Next.js App Router + Cloudflare Workers)

**Performance Goals**:
- Authentication response < 200ms p95
- OAuth callback < 500ms p95
- Session validation < 50ms (with cookie caching)

**Constraints**:
- Request-scoped D1 access (auth instance created per request)
- Cloudflare Workers limitations (no Node.js APIs)
- Progressive delays client-side (server-side exponential backoff needs custom plugin)

**Scale/Scope**:
- Support 10k+ users
- Multiple roles with granular permissions
- 3 authentication providers (email/password, Google, GitHub)
- 7 key entities (User, Role, Session, OAuth Connection, Security Event, Email Verification, Password Reset)

## Constitution Check

### I. AI-First Development
**Status**: ✅ PASS
- Authentication is infrastructure, not an AI feature
- Will integrate with existing Mastra agents for user context
- Future: User sessions available to agents via memory context

### II. Type-Safe Contracts
**Status**: ✅ PASS
- better-auth uses Zod internally for validation
- All API endpoints type-safe via better-auth client
- Custom password validation uses Zod schemas in hooks
- Database schema validated via Drizzle ORM

### III. Developer Experience First
**Status**: ✅ PASS
- better-auth-ui provides out-of-box UI components
- Clear migration path from manual setup to better-auth
- Environment variables documented in README
- CLI tools for schema generation and migrations

### IV. Observable AI Systems
**Status**: ✅ PASS (with notes)
- better-auth hooks support logging
- Security events logged to database
- Custom audit logging plugin planned
- Note: Not AI-specific, but auth observability important for security

### V. Progressive Enhancement
**Status**: ✅ PASS
- Server-side session validation in server components
- Client components enhance with real-time auth state
- Forms work without JavaScript (server actions)
- OAuth flows server-rendered

**Overall**: ✅ NO VIOLATIONS - Implementation aligns with constitutional principles

## Project Structure

### Documentation (this feature)
```
specs/001-add-auth-support/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── auth-api.yaml   # Better-auth API contracts
│   └── schemas.ts      # Zod schemas for custom validation
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page with AuthCard
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page with AuthCard
│   │   ├── forgot-password/
│   │   │   └── page.tsx          # Forgot password flow
│   │   └── reset-password/
│   │       └── page.tsx          # Reset password page
│   ├── (protected)/
│   │   ├── profile/
│   │   │   └── page.tsx          # Profile management with SettingsCards
│   │   └── dashboard/
│   │       └── page.tsx          # Example protected route
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts      # Better-auth API handler
│   └── layout.tsx                # Root layout with auth provider
├── lib/
│   ├── auth/
│   │   ├── index.ts              # Auth factory function (request-scoped)
│   │   ├── client.ts             # Client-side auth instance
│   │   ├── hooks.ts              # Custom auth hooks (password validation)
│   │   └── plugins/              # Custom better-auth plugins
│   │       ├── password-complexity.ts
│   │       └── audit-log.ts
│   └── db/
│       ├── schema.ts             # Drizzle schema (generated from better-auth)
│       └── migrations/           # D1 migration files
├── components/
│   ├── auth/
│   │   ├── auth-card.tsx         # Wrapped better-auth-ui AuthCard
│   │   ├── user-button.tsx       # User dropdown menu
│   │   └── protected-route.tsx   # HOC for route protection
│   └── ui/                        # shadcn components
└── mastra/
    ├── index.ts                   # Updated to include auth context
    └── agents/
        └── index.ts               # Agents with user context from sessions

drizzle/
└── migrations/                    # D1 migrations directory

tests/
├── auth/
│   ├── login.test.ts
│   ├── signup.test.ts
│   ├── oauth.test.ts
│   └── profile.test.ts
└── integration/
    └── auth-flow.test.ts
```

**Structure Decision**: Web application structure with Next.js App Router. Authentication routes separated into (auth) route group for unauthenticated pages and (protected) route group for authenticated pages. Better-auth integration follows request-scoped factory pattern for D1 access.

## Phase 0: Outline & Research

### Research Tasks Completed

1. ✅ **Better-auth capabilities research** - Comprehensive analysis complete (see `/better-auth-research.md`)
   - Full feature support for all requirements
   - D1 integration via Drizzle adapter confirmed
   - Custom password validation approach identified
   - Rate limiting strategy defined (built-in + custom client-side)
   - RBAC implementation path clear (admin plugin)

2. ⏭️ **Resend email integration** - Deferred to later phase
   - Will use console logging for development
   - Better-auth email hooks ready for integration
   - No blocker for core implementation

### Key Findings Summary

**Better-auth Feature Coverage**:
- ✅ Email/password authentication (built-in)
- ✅ Google OAuth (built-in)
- ✅ GitHub OAuth (built-in)
- ✅ Account linking for same email (built-in with config)
- ✅ Email verification (built-in)
- ✅ Password reset (built-in)
- ✅ Session management (cookie-based, 7-day default)
- ✅ Rate limiting (3 req/10sec, IP-based)
- ✅ RBAC (admin plugin with custom roles)
- ⚠️ Custom password validation (requires hooks with regex)
- ⚠️ Exponential backoff (requires custom client-side implementation)
- ✅ UI components (via @daveyplate/better-auth-ui)

**Implementation Approach**:
1. Use better-auth factory pattern for request-scoped D1 access
2. Apply custom password validation via `before` hooks
3. Implement progressive delay client-side (read `X-Retry-After` header)
4. Use admin plugin for role management
5. Leverage better-auth-ui for shadcn-based authentication UI

**Output**: research.md (to be generated)

## Phase 1: Design & Contracts

### Data Model Design

**Entities** (from spec + better-auth schema):
1. User (better-auth core)
2. Role (admin plugin)
3. Session (better-auth core)
4. Account (OAuth connections - better-auth core)
5. Verification (email verification - better-auth core)
6. Password Reset (password reset tokens - better-auth core)
7. Security Event (custom audit table)

### API Contracts

**Better-auth Endpoints** (built-in):
- POST `/api/auth/sign-up/email` - Email/password signup
- POST `/api/auth/sign-in/email` - Email/password login
- POST `/api/auth/sign-in/social` - OAuth login (Google/GitHub)
- POST `/api/auth/link-social` - Link OAuth provider
- POST `/api/auth/verify-email` - Verify email token
- POST `/api/auth/forget-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password with token
- GET `/api/auth/get-session` - Get current session
- POST `/api/auth/sign-out` - Logout
- POST `/api/auth/update-user` - Update profile
- POST `/api/auth/change-password` - Change password

**Custom Endpoints** (if needed):
- GET `/api/auth/security-events` - List security audit log

### Contract Tests Approach

Generate contract tests for:
1. Email/password signup with validation
2. OAuth flows (Google, GitHub)
3. Account linking scenarios
4. Email verification flow
5. Password reset flow
6. Profile updates
7. Session management

### Integration Tests from User Stories

Map acceptance scenarios to integration tests:
- AS-1: Email/password signup → verify account created
- AS-2: Google OAuth signup → verify account created with auto-verification
- AS-3: GitHub OAuth signup → verify account created with auto-verification
- AS-4: Account linking → verify OAuth auto-links to existing email
- AS-5: Login → verify session created
- AS-6: Profile view → verify all fields displayed
- AS-7: Update name → verify update persisted
- AS-8: Update email → verify verification reset
- AS-9: Change password → verify password updated
- AS-10: OAuth user set password → verify password enabled
- AS-11: Progressive delays → verify exponential backoff

### Agent Context Update

Update `CLAUDE.md` with:
- Authentication system overview
- Better-auth integration patterns
- Request-scoped auth factory
- Custom hooks for password validation
- Rate limiting implementation
- RBAC with admin plugin
- Recent changes section

**Outputs**:
- data-model.md
- contracts/ directory with schemas
- quickstart.md (user stories → test scenarios)
- Updated CLAUDE.md

## Phase 2: Task Planning Approach

**Task Generation Strategy** (/tasks command will execute):

1. **Setup & Dependencies** (5-7 tasks)
   - Install better-auth, drizzle-orm, better-auth-ui
   - Configure wrangler.jsonc for D1 migrations
   - Generate better-auth schema
   - Generate Drizzle migrations
   - Apply migrations to local D1

2. **Core Authentication** (8-10 tasks)
   - Create auth factory function (src/lib/auth/index.ts)
   - Create auth client (src/lib/auth/client.ts)
   - Create API route handler (src/app/api/auth/[...all]/route.ts)
   - Implement custom password validation hook
   - Configure OAuth providers (Google, GitHub)
   - Configure account linking
   - Add email verification configuration
   - Add password reset configuration

3. **RBAC Implementation** (4-5 tasks)
   - Add admin plugin with role definitions
   - Create role assignment utilities
   - Implement permission checking middleware
   - Add role management UI components

4. **UI Components** (6-8 tasks)
   - Install and configure better-auth-ui
   - Create login page with AuthCard
   - Create signup page with AuthCard
   - Create forgot password page
   - Create reset password page
   - Create profile page with SettingsCards
   - Add UserButton to navigation
   - Create protected route wrapper

5. **Security & Rate Limiting** (3-4 tasks)
   - Configure built-in rate limiting (IP-based)
   - Implement client-side progressive delay
   - Create audit logging plugin
   - Add security event tracking

6. **Integration & Testing** (8-10 tasks)
   - Contract tests for auth endpoints
   - Integration tests for signup flow
   - Integration tests for login flow
   - Integration tests for OAuth flow
   - Integration tests for account linking
   - Integration tests for email verification
   - Integration tests for password reset
   - Integration tests for profile updates

7. **Documentation & Validation** (3-4 tasks)
   - Update README with auth setup
   - Document environment variables
   - Create quickstart guide
   - Validate all acceptance scenarios

**Ordering Strategy**:
- TDD approach: Tests before implementation
- Dependencies first: Schema → Migrations → Core → UI → Tests
- Mark [P] for parallel execution (independent files):
  - Multiple UI components can be built in parallel
  - Contract tests can be written in parallel
  - OAuth providers can be configured in parallel

**Estimated Task Count**: 35-40 numbered, dependency-ordered tasks

**IMPORTANT**: Task generation will be performed by `/tasks` command, not during `/plan`

## Phase 3+: Future Implementation

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following TDD approach)
**Phase 5**: Validation (run all tests, validate quickstart scenarios, security audit)

## Complexity Tracking

*No constitutional violations - this section remains empty*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (via /clarify)
- [x] Complexity deviations documented (none)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
