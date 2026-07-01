# SyncCircle

SyncCircle is a hackathon web app workspace for a student collaboration app. The frontend is a working React prototype while the team shapes backend features and Kiro tasks.

## Branch Info

This branch (`workato-amazon-sns`) is a continuation of `workato-google-calendar-sync`.

Changes introduced in this branch:
- Task deadline email notifications via **Workato → AWS SNS**
- In-app notification system (toast + bell icon panel) for tasks due today/tomorrow
- `useTaskNotifications` hook with three notification paths (on-save, timed polling, startup banner)
- Optional `dueTime` field on tasks — triggers 30-min early in-app warning
- Add Task dialog on the Timetable page (Tasks tab) with date + time picker
- Calendar header buttons hidden when Tasks tab is active
- `<Toaster>` mounted globally in `App.tsx` for all toast notifications
- Kiro steering file: `.kiro/steering/workato-amazon-sns.md`

## Project Layout

```text
apps/
  frontend/      Vite React frontend app
  backend/       Backend placeholder for future API/service work
packages/
  shared/        Shared types, constants, and validation helpers
docs/
  requirements.md          Product requirements for Kiro/team planning
  design.md                Architecture and UI design notes
  kiro-context.md          Short handoff context for Kiro and teammates
  WORKATO_SNS_SETUP.md     Step-by-step AWS SNS + Workato recipe setup guide
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

---

## Feature: Task Deadline Email Notifications

When a task is created with a due date of **tomorrow**, the app automatically fires
a POST to Workato, which triggers AWS SNS to send a reminder email to the user.

### Notification behaviour

| Trigger | What happens |
|---|---|
| Task created with tomorrow's due date | Email sent immediately via Workato → SNS |
| App loads, task due today | In-app warning toast |
| App loads, task due tomorrow | In-app info toast + email (safety net) |
| Due date arrives, no `dueTime` set | In-app toast fires at **3:00 PM SGT** |
| Due date arrives, `dueTime` set | In-app toast fires **30 min before** `dueTime` |

### Environment variables

Create `apps/frontend/.env.local` and set both webhook URLs:

```env
VITE_WORKATO_WEBHOOK_URL=https://webhooks.trial.workato.com/webhooks/rest/a6158446-0e94-4d56-805f-a9b744af435e/synccircle-google-calendar
VITE_WORKATO_TASK_WEBHOOK_URL=https://webhooks.trial.workato.com/webhooks/rest/a6158446-0e94-4d56-805f-a9b744af435e/synccircledeadline
VITE_KIRO_API_URL=https://api.kiro.placeholder.dev
```

### Full setup guide

See `docs/WORKATO_SNS_SETUP.md` for the complete step-by-step guide covering:
- Creating the AWS SNS topic and email subscription
- Creating the IAM user with minimal permissions
- Building the Workato recipe (webhook trigger → SNS action)
- Testing the end-to-end flow

For Kiro context on this integration see `.kiro/steering/workato-amazon-sns.md`.

---

## Feature: Google Calendar Sync

The timetable page has a **Sync to Google Calendar** button that sends all classes
to a Workato webhook, which creates events in Google Calendar.

### 1. Configure your Google Calendar timezone

Settings → General → Time zone → **Asia/Singapore (+08:00)**

### 2. Workato recipe settings

| Setting | Value |
|---|---|
| Trigger | HTTP Webhook (`synccircle-google-calendar`) |
| Displayed time zone | `Etc/UTC` — do not change |
| Step | Repeat for each → `events` array → Google Calendar: Create event |
| Start date time | `events[].startDateTime` |
| End date time | `events[].endDateTime` |

For full details see `.kiro/steering/workato-google-calendar.md`.

---

## Current State

| Area | Status |
|---|---|
| Frontend | ✅ Working React prototype |
| Timetable → Google Calendar | ✅ Workato integration working |
| Task deadline → Email via SNS | ✅ Workato + AWS SNS integration working |
| In-app notifications | ✅ Toast + bell panel working |
| Backend | ⬜ Not connected — UI uses localStorage only |
| Auth | ⬜ Demo only (`localStorage` flag) |

## Team Notes

Use `docs/kiro-context.md` first when handing this to Kiro or a teammate. It explains
what is real today, what is placeholder-only, and where future backend/API work should attach.

Steering files for Kiro:
- `.kiro/steering/workato-google-calendar.md` — Google Calendar sync
- `.kiro/steering/workato-amazon-sns.md` — Task deadline email via SNS
