# Implementation Plan: Multi-Tenant Organization Setup

## Feature Overview

Implement multi-tenant infrastructure using Better Auth's organization plugin with org-scoped database access, authentication context propagation, and domain-specific database schema.

## User Stories

### US-1: Organization Membership
**As a** user
**I want to** be automatically assigned to an organization when I sign up
**So that** my data is isolated from other users

**Acceptance Criteria:**
- ✅ Better Auth organization plugin is enabled
- ✅ User can create an organization on first login
- ✅ User is assigned as "owner" role by default
- ✅ Organization membership is stored in Better Auth's `member` table
- ✅ `npx @better-auth/cli migrate` successfully applies schema changes

### US-2: Auth Context in Tool Calls
**As a** developer
**I want to** access user and org context in any Mastra tool
**So that** I can enforce org-scoped queries without passing context manually

**Acceptance Criteria:**
- ✅ AsyncLocalStorage provides auth context across async boundaries
- ✅ `getAuthContext()` returns `{ userId, email, orgId, roles }`
- ✅ Context is set once per request in CopilotKit route
- ✅ Tools can call `getAuthContext()` without explicit parameters
- ✅ Throws clear error if called outside authenticated request

### US-3: Org-Scoped Database Schema
**As a** platform
**I want to** ensure all domain tables have org_id column
**So that** data is isolated by organization

**Acceptance Criteria:**
- ✅ 5 new tables: dataset, dashboard, widget, automation, automation_run
- ✅ Each table has `org_id` NOT NULL column
- ✅ Foreign keys reference user.id and parent tables correctly
- ✅ Indexes on org_id for query performance
- ✅ JSON columns use Drizzle `.json()` mode with TypeScript types
- ✅ Migrations generated and applied to local D1
- ✅ Migrations applied to production D1

### US-4: Org Ownership Validation
**As a** security requirement
**I want to** validate org ownership before any mutation
**So that** users cannot access other orgs' data

**Acceptance Criteria:**
- ✅ `validateOrgOwnership()` utility checks record.orgId matches context.orgId
- ✅ Throws `OrgPermissionError` with clear message on mismatch
- ✅ Works with generic types: `validateOrgOwnership<T extends { orgId: string }>()`
- ✅ Used in all update/delete tool operations

## Technical Architecture

### Database Schema

**Tables to Add:**
- `dataset` - Data source definitions with schemas
- `dashboard` - Dashboard containers
- `widget` - Visualization widgets within dashboards
- `automation` - Alert and report configurations
- `automation_run` - Automation execution history

**Key Patterns:**
- Every table has `org_id` NOT NULL
- Foreign keys to `user.id` for audit trail
- JSON columns for flexible config storage
- Indexes on `org_id` for query performance
- Cascade delete for child records

### Auth Context Flow

```
Request → CopilotKit Route
         ↓
    Get Better Auth Session
         ↓
    Query member table for orgId
         ↓
    setAuthContext({ userId, email, orgId, roles })
         ↓
    Create Mastra Instance
         ↓
    Agent Tools call getAuthContext()
         ↓
    Org-scoped database queries
```

### Type Definitions

```typescript
// src/db/types.ts
export type ColumnDef = {
  name: string;
  type: 'text' | 'integer' | 'decimal' | 'date' | 'boolean';
  nullable: boolean;
  description?: string;
};

export type WidgetConfig = {
  sql: string;
  xField?: string;
  yField?: string;
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  timeRange?: '7d' | '30d' | '90d' | 'all';
};

export type AutomationConfig =
  | ThresholdAlertConfig
  | ScheduledReportConfig;
```

## Testing Strategy

### Unit Tests
- Auth context set/get operations
- Org ownership validation
- ID generation
- Error handling

### Integration Tests
- Better Auth organization creation flow
- Member assignment on signup
- Auth context in CopilotKit route
- Org-scoped database queries
- Cross-org access prevention

### Security Tests
- Verify cross-org data access blocked
- Verify all mutations validate org ownership
- Verify auth context required for all tools

## Definition of Done

### Functional Requirements
- ✅ Better Auth organization plugin enabled and working
- ✅ Users automatically assigned to organizations
- ✅ Auth context available in all tool calls
- ✅ All 5 domain tables created with org_id column
- ✅ Migrations applied to local and production D1
- ✅ Org-scoped query utilities implemented
- ✅ Ownership validation prevents cross-org access

### Non-Functional Requirements
- ✅ Performance: Indexes on org_id for fast queries
- ✅ Security: All queries org-scoped
- ✅ DX: No need to pass orgId manually to tools
- ✅ Error Handling: Clear error messages for auth/ownership failures

### Documentation
- ✅ Auth context usage documented in code comments
- ✅ Database schema documented with TypeScript types
- ✅ Migration commands documented in README

## Files to Create/Modify

### New Files
- `src/lib/auth-context.ts` - AsyncLocalStorage auth context
- `src/db/types.ts` - Domain type definitions
- `src/mastra/tools/shared/org-scoped-db.ts` - Org utilities

### Modified Files
- `src/lib/auth.ts` - Add organization plugin
- `src/db/schema.ts` - Add 5 domain tables + indexes
- `src/app/api/copilotkit/route.ts` - Extract and set auth context

### Generated Files
- `src/db/migrations/XXXX_add_domain_tables.sql` - Drizzle migration

## Dependencies

- `better-auth` - Organization plugin
- `async_hooks` - AsyncLocalStorage for context
- `drizzle-orm` - Database ORM
- `@cloudflare/workers-types` - D1 types

## Rollback Plan

If issues arise:
1. Revert Better Auth plugin addition
2. Drop domain tables via migration rollback
3. Remove auth-context.ts
4. Restore original CopilotKit route
5. Test existing features still work
