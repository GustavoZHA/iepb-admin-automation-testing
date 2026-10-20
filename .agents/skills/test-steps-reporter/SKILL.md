---
name: test-steps-reporter
description: >-
  Standard and procedure for structuring Playwright tests with action steps
  (test.step) and categorizing them strictly with one of the three allowed tags:
  API, UI, or backend. Use whenever creating, configuring, or editing tests to
  ensure proper log reporting and step breakdown.
---

# Skill: Action Steps Configuration & Reporting Tags

This skill defines the required standard for structuring automated tests in this project, ensuring:
1. Every test is strictly classified with **only one** of the three allowed tags: `@api`, `@ui`, or `@backend`.
2. Every significant action within a test is wrapped inside an **action step** (`test.step`), displaying step execution in the console log and the Playwright HTML report.
3. The framework and step descriptions are in **English**, except when referencing Spanish UI elements (e.g., button names like `"Crear Miembro"` or form labels like `"Nombre"`).

---

## 🏷️ Strict Tagging Rule (Only 3 Allowed Tags)

Every test case (or `test.describe` block) must include its corresponding tag. **No other tags are permitted:**

| Tag | Layer | When to Use |
| :--- | :--- | :--- |
| `@api` | **REST API** | HTTP endpoints, response schemas, status codes, and DTO validations. |
| `@ui` | **User Interface** | Browser E2E tests interacting with the frontend interface. |
| `@backend` | **Database / Backend** | Direct SQL Server (`mssql`) queries, table persistence, triggers, and stored procedures. |

---

## 📝 Tag Configuration in Playwright

Playwright supports tagging tests using the `tag` option:

### Test-level Tagging (Recommended)
```typescript
import { test, expect } from '@fixtures/testBase';

test('Create new member with valid data', { tag: ['@api'] }, async ({ request }) => {
  // ...
});
```

### Suite-level Tagging (`test.describe`)
```typescript
test.describe('Members Module - UI', { tag: ['@ui'] }, () => {
  test('Display list of members in table', async ({ page }) => {
    // Automatically inherits @ui tag
  });
});
```

---

## 🪜 Action Steps Standard (`test.step`)

Wrap each meaningful phase (Arrange, Act, Assert) in `test.step` to produce clean, readable test execution logs and report trees.

### Step Naming Rules:
1. **API and UI Steps:** Do **NOT** use bracket tags like `[API]`, `[backend]`, or `[UI]` in step descriptions. Use clean, standardized English descriptions:
   - `Send GET request to /api/lookups`
   - `Send POST request to /api/members`
   - `Verify HTTP 200 OK status code`
   - `Verify HTTP 201 Created status code`
   - `Validate JSON response structure`
   - `Navigate to Members page`
   - `Click "Crear Miembro" button`
   - `Fill member form with valid data`
2. **Database Steps:** When interacting with or asserting against the database, **ALWAYS** prefix the step with `DB - `:
   - `DB - Connect to SQL Server and query active server version`
   - `DB - Validate database instance responds properly`
   - `DB - Verify record was persisted in Members table`
   - `DB - Execute cleanup teardown for test record`

---

## 💡 Reference Examples by Category

### 1. `@api` Test Example
```typescript
import { test, expect } from '@playwright/test';

test('Retrieve lookup catalogs list', { tag: ['@api'] }, async ({ request }) => {
  let response: any;

  await test.step('Send GET request to /api/lookups', async () => {
    response = await request.get('/api/lookups');
  });

  await test.step('Verify HTTP 200 OK status code', async () => {
    expect(response.status()).toBe(200);
  });

  await test.step('Validate JSON response structure', async () => {
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});
```

### 2. `@backend` Test Example (Database with `DB - ` prefix)
```typescript
import { test, expect } from '@fixtures/testBase';

test('Verify database connectivity and active SQL Server version', { tag: ['@backend'] }, async ({ db }) => {
  let result: any;

  await test.step('DB - Connect to SQL Server and query active version', async () => {
    result = await db.query('SELECT @@VERSION AS ServerVersion;');
  });

  await test.step('DB - Validate database instance responds properly', async () => {
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});
```

### 3. `@ui` Test Example (Frontend with Spanish Element Names)
```typescript
import { test, expect } from '@playwright/test';

test('Create a new member from the UI', { tag: ['@ui'] }, async ({ page }) => {
  await test.step('Navigate to the Members page', async () => {
    await page.goto('/members');
  });

  await test.step('Click "Crear Miembro" button', async () => {
    await page.getByRole('button', { name: 'Crear Miembro' }).click();
  });

  await test.step('Fill member form with valid data', async () => {
    await page.getByLabel('Nombre').fill('Juan');
    await page.getByLabel('Apellido').fill('Pérez');
    await page.getByRole('button', { name: 'Guardar' }).click();
  });

  await test.step('Verify success toast notification appears', async () => {
    await expect(page.getByText('Miembro creado exitosamente')).toBeVisible();
  });
});
```

---

## 🚀 Execution by Tag

Run tests selectively using the Playwright `--grep` flag:

- **Run API tests only:**
  ```bash
  npm run test:api
  # or: npx playwright test --grep "@api"
  ```
- **Run UI tests only:**
  ```bash
  npm run test:ui
  # or: npx playwright test --grep "@ui"
  ```
- **Run Backend tests only:**
  ```bash
  npm run test:backend
  # or: npx playwright test --grep "@backend"
  ```
