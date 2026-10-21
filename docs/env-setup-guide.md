# Environment Setup Guide (.env from Scratch)

This document explains how to set up the environment configuration (`.env`) from scratch, the required operating system prerequisites, and the conditions that must be fulfilled before executing automated tests.

---

## 1. Operating System Prerequisites

Before configuring the environment, ensure your machine has the following tools installed:

| Tool | Minimum Version | Purpose | Verification Command |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.x` | JavaScript runtime to run Playwright and TypeScript | `node -v` |
| **npm** | `>= 9.x` | Package manager for dependencies | `npm -v` |
| **Git** | Latest | Version control | `git --version` |
| **Docker Desktop** | Latest (or native SQL Server) | Runs the SQL Server database container and backend services | `docker --version` |

---

## 2. Setting Up the `.env` File from Scratch

The `.env` file contains runtime variables, service URLs, and database connection details. It is excluded from version control for security.

### Step 1: Copy Template
Generate your local `.env` by copying `.env.example`:

```bash
# Windows PowerShell / CMD:
copy .env.example .env

# macOS / Linux:
cp .env.example .env
```

### Step 2: Configure All Variables
Open `.env` and fill in each section with your active local values:

```ini
# ==============================================================================
# Service Base URLs
# ==============================================================================
BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:9002

# ==============================================================================
# Microsoft SQL Server Configuration
# ==============================================================================
# Database host (localhost, 127.0.0.1, or host.docker.internal)
DB_SERVER=localhost
# Port: 1433 (default local instance) or 20000 (Docker mapped port)
DB_PORT=1433
# Target database name (e.g. IEPB_Spoke)
DB_NAME=IEPB_Spoke
# SQL Server authentication login
DB_USER=sa
# SQL Server password
DB_PASSWORD=YourLocalSecurePassword123!
# Encryption setting (false for local development containers)
DB_ENCRYPT=false
# Trust self-signed certificates in local instances
DB_TRUST_SERVER_CERTIFICATE=true

# ==============================================================================
# Playwright Execution Settings
# ==============================================================================
HEADLESS=true
SLOW_MO=0

# ==============================================================================
# Logging Configuration (Winston)
# ==============================================================================
LOG_LEVEL=info
LOG_HTTP=true
```

---

## 3. Mandatory Conditions Before Running Tests

All automated tests depend on the following conditions being met:

1. **SQL Server is Running and Accessible**:
   - The SQL Server container or local service must be running.
   - The port configured in `DB_PORT` (e.g., `1433` or `20000`) must be open and listening.
2. **Database Schema is Migrated**:
   - The database (`DB_NAME`) must already exist and have the base schema created (`Members`, `MaritalStatuses`, `MembershipStatuses`, `SpiritualLevels`).
3. **Backend API is Running**:
   - The .NET backend API must be active on `API_BASE_URL` (`http://localhost:9002`).
   - The lookups endpoints (`/api/members/lookups/genders`, `/api/lookups/marital-statuses`) must respond with HTTP 200 OK.
4. **Frontend Portal is Active (For UI Tests Only)**:
   - When running `@ui` tests, the frontend must be reachable on `BASE_URL` (`http://localhost:5173`).

---

## 4. Environment Verification

To verify that `.env` is properly populated and the database connection is operational, run:

```bash
npx playwright test tests/db/connection.db.spec.ts
```

If the environment is configured correctly, the test will connect to SQL Server and report:
```text
✓ Verify connection and active Microsoft SQL Server version
```
