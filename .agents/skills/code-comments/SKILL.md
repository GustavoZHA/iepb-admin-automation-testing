---
name: code-comments
description: >-
  Standard and conventions for writing maintainable code comments, JSDoc/TSDoc
  documentation, and inline annotations across the test automation framework.
---

# Skill: Code Comments & Documentation Standards (`code-comments`)

Standard for writing clean, high-value code comments across the automation framework without visual clutter or redundant noise.

---

## 🎯 Core Principles

1. **Self-Descriptive Methods Require No Comments:**
   - If a method name clearly describes what it does (e.g., `get(endpoint)`, `delete(id)`, `close()`, `getByIndex(i)`), do **NOT** add a comment.
2. **Clear Types Require No `@param` or `@returns`:**
   - When TypeScript parameter names and return types are self-evident, do **NOT** add redundant `@param` or `@returns` tags.
3. **Language:** All comments, docstrings, and annotations must be in **English**.
4. **Explain "Why", Not "What":** Code explains *what* happens; comments should strictly explain non-obvious business rules, algorithms, or database catalog mappings.
5. **No Redundancy with `test.step`:** `test.step` already documents test execution. Never write comments that duplicate the step title.
6. **Zero Dead Code:** Never leave commented-out code blocks.

---

## 📚 When to Comment vs When NOT to Comment

### ❌ Redundant Comments (Prohibited)
```typescript
// BAD: Method and signature are already completely self-descriptive
/**
 * Executes a GET request against the specified endpoint.
 * @param endpoint - Relative API path
 * @param options - Optional headers
 */
get(endpoint: string, options?: RequestOptions) { ... }

// BAD: Duplicates the test step title
// Send POST request to /api/members
await test.step('Send POST request to /api/members', async () => { ... });
```

### ✔️ High-Value Comments (Allowed)
Use comments only when the logic, formula, or constraint cannot be deduced from the name and type alone:

```typescript
// Gender catalog ID: 0 = Male, 1 = Female (mapped to database Lookups catalog)
genderId: 1,

// Conversion age is capped to prevent conversionDate from exceeding the current year
const maxConversionAge = Math.max(minConversionAge + 1, age - 2);

// NOTE: SQL Server connection uses custom port 20000 in Docker environment
```

---

## 📋 Summary Checklist

| Condition | Rule |
| :--- | :--- |
| **Clearly named method** | No comment. |
| **Self-evident parameters & return types** | No `@param` or `@returns` tags. |
| **Complex algorithm or business constraint** | Brief inline comment explaining the *why*. |
| **Test steps (`test.step`)** | No comments duplicating step names. |
| **Dead code** | Delete completely; never comment out. |
