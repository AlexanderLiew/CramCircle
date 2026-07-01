// ============================================================
// SGT (Singapore Time) Utilities — UTC+8, no DST
// ============================================================
//
// All timetable times are treated as Singapore Time (SGT = UTC+8).
// These helpers ensure dates and times are always computed in SGT
// regardless of the machine's local timezone, so syncing to Google
// Calendar is always accurate.
// ============================================================

const SGT_OFFSET_MS = 8 * 60 * 60 * 1000; // UTC+8

/**
 * Returns a Date object representing "now" shifted to SGT.
 * Use this instead of new Date() whenever you need the current
 * date/time expressed in Singapore time.
 */
export function nowInSGT(): Date {
  return new Date(Date.now() + SGT_OFFSET_MS);
}

/**
 * Returns the current date components in SGT as { year, month (1-12), day }.
 */
export function todaySGT(): { year: number; month: number; day: number; dow: number } {
  const sgt = nowInSGT();
  // getUTC* gives us the SGT-shifted values since we added the offset
  return {
    year: sgt.getUTCFullYear(),
    month: sgt.getUTCMonth() + 1,
    day: sgt.getUTCDate(),
    // getUTCDay: 0=Sun…6=Sat → shift so Mon=0, Sun=6
    dow: (sgt.getUTCDay() + 6) % 7,
  };
}

/**
 * Returns the SGT date string "YYYY-MM-DD" for a given timetable day
 * within the current SGT week (Mon–Fri).
 *
 * dayOfWeek: 0=Monday … 4=Friday
 *
 * Example — SGT today is Wednesday 2 July 2026:
 *   0 (Mon) → "2026-06-30"
 *   1 (Tue) → "2026-07-01"
 *   2 (Wed) → "2026-07-02"
 *   4 (Fri) → "2026-07-04"
 */
export function sgtDateForDayThisWeek(dayOfWeek: 0 | 1 | 2 | 3 | 4): string {
  const { year, month, day, dow } = todaySGT();
  const diff = dayOfWeek - dow;

  // Compute target date using UTC arithmetic to avoid local-tz interference
  const baseMs = Date.UTC(year, month - 1, day);
  const targetMs = baseMs + diff * 24 * 60 * 60 * 1000;
  const t = new Date(targetMs);

  const yyyy = t.getUTCFullYear();
  const mm = String(t.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(t.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns the Monday of the current SGT week as "YYYY-MM-DD".
 */
export function sgtWeekStart(): string {
  return sgtDateForDayThisWeek(0);
}

/**
 * Returns the Friday of the current SGT week as "YYYY-MM-DD".
 */
export function sgtWeekEnd(): string {
  return sgtDateForDayThisWeek(4);
}

/**
 * Formats an SGT date string "YYYY-MM-DD" to a human-readable label.
 * e.g. "2026-07-01" → "1 Jul"
 */
export function formatSGTDate(dateStr: string): string {
  const [yyyy, mm, dd] = dateStr.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${dd} ${months[mm - 1]}`;
}

/**
 * Formats an "HH:mm" 24h string to 12h AM/PM format for display.
 * e.g. "09:00" → "9:00 AM", "14:00" → "2:00 PM"
 */
export function formatTime12h(time: string): string {
  const [hh, mm] = time.split(':').map(Number);
  const period = hh < 12 ? 'AM' : 'PM';
  const h = hh % 12 || 12;
  return `${h}:${String(mm).padStart(2, '0')} ${period}`;
}

/**
 * Builds a timezone-aware ISO 8601 datetime string for Google Calendar.
 * Appends the SGT offset (+08:00) so the time is unambiguous.
 *
 * e.g. sgtDateForDayThisWeek(1) + "14:00" → "2026-07-01T14:00:00+08:00"
 */
export function toSGTDateTime(dateStr: string, timeHHmm: string): string {
  return `${dateStr}T${timeHHmm}:00+08:00`;
}
