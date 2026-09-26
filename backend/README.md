# PanelIQ Backend

Backend API service for **PanelIQ** — an interview simulation and evaluation platform.

This directory houses the standalone backend service owned by **Dev 4 (Backend)**.

---

## What Task 1 Implements

Task 1 establishes the runnable backend foundation:
- **Express HTTP Server** with graceful shutdown (SIGINT/SIGTERM).
- **Request Tracking:** Unique request IDs (`crypto.randomUUID()`) attached to `req.id` and the `X-Request-Id` header.
- **CORS Protection:** Configurable origin allowlist preventing unauthorized cross-origin requests.
- **Standardized Response Envelopes:**
  - Success: `{ "data": ..., "requestId": "..." }`
  - Error: `{ "error": { "code": "...", "message": "...", "retryable": false }, "requestId": "..." }`
- **Error & 404 Handling:** Graceful handling of unknown routes, bad JSON requests, and internal errors without leaking stack traces.
- **Health Check Endpoint:** `GET /api/v1/health` to confirm the server process is alive.

> **Note on Integrations:** Third-party services (Supabase database/auth and Groq/Gemini AI providers) are **not connected yet**. This foundation runs entirely self-contained without credentials.

---

## Prerequisites

- **Node.js:** v24.x LTS (tested on Node.js v24.18.0)
- **npm:** v10.x or v11.x (included with Node.js)

*Windows Note:* If Windows PowerShell restricts `.ps1` execution scripts, use `npm.cmd` instead of `npm`, or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.

---

## Installation & Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   *(On Windows PowerShell with execution policy restrictions, run `npm.cmd install`)*

3. **Configure local environment:**
   Copy the example environment file:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```

   The default `.env` contents are safe for local development:
   ```env
   PORT=4000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173
   ```

---

## Running the Backend

### Development Mode (with hot-reloading)
Uses Node.js built-in watch mode:
```bash
npm run dev
```

### Production Mode
Starts the server directly:
```bash
npm start
```

### Code Quality & Linting
Runs ESLint across JavaScript source files:
```bash
npm run lint
```

---

## Verification & Health Check

With the server running on port `4000`:

- **Endpoint URL:** `http://localhost:4000/api/v1/health`

### Windows PowerShell Verification
Run in PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/v1/health" -Method Get | ConvertTo-Json
```

Expected Response (HTTP 200):
```json
{
  "data": {
    "service": "paneliq-backend",
    "status": "ok"
  },
  "requestId": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
}
```

To test 404 handling:
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/v1/unknown" -Method Get
```

Expected Response (HTTP 404):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Route not found",
    "retryable": false
  },
  "requestId": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
}
```

---

## Folder Responsibilities

```
backend/
├── .env.example          # Template for environment configuration
├── .gitignore            # Git exclusion rules (ignores .env, node_modules, logs)
├── AGENTS.md             # Guidelines and constraints for AI assistants
├── README.md             # Setup and developer documentation (this file)
├── eslint.config.js      # ESLint 9 flat configuration
├── package.json          # Dependencies and scripts (ES modules)
├── docs/
│   ├── prd.md            # Preserved Product Requirements Document
│   └── progress.md       # Task tracking and architecture decision record
└── src/
    ├── app.js            # Express application factory and middleware configuration
    ├── server.js         # Entrypoint: loads config, listens on port, handles shutdown
    ├── config/
    │   └── env.js        # Environment loading via dotenv & schema validation via Zod
    ├── middleware/
    │   ├── error-handler.js # Central error formatter with standard JSON envelope
    │   ├── not-found.js     # 404 handler for unmatched routes
    │   └── request-id.js    # Generates UUIDs and populates req.id & X-Request-Id header
    ├── modules/
    │   └── health/
    │       └── health.routes.js # GET /api/v1/health endpoint
    └── routes/
        └── index.js      # Versioned router mounting module routes under /api/v1
```

---

## Next Steps

- **Task 2 (Upcoming):** Supabase project configuration, database schema migrations, and authentication verification.
