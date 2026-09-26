# Instructions for AI Agents Working on PanelIQ Backend

Welcome to the **PanelIQ Backend** repository (`paneliq/backend/`). All AI assistants collaborating on this codebase must strictly observe the following rules:

---

## 1. Backend-Only Scope
- **Directory boundary:** Work strictly inside `paneliq/backend/`.
- **Do not touch frontend:** Three other developers own the frontend. Do not create, modify, scaffold, or delete any frontend files or folders (`apps/web`, React components, UI pages, etc.).
- **No root workspace files:** Do not create a root `package.json`, root workspace configuration, or monorepo tools. Preserve all teammate files.

---

## 2. Language & Runtime Standard
- **Pure JavaScript:** All application code must be written in modern JavaScript (ES Modules, `"type": "module"`).
- **No TypeScript:** Do not convert files to TypeScript, create `.ts` files, add `tsconfig.json`, or introduce a `tsc` build step.
- **Node.js runtime:** Target Node.js 24 LTS.
- **Dependencies:** Keep dependencies minimal. Use Node's built-in features wherever possible (e.g. `node --watch` for dev, `node:crypto` for UUIDs). Always confirm before adding new packages.

---

## 3. Execution Discipline
- **Task-by-task execution:** Implement ONLY the specific task explicitly authorized by the developer in the current prompt.
- **No speculative features:** Do not implement upcoming features (such as interview session logic, LLM calling, or evaluation logic) ahead of schedule.
- **Stop and report:** Once the current task is completed and verified, STOP and report results. Never automatically proceed to the next milestone without explicit instruction.

---

## 4. Documentation & Context Awareness
- **Mandatory reading:** Always review `backend/docs/prd.md` and `backend/docs/progress.md` before writing code.
- **Document updates:** Update `backend/docs/progress.md` after completing each task, noting verification checks and blockers.

---

## 5. Security & Hygiene
- **Never expose secrets:** Never print, log, commit, or request database passwords, service role keys, or third-party AI keys.
- **Environment files:** Real credentials belong in local `.env` (which is git-ignored). Only safe defaults and placeholders belong in `.env.example`.
- **API conventions:** Maintain standard response envelopes:
  - Success: `{ "data": ..., "requestId": "..." }`
  - Error: `{ "error": { "code": "...", "message": "...", "retryable": false }, "requestId": "..." }`
  - Always include the `X-Request-Id` response header.
- **Truthful reporting:** Run actual verification commands. Never claim checks succeeded without executing them. Report blocked checks honestly.
