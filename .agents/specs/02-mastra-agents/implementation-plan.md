# Implementation Plan: Mastra AI Agents & Tools

## Feature Overview

Implement three specialized Mastra agents (Data Setup, Dashboard Builder, Automation) with comprehensive toolsets, SQL safety validation, and persistent memory backed by D1 storage.

## User Stories

### US-1: Data Setup Agent
**As a** user
**I want to** create dataset definitions that map to my D1 tables
**So that** I can use them in dashboards and queries

**Acceptance Criteria:**
- ✅ Agent understands natural language dataset requests
- ✅ Can create datasets with schema definitions (columns + types)
- ✅ Lists all datasets for the organization
- ✅ Shows dataset details including sample data
- ✅ Updates dataset schemas
- ✅ Deletes datasets with confirmation
- ✅ Validates table names (alphanumeric + underscore only)
- ✅ Prevents duplicate dataset names per org

### US-2: Dashboard Builder Agent
**As a** user
**I want to** ask questions about my data and get visualizations
**So that** I can understand trends without writing SQL

**Acceptance Criteria:**
- ✅ Agent generates safe SELECT-only SQL queries
- ✅ Executes queries against org-scoped datasets
- ✅ Returns query results with execution time
- ✅ Creates dashboard containers
- ✅ Adds widgets (chart, metric, table) to dashboards
- ✅ Updates widget configurations
- ✅ Validates SQL safety (no INSERT/UPDATE/DELETE/JOIN)
- ✅ Limits query results to 1000 rows max
- ✅ Provides helpful error messages for invalid queries

### US-3: Automation Agent
**As a** user
**I want to** set up alerts and scheduled reports
**So that** I'm notified when metrics change

**Acceptance Criteria:**
- ✅ Agent creates threshold alerts (notify when value crosses threshold)
- ✅ Agent creates scheduled reports (email data on schedule)
- ✅ Tests automation queries before saving
- ✅ Validates threshold alert queries return single numeric value
- ✅ Lists all automations for the organization
- ✅ Enables/disables automations
- ✅ Shows automation run history
- ✅ Defaults email recipient to current user

### US-4: SQL Safety Layer
**As a** security requirement
**I want to** prevent dangerous SQL operations
**So that** users cannot corrupt or access unauthorized data

**Acceptance Criteria:**
- ✅ Only SELECT queries allowed
- ✅ No JOIN operations (per spec requirement)
- ✅ No INSERT, UPDATE, DELETE, DROP, ALTER, CREATE
- ✅ No multi-statement queries (no semicolons)
- ✅ No SQL injection vectors (comments, pragmas)
- ✅ Table name whitelist enforced (only org's datasets)
- ✅ LIMIT automatically added if missing
- ✅ Clear error messages for violations

### US-5: Agent Memory
**As a** user
**I want to** agents to remember context across conversations
**So that** I don't have to repeat information

**Acceptance Criteria:**
- ✅ Working memory persists in D1 storage
- ✅ Each agent has typed state schema (Zod)
- ✅ Memory survives page refreshes
- ✅ Memory scoped to user/agent combination

## Technical Architecture

### Agent Architecture

```
┌─────────────────────────────────────────┐
│ Mastra Instance (src/mastra/index.ts)  │
│ - dataSetupAgent                        │
│ - dashboardBuilderAgent                 │
│ - automationAgent                       │
└──────────────┬──────────────────────────┘
               │
               ├──> Agent Factory Functions
               │    (accept MastraStorage)
               │
               ├──> Tools (createTool)
               │    - Input/Output Zod schemas
               │    - Execute function with context
               │    - Calls getAuthContext()
               │
               └──> Shared Utilities
                    - SQL Validator
                    - Org-scoped DB access
```

### Agent State Schemas

**Data Setup Agent:**
```typescript
{
  activeDatasetId?: string;
  recentActions: Array<{
    action: string;
    datasetId?: string;
    timestamp: number;
  }>;
}
```

**Dashboard Builder Agent:**
```typescript
{
  activeDashboardId?: string;
  lastQueryResult?: {
    rowCount: number;
    columns: string[];
  };
  recentWidgets: Array<{
    id: string;
    type: string;
    title: string;
  }>;
}
```

**Automation Agent:**
```typescript
{
  pendingAutomations: Array<{
    name: string;
    type: "threshold_alert" | "scheduled_report";
    status: "draft" | "testing" | "ready";
  }>;
  lastTestResult?: {
    success: boolean;
    message: string;
  };
}
```

### SQL Safety Validation

**Validation Rules:**
1. Query must start with SELECT
2. Block keywords: INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, PRAGMA, ATTACH, DETACH
3. Block SQL comments: `;--`, `/*`, `*/`
4. Block JOINs (per requirement)
5. Block multi-statement (semicolons)
6. Validate table names against org's dataset whitelist
7. Add LIMIT if missing (max 1000)

### Tool Patterns

**Standard Tool Structure:**
```typescript
export const toolName = createTool({
  id: 'tool-id',
  description: 'What the tool does',
  inputSchema: z.object({ /* Zod schema */ }),
  outputSchema: z.object({ /* Zod schema */ }),
  execute: async ({ context }) => {
    const auth = getAuthenticatedContext();
    const db = getOrgScopedDb();

    // Tool logic with org-scoped queries

    return { /* matches outputSchema */ };
  },
});
```

## Testing Strategy

### Unit Tests
- SQL validator (forbidden keywords, JOINs, multi-statement)
- Tool input/output validation
- Org ownership checks
- ID generation

### Integration Tests
- Agent conversations in Mastra Studio
- Tool chains (create dataset → create dashboard → add widget)
- Error handling paths
- Memory persistence

### Security Tests
- SQL injection attempts blocked
- Cross-org access prevented
- Table name whitelist enforced

## Definition of Done

### Functional Requirements
- ✅ Three agents implemented with factory functions
- ✅ All tools have Zod schemas for input/output
- ✅ SQL safety validator prevents dangerous operations
- ✅ Tools use auth context for org-scoped queries
- ✅ Agent memory persists in D1 storage
- ✅ Agents registered in both CLI and production modes

### Non-Functional Requirements
- ✅ Performance: Queries return in < 2 seconds
- ✅ Security: SQL injection impossible
- ✅ UX: Clear error messages for all failures
- ✅ DX: Tools documented with JSDoc comments

### Testing
- ✅ Unit tests pass for SQL validator
- ✅ Unit tests pass for all tools
- ✅ Integration tests pass in Mastra Studio
- ✅ Org isolation verified

## Files to Create

### Agent Files
- `src/mastra/agents/data-setup-agent.ts`
- `src/mastra/agents/dashboard-builder-agent.ts`
- `src/mastra/agents/automation-agent.ts`

### Tool Files
- `src/mastra/tools/shared/sql-validator.ts`
- `src/mastra/tools/data-setup-tools.ts`
- `src/mastra/tools/dashboard-builder-tools.ts`
- `src/mastra/tools/automation-tools.ts`

### Test Files
- `src/mastra/tools/shared/__tests__/sql-validator.test.ts`
- `src/mastra/tools/__tests__/data-setup-tools.test.ts`
- `src/mastra/tools/__tests__/dashboard-builder-tools.test.ts`
- `src/mastra/tools/__tests__/automation-tools.test.ts`

### Modified Files
- `src/mastra/index.ts` - Register three new agents

## Dependencies

- `@mastra/core` - Agent, Memory, createTool
- `@mastra/memory` - Working memory with D1 storage
- `zod` - Schema validation
- `@openrouter/ai-sdk-provider` - LLM provider (Claude 3.5 Sonnet)

## Rollback Plan

If issues arise:
1. Remove agent registrations from `src/mastra/index.ts`
2. Delete agent files from `src/mastra/agents/`
3. Delete tool files from `src/mastra/tools/`
4. Keep database schema (agents can be re-added later)
5. Test existing weatherAgent still works
