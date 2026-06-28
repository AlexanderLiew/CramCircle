# SyncCircle

SyncCircle is a hackathon web app workspace for a student collaboration app. The frontend is a working React prototype while the team shapes backend features and Kiro tasks.

## Project Layout

```text
apps/
  frontend/      Vite React frontend app
  backend/       Backend placeholder for future API/service work
packages/
  shared/        Shared types, constants, and validation helpers
docs/
  requirements.md   Product requirements for Kiro/team planning
  design.md         Architecture and UI design notes
  kiro-context.md   Short handoff context for Kiro and teammates
tests/
  e2e/           Future browser/user-flow tests
  integration/   Future API and cross-service tests
infra/           Future deployment/IaC notes
```

## Running The Frontend

Install dependencies from the repository root:

```bash
corepack pnpm install
```

Start the frontend:

```bash
corepack pnpm dev
```

Or run it directly:

```bash
cd apps/frontend
corepack pnpm dev
```

## Current State

- Frontend: React prototype with dashboard, timetable, notes, AI planner, friends, chat, profile, and settings screens.
- Backend: intentionally not connected yet. The current UI uses local/demo state only.
- Documentation: requirements and design notes are prepared for Kiro to refine into implementation tasks.

## Team Notes

Use `docs/kiro-context.md` first when handing this to Kiro or a teammate. It explains what is real today, what is placeholder-only, and where future backend/API work should attach.
