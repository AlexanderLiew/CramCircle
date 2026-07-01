import type { TimetableClass } from '../types';
import { sgtDateForDayThisWeek } from './sgt';

// ============================================================
// Google Calendar API Client — Direct REST + GIS OAuth2
// ============================================================
//
// Replaces the Workato webhook approach with direct Google Calendar
// API v3 calls from the browser. Uses Google Identity Services (GIS)
// for OAuth2 popup consent flow (no redirects).
// ============================================================

// --- Configuration ---

const CLIENT_ID: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) || '';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

// --- Storage Keys ---

const TOKEN_KEY = 'synccircle_google_token';
const TOKEN_EXPIRY_KEY = 'synccircle_google_token_expiry';

// --- Exported Types ---

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
}

// --- GIS Token Client (module-level singleton) ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tokenClient: any = null;
let gisLoaded = false;

// --- Helper: Load GSI Script Dynamically ---

function loadGISScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gisLoaded) {
      resolve();
      return;
    }
    // Check if already in DOM
    if (document.querySelector(`script[src="${GIS_SCRIPT_URL}"]`)) {
      gisLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });
}

// --- Helper: SGT to ISO DateTime with timezone ---

/**
 * Converts an SGT date string "YYYY-MM-DD" and time "HH:mm" to an
 * ISO 8601 datetime with +08:00 offset for Google Calendar.
 * e.g. ("2026-07-01", "14:00") → "2026-07-01T14:00:00+08:00"
 */
function sgtToISO8601(sgtDate: string, sgtTime: string): string {
  return `${sgtDate}T${sgtTime}:00+08:00`;
}

// --- Helper: Convert TimetableClass to Google Calendar Event body ---

function classToEventBody(classData: TimetableClass): Record<string, unknown> {
  const sgtDate = sgtDateForDayThisWeek(classData.dayOfWeek);
  return {
    summary: classData.title,
    description: classData.moduleCode ? `Module: ${classData.moduleCode}` : undefined,
    location: classData.location || undefined,
    start: {
      dateTime: sgtToISO8601(sgtDate, classData.startTime),
      timeZone: 'Asia/Singapore',
    },
    end: {
      dateTime: sgtToISO8601(sgtDate, classData.endTime),
      timeZone: 'Asia/Singapore',
    },
  };
}

// --- Helper: Authenticated fetch wrapper ---

async function calendarFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('No valid Google access token. Please sign in first.');
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  return fetch(`${CALENDAR_API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
}

// ============================================================
// Exported Functions
// ============================================================

/**
 * Loads the Google Identity Services script and initializes the
 * OAuth2 token client. Must be called once before signInGoogle().
 */
export async function initGoogleAuth(): Promise<void> {
  if (!CLIENT_ID) {
    console.warn('[GoogleCalendar] VITE_GOOGLE_CLIENT_ID not set. Google Calendar integration disabled.');
    return;
  }

  await loadGISScript();

  // Wait for google.accounts.oauth2 to be available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services not available after script load');
  }

  // Initialize token client (does NOT trigger popup yet)
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: () => {
      // Callback is set dynamically per signIn call
    },
  });
}

/**
 * Triggers the Google OAuth2 popup consent flow.
 * Returns the access token on success.
 */
export function signInGoogle(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Auth not initialized. Call initGoogleAuth() first.'));
      return;
    }

    // Override the callback for this specific sign-in attempt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tokenClient.callback = (response: any) => {
      if (response.error) {
        reject(new Error(`Google sign-in failed: ${response.error}`));
        return;
      }

      const accessToken: string = response.access_token;
      const expiresIn: number = response.expires_in; // seconds

      // Store token and expiry in localStorage
      const expiryTimestamp = Date.now() + expiresIn * 1000;
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTimestamp));

      resolve(accessToken);
    };

    // Trigger the popup
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

/**
 * Revokes the current Google access token and clears localStorage.
 */
export function signOutGoogle(): void {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    // Revoke the token with Google (best-effort, fire-and-forget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (google?.accounts?.oauth2) {
      google.accounts.oauth2.revoke(token, () => {
        // Revocation complete (or failed silently)
      });
    }
  }

  // Clear stored credentials
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * Returns true if a valid (non-expired) Google access token exists.
 */
export function isGoogleConnected(): boolean {
  return getGoogleAccessToken() !== null;
}

/**
 * Returns the stored access token if it exists and has not expired.
 * Returns null if no token or if expired.
 */
export function getGoogleAccessToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiryStr) {
    return null;
  }

  const expiry = Number(expiryStr);
  // Add 60-second buffer to avoid using a token that's about to expire
  if (Date.now() >= expiry - 60_000) {
    // Token expired — clean up
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    return null;
  }

  return token;
}

/**
 * Creates Google Calendar events for all provided classes (batch).
 * Returns true if all events were created successfully.
 */
export async function pushClassesToGoogleCalendar(
  classes: TimetableClass[]
): Promise<boolean> {
  if (classes.length === 0) return true;

  try {
    const results = await Promise.allSettled(
      classes.map((cls) => createGoogleCalendarEvent(cls))
    );

    const allSucceeded = results.every(
      (r) => r.status === 'fulfilled' && r.value !== null
    );
    return allSucceeded;
  } catch (error) {
    console.error('[GoogleCalendar] pushClassesToGoogleCalendar failed:', error);
    return false;
  }
}

/**
 * Fetches events from the user's primary Google Calendar within
 * the specified time range.
 *
 * @param timeMin - ISO 8601 datetime string (inclusive lower bound)
 * @param timeMax - ISO 8601 datetime string (exclusive upper bound)
 */
export async function pullEventsFromGoogleCalendar(
  timeMin: string,
  timeMax: string
): Promise<GoogleCalendarEvent[]> {
  try {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      timeZone: 'Asia/Singapore',
    });

    const response = await calendarFetch(
      `/calendars/primary/events?${params.toString()}`
    );

    if (!response.ok) {
      console.error('[GoogleCalendar] pullEvents failed:', response.status, await response.text());
      return [];
    }

    const data = await response.json();

    // Map API response to our GoogleCalendarEvent interface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events: GoogleCalendarEvent[] = (data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary || '',
      description: item.description,
      location: item.location,
      start: {
        dateTime: item.start?.dateTime || item.start?.date || '',
        timeZone: item.start?.timeZone,
      },
      end: {
        dateTime: item.end?.dateTime || item.end?.date || '',
        timeZone: item.end?.timeZone,
      },
    }));

    return events;
  } catch (error) {
    console.error('[GoogleCalendar] pullEventsFromGoogleCalendar failed:', error);
    return [];
  }
}

/**
 * Deletes a single event from the user's primary Google Calendar.
 * Returns true on success.
 */
export async function deleteGoogleCalendarEvent(eventId: string): Promise<boolean> {
  try {
    const response = await calendarFetch(
      `/calendars/primary/events/${encodeURIComponent(eventId)}`,
      { method: 'DELETE' }
    );

    // 204 No Content = success, 410 Gone = already deleted (treat as success)
    return response.status === 204 || response.status === 410;
  } catch (error) {
    console.error('[GoogleCalendar] deleteGoogleCalendarEvent failed:', error);
    return false;
  }
}

/**
 * Creates a single Google Calendar event from a TimetableClass.
 * Returns the created event's ID, or null on failure.
 */
export async function createGoogleCalendarEvent(
  classData: TimetableClass
): Promise<string | null> {
  try {
    const body = classToEventBody(classData);
    console.log('[GoogleCalendar] Creating event:', JSON.stringify(body, null, 2));

    const response = await calendarFetch('/calendars/primary/events', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GoogleCalendar] createEvent failed (${response.status}):`, errorText);
      
      // Surface specific error reasons
      try {
        const errorData = JSON.parse(errorText);
        const reason = errorData?.error?.errors?.[0]?.reason || errorData?.error?.message || '';
        if (response.status === 403) {
          console.error('[GoogleCalendar] 403 Forbidden — likely Calendar API not enabled in Google Cloud Console, or insufficient scope.');
        }
        if (response.status === 401) {
          console.error('[GoogleCalendar] 401 Unauthorized — token may be expired. Try reconnecting.');
        }
        console.error('[GoogleCalendar] Error reason:', reason);
      } catch { /* ignore parse error */ }
      
      return null;
    }

    const data = await response.json();
    console.log('[GoogleCalendar] Event created:', data.id);
    return data.id || null;
  } catch (error) {
    console.error('[GoogleCalendar] createGoogleCalendarEvent exception:', error);
    return null;
  }
}

/**
 * Updates an existing Google Calendar event with new class data.
 * Returns true on success.
 */
export async function updateGoogleCalendarEvent(
  eventId: string,
  classData: TimetableClass
): Promise<boolean> {
  try {
    const body = classToEventBody(classData);

    const response = await calendarFetch(
      `/calendars/primary/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.error('[GoogleCalendar] updateEvent failed:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('[GoogleCalendar] updateGoogleCalendarEvent failed:', error);
    return false;
  }
}
