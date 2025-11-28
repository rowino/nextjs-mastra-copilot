# Tasks: Mastra AI Agents & Tools

## Phase 1: Shared Tool Utilities (2-3 hours)

**Cluster: Foundation Utilities**

- [ ] **Task 1.1**: Create SQL validator module
  - Create `src/mastra/tools/shared/sql-validator.ts`
  - Export `SQLValidationError` class extending Error
  - Implement `validateSelectQuery(sql: string): void`
    - Normalize SQL to lowercase
    - Check starts with SELECT
    - Block forbidden keywords: insert, update, delete, drop, alter, create, truncate, pragma, attach, detach, `;--`, `/*`, `*/`
    - Block JOIN keyword
    - Block multi-statement (split by `;`, filter non-empty, check length > 1)
  - Implement `extractTableNames(sql: string): string[]`
    - Use regex to match `FROM table_name` pattern
    - Return array of table names
  - Implement `validateTableName(tableName: string, allowedTables: string[]): void`
    - Check if tableName in allowedTables
    - Throw SQLValidationError with available tables if not found

- [ ] **Task 1.2**: Write SQL validator unit tests
  - Create `src/mastra/tools/shared/__tests__/sql-validator.test.ts`
  - Test: valid SELECT query passes
  - Test: INSERT query throws SQLValidationError
  - Test: UPDATE query throws SQLValidationError
  - Test: DELETE query throws SQLValidationError
  - Test: JOIN query throws SQLValidationError
  - Test: multi-statement query throws SQLValidationError
  - Test: SQL comment (`--`) throws SQLValidationError
  - Test: extractTableNames extracts correct table
  - Test: validateTableName passes for whitelisted table
  - Test: validateTableName throws for non-whitelisted table

- [ ] **Task 1.3**: Review org-scoped utilities
  - Verify `src/mastra/tools/shared/org-scoped-db.ts` exists from Phase 1
  - Add JSDoc comments for all exported functions
  - Test functions work as expected

**Definition of Done:**
- SQL validator blocks all dangerous operations
- Unit tests pass with 100% coverage
- Clear error messages for each validation failure

---

## Phase 2: Data Setup Agent (4-5 hours)

**Cluster: Dataset Management Agent**

- [ ] **Task 2.1**: Create Data Setup Agent
  - Create `src/mastra/agents/data-setup-agent.ts`
  - Import Agent, Memory, MastraStorage, openrouter, z
  - Define `DataSetupAgentState` Zod schema:
    ```typescript
    z.object({
      activeDatasetId: z.string().optional(),
      recentActions: z.array(z.object({
        action: z.string(),
        datasetId: z.string().optional(),
        timestamp: z.number(),
      })).default([]),
    })
    ```
  - Write system instructions (multi-line string):
    - Role: Data Setup Agent
    - Purpose: Help users create and manage dataset definitions
    - Guidelines: Validate table names, confirm deletions, explain schema impact
  - Export `getDataSetupAgent(storage: MastraStorage)` factory function
  - Return new Agent with:
    - name: "dataSetupAgent"
    - tools: { createDataset, listDatasets, getDataset, updateDatasetSchema, deleteDataset }
    - model: openrouter("anthropic/claude-3.5-sonnet")
    - instructions: system instructions string
    - memory: new Memory with storage, workingMemory enabled, schema

- [ ] **Task 2.2**: Implement createDataset tool
  - Create `src/mastra/tools/data-setup-tools.ts`
  - Import createTool, z, org utilities, dataset schema, eq, and
  - Define `ColumnDefSchema` with z.object:
    - name: z.string()
    - type: z.enum(['text', 'integer', 'decimal', 'date', 'boolean'])
    - nullable: z.boolean().default(true)
    - description: z.string().optional()
  - Export `createDataset` tool:
    - id: 'create-dataset'
    - description: 'Create a new dataset definition mapping to a D1 table'
    - inputSchema: name, tableName (regex validated), description?, schema[], sampleData?
    - outputSchema: id, name, tableName, message
    - execute async function:
      - Get auth context and db
      - Validate tableName regex: `/^[a-zA-Z0-9_]+$/`
      - Check for duplicate tableName in org
      - Generate ID with `generateId('ds')`
      - Insert into dataset table with all fields
      - Return success message

- [ ] **Task 2.3**: Implement listDatasets tool
  - Export `listDatasets` tool:
    - id: 'list-datasets'
    - description: 'List all datasets in the organization'
    - inputSchema: z.object({}) (empty)
    - outputSchema: datasets[], count
    - execute: Query dataset table WHERE orgId, return results

- [ ] **Task 2.4**: Implement getDataset tool
  - Export `getDataset` tool:
    - id: 'get-dataset'
    - description: 'Get dataset details including schema and sample data'
    - inputSchema: datasetId (string)
    - outputSchema: full dataset record
    - execute: Query by id, validate org ownership, return record

- [ ] **Task 2.5**: Implement updateDatasetSchema tool
  - Export `updateDatasetSchema` tool:
    - id: 'update-dataset-schema'
    - description: 'Update dataset schema definition'
    - inputSchema: datasetId, schema[]
    - outputSchema: success message
    - execute: Validate ownership, update schema column, update updatedAt

- [ ] **Task 2.6**: Implement deleteDataset tool
  - Export `deleteDataset` tool:
    - id: 'delete-dataset'
    - description: 'Delete a dataset (checks for widget usage first)'
    - inputSchema: datasetId (string)
    - outputSchema: success message
    - execute: Validate ownership, check widget references, delete if safe

- [ ] **Task 2.7**: Register agent in Mastra instance
  - Open `src/mastra/index.ts`
  - Import `getDataSetupAgent` from agents file
  - Add to CLI mode agents object: `dataSetupAgent: getDataSetupAgent(cliStorage)`
  - Add to production mode: `dataSetupAgent: getDataSetupAgent(d1Storage)`

**Definition of Done:**
- Data Setup Agent responds to natural language dataset requests
- All 5 tools work correctly
- Agent registered in both modes
- Tools validate org ownership

---

## Phase 3: Dashboard Builder Agent (5-6 hours)

**Cluster: Query & Visualization Agent**

- [ ] **Task 3.1**: Create Dashboard Builder Agent
  - Create `src/mastra/agents/dashboard-builder-agent.ts`
  - Define `DashboardBuilderAgentState` Zod schema with activeDashboardId, lastQueryResult, recentWidgets
  - Write system instructions emphasizing SQL safety, dataset queries, widget types
  - Export `getDashboardBuilderAgent(storage)` factory function

- [ ] **Task 3.2**: Implement runQuery tool (CRITICAL)
  - Create `src/mastra/tools/dashboard-builder-tools.ts`
  - Import validation functions, dataset schema, getCloudflareContext
  - Export `runQuery` tool:
    - id: 'run-query'
    - description: 'Execute a safe SELECT query against datasets'
    - inputSchema: query (string), limit (number, min 1, max 1000, default 100)
    - outputSchema: rows[], rowCount, columns[], executionTimeMs
    - execute async function:
      - Get auth context and db
      - Start timer
      - Call `validateSelectQuery(query)`
      - Get org's datasets to build allowedTables array
      - Call `extractTableNames(query)` and validate each
      - Add LIMIT to query if not present
      - Execute via D1: `env.D1Database.prepare(query).all()`
      - Extract columns from first row
      - Calculate execution time
      - Return structured result

- [ ] **Task 3.3**: Implement createDashboard tool
  - Export `createDashboard` tool:
    - id: 'create-dashboard'
    - inputSchema: name, description?
    - outputSchema: id, name, message
    - execute: Generate ID, insert into dashboard table with orgId

- [ ] **Task 3.4**: Implement listDashboards tool
  - Export `listDashboards` tool:
    - id: 'list-dashboards'
    - inputSchema: empty
    - outputSchema: dashboards[], count
    - execute: Query dashboards WHERE orgId

- [ ] **Task 3.5**: Implement getDashboard tool
  - Export `getDashboard` tool:
    - id: 'get-dashboard'
    - inputSchema: dashboardId
    - outputSchema: dashboard with widgets array
    - execute: Query dashboard + widgets, validate ownership

- [ ] **Task 3.6**: Implement createWidget tool
  - Export `createWidget` tool:
    - id: 'create-widget'
    - inputSchema: dashboardId, datasetId, title, type, config (with SQL)
    - outputSchema: widget record
    - execute: Validate dashboard and dataset ownership, test config.sql with runQuery, insert widget

- [ ] **Task 3.7**: Implement updateWidget tool
  - Export `updateWidget` tool:
    - id: 'update-widget'
    - inputSchema: widgetId, title?, config?
    - outputSchema: updated widget
    - execute: Validate ownership, test SQL if changed, update record

- [ ] **Task 3.8**: Implement deleteWidget tool
  - Export `deleteWidget` tool:
    - id: 'delete-widget'
    - inputSchema: widgetId
    - outputSchema: success message
    - execute: Validate ownership, delete widget

- [ ] **Task 3.9**: Register agent in Mastra instance
  - Import `getDashboardBuilderAgent`
  - Add to both CLI and production agents objects

**Definition of Done:**
- Dashboard Builder Agent generates and executes safe SQL
- runQuery validates and executes correctly
- CRUD operations for dashboards and widgets work
- SQL validation prevents dangerous operations

---

## Phase 4: Automation Agent (4-5 hours)

**Cluster: Alerts & Scheduling Agent**

- [ ] **Task 4.1**: Create Automation Agent
  - Create `src/mastra/agents/automation-agent.ts`
  - Define `AutomationAgentState` Zod schema with pendingAutomations, lastTestResult
  - Write system instructions emphasizing automation types, query testing, email defaults
  - Export `getAutomationAgent(storage)` factory function

- [ ] **Task 4.2**: Implement testAutomation tool
  - Create `src/mastra/tools/automation-tools.ts`
  - Import validation functions and runQuery tool
  - Export `testAutomation` tool:
    - id: 'test-automation'
    - description: 'Test an automation query to ensure it returns valid results'
    - inputSchema: query, type (threshold_alert | scheduled_report)
    - outputSchema: valid (boolean), sampleResult?, error?, message
    - execute async function:
      - Call validateSelectQuery
      - Execute query with runQuery (limit 5)
      - If type === 'threshold_alert', validate 1 row, 1 column
      - Return validation result with sample data

- [ ] **Task 4.3**: Implement createAutomation tool
  - Export `createAutomation` tool:
    - id: 'create-automation'
    - inputSchema: name, description?, type, config (complex union type)
    - outputSchema: automation record
    - execute: Call testAutomation first, throw if invalid, insert automation

- [ ] **Task 4.4**: Implement listAutomations tool
  - Export `listAutomations` tool:
    - id: 'list-automations'
    - inputSchema: empty
    - outputSchema: automations[], count
    - execute: Query automations WHERE orgId

- [ ] **Task 4.5**: Implement getAutomation tool
  - Export `getAutomation` tool:
    - id: 'get-automation'
    - inputSchema: automationId
    - outputSchema: automation record
    - execute: Query by id, validate ownership

- [ ] **Task 4.6**: Implement updateAutomation tool
  - Export `updateAutomation` tool:
    - id: 'update-automation'
    - inputSchema: automationId, name?, description?, config?
    - outputSchema: updated automation
    - execute: Validate ownership, test query if config changed, update

- [ ] **Task 4.7**: Implement toggleAutomation tool
  - Export `toggleAutomation` tool:
    - id: 'toggle-automation'
    - inputSchema: automationId, enabled (boolean)
    - outputSchema: success message
    - execute: Validate ownership, update enabled column

- [ ] **Task 4.8**: Implement deleteAutomation tool
  - Export `deleteAutomation` tool:
    - id: 'delete-automation'
    - inputSchema: automationId
    - outputSchema: success message
    - execute: Validate ownership, delete (cascade deletes runs)

- [ ] **Task 4.9**: Implement listAutomationRuns tool
  - Export `listAutomationRuns` tool:
    - id: 'list-automation-runs'
    - inputSchema: automationId? (optional filter)
    - outputSchema: runs[] with execution details
    - execute: Query automation_run WHERE orgId, filter by automationId if provided, order by executedAt DESC, limit 100

- [ ] **Task 4.10**: Register agent in Mastra instance
  - Import `getAutomationAgent`
  - Add to both CLI and production agents objects

**Definition of Done:**
- Automation Agent creates alerts and scheduled reports
- testAutomation validates queries before saving
- Threshold alerts require single numeric value
- CRUD operations work
- Automation runs tracked

---

## Phase 5: Integration & Testing (3-4 hours)

**Cluster: End-to-End Validation**

- [ ] **Task 5.1**: Test Data Setup Agent in CLI
  - Run `pnpm mastra:dev`
  - Access Mastra Studio at http://localhost:4111
  - Select dataSetupAgent
  - Test conversation: "Create a sales dataset with date, amount, country columns"
  - Verify dataset created in database
  - Test: "List all datasets"
  - Test: "Show me the sales dataset schema"
  - Test: "Delete the sales dataset"

- [ ] **Task 5.2**: Test Dashboard Builder Agent in CLI
  - Select dashboardBuilderAgent in Mastra Studio
  - First create test dataset if needed
  - Test: "Show me all rows from the sales table"
  - Verify SQL query generated and executed safely
  - Check query results returned
  - Test: "Create a dashboard called Monthly Sales"
  - Test: "Add a metric widget showing total amount"
  - Verify widget created with correct SQL in config

- [ ] **Task 5.3**: Test Automation Agent in CLI
  - Select automationAgent in Mastra Studio
  - Test: "Alert me when total sales drops below 1000"
  - Verify automation created with correct config
  - Test: "Test the alert query"
  - Check test result is valid
  - Test: "Disable the alert"
  - Test: "List all automations"

- [ ] **Task 5.4**: Test SQL safety validation
  - In dashboardBuilderAgent, try: "DROP TABLE users"
  - Verify blocked with SQLValidationError
  - Try: "UPDATE sales SET amount = 0"
  - Verify blocked
  - Try: "SELECT * FROM users JOIN orders"
  - Verify blocked (no JOINs allowed)
  - Try: "SELECT * FROM sales; DROP TABLE users"
  - Verify multi-statement blocked

- [ ] **Task 5.5**: Test org isolation
  - Create two test user accounts with different organizations
  - In org A, create dataset
  - Switch to org B context (sign in as second user)
  - Try to access org A's dataset via getDataset tool
  - Verify OrgPermissionError thrown

- [ ] **Task 5.6**: Test agent memory persistence
  - Use Data Setup Agent, create dataset
  - Check `recentActions` in agent state
  - Close and reopen Mastra Studio (or refresh if in dev mode with D1)
  - Verify state persists if using D1 storage
  - Note: CLI mode uses in-memory storage, so state won't persist across restarts

**Definition of Done:**
- All three agents work in Mastra Studio CLI
- Natural language correctly converted to tool calls
- SQL safety prevents dangerous operations
- Org isolation prevents cross-org access
- Agent memory works as expected

---

## Estimated Timeline

- **Phase 1**: 2-3 hours
- **Phase 2**: 4-5 hours
- **Phase 3**: 5-6 hours
- **Phase 4**: 4-5 hours
- **Phase 5**: 3-4 hours

**Total**: 18-23 hours (2.5-3 days)

---

## Testing Checklist

### SQL Validator Unit Tests
- [ ] Valid SELECT passes
- [ ] INSERT blocked
- [ ] UPDATE blocked
- [ ] DELETE blocked
- [ ] DROP blocked
- [ ] ALTER blocked
- [ ] CREATE blocked
- [ ] JOIN blocked
- [ ] Multi-statement blocked
- [ ] SQL comments blocked
- [ ] Table name extraction works
- [ ] Table name validation works

### Tool Integration Tests
- [ ] createDataset with valid input succeeds
- [ ] createDataset with invalid table name fails
- [ ] createDataset with duplicate fails
- [ ] listDatasets returns only org's datasets
- [ ] runQuery with safe SQL succeeds
- [ ] runQuery with dangerous SQL blocked
- [ ] runQuery validates table names
- [ ] runQuery adds LIMIT if missing
- [ ] testAutomation validates threshold queries
- [ ] createAutomation tests query first

### Agent Conversation Tests
- [ ] Data Setup Agent creates datasets
- [ ] Dashboard Builder Agent runs queries
- [ ] Automation Agent creates alerts
- [ ] All agents maintain state across turns
- [ ] All agents provide helpful error messages
- [ ] All agents follow system instructions

### Security Tests
- [ ] SQL injection attempts blocked
- [ ] Cross-org access prevented
- [ ] Ownership validation enforced
- [ ] Auth context required for tools
