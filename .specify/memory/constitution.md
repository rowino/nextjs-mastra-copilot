<!--
Sync Impact Report:
Version: 1.3.0
Changes:
- Added VI. UI Component Standards principle requiring shadcn/ui usage
- Mandates using shadcn/ui components for common UI patterns (buttons, forms, dropdowns, etc.)
- Custom components only when shadcn/ui doesn't provide the pattern

Previous versions:
- 1.2.0: Added src/app/contracts/ directory for Zod schemas and API contracts
- 1.1.0: Updated Code Organization Standards to reflect Next.js app directory structure
- 1.0.0: Initial constitution creation

Templates Status:
✅ plan-template.md - Reviewed, constitution check section aligns
✅ spec-template.md - Reviewed, requirements align with principles
✅ tasks-template.md - Reviewed, task categorization supports TDD and type-safety
✅ agent-file-template.md - Reviewed, compatible with principles

Follow-up TODOs: None
-->

# Mastra + CopilotKit Starter Constitution

## Core Principles

### I. AI-First Development
Every feature MUST leverage Mastra's AI capabilities through well-defined agents, tools, and workflows. AI functionality is not an add-on but the foundation of feature design. Direct LLM calls without proper Mastra abstractions are prohibited unless justified for prototyping.

**Rationale**: This project exists to demonstrate AI-native development patterns. Features that bypass Mastra's architecture provide no learning value to users of this starter template.

### II. Type-Safe Contracts
All agent tools, API endpoints, and data models MUST use Zod schemas for runtime validation. TypeScript types alone are insufficient. Every external boundary (API routes, tool parameters, LLM responses) requires explicit schema validation.

**Rationale**: LLM outputs and external inputs are inherently unpredictable. Runtime validation prevents silent failures and provides clear error messages during development and production.

### III. Developer Experience (DX) First
Configuration MUST work out-of-the-box with sensible defaults. Required setup steps MUST be documented in README with working examples. Breaking changes to environment variables or project structure require migration guides.

**Requirements**:
- Environment variable changes → Update README and provide .env.example
- New dependencies → Document installation and purpose
- Configuration changes → Preserve backward compatibility or provide clear upgrade path
- Error messages → Include actionable next steps

**Rationale**: As a starter template, poor DX directly impacts adoption. Users evaluate quality within first 5 minutes of setup.

### IV. Observable AI Systems
All agent executions, tool calls, and LLM requests MUST be observable. Development mode MUST support debug logging via LOG_LEVEL environment variable. Production deployments MUST support structured logging for agent traces.

**Required observability**:
- Agent execution start/end with input/output
- Tool invocations with parameters and results
- LLM token usage and latency
- Error context (agent state, conversation history)

**Rationale**: AI systems fail opaquely. Without observability, debugging "the AI didn't work" is impossible.

### V. Progressive Enhancement
Core functionality MUST work without JavaScript where possible. UI components MUST render server-side first. Client-side AI features (CopilotKit) enhance but don't replace basic functionality.

**Hierarchy**:
1. Server-rendered content (accessible, fast)
2. Server actions for mutations (works without JS)
3. Client components for real-time AI (enhanced experience)

**Rationale**: Demonstrates modern Next.js patterns (App Router, Server Components). Ensures accessibility and performance baselines.

### VI. UI Component Standards
All UI components MUST use shadcn/ui when a component exists for the pattern. Custom UI components are only permitted when shadcn/ui does not provide the required pattern or when significant customization beyond shadcn's flexibility is needed.

**Required shadcn/ui usage for**:
- Buttons, inputs, forms, labels
- Dropdowns, selects, comboboxes
- Dialogs, modals, popovers, tooltips
- Cards, badges, alerts
- Tables, tabs, accordions
- Navigation menus, breadcrumbs
- Date pickers, calendars
- Command palette, search

**Custom components allowed for**:
- Domain-specific visualizations (charts unique to your app)
- AI-specific UI (CopilotKit components, generative UI renders)
- Highly branded/stylized components beyond shadcn customization

**Installation process**:
```bash
npx shadcn@latest add <component-name>
```

**Rationale**: Ensures consistent design system, accessibility compliance (shadcn uses Radix UI primitives), and faster development. Demonstrates modern component architecture and design system integration in starter template.

## Development Workflow

### Feature Development Process
1. **Specification**: Define feature requirements without implementation details
2. **Design**: Create Mastra agent/tool contracts, Zod schemas, API shapes
3. **Test-First**: Write integration tests for agent behaviors and tool outputs
4. **Implement**: Build features to pass tests, following TDD cycle
5. **Validate**: Ensure observability works, update README if needed

### Code Organization Standards
```
src/
├── mastra/
│   ├── index.ts          # Mastra instance configuration
│   ├── agents/           # Agent definitions
│   │   └── index.ts
│   └── tools/            # Tool implementations
│       └── index.ts
├── app/                  # Next.js App Router
│   ├── api/              # API routes (CopilotKit integration)
│   ├── components/       # Reusable UI components
│   ├── contracts/        # Zod schemas for API contracts and data models
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React context providers
│   ├── utils/            # Utility functions and helpers (shadcn/ui, etc.)
│   ├── services/         # API service calls and data fetching
│   ├── constants/        # Constant values used across the app
│   ├── assets/           # Images, icons, and other assets
│   ├── layouts/          # Layout components for consistent design
│   └── [pages]           # UI pages and routes
├── lib/                  # Utilities shared across app & mastra
```

**Constraints**:
- Agent definitions belong in `src/mastra/agents/`
- Tool implementations in `src/mastra/tools/`
- **Zod schemas and contracts belong in `src/app/contracts/`** (organized by domain/feature)
- API routes only for CopilotKit runtime and external integrations
- No business logic in API routes (delegate to tools/agents)
- UI components in `src/app/components/` (organized by feature or ui/)
- Custom hooks in `src/app/hooks/`
- Context providers in `src/app/contexts/`
- Utility functions in `src/app/utils/`
- API client code in `src/app/services/`
- App-wide constants in `src/app/constants/`
- Static assets in `src/app/assets/`
- Layout components in `src/app/layouts/`

### Testing Requirements
- **Integration tests**: Required for all new agents and tools
- **Contract tests**: Required for API endpoints
- **Unit tests**: Optional for pure utility functions
- **Manual testing**: Update quickstart.md with new feature flows

**Test execution gates**:
- All tests MUST pass before commit
- New features require corresponding test coverage
- Breaking changes require test updates in same commit

## Quality Gates

### Pre-Commit Checklist
- [ ] TypeScript compilation passes (`pnpm build` or equivalent)
- [ ] All tests pass
- [ ] Zod schemas validate all external inputs
- [ ] Environment variables documented in README
- [ ] Debug logging works with `LOG_LEVEL=debug`
- [ ] No `@claude` comments remain in code
- [ ] UI components use shadcn/ui when available

### Code Review Requirements
- Constitutional compliance (AI-first, type-safe, observable)
- Schema validation at boundaries
- Error handling provides actionable messages
- Breaking changes include migration guidance
- New dependencies justified (size, maintenance, alternatives considered)

### Definition of Done
- Feature works in production build (`pnpm build && pnpm start`)
- README updated if configuration changed
- Example usage added or existing examples work
- No console errors in browser or terminal
- Observability demonstrates feature works (logs/traces available)

## Governance

### Amendment Procedure
1. Propose change via pull request to constitution.md
2. Justify: What problem does this solve? What's the cost?
3. Update affected templates (plan, spec, tasks) in same PR
4. Increment version according to semantic rules
5. Document in Sync Impact Report

### Versioning Policy
- **MAJOR**: Remove or redefine core principles (rare)
- **MINOR**: Add new principle or expand existing guidance
- **PATCH**: Clarify wording, fix typos, refine examples

### Compliance Review
- All feature planning MUST reference constitution version
- Plan template enforces Constitution Check section
- Deviations require documentation in Complexity Tracking table
- Repeated deviations trigger constitutional review (principle may need revision)

### Runtime Development Guidance
Agent-specific instructions for active development sessions are maintained separately (e.g., `CLAUDE.md`, `.github/copilot-instructions.md`). These files reference this constitution but contain tactical, session-specific context that changes frequently.

**Version**: 1.3.0 | **Ratified**: 2025-10-02 | **Last Amended**: 2025-10-02
