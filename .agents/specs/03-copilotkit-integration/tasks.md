# Tasks: CopilotKit Frontend Integration

## Phase 1: Root Layout Dynamic Agent Selection (1-2 hours)

**Cluster: Routing Infrastructure**

- [ ] **Task 1.1**: Convert root layout to client component
  - Open `src/app/layout.tsx`
  - Add `"use client"` directive at the very top (before imports)
  - Import `usePathname` from `'next/navigation'`
  - Verify all existing imports still work
  - Ensure CopilotKit imports are correct

- [ ] **Task 1.2**: Implement agent mapping logic
  - Inside component function, create agentMap object:
    ```typescript
    const agentMap: Record<string, string> = {
      '/datasets': 'dataSetupAgent',
      '/dashboards': 'dashboardBuilderAgent',
      '/automations': 'automationAgent',
      '/dashboard': 'weatherAgent',
    };
    ```
  - Call `const pathname = usePathname()`
  - Select agent: `const agent = agentMap[pathname] || 'weatherAgent'`
  - Update CopilotKit component: `<CopilotKit agent={agent} ...>`
  - Keep all other CopilotKit props (runtimeUrl, publicApiKey)

- [ ] **Task 1.3**: Test dynamic agent selection
  - Start dev server: `pnpm dev`
  - Open browser console
  - Navigate to `/dashboard` (existing page)
  - Verify no errors in console
  - Navigate to `/datasets` (will 404 for now, that's expected)
  - Check console for CopilotKit logs showing agent switch
  - Verify no page refresh occurs on navigation

**Definition of Done:**
- Agent changes automatically based on route
- No errors in console
- Smooth transitions between routes
- Existing pages still work

---

## Phase 2: Datasets Page (2-3 hours)

**Cluster: Dataset Management UI**

- [ ] **Task 2.1**: Create datasets page component
  - Create file `src/app/(protected)/datasets/page.tsx`
  - Add `"use client"` directive at top
  - Import necessary hooks and components:
    ```typescript
    import { useCoAgent } from "@copilotkit/react-core";
    import { CopilotSidebar } from "@copilotkit/react-ui";
    ```
  - Import type: `import type { DataSetupAgentState } from "@/mastra/agents/data-setup-agent"`
  - Export default function DatasetsPage

- [ ] **Task 2.2**: Implement useCoAgent state sync
  - Inside component, call useCoAgent:
    ```typescript
    const { state } = useCoAgent<typeof DataSetupAgentState>({
      name: "dataSetupAgent",
      initialState: { recentActions: [] },
    });
    ```
  - Note: Type inference from imported AgentState schema
  - state.activeDatasetId and state.recentActions now available

- [ ] **Task 2.3**: Create page layout structure
  - Add main container:
    ```tsx
    <div className="min-h-screen flex">
      <div className="flex-1 p-8">
        {/* Content area */}
      </div>
      {/* Sidebar will go here */}
    </div>
    ```
  - Inside content area, add:
    - Heading: `<h1 className="text-3xl font-bold text-white mb-6">Datasets</h1>`
    - Description: `<p className="text-white/70 mb-4">Manage your data sources and schemas</p>`
    - Placeholder comment: `{/* Future: Dataset list UI */}`

- [ ] **Task 2.4**: Add CopilotSidebar
  - After content div, add CopilotSidebar:
    ```tsx
    <CopilotSidebar
      defaultOpen={true}
      labels={{
        title: "Data Setup Assistant",
        initial: "I can help you manage datasets.\n\nTry:\n- Create a sales dataset\n- List all datasets\n- Show me the schema for a dataset"
      }}
    />
    ```

- [ ] **Task 2.5**: Test datasets page
  - Navigate to http://localhost:3000/datasets
  - Verify page renders with heading and description
  - Verify CopilotSidebar opens on the right
  - Verify chat interface is functional
  - Try typing: "Create a test dataset with id and name columns"
  - Verify agent responds (should work after agents are implemented)
  - Check state updates in React DevTools

**Definition of Done:**
- Datasets page renders correctly
- CopilotSidebar functional
- Agent state synchronizes
- UI styled consistently with app theme

---

## Phase 3: Dashboards Page with Generative UI (3-4 hours)

**Cluster: Dashboard Visualization UI**

- [ ] **Task 3.1**: Create dashboards page component
  - Create file `src/app/(protected)/dashboards/page.tsx`
  - Add `"use client"` directive
  - Import hooks: `useCoAgent`, `useCopilotAction`, `CopilotSidebar`
  - Import type: `import type { DashboardBuilderAgentState } from "@/mastra/agents/dashboard-builder-agent"`
  - Export default function DashboardsPage

- [ ] **Task 3.2**: Implement useCoAgent state sync
  - Call useCoAgent:
    ```typescript
    const { state } = useCoAgent<typeof DashboardBuilderAgentState>({
      name: "dashboardBuilderAgent",
      initialState: { recentWidgets: [] },
    });
    ```

- [ ] **Task 3.3**: Implement generative UI for run-query
  - Before return statement, call useCopilotAction:
    ```typescript
    useCopilotAction({
      name: "run-query", // Must match Mastra tool id exactly
      available: "frontend",
      render: ({ args, result, status }) => {
        // Show loading state
        if (status !== "complete" || !result) {
          return (
            <div className="text-white p-4">
              <div className="animate-pulse">Executing query...</div>
            </div>
          );
        }

        // Render query results as table
        return (
          <div className="bg-white/10 p-4 rounded-lg overflow-x-auto mt-4">
            <p className="text-white text-sm mb-2">
              {result.rowCount} rows returned in {result.executionTimeMs}ms
            </p>
            <table className="w-full text-white text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  {result.columns.map((col: string) => (
                    <th key={col} className="text-left p-2">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-white/10">
                    {result.columns.map((col: string) => (
                      <td key={col} className="p-2">
                        {JSON.stringify(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      },
    });
    ```

- [ ] **Task 3.4**: Create page layout structure
  - Add main container with content area
  - Add heading: "Dashboards"
  - Add description: "Build visualizations and run queries"
  - Add placeholder: `{/* Future: Dashboard grid with widgets */}`

- [ ] **Task 3.5**: Add CopilotSidebar
  - Add CopilotSidebar with dashboard-specific labels:
    ```tsx
    <CopilotSidebar
      defaultOpen={true}
      labels={{
        title: "Dashboard Builder",
        initial: "I can help you create visualizations.\n\nTry:\n- Show total sales\n- Create a line chart of revenue by month\n- Add a KPI widget"
      }}
    />
    ```

- [ ] **Task 3.6**: Test dashboards page with generative UI
  - Navigate to http://localhost:3000/dashboards
  - Verify page renders
  - Try query: "Show me all rows from the sales table"
  - Verify loading state appears during execution
  - Verify table renders with correct columns when complete
  - Verify execution time displays
  - Verify table scrolls horizontally on small screens
  - Try: "Create a dashboard called Q1 Sales"
  - Verify agent responds appropriately

**Definition of Done:**
- Dashboards page functional
- Generative UI renders query results as formatted tables
- Loading states work correctly
- Execution metrics displayed (time, row count)
- Agent responds to dashboard commands

---

## Phase 4: Automations Page (2-3 hours)

**Cluster: Automation Management UI**

- [ ] **Task 4.1**: Create automations page component
  - Create file `src/app/(protected)/automations/page.tsx`
  - Add `"use client"` directive
  - Import necessary hooks and types
  - Import type: `import type { AutomationAgentState } from "@/mastra/agents/automation-agent"`
  - Export default function AutomationsPage

- [ ] **Task 4.2**: Implement useCoAgent state sync
  - Call useCoAgent:
    ```typescript
    const { state } = useCoAgent<typeof AutomationAgentState>({
      name: "automationAgent",
      initialState: { pendingAutomations: [] },
    });
    ```

- [ ] **Task 4.3**: Create page layout structure
  - Add main container with content area
  - Add heading: "Automations"
  - Add description: "Set up alerts and scheduled reports"
  - Add placeholder: `{/* Future: Automation list with enable/disable toggles */}`

- [ ] **Task 4.4**: Add CopilotSidebar
  - Add CopilotSidebar with automation-specific labels:
    ```tsx
    <CopilotSidebar
      defaultOpen={true}
      labels={{
        title: "Automation Assistant",
        initial: "I can help you set up automations.\n\nTry:\n- Alert me when daily revenue drops below 1000\n- Email me a sales report every morning"
      }}
    />
    ```

- [ ] **Task 4.5**: Test automations page
  - Navigate to http://localhost:3000/automations
  - Verify page renders correctly
  - Try: "Alert me when total sales drops below 500"
  - Verify agent creates automation (check database or state)
  - Check state.pendingAutomations in React DevTools
  - Try: "Test the alert query"
  - Verify state.lastTestResult updates

**Definition of Done:**
- Automations page functional
- CopilotSidebar working
- Agent state tracks pending automations
- Test results visible in state
- Chat interface smooth

---

## Phase 5: Navigation & Protected Layout (1-2 hours)

**Cluster: Navigation Infrastructure**

- [ ] **Task 5.1**: Update protected layout navigation
  - Open `src/app/(protected)/layout.tsx`
  - Find existing navigation section (nav element)
  - Add new navigation links:
    ```tsx
    <nav className="flex items-center gap-6">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/datasets">Datasets</Link>
      <Link href="/dashboards">Dashboards</Link>
      <Link href="/automations">Automations</Link>
    </nav>
    ```
  - If no nav exists, create one with appropriate styling

- [ ] **Task 5.2**: Style active navigation state (optional enhancement)
  - Import `usePathname` from 'next/navigation'
  - Add `"use client"` if not already present
  - Create helper function:
    ```typescript
    const pathname = usePathname();
    const linkClass = (href: string) =>
      pathname === href
        ? "text-white font-semibold border-b-2 border-white"
        : "text-white/70 hover:text-white transition-colors";
    ```
  - Apply to Link components: `className={linkClass("/datasets")}`

- [ ] **Task 5.3**: Test navigation
  - Start dev server if not running
  - Click "Dashboard" link - verify existing page loads
  - Click "Datasets" link - verify datasets page loads
  - Click "Dashboards" link - verify dashboards page loads
  - Click "Automations" link - verify automations page loads
  - Verify active link is highlighted (if implemented)
  - Test browser back/forward buttons work correctly
  - Verify navigation persists after page refresh

**Definition of Done:**
- All navigation links work
- Active link visually distinct (if implemented)
- Agent switches correctly on navigation
- Protected layout enforces auth on all routes

---

## Phase 6: Integration Testing (2-3 hours)

**Cluster: End-to-End Validation**

- [ ] **Task 6.1**: Test complete datasets flow
  - Start `pnpm dev`
  - Sign in with test account
  - Navigate to `/datasets`
  - Create dataset: "Create sales dataset with date, amount, product columns"
  - Verify dataset created (check database or list datasets)
  - List datasets: "Show all my datasets"
  - Verify list displayed in chat
  - Update schema: "Add a country column to sales dataset"
  - Verify update successful
  - Delete dataset: "Delete the sales dataset"
  - Verify deleted

- [ ] **Task 6.2**: Test complete dashboards flow
  - Navigate to `/dashboards`
  - Create dashboard: "Create a dashboard called Sales Overview"
  - Verify dashboard created
  - Run query: "Show me total amount from sales table"
  - Verify generative UI table renders correctly
  - Check execution time displays
  - Add widget: "Add a KPI showing total sales"
  - Verify widget created in database

- [ ] **Task 6.3**: Test complete automations flow
  - Navigate to `/automations`
  - Create alert: "Alert me when sales drop below 100"
  - Verify automation created
  - Test automation: "Test the alert query"
  - Verify test result shown in chat
  - List automations: "Show all my automations"
  - Verify list displayed
  - Disable automation: "Disable the sales alert"
  - Verify disabled in database

- [ ] **Task 6.4**: Test agent switching
  - Open multiple browser tabs
  - Navigate each tab to different page (datasets, dashboards, automations)
  - Verify each has correct agent active
  - Switch between tabs rapidly
  - Verify no agent conflicts or errors
  - Verify conversation state persists per agent/page

- [ ] **Task 6.5**: Test error handling
  - In dashboards page, try invalid query: "DROP TABLE users"
  - Verify friendly error message displayed
  - Try accessing another org's data (create second test org)
  - Verify permission error shown
  - Disconnect internet (or use browser dev tools to simulate offline)
  - Try to send message
  - Verify connection error handled gracefully

- [ ] **Task 6.6**: Test mobile responsiveness
  - Open browser dev tools
  - Set viewport to mobile size (e.g., iPhone 12)
  - Navigate to each page
  - Verify CopilotSidebar adjusts (becomes modal/overlay on mobile)
  - Verify navigation accessible on mobile
  - Verify query result tables scroll horizontally
  - Test on actual mobile device if available

**Definition of Done:**
- All end-to-end flows work smoothly
- No console errors
- Error messages user-friendly
- Mobile responsive
- State persists correctly
- Agent switching seamless

---

## Estimated Timeline

- **Phase 1**: 1-2 hours
- **Phase 2**: 2-3 hours
- **Phase 3**: 3-4 hours
- **Phase 4**: 2-3 hours
- **Phase 5**: 1-2 hours
- **Phase 6**: 2-3 hours

**Total**: 11-17 hours (1.5-2 days)

---

## Testing Checklist

### Component Tests
- [ ] Datasets page renders heading and description
- [ ] Dashboards page renders heading and description
- [ ] Automations page renders heading and description
- [ ] All pages have CopilotSidebar
- [ ] useCoAgent initializes state correctly
- [ ] Generative UI renders loading state
- [ ] Generative UI renders query results

### E2E Tests
- [ ] Dataset creation flow complete
- [ ] Dashboard creation flow complete
- [ ] Automation creation flow complete
- [ ] Query result table renders correctly
- [ ] Agent switches on navigation
- [ ] Navigation persists across refresh
- [ ] Error scenarios handled gracefully

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible (basic check)
- [ ] Color contrast meets WCAG AA

---

## Code Reference

### Root Layout (src/app/layout.tsx)
```typescript
"use client";

import { usePathname } from 'next/navigation';
import { CopilotKit } from "@copilotkit/react-core";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const agentMap: Record<string, string> = {
    '/datasets': 'dataSetupAgent',
    '/dashboards': 'dashboardBuilderAgent',
    '/automations': 'automationAgent',
    '/dashboard': 'weatherAgent',
  };

  const agent = agentMap[pathname] || 'weatherAgent';

  return (
    <html lang="en">
      <body>
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent={agent}
          publicApiKey={process.env.NEXT_PUBLIC_COPILOTKIT_PUBLIC_KEY}
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

### Page Template
```typescript
"use client";

import { useCoAgent } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import type { AgentState } from "@/mastra/agents/agent-name";

export default function PageName() {
  const { state } = useCoAgent<typeof AgentState>({
    name: "agentName",
    initialState: { /* defaults */ },
  });

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Page Title</h1>
        <p className="text-white/70 mb-4">Description</p>
        {/* Content */}
      </div>
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "Assistant Title",
          initial: "Initial message with prompts"
        }}
      />
    </div>
  );
}
```
