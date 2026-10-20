# AI Agents Guide & Core Rules (AGENTS.md)

This repository (`iepb-admin-automation-testing`) contains the integrated test automation suite (UI, API, and Database) for the **IEPB Admin** system.

---

## ⛔ GOLDEN RULE / CRITICAL RESTRICTION

> **THE AI AGENT IS STRICTLY FORBIDDEN FROM MODIFYING, EDITING, DELETING, OR COMMITTING CODE IN THE FOLLOWING PROJECTS:**
> 1. `iepb-admin` (Backend in .NET / C# / Docker / SQL Server)
> 2. `iepb-admin-front` (Frontend in React / TypeScript / Vite)
>
> **Access Policy:**
> - Both external projects (`../iepb-admin` and `../iepb-admin-front`) are **STRICTLY READ-ONLY**.
> - You may only inspect their files to check data models, DTOs, API endpoints, database table/column names, or frontend UI labels.
> - **ALL NEW CODE, MODIFICATIONS, OR CONFIGURATION FILES MUST RESIDE EXCLUSIVELY WITHIN THIS REPOSITORY (`iepb-admin-automation-testing`).**

---

## 🌐 Language Conventions

- **Language of Framework & Code:** All code, test files, step descriptions, Page Objects, method names, variable names, comments, and documentation must be in **English**.
- **Exception for UI Elements:** The frontend application interface is in **Spanish**. Therefore, user-facing UI text, button labels, form placeholders, table column headers, and toast messages should match the application text (e.g., clicking `"Crear Miembro"`, checking `"Guardar"`, validating `"Miembro creado exitosamente"`).

---

## 🎯 Test Automation Scope

This project uses **Playwright with TypeScript** covering three testing layers:

1. **API Testing (`tests/api/`):**
   - Use Playwright's `APIRequestContext` (`request`).
   - Validate HTTP response status codes, JSON response schemas with `Zod`, payload validation, and business logic.
   - Serve as fast data preparation (seeding) for UI end-to-end tests.

2. **Database Testing & Verification (`tests/db/` and `src/db/`):**
   - Direct connection to Microsoft SQL Server (`IEPB_Spoke`) via `mssql`.
   - Verify data persistence, triggers, constraints, and referential integrity.
   - Execute safe cleanup queries (*teardown*) after test executions.

3. **UI Testing (`tests/ui/` and `src/ui/`):**
   - Implement the **Page Object Model (POM)** pattern.
   - Frontend UI is in **Spanish**: Locators must prioritize accessibility and visible Spanish text using `page.getByRole(...)`, `page.getByLabel(...)`, `page.getByPlaceholder(...)`, or `page.getByText(...)`.
   - Avoid brittle CSS selectors or Tailwind utility classes.

---

## 🏷️ Standard Tags (Strictly 3 Tags Allowed)

Every test or suite must be tagged with **exactly one** of the following:
- `@api`: For REST API tests and endpoint verification.
- `@ui`: For browser-based E2E tests interacting with the user interface.
- `@backend`: For direct database and backend persistence/integrity tests.

---

## 🪜 Action Steps Standard (`test.step`)

- **No bracket prefixes:** Do NOT include `[API]`, `[backend]`, or `[UI]` inside `test.step` titles.
- **API & UI Steps:** Use clean, standardized English descriptions:
  - `Send GET request to /api/lookups`
  - `Send POST request to /api/lookups`
  - `Verify HTTP 200 OK status code`
  - `Click "Crear Miembro" button`
- **Database Steps:** When database verification/actions are performed, ALWAYS format as `DB - <action>`:
  - `DB - Validate database instance responds properly`
  - `DB - Connect to SQL Server and query active server version`

---

## 🏗️ Project Structure

- `config/`: Centralized environment and database configuration.
- `src/api/`: Typed HTTP clients, DTOs/interfaces, and Zod schemas.
- `src/db/`: SQL Server connection client (`dbClient.ts`), query helpers, and teardown utilities.
- `src/ui/`: Page Objects and reusable UI components.
- `src/fixtures/`: Custom Playwright fixtures combining `dbClient`, `apiClients`, and `pages`.
- `tests/`: Test suites organized by layer (`tests/api/`, `tests/db/`, `tests/ui/`).

---

## 🔒 Test Data Management

- **Preserve Master Catalog Data:** Do not truncate lookup or catalog tables (e.g., `Lookups`).
- **Clean Test Data:** All transactional test data (members, assignments, etc.) must use a traceable prefix (e.g., `TEST_AUT_` or timestamps) to allow clean and safe teardown without affecting real records.
- **SQL Server Connection:** Default mapped to port `20000` (Docker) or `1433` (Local), user `sa`, database `IEPB_Spoke`.

---

## 🔐 Zero Sensitive Data & Environment Variables Policy

> **STRICT SECURITY RULE: NO HARDCODED SECRETS OR SENSITIVE DATA**
> 1. **Never Hardcode Real Credentials:** Passwords, API tokens, secret keys, or real connection strings must **NEVER** be hardcoded anywhere in the codebase (including `config/env.config.ts`, test files, or helpers).
> 2. **Strict Reading from `.env`:** All environment values must be read dynamically from `process.env`. Fallbacks in code must only be empty strings or generic standard defaults (e.g. `localhost`, port `1433`), never real project credentials.
> 3. **Templates (`.env.example`):** Must strictly contain dummy, generic example values (e.g., `DB_PASSWORD=YourSecurePassword123!`). Never commit real credentials to `.env.example`.
> 4. **No Execution Duration in Response Logs:** API response logs and reporting must output clean logs (`Response Status: <status>`) without execution duration or latency metrics.
