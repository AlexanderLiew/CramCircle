# CramCircle
AWS Kiro BuildFest 2026 Hackathon.

## What is CramCircle?

CramCircle (SyncCircle) is a student collaboration web app built for the AWS Kiro BuildFest 2026 hackathon. It helps university students sync timetables, share notes, manage tasks, and study together.

## Key Integrations

| Integration | Status |
|---|---|
| Workato → Google Calendar | ✅ Timetable classes sync to Google Calendar |
| Workato → AWS SNS | ✅ Task deadline email notifications |

## Quick Start

```bash
cd SyncCircle
corepack pnpm install
corepack pnpm dev
```

Open `http://localhost:5173`

## Branches

| Branch | Description |
|---|---|
| `main` | Stable base |
| `alex-frontend-fixes` | Initial frontend fixes |
| `workato-google-calendar-sync` | Google Calendar integration |
| `workato-amazon-sns` | Task deadline email via AWS SNS ← current |

## Project Docs

Full setup and architecture details are in `SyncCircle/readme.md`.
