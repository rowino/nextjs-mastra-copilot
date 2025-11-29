---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
---

Goal: Implement the plan as defined in the specs and tasks files.

Execution steps:

1. Get the {feature} from the context or arguments. If not provided, ask the user.

2.  **Load Context**:
    - Read `.agents/specs/{feature}/tasks.md` for the execution plan.
    - Read `.agents/specs/{feature}/specs.md` for requirements.
    If files missing ask user to create-feature using `/create-feature` command.

3.  **Execute Phases**:
    - Iterate through each phase defined in `tasks.md`.
    - **Respect Dependencies**: Execute sequential tasks in order; parallel tasks [P] can run together.
    - **Update Progress**: After each task, mark it as [x] in `tasks.md`.

4.  **Checkpoints & Review**:
    - **Code Review**: After completing a phase (or a logical cluster of tasks), perform a code-review using coderabbit or ask the user for review.
    - **Commit & Compact**: If the review passes, offer to commit changes and compact the conversation history to maintain context window efficiency.

5.  **Completion**:
    - Verify all tasks in `tasks.md` are marked complete.
    - Confirm the implementation matches `specs.md`.

Behavior rules:

- Halt execution if a critical task fails.
- Ensure tests (if required) pass before marking a phase as complete.
