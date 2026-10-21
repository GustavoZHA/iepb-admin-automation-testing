# IEPB Admin - Test Automation Framework

Comprehensive end-to-end automation test suite (UI, API, and Database) for the **IEPB Admin** system, built with **Playwright**, **TypeScript**, and **Microsoft SQL Server**.

---

## 🏛️ Architecture Overview

The framework covers three testing layers:

```text
iepb-admin-automation-testing/
├── config/              # Centralized environment and database configuration
├── src/
│   ├── api/             # Typed API clients (MembersClient, LookupsClient), models, and Zod schemas
│   ├── context/         # ScenarioContext: singleton holding live catalog IDs fetched via ApiClient
│   ├── data/            # Pool data (members.pool.json) and MemberDataReader
│   ├── db/              # SQL Server connection (dbClient.ts) and teardown helpers
│   ├── fixtures/        # Custom Playwright fixtures (testBase.ts)
│   ├── ui/              # Page Object Model (POM) for UI testing
│   └── utils/           # Centralized logging (Winston)
├── tests/
│   ├── api/             # REST API tests (members.api.spec.ts, members-update.api.spec.ts, health.api.spec.ts)
│   ├── db/              # SQL Server persistence & integrity tests (connection.db.spec.ts)
│   └── ui/              # Browser E2E tests (home.ui.spec.ts)
└── docs/                # Detailed guides and execution manuals
```

---

## 🎯 Skills & Architectural Principles

1. **Zero Test Interdependence**:
   - Every scenario is 100% independent and does not rely on any other scenario.
   - Each test creates its own isolated data, performs its own assertions, and handles its own teardown.

2. **Dedicated API Clients**:
   - All HTTP interactions must strictly use typed domain clients (`MembersClient`, `LookupsClient`) built upon the centralized `ApiClient`.

---

## 🪜 Test Steps Standard (`test.step`)

All actions within test scenarios must be wrapped in `test.step`.

### Conditions Every Test Step Must Fulfill:

1. **Independence**: Steps within a test must never assume state from another test scenario.
2. **Clean Step Naming (No Brackets)**: Do not include bracket prefixes such as `[API]`, `[backend]`, or `[UI]`.
   - Example: `await test.step('Send POST request to /api/members', async () => { ... });`
3. **Database Steps Formatting (`DB - `)**: Any step interacting with or querying Microsoft SQL Server must start with `DB - `.
   - Example: `await test.step('DB - Verify member record is persisted in Members table', async () => { ... });`
4. **Atomicity**: One clear action (Arrange, Act, or Assert) per step.

---

## ⚡ Execution Commands

### 1. Run Build (TypeScript Verification)
```bash
npm run build
```

### 2. Run by Scenario Name
```bash
npx playwright test -g "Update member contact and address information"
```

### 3. Run by Tag
```bash
npm run test:api
```

### 4. Run by Feature File
```bash
npm run test:members:update
```

### 5. View Reports
```bash
# Playwright HTML report
npm run report

# Allure live report
npm run allure:serve
```

---

## 📚 Documentation
For complete execution details and Allure workflows, see the [Execution Guide](file:///f:/Programming/GitHubCode-GutavoZHA/iepb-admin-automation-testing/docs/execution-guide.md).
