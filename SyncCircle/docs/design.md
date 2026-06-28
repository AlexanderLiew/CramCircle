# SyncCircle Design Document

## Architecture

SyncCircle is organized as a small monorepo:

```text
apps/frontend    Vite React frontend app
apps/backend     Future API/service implementation
packages/shared  Shared TypeScript contracts and utilities
tests            Future e2e and integration tests
docs             Product and design documentation
infra            Future deployment notes
```

## Frontend Design

The current frontend uses:

- Vite
- React
- React Router
- Tailwind CSS
- Radix-style UI components
- Lucide icons
- Motion animations

Current routing lives in `apps/frontend/src/app/routes.tsx`. The main layout lives in `apps/frontend/src/app/components/Layout.tsx`. Pages live in `apps/frontend/src/app/pages`.

The prototype currently stores a demo auth flag in `localStorage` under `synccircle_auth`. This is temporary and should be replaced when the backend exists.

## Backend Design Placeholder

No backend stack has been implemented yet. Recommended simple hackathon path:

- Node.js + Express/Fastify, or a serverless API if deployment speed matters.
- REST endpoints first, because the frontend screens map cleanly to resource APIs.
- Use `packages/shared` for DTOs and validation schemas.

Candidate API areas:

- `/auth`
- `/users`
- `/friends`
- `/timetable`
- `/notes`
- `/groups`
- `/messages`
- `/planner`

## Data Model Draft

Core entities likely needed:

- `User`: id, name, email, avatar, course/program, preferences
- `Friendship`: user ids, status, timestamps
- `TimetableEntry`: owner id, title, type, start/end, location, visibility
- `Note`: owner id, title, content, tags, shared group ids
- `StudyGroup`: name, members, linked modules/classes
- `Message`: group id, sender id, body, attachments, created time
- `PlannerItem`: owner id, source, suggested schedule, status

## Integration Strategy

Keep the frontend usable with demo data while API work is added. Introduce a small data-access layer before connecting pages directly to `fetch`, so Kiro or teammates can swap mock data for API calls incrementally.

Suggested future frontend folders:

```text
apps/frontend/src/api
apps/frontend/src/features
apps/frontend/src/lib
apps/frontend/src/types
```

## Redesign Notes For Kiro

If Kiro redesigns the app, preserve these product flows:

- Fast login/demo entry
- Dashboard as the first authenticated screen
- Left navigation for core tools
- Timetable, notes, planner, friends, and chat as first-class areas

## Risks

- Current auth is not secure and is only for demo navigation.
- Current UI may contain generated placeholder content.
- Backend requirements will need pruning if hackathon time is short.
- Realtime chat and AI planning can expand quickly; ship a simple version first.
