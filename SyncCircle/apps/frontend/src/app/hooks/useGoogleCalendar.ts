import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  initGoogleAuth,
  signInGoogle,
  signOutGoogle,
  isGoogleConnected,
  pushClassesToGoogleCalendar,
  pullEventsFromGoogleCalendar,
} from '../lib/google-calendar';
import type { TimetableClass } from '../types';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface UseGoogleCalendarReturn {
  isConnected: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  syncStatus: SyncStatus;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  syncToGoogle: (classes: TimetableClass[]) => Promise<boolean>;
  importFromGoogle: (weekOffset?: number) => Promise<TimetableClass[]>;
}

/**
 * Returns the start (Monday 00:00) and end (Sunday 23:59:59) of the current week
 * in ISO format with Singapore timezone offset.
 */
function getCurrentWeekRange(weekOffset = 0): { timeMin: string; timeMax: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const formatSGT = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
  };

  return {
    timeMin: formatSGT(monday),
    timeMax: formatSGT(sunday),
  };
}

/**
 * Converts a Google Calendar event into a TimetableClass object.
 * Maps event summary to title and extracts time/location/day data.
 */
function convertEventToTimetableClass(event: {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}): TimetableClass | null {
  const startDateTime = event.start?.dateTime || event.start?.date || '';
  const endDateTime = event.end?.dateTime || event.end?.date || '';

  if (!startDateTime || !endDateTime) return null;

  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  // Convert JS day (0=Sun…6=Sat) to timetable dayOfWeek (0=Mon…4=Fri)
  const jsDay = startDate.getDay();
  if (jsDay === 0 || jsDay === 6) return null; // skip weekends
  const dayOfWeek = (jsDay - 1) as 0 | 1 | 2 | 3 | 4;

  const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Try to extract module code from description "Module: CS2040" pattern
  const descMatch = event.description?.match(/Module:\s*([A-Z]{2,4}\d{3,4}[A-Z]?)/i);
  const summaryMatch = event.summary?.match(/([A-Z]{2,4}\d{3,4}[A-Z]?)/);
  const moduleCode = descMatch?.[1] || summaryMatch?.[1] || '';

  // Color palette for imported events
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
  const colorIdx = Math.abs((event.summary || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length;

  return {
    id: event.id || crypto.randomUUID(),
    title: event.summary || 'Imported Event',
    moduleCode,
    location: event.location || '',
    dayOfWeek,
    startTime: formatTime(startDate),
    endTime: formatTime(endDate),
    color: colors[colorIdx],
    source: 'imported',
  };
}

export function useGoogleCalendar(): UseGoogleCalendarReturn {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Auth on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initGoogleAuth();
        if (mounted) {
          setIsInitialized(true);
          setIsConnected(isGoogleConnected());
        }
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Failed to initialize Google Auth';
          setError(message);
          console.error('Google Auth initialization failed:', err);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // Connect to Google Calendar
  const connect = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await signInGoogle();
      setIsConnected(true);
      toast.success('Connected to Google Calendar');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to Google Calendar';
      setError(message);
      setIsConnected(false);
      toast.error('Failed to connect to Google Calendar', {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect from Google Calendar
  const disconnect = useCallback((): void => {
    try {
      signOutGoogle();
      setIsConnected(false);
      setError(null);
      setSyncStatus('idle');
      toast.success('Disconnected from Google Calendar');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(message);
      toast.error('Failed to disconnect from Google Calendar', {
        description: message,
      });
    }
  }, []);

  // Sync classes to Google Calendar
  const syncToGoogle = useCallback(async (classes: TimetableClass[]): Promise<boolean> => {
    if (!isGoogleConnected()) {
      toast.error('Not connected to Google Calendar');
      return false;
    }

    setSyncStatus('syncing');
    setError(null);

    try {
      const success = await pushClassesToGoogleCalendar(classes);

      if (success) {
        setSyncStatus('success');
        toast.success('Timetable synced to Google Calendar', {
          description: `${classes.length} class${classes.length !== 1 ? 'es' : ''} pushed successfully.`,
        });
      } else {
        setSyncStatus('error');
        toast.error('Some classes failed to sync', {
          description: 'Check browser console (F12) for details. Common causes: Calendar API not enabled, or token expired — try reconnecting.',
        });
      }

      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync to Google Calendar';
      setSyncStatus('error');
      setError(message);
      toast.error('Failed to sync to Google Calendar', {
        description: message,
      });
      return false;
    }
  }, []);

  // Import events from Google Calendar (specified week)
  const importFromGoogle = useCallback(async (weekOffset = 0): Promise<TimetableClass[]> => {
    if (!isGoogleConnected()) {
      toast.error('Not connected to Google Calendar');
      return [];
    }

    setSyncStatus('syncing');
    setError(null);

    try {
      const { timeMin, timeMax } = getCurrentWeekRange(weekOffset);
      const events = await pullEventsFromGoogleCalendar(timeMin, timeMax);

      const classes: TimetableClass[] = events
        .map(convertEventToTimetableClass)
        .filter((c): c is TimetableClass => c !== null);

      setSyncStatus('success');
      toast.success('Imported events from Google Calendar', {
        description: `${classes.length} event${classes.length !== 1 ? 's' : ''} imported for this week.`,
      });

      return classes;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import from Google Calendar';
      setSyncStatus('error');
      setError(message);
      toast.error('Failed to import from Google Calendar', {
        description: message,
      });
      return [];
    }
  }, []);

  return {
    isConnected,
    isInitialized,
    isLoading,
    syncStatus,
    error,
    connect,
    disconnect,
    syncToGoogle,
    importFromGoogle,
  };
}
