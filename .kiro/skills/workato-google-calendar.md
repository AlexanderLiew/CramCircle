# Skill: Workato → Google Calendar Sync

## What This Skill Covers

How to work with, debug, or extend the timetable → Google Calendar sync
feature in SyncCircle.

---

## Architecture at a Glance

```
Timetable page (Timetable.tsx)
  └── postBulkSync(classes)          ← workato-client.ts
        └── buildBulkSyncPayload()   ← converts SGT times to UTC
              └── sgtToUTCDateTime() ← uses sgt.ts utilities
                    └── POST → Workato webhook → Google Calendar
```

---

## Timezone Rule — Never Break This

All timetable times are **Singapore Time (SGT = UTC+8)**.
Before sending to Workato, subtract 8 hours to get UTC.

```ts
// SGT 12:00 → UTC 04:00
const sgtAsUTCMs = Date.UTC(yyyy, mo - 1, dd, hh, mm, 0);
const realUTCMs = sgtAsUTCMs - 8 * 60 * 60 * 1000;
```

Always send with `Z` suffix. Never send with `+08:00` or no suffix —
Workato ignores offset strings and treats naive datetimes as UTC.

---

## Adding a New Field to the Sync Payload

1. Add the field to `buildBulkSyncPayload()` in `workato-client.ts`
2. Update the Workato payload schema (click "Edit Schema" on the webhook trigger)
3. Map the new field in the Google Calendar action step

---

## Changing the Webhook URL

Update both places:
- `apps/frontend/.env.local` → `VITE_WORKATO_WEBHOOK_URL=<new-url>`
- Fallback in `workato-client.ts` → `WORKATO_WEBHOOK_URL` constant

Restart the dev server after changing `.env.local`.

---

## Debugging a Sync

1. Open browser DevTools → Network tab
2. Click "Sync to Google Calendar"
3. Find the POST request to the Workato URL
4. Check the request body — confirm `startDateTime` ends in `Z` and is 8h behind SGT
5. Check the response — `200` means Workato received it; check the Workato job log for Google Calendar errors

**Common issues:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| Events show 8h early | Google Calendar timezone not set to SGT | Set Google Calendar → Settings → Time zone → Asia/Singapore |
| Events show wrong day | `sgtDateForDayThisWeek` bug | Check `sgt.ts` — uses `Date.UTC` not local date |
| Sync button shows error toast | Webhook URL wrong or Workato recipe stopped | Check `.env.local` and verify recipe is running |
| No toast at all | JS error before fetch | Check browser console |

---

## Key Functions Reference

| Function | File | Does |
|----------|------|------|
| `sgtDateForDayThisWeek(dow)` | `sgt.ts` | Returns `"YYYY-MM-DD"` for a timetable day in the current SGT week |
| `sgtToUTCDateTime(date, time)` | `workato-client.ts` | Converts SGT date+time to `"YYYY-MM-DDTHH:MM:00Z"` UTC |
| `buildBulkSyncPayload(classes)` | `workato-client.ts` | Builds full `{ events: [...] }` payload |
| `postBulkSync(classes)` | `workato-client.ts` | POSTs payload to Workato, returns `true/false` |
| `syncClass(action, cls)` | `useWorkato.ts` | Per-class sync on add/delete with pending retry queue |
