# Workato + AWS SNS — Task Deadline Email Notification Setup

This guide walks you through configuring the Workato recipe and AWS SNS so that
when a task is due tomorrow, CramCircle fires a webhook → Workato picks it up →
AWS SNS sends an email to the user.

---

## How it works (end-to-end)

```
User has a task due tomorrow
         ↓
App loads → useTaskNotifications hook runs
         ↓
POST to Workato webhook URL  (task-deadline-alert payload)
         ↓
Workato recipe triggers
         ↓
Workato HTTP action → AWS SNS Publish API
         ↓
SNS sends email to user's address
         ↓
In-app toast also shows immediately
```

---

## Part 1 — AWS SNS Setup

### Step 1: Create an SNS Topic

1. Sign in to the [AWS Console](https://console.aws.amazon.com/sns)
2. Go to **Simple Notification Service → Topics → Create topic**
3. Type: **Standard**
4. Name: `CramCircle-TaskDeadlineAlerts`
5. Click **Create topic**
6. Copy the **Topic ARN** — you'll need it in Workato (looks like
   `arn:aws:sns:ap-southeast-1:123456789012:CramCircle-TaskDeadlineAlerts`)

### Step 2: Subscribe your email to the topic

1. In the topic page, click **Create subscription**
2. Protocol: **Email**
3. Endpoint: your personal email address
4. Click **Create subscription**
5. Check your inbox and click **Confirm subscription** in the email from AWS

### Step 3: Create an IAM user for Workato

1. Go to **IAM → Users → Create user**
2. Name: `workato-synccircle`
3. Attach the policy **AmazonSNSFullAccess** (or a custom policy — see below)
4. Create the user, then go to **Security credentials → Create access key**
5. Choose **Application running outside AWS**
6. Copy the **Access Key ID** and **Secret Access Key** — store these safely

**Minimal IAM policy (recommended over full access):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:ap-southeast-1:YOUR_ACCOUNT_ID:CramCircle-TaskDeadlineAlerts"
    }
  ]
}
```

---

## Part 2 — Workato Recipe Setup

### Step 1: Create a new recipe

1. Log in to [Workato](https://app.workato.com)
2. Click **Create → Recipe**
3. Name it: `CramCircle — Task Deadline Alert → SNS Email`

### Step 2: Configure the Trigger — Webhook (HTTP)

1. Select trigger: **App: Webhooks → New event via webhook**
2. Workato will generate a webhook URL — copy it
3. **Paste this URL into your `.env.local` file** as `VITE_WORKATO_WEBHOOK_URL`
   (replacing the existing Google Calendar webhook URL, or add a second one
   — see the note at the bottom of this doc)
4. Event name: `task-deadline-alert`
5. Click **Next**, then send a test payload to register the schema:

```json
{
  "event": "task-deadline-alert",
  "task": {
    "id": "test-123",
    "title": "Submit Assignment 1",
    "dueDate": "2026-07-02",
    "priority": "High"
  },
  "recipient": {
    "email": "your@email.com",
    "displayName": "Your Name"
  },
  "daysUntilDue": 1,
  "notifiedAt": "2026-07-01T10:00:00.000Z"
}
```

6. Workato will auto-detect the schema from that payload. Click **Use this sample**.

### Step 3: Add a Filter (optional but recommended)

To only process task-deadline-alert events (and not accidentally catch
calendar-sync events if you use the same webhook URL):

1. Add a **Conditional action: Stop if**
2. Condition: `event` **does not equal** `task-deadline-alert`
3. This stops the recipe early for any other event type

### Step 4: Add Action — HTTP Request to AWS SNS

AWS SNS Publish is a standard HTTPS endpoint. We'll call it directly via
Workato's HTTP connector.

1. Click **+** to add an action
2. App: **HTTP → Send request**
3. Configure:
   - **Method:** POST
   - **URL:** `https://sns.ap-southeast-1.amazonaws.com/`
     *(replace `ap-southeast-1` with your SNS topic's region)*
   - **Request type:** Form data (URL-encoded)
   - **Authentication:** AWS (fill in Access Key ID and Secret Access Key from Part 1 Step 3)
   - **AWS Service:** `sns`
   - **AWS Region:** `ap-southeast-1` *(match your topic region)*

4. Body (form fields):

   | Field | Value |
   |---|---|
   | `Action` | `Publish` |
   | `TopicArn` | `arn:aws:sns:ap-southeast-1:YOUR_ACCOUNT_ID:CramCircle-TaskDeadlineAlerts` |
   | `Subject` | `⏰ Task Due Tomorrow: {{task.title}}` |
   | `Message` | See the message template below |

5. **Message template** (paste this into the Message field, using Workato's
   pill/data mapping to insert dynamic values):

```
Hi {{recipient.displayName}},

This is a reminder from CramCircle that the following task is due tomorrow:

  📋 Task:     {{task.title}}
  📅 Due Date: {{task.dueDate}}
  🚩 Priority: {{task.priority}}

Log in to CramCircle to mark it complete or update the deadline.

Good luck! 🎓
— The CramCircle Team
```

### Step 5: Test the recipe

1. Click **Test recipe**
2. Manually send the test payload from Step 2 to the webhook URL using a tool
   like Postman or curl:

```bash
curl -X POST "YOUR_WORKATO_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "task-deadline-alert",
    "task": {
      "id": "test-123",
      "title": "Submit Assignment 1",
      "dueDate": "2026-07-02",
      "priority": "High"
    },
    "recipient": {
      "email": "YOUR_EMAIL@example.com",
      "displayName": "Your Name"
    },
    "daysUntilDue": 1,
    "notifiedAt": "2026-07-01T10:00:00.000Z"
  }'
```

3. Check your email for the SNS notification
4. Click **Activate recipe** when confirmed working

---

## Part 3 — Frontend Configuration

### Update `.env.local`

Open `apps/frontend/.env.local` and update (or add) the webhook URL:

```env
VITE_WORKATO_WEBHOOK_URL=https://webhooks.workato.com/webhooks/rest/YOUR_RECIPE_ID/your-webhook-token
```

> **Note on multiple webhooks:** Currently `VITE_WORKATO_WEBHOOK_URL` is shared
> between the Google Calendar sync and the task deadline alert. Workato's webhook
> trigger receives both — use the filter in Step 3 above to route by `event` type,
> or create a second recipe with its own URL and add a second env var
> `VITE_WORKATO_TASK_WEBHOOK_URL` if you want them fully separated.

---

## Part 4 — How the in-app notification works

When the app loads (any page), `Layout.tsx` calls `checkDeadlines()`:

1. Reads all tasks from `localStorage`
2. Reads the user's email from `localStorage` (`synccircle_user`)
3. Finds any incomplete task where `dueDate` is exactly tomorrow
4. Skips tasks already notified (tracked in `synccircle_notified_tasks`)
5. POSTs the `task-deadline-alert` payload to Workato
6. Shows a `sonner` warning toast immediately in the app
7. Marks the task as notified so it won't fire again this session

The "already notified" list persists in `localStorage`, so a refresh won't
re-send the email. It resets when the task is deleted or completed.

---

## Troubleshooting

| Symptom | Check |
|---|---|
| Toast shows but no email received | Verify SNS subscription is confirmed (check spam) |
| No toast at all | Open browser DevTools console for errors; check `VITE_WORKATO_WEBHOOK_URL` is set |
| Workato recipe not triggering | Ensure recipe is **Active** (not just saved) |
| SNS returns 403 | IAM user doesn't have `sns:Publish` on the correct Topic ARN |
| Email goes to spam | Add `no-reply@sns.amazonaws.com` to your contacts |
| Notification fires every page load | `synccircle_notified_tasks` may be corrupted — clear it in DevTools → Application → Local Storage |
