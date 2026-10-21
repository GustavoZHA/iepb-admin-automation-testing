# Test Execution Guide

This document describes how to compile, execute, and generate test reports (including **Allure Report**) for the **IEPB Admin Automation Testing** project.

## 1. Build Verification

Validates TypeScript syntax, types, and imports without emitting output files:

```bash
npm run build
```
## 2. Test Execution Commands

### By Tag
Runs tests categorized under one of the three framework layers (`@api`, `@backend`, `@ui`):

```bash
npm run test:api
```

### By Scenario Name (`-g`)
Runs an individual test scenario by its exact title:

```bash
npx playwright test -g "Update member contact and address information"
```

### By Feature File
Runs a specific test spec file:

```bash
npm run test:members:update
```

---

## 3. Allure Report

The Allure reporter (`allure-playwright`) records test results automatically into the `allure-results/` directory during every execution.

### Open Live Allure Report (Recommended)
Generates the report in memory and launches a local server with the report in your browser:

```bash
npm run allure:serve
```

### Generate and Open Static Report
```bash
npm run allure:generate
npm run allure:open
```

## 4. End-to-End Workflow Example

Run a test scenario and immediately view the generated Allure report:

```bash
npx playwright test -g "Update member contact and address information"
npm run allure:serve
```

## 5. Playwright HTML Report

Opens the built-in Playwright HTML report:

```bash
npm run report
```
