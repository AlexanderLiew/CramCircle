# Backend

This folder is reserved for the SyncCircle backend. No backend is wired to the imported frontend yet.

Recommended first backend scope:

- Auth/session API that replaces the current frontend-only `localStorage` demo auth.
- User profile and friend graph endpoints.
- Timetable, notes, group chat, and AI planner APIs.
- A documented API contract consumed by `apps/frontend`.

Keep backend code here when the team chooses the stack. For a hackathon build, a small Node/Express or serverless API is likely enough.
