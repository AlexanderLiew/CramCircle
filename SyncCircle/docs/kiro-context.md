# Kiro Context

## What Exists Now

SyncCircle currently contains a Vite React prototype under `apps/frontend` for a student collaboration app with these screens:

- Login/signup/forgot password
- Dashboard
- Timetable
- Notes
- AI planner
- Friends
- Group chat
- Profile
- Settings

The UI is mostly presentational. Auth is mocked with `localStorage`, and there is no backend API connection yet.

## Suggested Kiro Task Direction

1. Stabilize the frontend as a clean Vite React app.
2. Decide the backend stack and add real API routes under `apps/backend`.
3. Replace demo/local state with API calls.
4. Add shared DTOs and validation schemas under `packages/shared`.
5. Add smoke tests for login, dashboard navigation, timetable, notes, and group chat.

## Guardrails

- Preserve the existing screens unless replacing them with a working equivalent.
- Keep frontend and backend independently runnable.
- Document any new environment variables where they are introduced.
