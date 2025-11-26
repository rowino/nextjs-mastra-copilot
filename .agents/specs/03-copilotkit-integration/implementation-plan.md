# Implementation Plan: CopilotKit Frontend Integration

## Feature Overview

Integrate three Mastra agents with CopilotKit frontend via dynamic agent selection, create dedicated UI pages for each agent, implement generative UI for query results, and add navigation.

## User Stories

### US-1: Dynamic Agent Routing
**As a** user
**I want to** different AI agents activated based on which page I'm on
**So that** I get contextual help for each feature

**Acceptance Criteria:**
- ✅ `/datasets` page connects to dataSetupAgent
- ✅ `/dashboards` page connects to dashboardBuilderAgent
- ✅ `/automations` page connects to automationAgent
- ✅ `/dashboard` page keeps weatherAgent (existing)
- ✅ Single `/api/copilotkit` route handles all agents
- ✅ Agent selection based on pathname in root layout
- ✅ No page refresh needed when switching agents

### US-2: Datasets Page
**As a** user
**I want to** manage my datasets through a conversational interface
**So that** I can define data sources for dashboards

**Acceptance Criteria:**
- ✅ Page shows "Datasets" heading and description
- ✅ CopilotSidebar shows helpful prompts
- ✅ Agent state synchronized via useCoAgent hook
- ✅ Recent actions visible in agent state
- ✅ Chat interface works smoothly

### US-3: Dashboards Page with Generative UI
**As a** user
**I want to** see query results rendered as tables automatically
**So that** I can visualize data without manual formatting

**Acceptance Criteria:**
- ✅ Page shows "Dashboards" heading and description
- ✅ CopilotSidebar shows helpful prompts
- ✅ `run-query` tool renders custom UI component
- ✅ Query results shown in formatted table
- ✅ Execution time displayed
- ✅ Row count displayed
- ✅ Loading state shown during query execution
- ✅ Agent state includes lastQueryResult

### US-4: Automations Page
**As a** user
**I want to** create alerts and scheduled reports through conversation
**So that** I'm notified about important changes

**Acceptance Criteria:**
- ✅ Page shows "Automations" heading and description
- ✅ CopilotSidebar shows helpful prompts
- ✅ Agent state includes pendingAutomations
- ✅ Last test result visible in agent state
- ✅ Chat interface works smoothly

### US-5: Navigation
**As a** user
**I want to** easily navigate between different sections
**So that** I can access all features

**Acceptance Criteria:**
- ✅ Navigation bar shows: Dashboard, Datasets, Dashboards, Automations
- ✅ Active link highlighted
- ✅ Links work in protected layout
- ✅ Auth required for all routes

## Technical Architecture

### Routing Architecture

```
Root Layout (src/app/layout.tsx)
├── usePathname() detects current route
├── agentMap: { '/datasets': 'dataSetupAgent', ... }
├── <CopilotKit agent={selectedAgent}>
│
├── /datasets → dataSetupAgent
├── /dashboards → dashboardBuilderAgent
├── /automations → automationAgent
└── /dashboard → weatherAgent (existing)
```

### Page Component Pattern

```typescript
"use client";

import { useCoAgent } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

export default function Page() {
  const { state } = useCoAgent<AgentState>({
    name: "agentName",
    initialState: { /* default state */ },
  });

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 p-8">
        {/* Main content */}
      </div>
      <CopilotSidebar defaultOpen={true} labels={{ ... }} />
    </div>
  );
}
```

### Generative UI Pattern

```typescript
useCopilotAction({
  name: "tool-name", // Must match Mastra tool id
  available: "frontend",
  render: ({ args, result, status }) => {
    if (status !== "complete") {
      return <LoadingState />;
    }
    return <CustomUIComponent data={result} />;
  },
});
```

## CopilotKit Configuration

### Environment Variables
```bash
NEXT_PUBLIC_COPILOTKIT_PUBLIC_KEY=your_key_here
```

### Runtime Setup
- Single `/api/copilotkit` endpoint
- Uses `MastraAgent.getLocalAgents({ mastra })` to auto-expose all agents
- No per-agent routes needed
- Agent selected dynamically based on frontend page

### State Synchronization
- `useCoAgent` hook syncs agent state to frontend
- State persists in D1 storage (configured in Mastra instance)
- Thread-based conversation history
- State scoped by user + agent name

## Testing Strategy

### Component Tests
- Page rendering (headings, descriptions)
- CopilotSidebar presence
- Agent state initialization
- Generative UI rendering

### E2E Tests
- Complete dataset creation flow
- Query result rendering
- Agent switching on navigation
- Error handling

### Integration Tests
- Agent state synchronization
- Tool call → UI update flow
- Navigation state persistence

## Definition of Done

### Functional Requirements
- ✅ Dynamic agent selection based on route
- ✅ Three new pages: /datasets, /dashboards, /automations
- ✅ All pages have CopilotSidebar with contextual prompts
- ✅ Dashboards page has generative UI for query results
- ✅ Agent state synchronized via useCoAgent
- ✅ Navigation links added and working
- ✅ Active navigation state highlighted

### Non-Functional Requirements
- ✅ Performance: Page transitions instant (< 100ms)
- ✅ UX: Smooth chat interactions, no lag
- ✅ Mobile: Responsive design works on all viewports
- ✅ Accessibility: Keyboard navigation works

### Testing
- ✅ Component tests pass for all pages
- ✅ E2E tests pass for complete flows
- ✅ Manual testing on multiple devices
- ✅ Error scenarios handled gracefully

## Files to Create

### Page Components
- `src/app/(protected)/datasets/page.tsx`
- `src/app/(protected)/dashboards/page.tsx`
- `src/app/(protected)/automations/page.tsx`

### Modified Files
- `src/app/layout.tsx` - Dynamic agent selection
- `src/app/(protected)/layout.tsx` - Navigation links

### Test Files
- `src/app/(protected)/datasets/__tests__/page.test.tsx`
- `src/app/(protected)/dashboards/__tests__/page.test.tsx`
- `src/app/(protected)/automations/__tests__/page.test.tsx`
- `e2e/agents.spec.ts`

## Styling Guidelines

### Tailwind Classes
- Background: `bg-white/10` for cards
- Text: `text-white` primary, `text-white/70` secondary
- Borders: `border-white/20`
- Spacing: `p-8` for page padding, `p-4` for card padding
- Rounded: `rounded-lg` for cards

### Responsive Design
- Mobile: CopilotSidebar becomes modal/overlay
- Tablet: Sidebar adjusts width
- Desktop: Full sidebar visible
- Query result tables: Horizontal scroll on small screens

## Dependencies

- `@copilotkit/react-core` - useCoAgent, useCopilotAction hooks
- `@copilotkit/react-ui` - CopilotSidebar component
- `next/navigation` - usePathname hook
- `next/link` - Link component

## Future Enhancements (Not in Scope)

- Real-time collaboration on dashboards
- Dashboard layout drag-and-drop
- Widget preview before saving
- Automation run history visualization
- Dataset schema editor UI
- Export dashboard as PDF
- Share dashboard via link
- Email template visual editor

## Rollback Plan

If issues arise:
1. Revert layout.tsx to original (remove dynamic agent selection)
2. Delete new page components
3. Restore original navigation
4. Agents and backend remain functional
5. Only frontend impacted
