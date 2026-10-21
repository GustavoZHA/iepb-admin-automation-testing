# Agent Skills Architecture & Direct Entry Point Guide

This document establishes the architecture for AI and developer skills within the `.agents/skills/` directory, ensuring every skill has a single, unambiguous, and direct entry point.

---

## 🎯 The Direct Entry Point Principle

Every skill defined in this repository must provide a **single direct entry point**:

1. **Deterministic Discovery**: Each skill resides in its dedicated directory (`.agents/skills/<skill-name>/`) with exactly one primary instruction file: `SKILL.md`.
2. **Explicit Trigger Contract**: The YAML frontmatter clearly defines the skill's name and exact trigger purpose.
3. **Linear Workflow (Input -> Execution -> Output)**: The skill instructions proceed in a direct, sequential order without circular references or ambiguous conditions.
4. **Self-Contained Rules**: A skill must not require reading multiple peripheral files to understand its core execution rules.

---

## 📁 Standard Skill File Structure

Every skill follows this canonical format:

```text
.agents/skills/<skill-name>/
└── SKILL.md                 # Primary instruction file (Direct Entry Point)
```

### Frontmatter Standard
The top of every `SKILL.md` must declare:

```yaml
---
name: <unique-skill-name>
description: >-
  Concise statement of what this skill does and the exact scenario
  that triggers its activation.
---
```

---

## 🧭 Repository Skills Directory

| Skill Name | Direct Entry Point | Trigger Condition / Purpose |
| :--- | :--- | :--- |
| **`api-test-cases`** | [`.agents/skills/api-test-cases/SKILL.md`](file:///f:/Programming/GitHubCode-GutavoZHA/iepb-admin-automation-testing/.agents/skills/api-test-cases/SKILL.md) | Activated whenever writing or editing REST API tests. Enforces typed domain clients and prohibits raw HTTP calls. |
| **`test-steps-reporter`**| [`.agents/skills/test-steps-reporter/SKILL.md`](file:///f:/Programming/GitHubCode-GutavoZHA/iepb-admin-automation-testing/.agents/skills/test-steps-reporter/SKILL.md) | Activated when structuring test cases. Enforces the 3 standard tags (`@api`, `@ui`, `@backend`) and clean `test.step` blocks. |
| **`hooks-steps`** | [`.agents/skills/hooks-steps/SKILL.md`](file:///f:/Programming/GitHubCode-GutavoZHA/iepb-admin-automation-testing/.agents/skills/hooks-steps/SKILL.md) | Activated when creating or configuring test lifecycle hooks (`beforeAll`, `afterAll`). Ensures setup and teardown actions are visible in reports. |
| **`code-comments`** | [`.agents/skills/code-comments/SKILL.md`](file:///f:/Programming/GitHubCode-GutavoZHA/iepb-admin-automation-testing/.agents/skills/code-comments/SKILL.md) | Activated when authoring or reviewing code. Enforces English JSDoc/TSDoc on utilities and prohibits redundant or dead comments. |

---

## 🪜 Rules for Authoring New Skills

When adding a new skill to `.agents/skills/`:

1. **Single Entry File**: Put all foundational instructions directly in `SKILL.md`.
2. **Action-Oriented Checklist**: Include a direct table or numbered list summarizing strict constraints.
3. **One Canonical Example**: Provide a single, clean code snippet demonstrating correct implementation.
4. **Strict English**: All skill documentation and examples must be written in English.
