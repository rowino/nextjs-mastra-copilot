# Tasks: Authentication System

**Input**: Design documents from `/specs/001-add-auth-support/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: better-auth, D1, shadcn UI, Cloudflare Workers
2. Load design documents:
   → data-model.md: 7 entities (User, Account, Session, Verification, Role, SecurityEvent, PasswordReset)
   → contracts/: schemas.ts, auth-api.yaml
   → quickstart.md: 15 test scenarios
3. Generate tasks by category:
   → Setup: Dependencies, D1 config, schema generation
   → Tests: Contract tests, integration tests
   → Core: Auth factory, hooks, plugins, API routes
   → UI: Auth pages, components, profile management
   → Integration: D1 migrations, rate limiting, security logging
   → Polish: Documentation, validation, performance
4. Apply TDD: Tests before implementation
5. Number tasks sequentially (T001, T002...)
6. Generate parallel execution guidance
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- Repository root: `/Users/raphael/work/projects/rowino/starters/mastra/`
- Source: `src/`
- Tests: `tests/`
- Migrations: `drizzle/`
- Specs: `specs/001-add-auth-support/`

---

## Phase 3.1: Setup & Dependencies

- [x] **T001** Install better-auth dependencies
  ```bash
  pnpm add better-auth drizzle-orm
  ```

- [x] **T002** Install better-auth UI components
  ```bash
  pnpm add @daveyplate/better-auth-ui
  ```

- [x] **T003** Install development dependencies
  ```bash
  pnpm add -D @better-auth/cli drizzle-kit @cloudflare/workers-types
  ```

- [x] **T004** Update `wrangler.jsonc` with D1 migrations directory
  - Add `migrations_dir: "drizzle/migrations"` to D1 binding configuration
  - File: `wrangler.jsonc`

- [x] **T005** Create environment variables template
  - Create `.env.example` with:
    ```
    BETTER_AUTH_SECRET=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GITHUB_CLIENT_ID=
    GITHUB_CLIENT_SECRET=
    ```
  - File: `.env.example`

---

## Phase 3.2: Database Schema & Migrations

- [x] **T006** Generate better-auth base schema
  ```bash
  npx @better-auth/cli@latest generate --output src/lib/db/auth-schema.ts
  ```

- [x] **T007** Create custom security events table schema
  - Add `securityEvent` table to `src/lib/db/schema.ts`
  - Columns: id, userId, eventType, action, ipAddress, userAgent, success, metadata, createdAt
  - Indexes: eventType, createdAt, userId
  - File: `src/lib/db/schema.ts`

- [x] **T008** Generate Drizzle migrations from schema
  ```bash
  npx drizzle-kit generate
  ```

- [x] **T009** Apply D1 migrations locally
  ```bash
  wrangler d1 migrations apply mastra-db --local
  ```

---

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Parallel)

- [ ] **T010** [P] Contract test: Email/password signup validation
  - Test: POST `/api/auth/sign-up/email` with various password patterns
  - Verify: 12+ chars, uppercase, lowercase, number, special char required
  - File: `tests/auth/signup-email.test.ts`

- [ ] **T011** [P] Contract test: OAuth signup flow
  - Test: POST `/api/auth/sign-in/social` for Google and GitHub
  - Verify: Redirect to provider, callback handling
  - File: `tests/auth/signup-oauth.test.ts`

- [ ] **T012** [P] Contract test: Session management
  - Test: GET `/api/auth/get-session`
  - Verify: Session returned for authenticated user, 401 for unauthenticated
  - File: `tests/auth/session.test.ts`

- [ ] **T013** [P] Contract test: Profile updates
  - Test: POST `/api/auth/update-user` with name, email, image
  - Verify: Profile updated, email change resets verification
  - File: `tests/auth/profile.test.ts`

- [ ] **T014** [P] Contract test: Password management
  - Test: POST `/api/auth/change-password` and `/api/auth/reset-password`
  - Verify: Current password required, new password validated
  - File: `tests/auth/password.test.ts`

### Integration Tests (Parallel)

- [ ] **T015** [P] Integration test: Email/password signup flow (Scenario 1)
  - Steps: Sign up → Verify email verification sent → Login → Check limited access
  - Expected: Account created, logged in, verification pending
  - File: `tests/integration/signup-flow.test.ts`

- [ ] **T016** [P] Integration test: Google OAuth signup (Scenario 4)
  - Steps: OAuth signup → Check auto-verification → Check full access
  - Expected: Account created with verified email, full access granted
  - File: `tests/integration/oauth-google.test.ts`

- [ ] **T017** [P] Integration test: Account linking (Scenario 5)
  - Steps: Create email/password account → Sign in with Google (same email)
  - Expected: Google account linked to existing account
  - File: `tests/integration/account-linking.test.ts`

- [ ] **T018** [P] Integration test: Progressive rate limiting (Scenario 11)
  - Steps: Fail login 5 times → Measure delays
  - Expected: Exponential backoff (1s, 2s, 4s, 8s, 16s)
  - File: `tests/integration/rate-limiting.test.ts`

- [ ] **T019** [P] Integration test: Email verification flow (Scenario 2)
  - Steps: Sign up → Click verification link → Check full access
  - Expected: Email verified, full feature access
  - File: `tests/integration/email-verification.test.ts`

- [ ] **T020** [P] Integration test: Password reset flow (Scenario 10)
  - Steps: Request reset → Click link → Reset password → Login
  - Expected: Password updated, can login with new password
  - File: `tests/integration/password-reset.test.ts`

---

## Phase 3.4: Core Authentication (ONLY after tests are failing)

### Auth Configuration & Factory

- [ ] **T021** Create auth factory function with D1 integration
  - Create `getAuth(d1: D1Database)` function
  - Configure drizzle adapter for D1
  - Add email/password config with min 12 chars
  - File: `src/lib/auth/index.ts`

- [ ] **T022** Create custom password validation hook
  - Implement `before` hook with regex validation
  - Enforce: 12+ chars, uppercase, lowercase, number, special char
  - Apply to `/sign-up/email`, `/change-password`, `/reset-password`
  - File: `src/lib/auth/hooks.ts`

- [ ] **T023** Configure OAuth providers (Google, GitHub)
  - Add `socialProviders.google` and `socialProviders.github`
  - Configure client IDs and secrets from env
  - Set callback URLs
  - File: `src/lib/auth/index.ts`

- [ ] **T024** Configure account linking strategy
  - Enable `accountLinking` with `allowDifferentEmails: false`
  - Set `trustedProviders: ["google", "github", "email-password"]`
  - File: `src/lib/auth/index.ts`

- [ ] **T025** Configure email verification (non-blocking)
  - Set `requireEmailVerification: true`
  - Implement `sendVerificationEmail` with console.log (dev)
  - Configure verification token expiry (24 hours)
  - File: `src/lib/auth/index.ts`

- [ ] **T026** Configure password reset flow
  - Implement `sendResetPassword` with console.log (dev)
  - Set `resetPasswordTokenExpiresIn: 3600` (1 hour)
  - File: `src/lib/auth/index.ts`

- [ ] **T027** Add admin plugin for RBAC
  - Add `admin({ roles: ["admin", "moderator", "user"] })`
  - Configure default role assignment
  - File: `src/lib/auth/index.ts`

- [ ] **T028** Configure session management
  - Set `expiresIn: 60 * 60 * 24 * 7` (7 days)
  - Set `updateAge: 60 * 60 * 24` (1 day)
  - Enable cookie caching with 5 min maxAge
  - File: `src/lib/auth/index.ts`

- [ ] **T029** Configure rate limiting for Cloudflare
  - Enable rate limiting with 3 requests/10 seconds
  - Set `customIpHeader: "cf-connecting-ip"` for Cloudflare
  - File: `src/lib/auth/index.ts`

### Custom Plugins

- [ ] **T030** [P] Create audit logging plugin
  - Implement `after` hook to log security events
  - Log: authentication, account_management, security, admin_actions
  - Insert to `securityEvent` table
  - File: `src/lib/auth/plugins/audit-log.ts`

- [ ] **T031** [P] Create progressive delay utility (client-side)
  - Implement exponential backoff function
  - Read `X-Retry-After` header from 429 responses
  - Retry with delays: 1s → 2s → 4s → 8s → 16s
  - File: `src/lib/auth/progressive-delay.ts`

### Auth Client & API Routes

- [ ] **T032** Create client-side auth instance
  - Create `authClient` with plugins: `adminClient()`
  - Set baseURL from environment
  - File: `src/lib/auth/client.ts`

- [ ] **T033** Create better-auth API route handler
  - Retrieve D1 via `getCloudflareContext().env.D1Database`
  - Call `getAuth(d1Database)` per request
  - Use `toNextJsHandler(auth.handler)` for GET/POST
  - File: `src/app/api/auth/[...all]/route.ts`

---

## Phase 3.5: UI Components & Pages

### Authentication Pages (Parallel)

- [ ] **T034** [P] Create login page with AuthCard
  - Render `<AuthCard pathname={["login"]} />`
  - Support email/password and OAuth (Google, GitHub)
  - File: `src/app/(auth)/login/page.tsx`

- [ ] **T035** [P] Create signup page with AuthCard
  - Render `<AuthCard pathname={["signup"]} />`
  - Support email/password and OAuth
  - File: `src/app/(auth)/signup/page.tsx`

- [ ] **T036** [P] Create forgot password page
  - Render `<AuthCard pathname={["forgot-password"]} />`
  - Request password reset email
  - File: `src/app/(auth)/forgot-password/page.tsx`

- [ ] **T037** [P] Create reset password page
  - Render `<AuthCard pathname={["reset-password"]} />`
  - Accept token from URL params
  - File: `src/app/(auth)/reset-password/page.tsx`

### Profile & Protected Routes

- [ ] **T038** Create profile page with SettingsCards
  - Render `<SettingsCards />` from better-auth-ui
  - Display: Avatar, Email, Username, Password, Linked Providers, Sessions
  - Route protection with session check
  - File: `src/app/(protected)/profile/page.tsx`

- [ ] **T039** Create protected route wrapper component
  - Check session via `auth.api.getSession({ headers })`
  - Redirect to `/login` if unauthenticated
  - Server component for initial auth check
  - File: `src/components/auth/protected-route.tsx`

- [ ] **T040** Create UserButton navigation component
  - Render `<UserButton />` from better-auth-ui
  - Display: User avatar, name, role
  - Dropdown: Profile link, Sign out
  - File: `src/components/auth/user-button.tsx`

- [ ] **T041** Add UserButton to main layout
  - Import and render UserButton in navigation
  - Server-side session check for initial state
  - File: `src/app/layout.tsx`

---

## Phase 3.6: Integration & Security

- [ ] **T042** Create server action for session validation
  - Implement reusable `getServerSession()` helper
  - Use `auth.api.getSession({ headers })` pattern
  - Return session or null
  - File: `src/lib/auth/session.ts`

- [ ] **T043** Implement feature access control based on email verification
  - Create middleware or guard checking `emailVerified` status
  - Return limited access flag for unverified users
  - File: `src/lib/auth/access-control.ts`

- [ ] **T044** Add security event logging to auth hooks
  - Log failed login attempts, password changes, role changes
  - Use audit plugin from T030
  - File: `src/lib/auth/index.ts` (update hooks)

- [ ] **T045** Create admin security events API route
  - GET `/api/auth/security-events` with query params
  - Filter by userId, eventType, limit, offset
  - Require admin role permission check
  - File: `src/app/api/auth/security-events/route.ts`

---

## Phase 3.7: Integration with Mastra Agents

- [ ] **T046** Update Mastra factory to accept user session context
  - Modify `getMastraInstance()` to accept optional session
  - Pass user context to agent memory
  - File: `src/mastra/index.ts`

- [ ] **T047** Create session-aware CopilotKit runtime
  - Retrieve session in CopilotKit API route
  - Pass session to Mastra instance
  - Make user context available to agents
  - File: `src/app/api/copilotkit/route.ts` (update)

---

## Phase 3.8: Polish & Validation

### Documentation

- [ ] **T048** [P] Update README with authentication setup
  - Add "Authentication" section
  - Document OAuth provider setup (Google, GitHub)
  - Document environment variables
  - Explain D1 migrations workflow
  - File: `README.md`

- [ ] **T049** [P] Document password requirements in UI
  - Add password requirements text to signup/change password forms
  - Show validation errors inline
  - Files: Update auth pages

- [ ] **T050** [P] Create migration guide for existing users
  - Document D1 database creation
  - Document migrations application
  - Document OAuth app setup steps
  - File: `docs/AUTH_SETUP.md`

### Testing & Validation

- [ ] **T051** Run all contract tests and verify they pass
  ```bash
  pnpm test tests/auth/ tests/integration/
  ```

- [ ] **T052** Execute quickstart.md scenarios manually
  - Complete all 15 testing scenarios
  - Verify acceptance criteria
  - Update quickstart with any findings

- [ ] **T053** [P] Add unit tests for password validation hook
  - Test all regex patterns independently
  - Test edge cases (11 chars, missing special char, etc.)
  - File: `tests/unit/password-validation.test.ts`

- [ ] **T054** [P] Add unit tests for progressive delay utility
  - Test exponential backoff calculation
  - Test retry-after header parsing
  - File: `tests/unit/progressive-delay.test.ts`

### Performance & Security

- [ ] **T055** Performance test authentication endpoints
  - Test signup, login, session validation response times
  - Target: <200ms p95 for auth, <50ms for session validation
  - File: `tests/performance/auth-perf.test.ts`

- [ ] **T056** Security audit checklist
  - Verify HTTPS enforced (production)
  - Verify cookie attributes (httpOnly, secure, sameSite)
  - Verify rate limiting works
  - Verify password hashing (scrypt via better-auth)
  - Verify CSRF protection enabled

- [ ] **T057** Test OAuth flows end-to-end
  - Google OAuth: Sign up, sign in, account linking
  - GitHub OAuth: Sign up, sign in, account linking
  - Verify tokens stored correctly

---

## Dependencies

### Critical Path
1. **Setup (T001-T009)** → All other phases
2. **Tests (T010-T020)** → Implementation (T021-T047)
3. **Core Auth (T021-T029)** → API Routes (T033) → UI (T034-T041)
4. **Migrations (T008-T009)** → All runtime features
5. **Auth Factory (T021)** → All auth features
6. **Plugins (T030-T031)** → Integration (T042-T045)

### Blocking Relationships
- T009 blocks T021-T047 (migrations before runtime)
- T021 blocks T033 (factory before API route)
- T033 blocks T034-T041 (API before UI)
- T010-T020 must complete before T021 (TDD)
- T030 blocks T044 (audit plugin before logging)
- T046-T047 require T021 (auth factory) and existing Mastra setup

---

## Parallel Execution Examples

### Setup Phase (Run together)
```bash
# T001, T002, T003 can run sequentially (pnpm add is fast)
pnpm add better-auth drizzle-orm @daveyplate/better-auth-ui
pnpm add -D @better-auth/cli drizzle-kit @cloudflare/workers-types
```

### Contract Tests (Run in parallel after setup)
```
Task: "Contract test: Email/password signup validation in tests/auth/signup-email.test.ts"
Task: "Contract test: OAuth signup flow in tests/auth/signup-oauth.test.ts"
Task: "Contract test: Session management in tests/auth/session.test.ts"
Task: "Contract test: Profile updates in tests/auth/profile.test.ts"
Task: "Contract test: Password management in tests/auth/password.test.ts"
```

### Integration Tests (Run in parallel after contract tests)
```
Task: "Integration test: Email/password signup flow in tests/integration/signup-flow.test.ts"
Task: "Integration test: Google OAuth signup in tests/integration/oauth-google.test.ts"
Task: "Integration test: Account linking in tests/integration/account-linking.test.ts"
Task: "Integration test: Progressive rate limiting in tests/integration/rate-limiting.test.ts"
Task: "Integration test: Email verification flow in tests/integration/email-verification.test.ts"
Task: "Integration test: Password reset flow in tests/integration/password-reset.test.ts"
```

### UI Pages (Run in parallel after API routes)
```
Task: "Create login page with AuthCard in src/app/(auth)/login/page.tsx"
Task: "Create signup page with AuthCard in src/app/(auth)/signup/page.tsx"
Task: "Create forgot password page in src/app/(auth)/forgot-password/page.tsx"
Task: "Create reset password page in src/app/(auth)/reset-password/page.tsx"
```

### Documentation (Run in parallel during polish)
```
Task: "Update README with authentication setup"
Task: "Document password requirements in UI"
Task: "Create migration guide for existing users in docs/AUTH_SETUP.md"
```

---

## Validation Checklist

### Before Starting
- [x] All design documents available (plan.md, data-model.md, contracts/, quickstart.md)
- [x] D1 database created and ID configured in wrangler.jsonc
- [x] OAuth apps created (Google, GitHub)
- [x] Environment variables template ready

### During Implementation (TDD Gates)
- [ ] T010-T020 completed and tests FAILING before T021
- [ ] Contract tests cover all API endpoints
- [ ] Integration tests cover all user scenarios
- [ ] Each test specifies exact file path

### After Implementation
- [ ] All tests passing (contract + integration + unit)
- [ ] Manual testing via quickstart.md complete
- [ ] Performance targets met (<200ms auth, <50ms session)
- [ ] Security checklist verified
- [ ] Documentation updated (README, AUTH_SETUP.md)

### Production Readiness
- [ ] D1 migrations applied to production
- [ ] OAuth redirect URLs updated for production domain
- [ ] Environment variables configured in Cloudflare
- [ ] Rate limiting tested under load
- [ ] Email verification flow tested end-to-end (when Resend integrated)

---

## Notes

- **[P] tasks**: Different files, can run in parallel via multiple Task agents
- **Verify tests fail**: Run tests after T010-T020 to confirm TDD approach
- **Commit strategy**: Commit after each phase (setup, tests, core, UI, polish)
- **Avoid**: Modifying same file in parallel tasks, skipping tests before implementation

---

## Task Generation Summary

**Total Tasks**: 57
**Parallel Tasks**: 21 (marked with [P])
**Critical Path**: Setup (9) → Tests (11) → Core (17) → UI (8) → Integration (6) → Polish (10)
**Estimated Duration**: 5-7 days for solo developer, 3-4 days with parallel execution

**Key Milestones**:
1. Day 1: Setup + Schema + Migrations (T001-T009)
2. Day 2: All Tests Written (T010-T020) ✓ Tests must fail
3. Day 3-4: Core Auth + API Routes + Plugins (T021-T033)
4. Day 5: UI Components (T034-T041) + Integration (T042-T047)
5. Day 6-7: Polish + Validation + Documentation (T048-T057)

---

**Status**: ✅ Ready for execution
**Next Command**: Begin with `T001` or run parallel setup tasks
