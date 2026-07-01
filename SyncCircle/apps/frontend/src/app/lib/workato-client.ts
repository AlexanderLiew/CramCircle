import type { TimetableClass } from '../types';
import { sgtDateForDayThisWeek } from './sgt';

// ============================================================
// Workato Client — Webhook URL Configuration & Helpers
// ============================================================

/**
 * Workato webhook URL for Google Calendar / Notes sync.
 * Configured via VITE_WORKATO_WEBHOOK_URL environment variable.
 */
export const WORKATO_WEBHOOK_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WORKATO_WEBHOOK_URL) ||
  'https://webhooks.trial.workato.com/webhooks/rest/a6158446-0e94-4d56-805f-a9b744af435e/synccircle-google-calendar';

/**
 * Workato webhook URL specifically for task deadline email alerts → AWS SNS.
 * Configured via VITE_WORKATO_TASK_WEBHOOK_URL environment variable.
 */
export const WORKATO_TASK_WEBHOOK_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WORKATO_TASK_WEBHOOK_URL) ||
  'https://webhooks.trial.workato.com/webhooks/rest/a6158446-0e94-4d56-805f-a9b744af435e/synccircledeadline';

/**
 * localStorage key for storing failed syncs that should be retried on next load.
 */
export const PENDING_SYNCS_KEY = 'synccircle_pending_syncs';

// --- Pending Sync Types ---

export type SyncAction = 'create' | 'update' | 'delete';

export type SyncType =
  | 'class'
  | 'note'
  | 'calendar-connect'
  | 'calendar-disconnect'
  | 'notes-connect'
  | 'task-deadline-alert';

export interface PendingSync {
  id: string;
  type: SyncType;
  action: SyncAction | 'connect' | 'disconnect' | 'notify';
  payload: unknown;
  createdAt: string;
}

// --- Task Deadline Alert ---

export interface TaskDeadlineAlertPayload {
  event: 'task-deadline-alert';
  task: {
    id: string;
    title: string;
    dueDate: string;       // ISO date string e.g. "2026-07-02"
    priority: string;      // 'High' | 'Medium' | 'Low'
  };
  recipient: {
    email: string;
    displayName: string;
  };
  daysUntilDue: number;    // always 1 for the current threshold
  notifiedAt: string;      // ISO timestamp of when the notification was fired
}

/**
 * Builds the payload sent to Workato when a task deadline is 1 day away.
 * Workato receives this, then calls AWS SNS to send the email.
 */
export function buildTaskDeadlineAlertPayload(
  taskId: string,
  taskTitle: string,
  taskDueDate: string,
  taskPriority: string,
  recipientEmail: string,
  recipientName: string,
  daysUntilDue: number
): TaskDeadlineAlertPayload {
  return {
    event: 'task-deadline-alert',
    task: {
      id: taskId,
      title: taskTitle,
      dueDate: taskDueDate,
      priority: taskPriority,
    },
    recipient: {
      email: recipientEmail,
      displayName: recipientName,
    },
    daysUntilDue,
    notifiedAt: new Date().toISOString(),
  };
}

/**
 * localStorage key for tracking which task IDs have already had a
 * deadline notification sent, so we don't spam on every page load.
 * Stored as a JSON array of strings: ["taskId1", "taskId2", ...]
 */
export const NOTIFIED_TASKS_KEY = 'synccircle_notified_tasks';

// --- Google Calendar Field Mapping ---

/**
 * Maps CramCircle TimetableClass fields to Google Calendar event fields.
 * Used by the Workato webhook to create/update Google Calendar events.
 */
export function mapClassToGoogleCalendarEvent(classData: TimetableClass): Record<string, unknown> {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

  return {
    summary: classData.title,
    description: `Module: ${classData.moduleCode}`,
    location: classData.location,
    recurrence: `BYDAY=${dayNames[classData.dayOfWeek].slice(0, 2).toUpperCase()}`,
    start: {
      time: classData.startTime,
      dayOfWeek: dayNames[classData.dayOfWeek],
    },
    end: {
      time: classData.endTime,
      dayOfWeek: dayNames[classData.dayOfWeek],
    },
    colorId: classData.color,
    source: classData.source,
    externalId: classData.id,
    moduleCode: classData.moduleCode,
  };
}

// --- Bulk Sync (Timetable → Google Calendar) ---

/**
 * Returns the SGT date string (YYYY-MM-DD) for a timetable day this week.
 * Delegates to the canonical SGT utility so all date logic is in one place.
 */
export function getDateForDayThisWeek(dayOfWeek: 0 | 1 | 2 | 3 | 4): string {
  return sgtDateForDayThisWeek(dayOfWeek);
}

/**
 * Converts an SGT "HH:mm" + "YYYY-MM-DD" to a UTC ISO string with Z suffix.
 * SGT = UTC+8, so UTC = SGT - 8 hours.
 * Handles midnight rollback (e.g. 01:00 SGT → previous day 17:00 UTC).
 */
function sgtToUTCDateTime(sgtDate: string, sgtTime: string): string {
  const [hh, mm] = sgtTime.split(':').map(Number);
  const [yyyy, mo, dd] = sgtDate.split('-').map(Number);

  // Build a UTC ms timestamp: treat the SGT date+time as if it were UTC,
  // then subtract 8 hours to get real UTC
  const sgtAsUTCMs = Date.UTC(yyyy, mo - 1, dd, hh, mm, 0);
  const realUTCMs = sgtAsUTCMs - 8 * 60 * 60 * 1000;

  const d = new Date(realUTCMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const mins = String(d.getUTCMinutes()).padStart(2, '0');

  return `${y}-${m}-${day}T${hours}:${mins}:00Z`;
}

/**
 * Builds the bulk payload with pure UTC datetime strings (Z suffix).
 * Times are entered in SGT (UTC+8) and converted to UTC before sending.
 * Workato passes them straight to Google Calendar, which displays them
 * in your calendar's timezone (SGT) — so 9:00 AM SGT shows as 9:00 AM.
 *
 * Shape: { events: [{ title, startDateTime, endDateTime, location, description }] }
 */
export function buildBulkSyncPayload(classes: TimetableClass[]): {
  events: {
    title: string;
    startDateTime: string;
    endDateTime: string;
    location: string;
    description: string;
  }[];
} {
  return {
    events: classes.map((cls) => {
      const sgtDate = sgtDateForDayThisWeek(cls.dayOfWeek);
      return {
        title: cls.title,
        startDateTime: sgtToUTCDateTime(sgtDate, cls.startTime),
        endDateTime: sgtToUTCDateTime(sgtDate, cls.endTime),
        location: cls.location,
        description: cls.moduleCode ? `Module: ${cls.moduleCode}` : '',
      };
    }),
  };
}

/**
 * POST the bulk sync payload directly to the Workato webhook URL.
 * Returns true on HTTP 2xx, false otherwise.
 */
export async function postBulkSync(classes: TimetableClass[]): Promise<boolean> {
  if (classes.length === 0) return true;
  try {
    const res = await fetch(WORKATO_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBulkSyncPayload(classes)),
    });
    return res.ok;
  } catch {
    return false;
  }
}
