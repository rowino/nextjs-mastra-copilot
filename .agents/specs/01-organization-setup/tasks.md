# Tasks: Multi-Tenant Organization Setup

## Phase 1: Better Auth Organization Plugin (2-3 hours)

**Cluster: Authentication Infrastructure**

- [ ] **Task 1.1**: Enable organization plugin in `src/lib/auth.ts`
  - Import `organization` from `"better-auth/plugins"`
  - Add to plugins array with `allowUserToCreateOrganization: true`
  - Test configuration loads without errors

- [ ] **Task 1.2**: Run Better Auth migration
  - Execute `npx @better-auth/cli migrate`
  - Verify `organization` and `member` tables created
  - Check migration files in Better Auth directory

- [ ] **Task 1.3**: Test organization creation flow
  - Start dev server with `pnpm dev`
  - Create test user account
  - Verify organization is auto-created
  - Check `member` table has record with role="owner"

**Definition of Done:**
- Better Auth organization plugin active
- Migration applied successfully
- Test user has organization membership

---

## Phase 2: Auth Context Infrastructure (3-4 hours)

**Cluster: Context Propagation**

- [ ] **Task 2.1**: Create auth context module
  - Create `src/lib/auth-context.ts`
  - Define `AuthContext` type with userId, email, orgId, roles
  - Implement `authContextStorage` with AsyncLocalStorage
  - Implement `setAuthContext()` to store context
  - Implement `getAuthContext()` with error handling

- [ ] **Task 2.2**: Update CopilotKit route for auth extraction
  - Open `src/app/api/copilotkit/route.ts`
  - Import `getAuth`, `setAuthContext`, `getDb`, `member` schema
  - After getting D1 binding, get Better Auth session
  - Return 401 if no session
  - Query `member` table for user's active org membership
  - Return 403 if no membership found
  - Call `setAuthContext()` with userId, email, orgId, roles
  - Ensure context is set before Mastra instance creation

- [ ] **Task 2.3**: Create org-scoped DB utilities
  - Create `src/mastra/tools/shared/org-scoped-db.ts`
  - Export `OrgPermissionError` class
  - Export `getOrgScopedDb()` - returns Drizzle instance from Cloudflare context
  - Export `getAuthenticatedContext()` - wrapper for getAuthContext()
  - Export `validateOrgOwnership<T>()` - validates record.orgId matches context
  - Export `generateId(prefix)` - creates unique IDs with prefix

- [ ] **Task 2.4**: Test auth context flow
  - Add console.log in auth context functions
  - Make authenticated request to CopilotKit endpoint
  - Verify context is set with correct orgId
  - Verify getAuthContext() works in async tool execution

**Definition of Done:**
- Auth context available in all tool calls
- No need to pass userId/orgId as tool parameters
- Clear error messages when context unavailable

---

## Phase 3: Database Schema & Migrations (2-3 hours)

**Cluster: Data Layer**

- [ ] **Task 3.1**: Add type definitions
  - Create `src/db/types.ts`
  - Add `ColumnDef`, `WidgetConfig`, `AutomationConfig` types
  - Export all types

- [ ] **Task 3.2**: Add domain tables to schema
  - Open `src/db/schema.ts`
  - Add `dataset` table definition with columns:
    - id (text, PK)
    - orgId (text, NOT NULL)
    - name (text, NOT NULL)
    - description (text, nullable)
    - tableName (text, NOT NULL)
    - schema (json, ColumnDef[])
    - sampleData (json, nullable)
    - createdById (text, FK to user.id)
    - createdAt, updatedAt (timestamp)
  - Add `dashboard` table definition with columns:
    - id (text, PK)
    - orgId (text, NOT NULL)
    - name (text, NOT NULL)
    - description (text, nullable)
    - createdById (text, FK to user.id)
    - createdAt, updatedAt (timestamp)
  - Add `widget` table definition with columns:
    - id (text, PK)
    - dashboardId (text, FK to dashboard.id, cascade delete)
    - orgId (text, NOT NULL)
    - datasetId (text, FK to dataset.id)
    - title (text, NOT NULL)
    - type (text, "chart" | "metric" | "table")
    - config (json, WidgetConfig)
    - position (integer, NOT NULL)
    - createdById (text, FK to user.id)
    - createdAt, updatedAt (timestamp)
  - Add `automation` table definition with columns:
    - id (text, PK)
    - orgId (text, NOT NULL)
    - name (text, NOT NULL)
    - description (text, nullable)
    - type (text, "threshold_alert" | "scheduled_report")
    - config (json, AutomationConfig)
    - enabled (boolean, default true)
    - createdById (text, FK to user.id)
    - createdAt, updatedAt (timestamp)
  - Add `automationRun` table definition with columns:
    - id (text, PK)
    - automationId (text, FK to automation.id, cascade delete)
    - orgId (text, NOT NULL)
    - status (text, "success" | "failed" | "pending")
    - result (json, nullable)
    - error (text, nullable)
    - executedAt (timestamp)
  - Add 5 indexes:
    - dataset_org_id_idx on dataset.orgId
    - dashboard_org_id_idx on dashboard.orgId
    - widget_dashboard_id_idx on widget.dashboardId
    - widget_org_id_idx on widget.orgId
    - automation_org_id_idx on automation.orgId
  - Import types from `./types`

- [ ] **Task 3.3**: Generate and apply migrations
  - Run `npx drizzle-kit generate`
  - Review generated migration SQL
  - Run `npx wrangler d1 migrations apply mastra-db --local`
  - Verify tables created in local D1
  - Run `npx wrangler d1 migrations apply mastra-db --remote` (production)

- [ ] **Task 3.4**: Verify schema with queries
  - Use `npx wrangler d1 execute mastra-db --local --command "SELECT name FROM sqlite_master WHERE type='table'"`
  - Confirm all 5 new tables exist: dataset, dashboard, widget, automation, automation_run
  - Check indexes are applied

**Definition of Done:**
- All tables created with correct columns
- Indexes applied
- Migrations successful in local and remote D1
- Schema types available for TypeScript

---

## Phase 4: Integration Testing (1-2 hours)

**Cluster: End-to-End Validation**

- [ ] **Task 4.1**: Create test organization
  - Sign up new user via Better Auth UI
  - Verify organization created automatically
  - Check member table has entry with role="owner"

- [ ] **Task 4.2**: Test auth context in mock tool
  - Create temporary test tool that calls `getAuthContext()`
  - Register in Mastra instance
  - Call via CopilotKit
  - Verify context contains correct orgId

- [ ] **Task 4.3**: Test org-scoped query
  - Insert test record in dataset table with orgId
  - Create tool that queries with `WHERE orgId = context.orgId`
  - Verify only org's records returned

- [ ] **Task 4.4**: Test org ownership validation
  - Insert record with different orgId
  - Try to access via validateOrgOwnership()
  - Verify OrgPermissionError thrown with clear message

**Definition of Done:**
- Auth context flows correctly
- Org-scoped queries work
- Ownership validation prevents cross-org access

---

## Estimated Timeline

- **Phase 1**: 2-3 hours
- **Phase 2**: 3-4 hours
- **Phase 3**: 2-3 hours
- **Phase 4**: 1-2 hours

**Total**: 8-12 hours (1-1.5 days)

---

## Code Examples

### src/lib/auth-context.ts
```typescript
import { AsyncLocalStorage } from 'async_hooks';

export type AuthContext = {
  userId: string;
  email: string;
  orgId: string;
  roles: string[];
};

export const authContextStorage = new AsyncLocalStorage<AuthContext>();

export function setAuthContext(context: AuthContext): void {
  authContextStorage.enterWith(context);
}

export function getAuthContext(): AuthContext {
  const context = authContextStorage.getStore();
  if (!context) {
    throw new Error("Auth context not available. Ensure this is called within an authenticated request.");
  }
  return context;
}
```

### src/lib/auth.ts (addition)
```typescript
import { organization } from "better-auth/plugins";

plugins.push(
  organization({
    allowUserToCreateOrganization: true,
  })
);
```

### src/app/api/copilotkit/route.ts (addition)
```typescript
import { getAuth } from "@/lib/auth";
import { setAuthContext } from "@/lib/auth-context";
import { getDb } from "@/db";
import { member } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

// Inside POST handler, before getMastraInstance:
const auth = getAuth(d1Database);
const headersList = await headers();
const session = await auth.api.getSession({ headers: headersList });

if (!session?.user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}

const db = getDb(d1Database);
const activeMembership = await db
  .select()
  .from(member)
  .where(eq(member.userId, session.user.id))
  .orderBy(desc(member.createdAt))
  .limit(1)
  .get();

if (!activeMembership) {
  return new Response(JSON.stringify({ error: "No organization membership found" }), { status: 403 });
}

setAuthContext({
  userId: session.user.id,
  email: session.user.email,
  orgId: activeMembership.organizationId,
  roles: [activeMembership.role],
});
```

### src/mastra/tools/shared/org-scoped-db.ts
```typescript
import { getDb } from "@/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuthContext } from "@/lib/auth-context";

export class OrgPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrgPermissionError';
  }
}

export function getOrgScopedDb() {
  const { env } = getCloudflareContext();
  return getDb(env.D1Database);
}

export function getAuthenticatedContext() {
  return getAuthContext();
}

export async function validateOrgOwnership<T extends { orgId: string }>(
  record: T | null | undefined,
  expectedOrgId: string,
  resourceType: string
): Promise<T> {
  if (!record) {
    throw new OrgPermissionError(`${resourceType} not found`);
  }
  if (record.orgId !== expectedOrgId) {
    throw new OrgPermissionError(`Access denied: ${resourceType} belongs to a different organization`);
  }
  return record;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
```
