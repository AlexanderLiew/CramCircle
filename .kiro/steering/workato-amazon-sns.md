---
inclusion: fileMatch
fileMatchPattern: "**/useTaskNotifications*,**/workato-client*,**/TaskList*,**/Timetable*,**/task*"
---

# Workato → Amazon SNS — Task Deadline Email Integration

## Status: Working ✓

When a task is created with a due date of **tomorrow**, the frontend immediately
POSTs to a Workato webhook. Workato forwards the payload to **AWS SNS**, which
sends an email to the user's registered address.

An in-app toast notification also fires independently — no backend required.

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/frontend/src/app/hooks/useTaskNotifications.ts` | All notification logic — on-save email, timed polling, startup banner |
| `apps/frontend/src/app/lib/workato-client.ts` | `WORKATO_TASK_WEBHOOK_URL`, `buildTaskDeadlineAlertPayload()`, `NOTIFIED_TASKS_KEY` |
| `apps/frontend/src/app/components/TaskList.tsx` | Calls `fireDeadlineEmailIfTomorrow()` after `saveTask()` |
| `apps/frontend/src/app/pages/Timetable.tsx` | Calls `fireDeadlineEmailIfTomorrow()` after `saveTask()` in Add Task dialog |
| `apps/frontend/src/app/components/Layout.tsx` | Mounts `useTaskNotifications()` — polling interval + startup banner |
| `apps/frontend/src/app/App.tsx` | Renders `<Toaster>` from sonner for all toast notifications |
| `apps/frontend/.env.local` | `VITE_WORKATO_TASK_WEBHOOK_URL` — task-specific webhook URL |
| `apps/frontend/src/app/types/index.ts` | `Task` interface — includes optional `dueTime?: string` field |

---

## Webhook URL

```
https://webhooks.trial.workato.com/webhooks/rest/a6158446-0e94-4d56-805f-a9b744af435e/synccircledeadline
```

Configured via `VITE_WORKATO_TASK_WEBHOOK_URL` in `.env.local`.
The same URL is hardcoded as a fallback in `workato-client.ts`.

This is **separate** from the Google Calendar webhook (`VITE_WORKATO_WEBHOOK_URL`).

---

## Notification Trigger Rules

| Condition | Behaviour |
|---|---|
| Task created with `dueDate = tomorrow` | Email fired immediately on save (Path A) |
| Task due today, no `dueTime` | In-app toast at **15:00 SGT** (Path B polling) |
| Task due today, has `dueTime` | In-app toast **30 min before** `dueTime` (Path B polling) |
| App loads, task due today | Warning toast immediately (Path C startup banner) |
| App loads, task due tomorrow | Info toast + email if not already sent (Path C startup banner) |

---

## Three Notification Paths

### Path A — On-save (immediate email)

Called from `TaskList.tsx` and `Timetable.tsx` right after `saveTask()`:

```ts
fireDeadlineEmailIfTomorrow(newTask);
```

- Checks `task.dueDate === tomorrowSGT()`
- Reads user email from `localStorage` via `getUser()`
- POSTs `task-deadline-alert` payload to Workato
- Shows `📧 Reminder email scheduled` success toast
- Dedup key: `<taskId>:email:<YYYY-MM-DD>`

### Path B — Timed polling (in-app toast on due day)

`setInterval` running every **60 seconds** while the app is open:

- Finds tasks where `dueDate === todayStr` (SGT)
- Fires warning toast at notify time (15:00 SGT default, or 30 min before `dueTime`)
- Dedup key: `<taskId>:timed:<YYYY-MM-DD>`

### Path C — Startup banner (on every app load)

Runs once on mount via `useEffect` in `useTaskNotifications`:

- Tasks due **today** → warning toast
- Tasks due **tomorrow** → info toast + email (safety net if Path A was missed)
- Dedup key: `<taskId>:banner:<YYYY-MM-DD>` — re-fires each new calendar day

---

## Webhook Payload Contract

```json
{
  "event": "task-deadline-alert",
  "task": {
    "id": "uuid",
    "title": "Submit Assignment 1",
    "dueDate": "2026-07-03",
    "priority": "High"
  },
  "recipient": {
    "email": "user@example.com",
    "displayName": "Your Name"
  },
  "daysUntilDue": 1,
  "notifiedAt": "2026-07-02T10:00:00.000Z"
}
```

- `daysUntilDue`: `1` for on-save and startup banner; `0` for on-day timed path
- `notifiedAt`: UTC ISO timestamp of when the notification fired
- `event` field always `"task-deadline-alert"` — used to filter in Workato recipe

---

## Deduplication

All dedup keys are stored in `localStorage` under `synccircle_notified_tasks`
as a JSON array of strings.

| Key format | Resets |
|---|---|
| `<taskId>:email:<YYYY-MM-DD>` | Never (email sent once per task per date) |
| `<taskId>:timed:<YYYY-MM-DD>` | Next calendar day |
| `<taskId>:banner:<YYYY-MM-DD>` | Next calendar day |

To reset all notifications (e.g. for testing):
```js
localStorage.removeItem('synccircle_notified_tasks')
```

---

## Task Type — dueTime Field

```ts
interface Task {
  id: string;
  title: string;
  dueDate?: string;   // "YYYY-MM-DD"
  dueTime?: string;   // "HH:mm" SGT — optional, controls 30-min warning
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}
```

`dueTime` is only saved when both `dueDate` and `dueTime` are set in the form.
It does **not** affect the email send time — only the in-app toast timing.

---

## Bell Icon Notification Panel

Located in `Layout.tsx` header. Shows a live badge count of tasks due today or tomorrow.

- Clicking the bell opens a dropdown listing each upcoming task
- Badge resets when tasks are completed or deleted
- "Refresh" button calls `checkNow()` for an immediate re-check
- "View all tasks →" navigates to `/timetable`

---

## Workato Recipe Setup

### Trigger
- App: **Webhooks → New event via webhook**
- Endpoint path: `synccircledeadline`

### Action
- App: **Amazon SNS → Publish message to topic**
- Topic: `CramCircle-TaskDeadlineAlerts`
- Topic type: **Standard**
- Subject: `⏰ Task Due Tomorrow: ` + pill `task → title`
- Message format: **Raw**
- Message body: plain text with pills for `recipient.displayName`, `task.title`,
  `task.dueDate`, `task.priority`

### AWS Requirements
- SNS topic in `ap-southeast-1` (or your chosen region)
- Email subscription confirmed on the topic
- IAM user with `sns:Publish` permission on the topic ARN
- Access Key ID + Secret Access Key configured in the Workato connection

---

## Environment Variables

```env
# apps/frontend/.env.local
VITE_WORKATO_WEBHOOK_URL=https://webhooks.trial.workato.com/.../synccircle-google-calendar
VITE_WORKATO_TASK_WEBHOOK_URL=https://webhooks.trial.workato.com/.../synccircledeadline
VITE_KIRO_API_URL=https://api.kiro.placeholder.dev
```

---

## Testing the Full Flow

1. Clear dedup: `localStorage.removeItem('synccircle_notified_tasks')`
2. Ensure user has email: check `localStorage.getItem('synccircle_user')`
3. Create a task with tomorrow's date in the app
4. Watch for `📧 Reminder email scheduled` toast
5. Check Workato job history — the recipe should show a completed run
6. Check inbox for SNS email

---

## Do Not Change

- `fireDeadlineEmailIfTomorrow()` must be called after **every** `saveTask()` that creates a new task
- `tomorrowSGT()` uses UTC arithmetic — do not replace with `new Date()` local time
- The `NOTIFIED_TASKS_KEY` constant — changing it will lose all dedup state
- `daysUntilDue: 1` in the on-save payload — Workato recipe may use this to filter
