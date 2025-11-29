---
description: Analyze the provided implementation plan for critical risks, gaps, and inconsistencies.
---

Input: The implementation plan provided in the context or arguments.

Goal: Identify critical issues in the plan before execution.

Execution steps:

1.  **Analyze the Plan**: Review the provided plan for:
    *   **Completeness**: Are all requirements addressed?
    *   **Risks**: Are there security, performance, or data loss risks?
    *   **Clarity**: Are there ambiguous steps or "magic" solutions?
    *   **Consistency**: Do the steps follow a logical order?

2.  **Report Findings**: Output a concise analysis including:
    *   **Critical Issues**: Any "must-fix" problems (e.g., breaking changes, security flaws).
    *   **Gaps**: Missing pieces of the solution.
    *   **Suggestions**: Concrete improvements.

3.  **Verdict**: Explicitly state if the plan is **APPROVED** (safe to proceed) or **NEEDS REVISION**.

Behavior rules:
-   Focus on *critical* flaws first.
-   Be concise.
-   Do not hallucinate constraints not present in the plan or context.
