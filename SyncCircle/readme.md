# SyncCircle

SyncCircle is a hackathon web app workspace for a student collaboration app. The frontend is a working React prototype while the team shapes backend features and Kiro tasks.

## Branch Info

This branch (`workato-google-calendar-sync`) is a continuation of `alex-frontend-fixes`.

Changes introduced in this branch:
- Workato → Google Calendar integration for the timetable feature
- "Sync to Google Calendar" button on the timetable page
- SGT timezone utility (`sgt.ts`) for accurate Singapore time handling
- Kiro steering and skills files for the Workato integration

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

## Workato Google Calendar Setup

The timetable page has a **Sync to Google Calendar** button that sends all classes
to a Workato webhook, which creates events in Google Calendar.

### 1. Add the webhook URL

Create `apps/frontend/.env.local` (copy from `.env.example`) and set:

```
VITE_WORKATO_WEBHOOK_URL=https://webhooks.trial.workato.com/webhooks/rest/a6158446-0e94-4d56-805f-a9b744af435e/synccircle-google-calendar
```

### 2. Configure your Google Calendar

Set your Google Calendar timezone to **Asia/Singapore (+08:00)**:
Google Calendar → Settings → General → Time zone

All timetable times are treated as SGT. The frontend converts them to UTC before
sending, so Google Calendar displays the correct local time.

### 3. Workato recipe settings

| Setting | Value |
|---------|-------|
| Trigger | HTTP Webhook (the URL above) |
| Displayed time zone | `Etc/UTC` — do not change this |
| Step | Repeat for each → `events` array → Google Calendar: Create event |
| Start date time | `events[].startDateTime` |
| End date time | `events[].endDateTime` |

## Current State

- Frontend: React prototype with dashboard, timetable, notes, AI planner, friends, chat, profile, and settings screens.
- Timetable: fully integrated with Workato for Google Calendar sync.
- Backend: intentionally not connected yet. The current UI uses local/demo state only.
- Documentation: requirements and design notes are prepared for Kiro to refine into implementation tasks.

## Team Notes

Use `docs/kiro-context.md` first when handing this to Kiro or a teammate. It explains what is real today, what is placeholder-only, and where future backend/API work should attach.

For Workato integration details see `.kiro/steering/workato-google-calendar.md` and `.kiro/skills/workato-google-calendar.md`.
