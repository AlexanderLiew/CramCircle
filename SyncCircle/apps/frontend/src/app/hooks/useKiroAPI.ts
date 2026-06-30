import { useState, useCallback } from 'react';
import type { ChatMessage, TimetableClass, Task, UserSettings } from '../types';
import { getClasses, getTasks, getSettings } from '../lib/storage';

// --- Types ---

export interface UserContext {
  timetable: TimetableClass[];
  tasks: Task[];
  aiPreferences: UserSettings['aiPreferences'];
}

interface APIResult<T> {
  data?: T;
  error?: string;
}

export interface UseKiroAPIReturn {
  summarizeNote: (content: string) => Promise<APIResult<{ summary: string }>>;
  chatMessage: (
    message: string,
    history: ChatMessage[],
    context: UserContext
  ) => Promise<APIResult<{ response: string }>>;
  isLoading: boolean;
  error: string | null;
}

// --- API Base URL ---

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_KIRO_API_URL) ||
  '';

// --- Mock AI Response (used when no real API is configured) ---

function generateMockChatResponse(message: string, context: UserContext): string {
  const msg = message.toLowerCase();
  const { timetable, tasks } = context;
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? -1 : today.getDay() - 1; // Map to 0-4 Mon-Fri
  const todaysClasses = timetable.filter((c) => c.dayOfWeek === dayOfWeek);

  if (msg.includes('schedule') || msg.includes('today') || msg.includes('class')) {
    if (todaysClasses.length === 0) {
      return `You don't have any classes scheduled for today! This is a great opportunity to work on your ${incompleteTasks.length} pending task${incompleteTasks.length !== 1 ? 's' : ''} or get ahead on studying.`;
    }
    const classList = todaysClasses
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((c) => `• ${c.title} (${c.startTime} - ${c.endTime}) at ${c.location}`)
      .join('\n');
    return `Here's your schedule for today:\n\n${classList}\n\nYou have ${todaysClasses.length} class${todaysClasses.length !== 1 ? 'es' : ''} today. I'd suggest using the gaps between classes for quick review sessions.`;
  }

  if (msg.includes('task') || msg.includes('todo') || msg.includes('pending')) {
    if (incompleteTasks.length === 0) {
      return "You're all caught up — no pending tasks! Consider reviewing upcoming material or getting ahead on assignments.";
    }
    const taskList = incompleteTasks
      .slice(0, 5)
      .map((t) => `• ${t.title} (${t.priority} priority${t.dueDate ? `, due ${new Date(t.dueDate).toLocaleDateString()}` : ''})`)
      .join('\n');
    return `You have ${incompleteTasks.length} pending task${incompleteTasks.length !== 1 ? 's' : ''}:\n\n${taskList}\n\nI'd recommend tackling the high-priority items first. Want me to help you plan study blocks?`;
  }

  if (msg.includes('study') || msg.includes('plan') || msg.includes('session')) {
    const freeHours = todaysClasses.length > 0
      ? `Based on your ${todaysClasses.length} class${todaysClasses.length !== 1 ? 'es' : ''} today, I'd suggest studying in the gaps between them.`
      : "Since you don't have classes today, you could dedicate a solid 2-3 hour block for deep study.";
    return `Here's a study plan suggestion:\n\n${freeHours}\n\n📚 **Recommended approach:**\n• Use 25-min focused sessions (Pomodoro technique)\n• Take 5-min breaks between sessions\n• After 4 sessions, take a longer 15-20 min break\n• Start with your most difficult subject while your energy is highest`;
  }

  if (msg.includes('meet') || msg.includes('free') || msg.includes('available')) {
    return "To find the best meeting time, I'd look at the gaps in everyone's timetable. Try using the **Friend Availability** feature on the Timetable page — select the friends you want to meet with and it'll highlight when everyone is free!\n\nGenerally, late afternoon (3-5 PM) tends to work well for group study sessions after classes wrap up.";
  }

  if (msg.includes('break') || msg.includes('rest') || msg.includes('relax')) {
    return "Here are some study break suggestions:\n\n🧘 **5-minute breaks:**\n• Stretch or walk around\n• Do some deep breathing\n• Look away from screens (20-20-20 rule)\n\n☕ **15-minute breaks:**\n• Grab a snack or drink\n• Listen to a song or two\n• Chat with a friend\n\nRemember: breaks actually improve retention and focus for your next study block!";
  }

  if (msg.includes('exam') || msg.includes('test') || msg.includes('revision')) {
    return "Here's my exam prep strategy:\n\n📋 **1 week before:**\n• Review all lecture notes and highlights\n• Identify weak areas that need extra attention\n\n📝 **3-4 days before:**\n• Practice past papers or problem sets\n• Create summary sheets / cheat sheets\n\n🔄 **1-2 days before:**\n• Do active recall — test yourself without notes\n• Review only the areas you struggled with\n\n💤 **Night before:**\n• Light review only — no cramming\n• Get 7-8 hours of sleep!\n\nWant me to help you schedule specific study blocks for an upcoming exam?";
  }

  // Default helpful response
  return `I'm here to help with your study planning! Here are some things I can assist with:\n\n• 📅 Reviewing your schedule and finding free time\n• ✅ Prioritizing your pending tasks (you have ${incompleteTasks.length})\n• 📚 Creating study plans and session schedules\n• 🤝 Finding meeting times with friends\n• 😌 Suggesting study breaks and wellness tips\n• 📝 Exam preparation strategies\n\nWhat would you like help with?`;
}

function generateMockSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  if (sentences.length <= 2) {
    return `Summary: ${content.slice(0, 200)}`;
  }
  // Take first and last meaningful sentences as a basic summary
  const keyPoints = sentences.slice(0, 3).map((s) => s.trim());
  return `**Key Points:**\n${keyPoints.map((p) => `• ${p}`).join('\n')}\n\n(${sentences.length} main points identified in the note)`;
}

// --- Core fetch wrapper with AbortController timeout ---

async function callKiroAPI<T>(
  endpoint: string,
  payload: unknown,
  timeoutMs: number
): Promise<APIResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { error: 'Something went wrong. Please try again.' };
    }
    return { data: await res.json() };
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { error: 'Request timed out. Please try again.' };
    }
    return { error: 'Unable to connect. Please check your connection.' };
  }
}

// --- Hook ---

/**
 * Custom hook for interacting with the Kiro API.
 *
 * Provides methods for note summarization and AI chat,
 * along with shared loading and error state.
 */
export function useKiroAPI(): UseKiroAPIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summarizeNote = useCallback(
    async (content: string): Promise<APIResult<{ summary: string }>> => {
      setIsLoading(true);
      setError(null);

      // Use mock response when no real API URL is configured
      if (!API_BASE_URL) {
        await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate network delay
        const summary = generateMockSummary(content);
        setIsLoading(false);
        return { data: { summary } };
      }

      const result = await callKiroAPI<{ summary: string }>(
        `${API_BASE_URL}/api/summarize`,
        { content },
        30_000 // 30s timeout
      );

      setIsLoading(false);
      if (result.error) {
        setError(result.error);
      }
      return result;
    },
    []
  );

  const chatMessage = useCallback(
    async (
      message: string,
      history: ChatMessage[],
      context: UserContext
    ): Promise<APIResult<{ response: string }>> => {
      setIsLoading(true);
      setError(null);

      // Use mock response when no real API URL is configured
      if (!API_BASE_URL) {
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700)); // Simulate typing delay
        const response = generateMockChatResponse(message, context);
        setIsLoading(false);
        return { data: { response } };
      }

      const result = await callKiroAPI<{ response: string }>(
        `${API_BASE_URL}/api/chat`,
        {
          message,
          history,
          context: {
            timetable: context.timetable,
            tasks: context.tasks,
            aiPreferences: context.aiPreferences,
          },
        },
        10_000 // 10s timeout
      );

      setIsLoading(false);
      if (result.error) {
        setError(result.error);
      }
      return result;
    },
    []
  );

  return { summarizeNote, chatMessage, isLoading, error };
}

/**
 * Helper to build UserContext from current localStorage state.
 * Useful for callers who want a quick way to assemble context.
 */
export function buildUserContext(): UserContext {
  const settings = getSettings();
  return {
    timetable: getClasses(),
    tasks: getTasks(),
    aiPreferences: settings.aiPreferences,
  };
}
