---
name: code-comments
description: >-
  Standard and conventions for writing maintainable code comments, JSDoc/TSDoc
  documentation, and inline annotations across the test automation framework.
---

# Skill: Code Comments & Documentation Standards (`code-comments`)

Standard for writing clear, maintainable, and high-value code comments across the automation framework.

---

## 🎯 Core Principles

1. **Language:** All comments, docstrings, and annotations must be in **English**.
2. **Explain "Why", Not "What":** Code explains *what* happens; comments should explain *why* a specific business rule, workaround, or catalog mapping exists.
3. **No Redundancy with `test.step`:** `test.step` already documents test execution. Avoid writing comments that merely repeat the step title.
4. **Zero Dead Code:** Never leave commented-out code blocks in committed files. Git tracks historical changes.

---

## 📚 Comment Types & When to Use Them

### 1. JSDoc / TSDoc (`/** ... */`)
Used for all shared utilities, API clients, Page Objects, Builders, and helper functions.

**Must include:**
- Brief description of the class, method, or function.
- `@param` describing purpose of non-obvious arguments.
- `@returns` describing the returned value.

```typescript
/**
 * Generates three chronological dates fulfilling the business constraint:
 * birthDate < conversionDate < baptismDate.
 *
 * @returns Object containing ISO date strings (YYYY-MM-DD)
 */
static generateChronologicalDates(): {
  birthDate: string;
  conversionDate: string;
  baptismDate: string;
}
```

### 2. Business Logic / Mapping Comments (`// ...`)
Used when a value or logic is not obvious from reading the code directly.

**Good Examples:**
```typescript
// Gender catalog ID: 0 = Male, 1 = Female (mapped to database Lookups catalog)
genderId: 1,

// Conversion age is capped to prevent conversion date exceeding current year
const maxConversionAge = Math.max(minConversionAge + 1, age - 2);

// Append unique timestamp to prevent email collision in database
emailAddress: `${cleanName}.${timestamp}@gmail.com`,
```

**Bad Examples (Redundant / Noise):**
```typescript
// BAD: Just repeats what the code says
// Set genderId to 1
genderId: 1,

// BAD: Duplicates the test step title
// Send POST request to /api/members
await test.step('Send POST request to /api/members', async () => { ... });
```

### 3. Action Tags (`TODO:` / `NOTE:`)
Used for tracking intentional technical notes or future tasks:

```typescript
// NOTE: SQL Server connection uses custom port 20000 in Docker environment
// TODO: Add support for multi-language validation when frontend supports English
```

---

## 📋 Summary Checklist

| Category | Standard |
| :--- | :--- |
| **Language** | Strictly English |
| **Clients & Utilities (`src/`)** | JSDoc on classes and public methods |
| **Test Specs (`tests/`)** | Rely on `test.step`; use comments only for complex business rules |
| **Dead Code** | Delete unused code completely; do not comment it out |
| **Tags** | Standard uppercase `NOTE:` or `TODO:` |
