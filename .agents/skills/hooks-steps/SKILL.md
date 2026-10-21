---
name: hooks-steps
description: >-
  Standard and workflow for structuring Playwright lifecycle hooks (beforeAll,
  beforeEach, afterEach, afterAll) with atomic test.step blocks.
---

# Skill: Lifecycle Hooks with Action Steps (`hooks-steps`)

Standard for structuring Playwright lifecycle hooks using action steps (`test.step`).

---

## 🎯 Core Rule

> **EVERY ACTION INSIDE A HOOK MUST BE WRAPPED IN `test.step`.**
>
> 1. Displays hook execution steps clearly in Playwright HTML Report and Allure Report.
> 2. Immediately isolates failures in setup, pre-seeding, or database cleanup.

---

## 🪜 Step Naming Rules for Hooks

1. **No Bracket Prefixes**: Do **not** use `[API]`, `[backend]`, or `[UI]`.
2. **Database Steps (`DB - `)**: Any database operation must start with `DB - `.
3. **Atomic Steps**: Keep catalog loading, pre-creation, entity deletion, and connection closing in separate steps.

---

## 📋 Standard Hook Patterns

### 1. `beforeAll` (Setup & Seeding)
```typescript
test.beforeAll(async ({ request }) => {
  const apiClient = new ApiClient(request);

  await test.step('Send GET requests to load catalog lookups using ApiClient and verify 200 OK', async () => {
    await scenarioContext.loadFromApiClient(apiClient);
  });

  await test.step('Send POST request to /api/members to pre-create member for update suite', async () => {
    const membersClient = new MembersClient(apiClient);
    const createRes = await membersClient.create(buildMemberPayload());
    expect(createRes.status()).toBe(201);
  });
});
```

### 2. `afterAll` (Teardown & Cleanup)
```typescript
test.afterAll(async ({ db }) => {
  await test.step('DB - Delete all created test members by ID', async () => {
    for (const id of createdMemberIds) {
      await deleteMemberById(db, id);
    }
  });

  await test.step('DB - Clean up test members matching TEST_AUT_ or TEST_AT_ prefix', async () => {
    await cleanTestMembers(db, 'TEST_AUT_');
  });

  await test.step('DB - Close SQL Server connection pool', async () => {
    await db.close();
  });
});
```
