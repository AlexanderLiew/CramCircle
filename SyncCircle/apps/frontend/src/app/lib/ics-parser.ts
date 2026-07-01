/**
 * ICS (iCalendar) File Parser for CramCircle/SyncCircle
 *
 * Parses standard .ics file content into TimetableClass[] entries.
 * Handles VEVENT components, recurring rules, timezone parameters,
 * folded lines, and various .ics formatting quirks.
 */

import type { TimetableClass } from '../types';

// Color palette for imported events — cycles per unique SUMMARY
const IMPORT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

// BYDAY value → dayOfWeek mapping (Mon=0 … Fri=4)
const BYDAY_MAP: Record<string, 0 | 1 | 2 | 3 | 4> = {
  MO: 0,
  TU: 1,
  WE: 2,
  TH: 3,
  FR: 4,
};

// JS Date.getDay() → dayOfWeek (Sun=0…Sat=6 → Mon=0…Fri=4)
// Returns undefined for weekends
function jsDayToTimetableDay(jsDay: number): 0 | 1 | 2 | 3 | 4 | undefined {
  // jsDay: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  if (jsDay === 0 || jsDay === 6) return undefined; // weekend
  return (jsDay - 1) as 0 | 1 | 2 | 3 | 4;
}

/**
 * Unfold lines per RFC 5545 §3.1:
 * Lines that start with a space or tab are continuations of the previous line.
 */
function unfoldLines(raw: string): string[] {
  // Normalize line endings to \n
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Unfold: a CRLF followed by a single whitespace is a line continuation
  const unfolded = normalized.replace(/\n[ \t]/g, '');
  return unfolded.split('\n');
}

/**
 * Parse a content line into { name, params, value }
 * e.g. "DTSTART;TZID=Asia/Singapore:20260701T090000"
 *   → { name: "DTSTART", params: { TZID: "Asia/Singapore" }, value: "20260701T090000" }
 */
interface ParsedLine {
  name: string;
  params: Record<string, string>;
  value: string;
}

function parseContentLine(line: string): ParsedLine {
  // Split at first unquoted colon
  // Property name and params are before the colon, value is after
  let colonIdx = -1;
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ':' && !inQuotes) {
      colonIdx = i;
      break;
    }
  }

  if (colonIdx === -1) {
    return { name: line.trim(), params: {}, value: '' };
  }

  const beforeColon = line.substring(0, colonIdx);
  const value = line.substring(colonIdx + 1);

  // Split name and params by semicolons (respecting quotes)
  const parts = splitBySemicolon(beforeColon);
  const name = parts[0].toUpperCase();
  const params: Record<string, string> = {};

  for (let i = 1; i < parts.length; i++) {
    const eqIdx = parts[i].indexOf('=');
    if (eqIdx !== -1) {
      const pName = parts[i].substring(0, eqIdx).toUpperCase();
      let pValue = parts[i].substring(eqIdx + 1);
      // Strip surrounding quotes
      if (pValue.startsWith('"') && pValue.endsWith('"')) {
        pValue = pValue.slice(1, -1);
      }
      params[pName] = pValue;
    }
  }

  return { name, params, value };
}

/**
 * Split a string by semicolons, respecting quoted strings.
 */
function splitBySemicolon(str: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const ch of str) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === ';' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

/**
 * Parse an iCalendar date-time value into a Date object.
 * Supports:
 *   - 20260701T090000 (local date-time)
 *   - 20260701T090000Z (UTC)
 *   - Value from TZID param (treated as local, timezone info ignored for day/time extraction)
 */
function parseDateTime(value: string): Date | null {
  // Strip trailing Z for parsing — we only care about day/time
  const cleaned = value.replace(/Z$/, '');

  // Match: YYYYMMDDTHHmmss
  const match = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (!match) {
    // Try date-only: YYYYMMDD
    const dateOnly = cleaned.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (dateOnly) {
      const [, y, m, d] = dateOnly;
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
}

/**
 * Format hours and minutes to "HH:mm".
 */
function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Extract module code from text.
 * Looks for patterns like "CS2040", "IS3106", "MA1521", etc.
 * (1-4 uppercase letters followed by 4 digits, optionally followed by a letter)
 */
function extractModuleCode(text: string): string | null {
  const match = text.match(/\b([A-Z]{2,4}\d{4}[A-Z]?)\b/);
  return match ? match[1] : null;
}

/**
 * Parse RRULE value and extract BYDAY days.
 * e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR" → [0, 2, 4]
 */
function parseBYDAY(rruleValue: string): (0 | 1 | 2 | 3 | 4)[] {
  const days: (0 | 1 | 2 | 3 | 4)[] = [];

  // Find BYDAY component
  const parts = rruleValue.split(';');
  for (const part of parts) {
    const [key, val] = part.split('=');
    if (key.toUpperCase() === 'BYDAY' && val) {
      const dayTokens = val.split(',');
      for (const token of dayTokens) {
        // BYDAY can have numeric prefix like "1MO" — strip digits
        const dayCode = token.replace(/[-+]?\d*/g, '').toUpperCase();
        if (dayCode in BYDAY_MAP) {
          days.push(BYDAY_MAP[dayCode]);
        }
      }
    }
  }

  return days;
}

/**
 * Represents a parsed VEVENT before conversion to TimetableClass.
 */
interface VEvent {
  summary: string;
  location: string;
  description: string;
  dtstart: Date | null;
  dtend: Date | null;
  rruleBYDAY: (0 | 1 | 2 | 3 | 4)[];
}

/**
 * Extract VEVENT blocks from unfolded lines.
 */
function extractVEvents(lines: string[]): VEvent[] {
  const events: VEvent[] = [];
  let inEvent = false;
  let currentEvent: VEvent | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {
        summary: '',
        location: '',
        description: '',
        dtstart: null,
        dtend: null,
        rruleBYDAY: [],
      };
      continue;
    }

    if (trimmed === 'END:VEVENT') {
      if (currentEvent) {
        events.push(currentEvent);
      }
      inEvent = false;
      currentEvent = null;
      continue;
    }

    if (!inEvent || !currentEvent) continue;

    const parsed = parseContentLine(trimmed);

    switch (parsed.name) {
      case 'SUMMARY':
        currentEvent.summary = parsed.value;
        break;
      case 'LOCATION':
        currentEvent.location = parsed.value;
        break;
      case 'DESCRIPTION':
        // Unescape common sequences
        currentEvent.description = parsed.value
          .replace(/\\n/g, '\n')
          .replace(/\\,/g, ',')
          .replace(/\\\\/g, '\\');
        break;
      case 'DTSTART':
        currentEvent.dtstart = parseDateTime(parsed.value);
        break;
      case 'DTEND':
        currentEvent.dtend = parseDateTime(parsed.value);
        break;
      case 'RRULE':
        currentEvent.rruleBYDAY = parseBYDAY(parsed.value);
        break;
    }
  }

  return events;
}

/**
 * Determine the module code for an event.
 * Priority: DESCRIPTION "Module: XXX" → SUMMARY code-like pattern → SUMMARY as fallback
 */
function getModuleCode(event: VEvent): string {
  // Check DESCRIPTION for "Module: XXX" pattern
  const descModuleMatch = event.description.match(/Module:\s*([A-Z]{2,4}\d{4}[A-Z]?)/i);
  if (descModuleMatch) {
    return descModuleMatch[1].toUpperCase();
  }

  // Check SUMMARY for a code-like pattern
  const summaryCode = extractModuleCode(event.summary);
  if (summaryCode) {
    return summaryCode;
  }

  // No module code found — return empty
  return '';
}

/**
 * Main parser: converts raw .ics content string into TimetableClass[].
 */
export function parseICSFile(icsContent: string): TimetableClass[] {
  const lines = unfoldLines(icsContent);
  const vevents = extractVEvents(lines);
  const results: TimetableClass[] = [];

  // Color assignment: one color per unique SUMMARY, cycling through palette
  const colorMap = new Map<string, string>();
  let colorIndex = 0;

  function getColor(summary: string): string {
    if (colorMap.has(summary)) {
      return colorMap.get(summary)!;
    }
    const color = IMPORT_COLORS[colorIndex % IMPORT_COLORS.length];
    colorMap.set(summary, color);
    colorIndex++;
    return color;
  }

  for (const event of vevents) {
    const moduleCode = getModuleCode(event);
    const title = event.summary || 'Untitled Event';
    const location = event.location || '';
    const color = getColor(event.summary || title);

    // Determine start/end times
    let startTime = '09:00';
    let endTime = '10:00';

    if (event.dtstart) {
      startTime = formatTime(event.dtstart);
    }
    if (event.dtend) {
      endTime = formatTime(event.dtend);
    }

    // Determine day(s) of week
    if (event.rruleBYDAY.length > 0) {
      // Recurring event with BYDAY — create one entry per day
      for (const day of event.rruleBYDAY) {
        results.push({
          id: crypto.randomUUID(),
          title,
          moduleCode,
          location,
          dayOfWeek: day,
          startTime,
          endTime,
          color,
          source: 'imported',
        });
      }
    } else if (event.dtstart) {
      // Single/non-recurring event — derive day from DTSTART
      const jsDay = event.dtstart.getDay();
      const dayOfWeek = jsDayToTimetableDay(jsDay);

      // Skip weekend events
      if (dayOfWeek === undefined) continue;

      results.push({
        id: crypto.randomUUID(),
        title,
        moduleCode,
        location,
        dayOfWeek,
        startTime,
        endTime,
        color,
        source: 'imported',
      });
    }
    // If no DTSTART and no RRULE BYDAY, skip the event (can't determine day)
  }

  return results;
}

/**
 * Reads a File object and parses its content as an .ics file.
 */
export async function parseICSFromFile(file: File): Promise<TimetableClass[]> {
  const content = await file.text();
  return parseICSFile(content);
}
