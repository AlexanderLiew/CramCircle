import type { TimetableClass } from '../types';
import { sgtDateForDayThisWeek } from './sgt';

// ============================================================
// Workato Client — Webhook URL Configuration & Helpers
// ============================================================

/**
 * Base webhook URL for Workato recipes.
 * Configured via VITE_WORKATO_WEBHOOK_URL environment variable.
 * Falls back to a placeholder for local development.
 */
export const WORKATO_WEBHOOK_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WORKATO_WEBHOOK_URL) ||
  'https://webhooks.trial.workato.com/webhooks/rest/a6158446-0e94-4d56-805f-a9b744af435e/synccircle-google-calendar';

/**
 * localStorage key for storing failed syncs that should be retried on next load.
 */
export const PENDING_SYNCS_KEY = 'synccircle_pending_syncs';

// --- Pending Sync Types ---

export type SyncAction = 'create' | 'update' | 'delete';

export type SyncType = 'class' | 'note' | 'calendar-connect' | 'calendar-disconnect' | 'notes-connect';

export interface PendingSync {
  id: string;
  type: SyncType;
  action: SyncAction | 'connect' | 'disconnect';
  payload: unknown;
  createdAt: string;
}

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
