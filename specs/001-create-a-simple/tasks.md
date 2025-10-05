# Tasks: Modular Starter Kit with Better-Auth + Laravel Sanctum

**Input**: Design documents from `/specs/001-create-a-simple/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/
**Architecture**: Next.js + Better-Auth frontend ↔ Laravel Sanctum backend API

## Execution Flow
```
1. Load plan.md from feature directory ✓
   → Tech stack: Next.js 15.5+, Better-Auth, TypeScript, Mastra, CopilotKit
   → Structure: Frontend-only (no local database)
2. Load design documents ✓
   → data-model.md: Better-Auth session schema, Laravel API entities
   → contracts/: auth.ts, profile.ts, settings.ts, dashboard.ts
   → research.md: Better-Auth + Sanctum integration decisions
   → quickstart.md: Manual test scenarios
3. Generate tasks by category:
   → Setup: Dependencies, Better-Auth config, API client
   → Tests: Contract tests for Laravel API endpoints
   → Core: Custom Sanctum provider, auth UI, protected routes
   → Features: Profile, settings, dashboard pages
   → Integration: Mastra agents, CopilotKit bridge
   → Polish: E2E tests, documentation
4. Apply task rules:
   → Different components = [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD where applicable)
5. Number tasks sequentially (T001-T045)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Exact file paths included in descriptions

---

## Phase 3.1: Setup & Dependencies

**Goal**: Install dependencies and configure Better-Auth with custom Laravel Sanctum provider

- [x] **T001** Add Better-Auth dependencies to package.json (better-auth, @tanstack/react-query)
- [x] **T002** Create .env.example with LARAVEL_API_URL and NEXT_PUBLIC_APP_URL
- [x] **T003** Create API client base configuration in src/lib/api/client.ts (ky/axios with error handling)

---

## Phase 3.2: Better-Auth Foundation

**Goal**: Implement custom Laravel Sanctum provider for Better-Auth

- [x] **T004** Create Zod schemas for Better-Auth session in src/lib/schemas/auth.ts
- [x] **T005** Implement custom Sanctum provider in src/lib/auth/providers/sanctum.ts
- [x] **T006** Create Better-Auth client configuration in src/lib/auth/client.ts
- [x] **T007** Create Better-Auth API route handler in src/app/api/auth/[...better-auth]/route.ts
- [x] **T008** Create Better-Auth server utilities in src/lib/auth/server.ts (session validation)

---

## Phase 3.3: Contract Tests [P] ⚠️ REQUIRES LARAVEL BACKEND

**Goal**: Write failing tests for Laravel API endpoints (TDD approach)

**NOTE: These tests validate Laravel API contracts and require a running Laravel backend to execute**

- [ ] **T009** [P] ⏸️ SKIPPED (requires Laravel backend) - Contract test for POST /api/auth/register in tests/integration/auth/register.test.ts
- [ ] **T010** [P] ⏸️ SKIPPED (requires Laravel backend) - Contract test for POST /api/auth/login in tests/integration/auth/login.test.ts
- [ ] **T011** [P] ⏸️ SKIPPED (requires Laravel backend) - Contract test for POST /api/auth/refresh in tests/integration/auth/refresh.test.ts
- [ ] **T012** [P] ⏸️ SKIPPED (requires Laravel backend) - Contract test for POST /api/auth/logout in tests/integration/auth/logout.test.ts
- [ ] **T013** [P] ⏸️ SKIPPED (requires Laravel backend) - Contract test for GET /api/profile in tests/integration/profile/get-profile.test.ts
- [ ] **T014** [P] ⏸️ SKIPPED (requires Laravel backend) - Contract test for PUT /api/profile in tests/integration/profile/update-profile.test.ts
- [ ] **T015** [P] ⏸️ SKIPPED (requires Laravel backend) - Contract test for POST /api/profile/avatar in tests/integration/profile/upload-avatar.test.ts
- [ ] **T016** [P] ⏸️ SKIPPED (requires Laravel backend) - Contract test for GET /api/settings in tests/integration/settings/get-settings.test.ts
- [ ] **T017** [P] ⏸️ SKIPPED (requires Laravel backend) - Contract test for PUT /api/settings in tests/integration/settings/update-settings.test.ts
- [ ] **T018** [P] ⏸️ SKIPPED (requires Laravel backend) - Contract test for GET /api/dashboard in tests/integration/dashboard/get-dashboard.test.ts

---

## Phase 3.4: Authentication UI

**Goal**: Build login, register, and email verification pages using Better-Auth hooks

- [x] **T019** Create login form component in src/app/components/auth/login-form.tsx using Better-Auth useSignIn hook with Zod form validation (react-hook-form + @hookform/resolvers/zod)
- [x] **T020** Create register form component in src/app/components/auth/register-form.tsx using Better-Auth useSignUp hook with Zod form validation (react-hook-form + @hookform/resolvers/zod)
- [x] **T021** Create login page in src/app/(auth)/login/page.tsx
- [x] **T022** Create register page in src/app/(auth)/register/page.tsx
- [x] **T023** Create email verification page in src/app/(auth)/verify-email/page.tsx
- [x] **T024** Create forgot password page in src/app/(auth)/forgot-password/page.tsx
- [x] **T025** Create reset password page in src/app/(auth)/reset-password/page.tsx

---

## Phase 3.5: Protected Routes & Middleware

**Goal**: Implement authentication guards using Better-Auth session

- [x] **T026** Create auth middleware in src/middleware.ts (checks Better-Auth session)
- [x] **T027** Create protected dashboard layout in src/app/dashboard/layout.tsx (uses useSession hook)
- [x] **T028** Create dashboard home page in src/app/dashboard/page.tsx

---

## Phase 3.6: Profile Feature [P]

**Goal**: Implement profile viewing and editing

- [x] **T029** [P] Create profile API client functions in src/lib/api/profile.ts
- [x] **T030** [P] Create profile form component in src/app/components/profile/profile-form.tsx using Next.js Server Actions for form submissions (PUT /api/profile)
- [x] **T031** [P] Create avatar upload component in src/app/components/profile/avatar-upload.tsx
- [x] **T032** [P] Create password change form in src/app/components/profile/password-form.tsx using Next.js Server Actions for password updates (PUT /api/profile/password)
- [x] **T033** Create profile page in src/app/dashboard/profile/page.tsx
- [x] **T034** Create profile security page in src/app/dashboard/profile/security/page.tsx

---

## Phase 3.7: Settings Feature [P]

**Goal**: Implement user settings management

- [x] **T035** [P] Create settings API client functions in src/lib/api/settings.ts
- [x] **T036** [P] Create theme toggle component in src/app/components/settings/theme-toggle.tsx using Next.js Server Actions for theme persistence (PUT /api/settings)
- [x] **T037** [P] Create language selector in src/app/components/settings/language-selector.tsx using Next.js Server Actions for language persistence (PUT /api/settings)
- [x] **T038** [P] Create notification preferences component in src/app/components/settings/notification-preferences.tsx using Next.js Server Actions for preference updates (PUT /api/settings)
- [x] **T039** Create settings page in src/app/dashboard/settings/page.tsx with Server Component rendering and client islands for interactive controls
- [x] **T040** Create appearance settings page in src/app/dashboard/settings/appearance/page.tsx using Server Components with client components for theme/language selectors
- [x] **T041** Create account settings page in src/app/dashboard/settings/account/page.tsx with account deletion UI using Server Action for deletion flow (DELETE /api/auth/user)

---

## Phase 3.8: Dashboard Feature

**Goal**: Implement dashboard with stats and widgets

- [x] **T042** Create dashboard API client functions in src/lib/api/dashboard.ts
- [x] **T043** [P] Create stat card component in src/app/components/dashboard/stat-card.tsx
- [x] **T044** [P] Create chart widget component in src/app/components/dashboard/chart-widget.tsx
- [x] **T045** [P] Create activity list component in src/app/components/dashboard/activity-list.tsx

---

## Phase 3.9: Mastra Agents Integration [P]

**Goal**: Add AI-powered features using Mastra agents

- [x] **T046** [P] Create profile assistant agent in src/mastra/agents/index.ts (profileAssistantAgent)
- [x] **T047** [P] Create dashboard agent in src/mastra/agents/index.ts (dashboardAgent)
- [x] **T048** [P] Create profile tools in src/mastra/tools/index.ts (getProfileCompletionTool, suggestBioImprovementsTool)
- [x] **T049** Register agents in src/mastra/agents/index.ts
- [x] **T050** Export agents in src/mastra/index.ts (add to Mastra instance)

---

## Phase 3.10: CopilotKit Bridge

**Goal**: Connect Mastra agents to frontend via CopilotKit

- [x] **T051** Update CopilotKit route handler in src/app/api/copilotkit/route.ts (MastraAgent.getLocalAgents)
- [x] **T052** Add useCopilotAction hooks to profile page for generative UI (get-profile-completion, suggest-bio-improvements)
- [x] **T053** Add useCopilotAction hooks to dashboard page for conversational features

---

## Phase 3.11: E2E Tests & Polish

**Goal**: End-to-end validation and documentation

- [ ] **T054** [P] ⏸️ SKIPPED (requires Laravel backend) - E2E test for complete auth flow in tests/e2e/auth-flow.spec.ts (Playwright)
- [ ] **T055** [P] ⏸️ SKIPPED (requires Laravel backend) - E2E test for profile update in tests/e2e/profile-update.spec.ts (Playwright)
- [ ] **T056** [P] ⏸️ SKIPPED (requires Laravel backend) - E2E test for settings management in tests/e2e/settings.spec.ts (Playwright)
- [x] **T057** Update README.md with setup instructions, architecture diagrams, and troubleshooting guide
- [x] **T058** Update CLAUDE.md with Better-Auth patterns, custom provider examples, and best practices
- [x] **T059** Verify .env.example has all required variables (LARAVEL_API_URL, NEXT_PUBLIC_LARAVEL_GRAPHQL_URL, NEXT_PUBLIC_APP_URL, OPENROUTER_API_KEY/OPENAI_API_KEY, LOG_LEVEL)
- [ ] **T060** ⏸️ SKIPPED (requires Laravel backend) - Run manual test scenarios from quickstart.md (all 13 scenarios)
- [ ] **T061** ⏸️ SKIPPED (requires Laravel backend) - Create performance test for dashboard load time using Lighthouse CI in tests/e2e/performance.spec.ts (verify <3s target per FR-032)

---

## Dependencies

**Critical Path**:
1. Setup (T001-T003) must complete first
2. Better-Auth foundation (T004-T008) before auth UI
3. Contract tests (T009-T018) should fail before implementation
4. Auth UI (T019-T025) before protected routes
5. Protected routes (T026-T028) before feature pages
6. Profile/Settings/Dashboard (T029-T045) can run in parallel after protected routes
7. Mastra agents (T046-T050) can run in parallel with features
8. CopilotKit bridge (T051-T053) after agents registered
9. E2E tests (T054-T056, T061) after all features complete
10. Documentation (T057-T059) in parallel with tests
11. Manual validation (T060) final gate before release

**Blocking Relationships**:
- T001-T003 block everything
- T004-T008 block T009-T025
- T026-T028 block T029-T045
- T046-T050 block T051-T053
- T029-T053 block T054-T061
- T041 provides account settings page (required for deletion UI in T041)
- T028, T042-T045 block T061 (dashboard must exist for performance testing)

**Parallel Groups**:
- **Group A**: T009-T018 (contract tests - different files)
- **Group B**: T029-T032 (profile components - different files)
- **Group C**: T035-T038 (settings components - different files)
- **Group D**: T043-T045 (dashboard widgets - different files)
- **Group E**: T046-T048 (Mastra agents - different files)
- **Group F**: T054-T056, T061 (E2E tests - different files)

---

## Parallel Execution Examples

**Contract Tests (Group A)**:
```bash
# Launch all contract tests together (T009-T018):
Task: "Contract test POST /api/auth/register in tests/integration/auth/register.test.ts"
Task: "Contract test POST /api/auth/login in tests/integration/auth/login.test.ts"
Task: "Contract test POST /api/auth/refresh in tests/integration/auth/refresh.test.ts"
Task: "Contract test POST /api/auth/logout in tests/integration/auth/logout.test.ts"
Task: "Contract test GET /api/profile in tests/integration/profile/get-profile.test.ts"
Task: "Contract test PUT /api/profile in tests/integration/profile/update-profile.test.ts"
Task: "Contract test POST /api/profile/avatar in tests/integration/profile/upload-avatar.test.ts"
Task: "Contract test GET /api/settings in tests/integration/settings/get-settings.test.ts"
Task: "Contract test PUT /api/settings in tests/integration/settings/update-settings.test.ts"
Task: "Contract test GET /api/dashboard in tests/integration/dashboard/get-dashboard.test.ts"
```

**Profile Components (Group B)**:
```bash
# Launch profile components in parallel (T029-T032):
Task: "Create profile API client in src/lib/api/profile.ts"
Task: "Create profile form in src/app/components/profile/profile-form.tsx"
Task: "Create avatar upload in src/app/components/profile/avatar-upload.tsx"
Task: "Create password form in src/app/components/profile/password-form.tsx"
```

**Mastra Agents (Group E)**:
```bash
# Launch agents in parallel (T046-T048):
Task: "Create profile assistant agent in src/mastra/agents/profile-assistant.ts"
Task: "Create dashboard agent in src/mastra/agents/dashboard-agent.ts"
Task: "Create profile tools in src/mastra/tools/profile-tools.ts"
```

---

## Notes

**Better-Auth Patterns**:
- All auth state managed by Better-Auth hooks (useSession, useSignIn, useSignUp, useSignOut)
- Custom Sanctum provider bridges Better-Auth to Laravel API
- httpOnly cookies for secure token storage
- Automatic token refresh via Better-Auth
- Server-side session validation available

**Type Safety**:
- All Laravel API responses validated with Zod schemas (contracts/)
- Better-Auth session schema defined with Zod
- Form inputs validated with Zod before submission
- TypeScript types derived from Zod schemas

**Testing Strategy**:
- Contract tests validate Laravel API responses match contracts
- MSW (Mock Service Worker) for mocking Laravel API in tests
- E2E tests use real Better-Auth flow with mocked backend
- Manual validation via quickstart.md scenarios

**Performance Targets**:
- Dashboard load: <3s on broadband
- Auth operations: <500ms (Laravel API dependent)
- Token refresh: <200ms (Better-Auth automatic)
- Concurrent users: 1,000+ (Laravel backend handles)

**Avoid**:
- Direct token manipulation (use Better-Auth abstractions)
- Local database (all data in Laravel)
- Hardcoded API URLs (use env vars)
- Password hashing frontend (Laravel handles)

---

## Validation Checklist

**GATE: Must pass before implementation complete**

- [ ] All contracts (auth, profile, settings, dashboard) have tests
- [ ] All Laravel API endpoints have corresponding frontend functions
- [ ] Better-Auth session management working (login, logout, refresh)
- [ ] Protected routes redirect unauthenticated users
- [ ] Profile, settings, dashboard pages functional
- [ ] Mastra agents accessible via CopilotKit
- [ ] E2E tests passing
- [ ] Manual quickstart scenarios pass (13 scenarios)
- [ ] No @claude comments in code
- [ ] CLAUDE.md updated with Better-Auth patterns
- [ ] README.md has complete setup instructions

---

## Task Estimation

**Total Tasks**: 61
**Estimated Completion**: 5-7 days (1 developer)

**Time Breakdown**:
- Setup & Better-Auth: 4 hours (T001-T008)
- Contract Tests: 6 hours (T009-T018) - can parallelize
- Auth UI: 6 hours (T019-T025)
- Protected Routes: 2 hours (T026-T028)
- Profile Feature: 6 hours (T029-T034)
- Settings Feature: 6 hours (T035-T041)
- Dashboard Feature: 4 hours (T042-T045)
- Mastra Agents: 4 hours (T046-T050) - can parallelize
- CopilotKit Bridge: 2 hours (T051-T053)
- E2E & Polish: 10 hours (T054-T061) - includes performance testing

**Critical Path**: 50 hours (excluding parallelizable tasks)
**With Parallelization**: ~34 hours (assuming 3 parallel agents)
