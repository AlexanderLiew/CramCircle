---
inclusion: fileMatch
fileMatchPattern: "**/timetable*,**/calendar*,**/workato*,**/sgt*"
---

# Workato → Google Calendar Integration

## Status: Working ✓

The integration is fully implemented and working. All sync logic lives in the
**frontend only** — no backend is required. The frontend POSTs directly to the
Workato webhook.

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/frontend/src/app/lib/sgt.ts` | All SGT timezone utilities — date math, formatting, UTC conversion |
| `apps/frontend/src/app/lib/workato-client.ts` | Webhook URL, payload builder, `postBulkSync()` |
| `apps/frontend/src/app/hooks/useWorkato.ts` | Per-class sync hook (`syncClass`) called on add/delete |
| `apps/frontend/src/app/pages/Timetable.tsx` | "Sync to Google Calendar" button + `handleSyncToGoogleCalendar` |
| `apps/frontend/.env.local` | `VITE_WORKATO_WEBHOOK_URL` — actual webhook URL |

---

## Webhook URL

```
https://webhooks.trial.workato.com/webhooks/rest/a6158446-0e94-4d56-805f-a9b744af435e/synccircle-google-calendar
```

Configured via `VITE_WORKATO_WEBHOOK_URL` in `.env.local`. The same URL is
hardcoded as a fallback in `workato-client.ts`.

---

## Timezone Approach — SGT (UTC+8)

All timetable times are treated as **Singapore Time (SGT = UTC+8)**.

The `sgt.ts` utility uses `Date.UTC` arithmetic internally — it is completely
immune to the machine's local timezone. This means the app works correctly
whether the computer is in SGT, UTC, or any other timezone.

**Conversion flow:**
1. User enters `12:00` in the timetable → stored as `"12:00"` (SGT implied)
2. On sync, `sgtToUTCDateTime()` subtracts 8 hours → `"04:00Z"` UTC
3. Workato receives pure UTC and forwards it to Google Calendar API as-is
4. Google Calendar displays the event in the user's calendar timezone

**Requirement:** The user's Google Calendar timezone must be set to
`Asia/Singapore (+08:00)`. This is a one-time Google Calendar account setting
under Settings → General → Time zone.

---

## Payload Contract (Current)

The frontend sends this shape to Workato — datetimes are pure UTC with `Z` suffix:

```json
{
  "events": [
    {
      "title": "Data Structures",
      "startDateTime": "2026-06-30T01:00:00Z",
      "endDateTime": "2026-06-30T03:00:00Z",
      "location": "CS-201",
      "description": "Module: CS2040"
    }
  ]
}
```

- `startDateTime` / `endDateTime` are UTC (SGT − 8h), always with `Z`
- Dates are the **real current-week SGT dates** computed at sync time
- `"12:00 SGT"` → `"04:00Z"`, `"09:00 SGT"` → `"01:00Z"`

---

## Workato Recipe Configuration

| Setting | Value |
|---------|-------|
| Trigger | HTTP Webhook (single endpoint) |
| Displayed time zone | `Etc/UTC (+00:00)` — do NOT change this |
| Step 1 | Repeat for each → `events` array |
| Step 2 | Google Calendar → Create event |

### Google Calendar Action Field Mapping

| Google Calendar field | Workato mapping |
|-----------------------|-----------------|
| Summary / Title | `events[].title` |
| Start date time | `events[].startDateTime` |
| End date time | `events[].endDateTime` |
| Location | `events[].location` |
| Description | `events[].description` |
| Calendar | `primary` |

**Important:** Leave Workato's "Displayed time zone" as `Etc/UTC`.
The `+08:00` conversion is already done in the frontend code — Workato must
not apply any additional timezone shift.

---

## How the Sync Button Works

Located in `Timetable.tsx` header:

```tsx
<button onClick={handleSyncToGoogleCalendar}>
  Sync to Google Calendar
</button>
```

Flow:
1. Reads all classes from `localStorage` via `getClasses()`
2. Calls `postBulkSync(classes)` from `workato-client.ts`
3. `buildBulkSyncPayload()` maps each class to UTC datetime using `sgtToUTCDateTime()`
4. POSTs `{ events: [...] }` to the Workato webhook
5. Shows success/error toast via `sonner`

Per-class sync (`syncClass` from `useWorkato`) also fires on every individual
add/delete — this uses the same webhook endpoint with an `action` field in the payload.

---

## Running the Project

```bash
cd SyncCircle
corepack pnpm install   # first time only
corepack pnpm dev
```

Open `http://localhost:5173/timetable` and click **Sync to Google Calendar**.

---

## Do Not Change

- The `sgtToUTCDateTime()` function in `workato-client.ts` — it correctly converts SGT to UTC
- The `Z` suffix on datetime strings — removing it breaks Google Calendar display
- Workato's "Displayed time zone" setting — must stay `Etc/UTC`
- The `sgt.ts` utility functions — they are the single source of truth for all date/time logic
