# SyncCircle Requirements

## Product Goal

Build a student collaboration web app that helps classmates coordinate schedules, share learning material, plan study sessions, and communicate in one place.

## Current Prototype Scope

The frontend prototype already includes these user-facing areas:

- Authentication screens
- Dashboard overview
- Timetable
- Notes
- AI planner
- Friends
- Group chat
- Profile
- Settings

## Functional Requirements

### Authentication

- Users can sign up and log in with an email/password flow.
- Users can request password reset.
- Current prototype uses frontend-only demo auth; production work must replace this with backend-backed sessions.

### Dashboard

- Users can see upcoming tasks, sessions, schedule highlights, and collaboration activity.
- Dashboard data should eventually come from user-specific backend records.

### Timetable

- Users can view and manage classes, study sessions, and shared availability.
- Future backend should support schedule CRUD and friend/group visibility.

### Notes

- Users can browse, create, and organize notes.
- Future backend should support note persistence, ownership, sharing, and search.

### AI Planner

- Users can request study planning suggestions based on workload, deadlines, and availability.
- AI output should be explainable enough for users to adjust manually.

### Friends

- Users can view friend status and collaboration context.
- Future backend should support friend requests, accepted friends, and presence/status.

### Group Chat

- Users can participate in group study conversations.
- Future backend should support message persistence and, if time allows, realtime updates.

### Profile And Settings

- Users can manage basic profile details and app preferences.
- Settings should be persisted once backend exists.

## Non-Functional Requirements

- The frontend must run locally with a single documented command.
- Backend and frontend should remain separate apps.
- Shared contracts should live in `packages/shared` once backend work begins.
- The app should be responsive enough for laptop and mobile demo views.
- Avoid hard-coding production secrets or API keys.

## Out Of Scope For The Current Import

- Real backend storage
- Real authentication
- Production authorization
- Realtime infrastructure
- AI provider integration
- Payment or admin features

## Acceptance Criteria For Next Milestone

- `pnpm install` and `pnpm dev` start the frontend from the repository root.
- Main frontend routes render without backend dependencies.
- Team docs explain current limitations and next implementation tasks.
- Kiro has enough requirement/design context to generate backend or redesign tasks.
