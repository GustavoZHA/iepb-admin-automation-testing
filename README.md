# IEPB Admin - Test Automation Framework

Comprehensive end-to-end test automation suite covering the **UI**, **API**, and **Database** layers of the **IEPB Admin** system, built with **Playwright**, **TypeScript**, and **Microsoft SQL Server**.

---

## 📖 System Description & Scope

### What is IEPB Admin?
**IEPB Admin** is an enterprise church administration platform responsible for managing church members, spiritual milestones, membership classifications, and ministerial assignments across multiple church locations.

### What Does This Suite Cover?
This automation repository validates the entire system across three coordinated testing layers:

1. **User Interface (UI Layer - `tests/ui/`)**:
   - Browser end-to-end workflows using the **Page Object Model (POM)**.
   - Form inputs, button interactions, data tables, and user notifications in Spanish.
2. **REST API (API Layer - `tests/api/`)**:
   - Domain-specific API clients (`MembersClient`, `LookupsClient`) built on a centralized `ApiClient`.
   - Verification of HTTP response status codes, payload structures, pagination, and strict schema validation via **Zod**.
   - Dynamic catalog lookup loading through a singleton `ScenarioContext`.
3. **Database (Backend Layer - `tests/db/`)**:
   - Direct connection to Microsoft SQL Server (`IEPB_Spoke`) using `mssql`.
   - Verification of data persistence, foreign key relationships, and integrity constraints.
   - Automated teardown routines that remove test data without impacting master catalogs.

---

## 🛠️ Tools & Technologies Used

| Tool / Technology | Version / Category | Purpose |
| :--- | :--- | :--- |
| **Playwright** | `^1.64.1` | Unified test runner for browser automation and API requests |
| **TypeScript** | `^7.0.2` | Strongly typed test automation codebase and DTO models |
| **Node.js** | `>= 18.x` | Execution runtime environment |
| **Microsoft SQL Server (`mssql`)** | `^12.7.10` | Direct SQL Server client for database assertions and teardown |
| **Allure Report** | `allure-playwright` | Interactive test reports with step breakdowns and execution timings |
| **Zod** | `^4.6.7` | Schema definition and runtime validation for API response bodies |
| **Winston** | `^3.19.0` | Structured logging for HTTP traffic, database actions, and errors |
| **Dotenv** | `^18.0.8` | Dynamic environment configuration from local `.env` files |

---

## ⚙️ Quick Environment Setup

1. Copy the example configuration template:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and configure your local service URLs (`API_BASE_URL`, `BASE_URL`) and SQL Server credentials.
3. For the complete list of OS requirements and setup instructions, see the [Environment Setup Guide](file:///f:/Programming/GitHubCode-GutavoZHA/iepb-admin-automation-testing/docs/env-setup-guide.md).

---

## 🏛️ Project Structure

```text
iepb-admin-automation-testing/
├── config/              # Centralized environment and database configuration
├── src/
│   ├── api/             # Typed API clients (MembersClient, LookupsClient), models, and Zod schemas
│   ├── context/         # ScenarioContext: singleton holding live catalog IDs fetched via ApiClient
│   ├── data/            # Pool data (members.pool.json) and MemberDataReader
│   ├── db/              # SQL Server connection (dbClient.ts) and teardown helpers
│   ├── fixtures/        # Custom Playwright fixtures (testBase.ts) combining db, api, and clients
│   ├── ui/              # Page Object Model (POM) for UI testing
│   └── utils/           # Centralized logging (Winston)
├── tests/
│   ├── api/             # REST API test suites (members.api.spec.ts, members-update.api.spec.ts)
│   ├── db/              # SQL Server persistence & integrity tests (connection.db.spec.ts)
│   └── ui/              # Browser E2E tests (home.ui.spec.ts)
├── docs/                # Detailed guides (execution, env-setup, skills)
└── .agents/skills/      # Automation agent skills with direct entry points
```

---

## 📚 Documentation Index

For detailed guidelines, refer to the documents in the `docs/` folder:

* **[Test Execution Guide](file:///f:/Programming/GitHubCode-GutavoZHA/iepb-admin-automation-testing/docs/execution-guide.md)**
  Detailed instructions for running tests by tag (`@api`, `@backend`, `@ui`), by feature file, by scenario name (`-g`), and generating/opening **Allure Report** and Playwright HTML reports.

* **[Environment Setup Guide](file:///f:/Programming/GitHubCode-GutavoZHA/iepb-admin-automation-testing/docs/env-setup-guide.md)**
  Complete guide covering operating system prerequisites (Node.js, Docker/SQL Server), configuring `.env` from scratch, and connection verification.

* **[Skills Architecture Guide](file:///f:/Programming/GitHubCode-GutavoZHA/iepb-admin-automation-testing/docs/skills-guide.md)**
  Standard and directory index explaining how automated agent skills provide single, direct entry points for API tests, test steps, hooks, and code comments.
