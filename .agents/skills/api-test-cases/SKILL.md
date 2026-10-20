---
name: api-test-cases
description: >-
  Standard and workflow for writing API automated tests using dedicated API clients.
  Enforces the rule that all HTTP requests must go through API clients with standardized steps.
---

# Skill: API Test Cases with API Clients

Simple and maintainable guide for writing API tests in this project.

---

## 🎯 Core Rule

> **EVERY HTTP REQUEST MUST USE AN API CLIENT.**
> - Do **not** use `request.get()` or `request.post()` directly in test spec files.
> - Call methods from typed clients in `src/api/clients/` injected via `src/fixtures/testBase.ts`.
> - Always tag tests with `{ tag: ['@api'] }`.
> - Keep step descriptions clean without bracket prefixes like `[API]`.

---

## 📁 File Structure

```text
src/api/clients/       # API Clients encapsulating endpoints (e.g., lookupsClient.ts)
src/fixtures/testBase.ts # Injects API clients into Playwright tests
tests/api/             # Clean API test specs (*.api.spec.ts)
```

---

## 💡 Quick Example

### 1. API Client (`src/api/clients/lookupsClient.ts`)
```typescript
import { ApiClient } from '../apiClient';

export class LookupsClient {
  constructor(private api: ApiClient) {}

  async getMaritalStatuses() {
    return this.api.get('/api/lookups/marital-statuses');
  }
}
```

### 2. Test Case (`tests/api/lookups.api.spec.ts`)
```typescript
import { test, expect } from '../../src/fixtures/testBase';

test.describe('Lookups API', { tag: ['@api'] }, () => {
  test('Retrieve marital statuses list', async ({ lookupsApi }) => {
    let response: any;

    await test.step('Send GET request to /api/lookups/marital-statuses', async () => {
      response = await lookupsApi.getMaritalStatuses();
    });

    await test.step('Verify HTTP 200 OK status code', async () => {
      expect(response.status()).toBe(200);
    });

    await test.step('Validate response body', async () => {
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });
});
```
