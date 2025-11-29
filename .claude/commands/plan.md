---
description: Plan a new feature before implementing it. Consolidates specification, clarification, task generation, and analysis.
---

Goal: Create a comprehensive plan for a new feature, ensuring clarity, constitutional alignment, and a solid execution strategy.

Input: Feature description or existing plan.

## Step 1: Specify & Clarify

Goal: Define the feature requirements and resolve ambiguities.

Execution steps:

1.  **Input Handling**:
    -   If a feature description is provided, use it.
    -   If not, ask the user for the feature description.

2.  **Constitution Check**:
    -   Read `.specify/memory/constitution.md`. Ensure the feature aligns with core principles.

3.  **Clarification Loop**:
    -   Analyze the request for ambiguities (functional, data model, edge cases, etc.).
    -   Ask up to 5 targeted clarification questions if necessary.
    -   Update the understanding based on answers.

4.  **Create/Update Spec**:
    -   Create a new folder in `.agents/specs/{feature-slug}/`.
    -   Write requirements to `.agents/specs/{feature-slug}/specs.md`.

## Step 2: Define Tasks & Artifacts

Goal: Break down the feature into actionable tasks and supporting design documents.

Execution steps:

1.  **Generate Artifacts**:
    -   **Research**: (Optional) Create `.agents/specs/{feature-slug}/research.md` for technical decisions.
    -   **Data Model**: (Optional) Create `.agents/specs/{feature-slug}/data-model.md` for schema definitions.
    -   **Contracts**: (Optional) Create `.agents/specs/{feature-slug}/contracts/` for API specs.

2.  **Generate Tasks**:
    -   Create `.agents/specs/{feature-slug}/tasks.md`.
    -   **Phases**: Setup, Tests, Core, Integration, Polish.
    -   **Dependencies**: Order tasks logically (Setup -> Tests -> Core -> ...).
    -   **Parallelism**: Mark independent tasks with [P].

## Step 3: Analyze Plan

Goal: Review the generated plan for critical issues.

Execution steps:

1.  **Review**:
    -   **Completeness**: Are all requirements covered by tasks?
    -   **Consistency**: Do artifacts align?
    -   **Risks**: Security, performance, data loss?

2.  **Report**:
    -   List Critical Issues, Gaps, and Suggestions.
    -   Verdict: APPROVED or NEEDS REVISION.

## Step 4: Handoff

Goal: Transition to implementation.

Execution steps:

1.  **Instruction**:
    -   If the plan is APPROVED, instruct the user to run the `/implement` command to start building.
    -   Example: "Plan approved. Run `/implement` to start execution."
