# CramCircle

AWS Kiro BuildFest 2026 Hackathon.

## What is CramCircle?

CramCircle (SyncCircle) is a student collaboration web app built for the AWS Kiro BuildFest 2026 hackathon. It helps university students sync timetables, share notes, manage tasks, and study together with real-time friend connections.

## Architecture

```
Frontend (React + Vite)  →  API Gateway  →  Lambda (Node.js 20)  →  DynamoDB
                              ↓
                        Cognito Auth
                              ↓
                        SES (emails)
```

## Key Integrations

| Integration | Status |
|---|---|
| AWS Cognito | ✅ Real user authentication (signup, login, email verification) |
| AWS DynamoDB | ✅ UserProfiles, FriendRequests, Friendships, UserTimetables tables |
| AWS Lambda | ✅ 14 serverless functions (friends API + timetable sync) |
| AWS API Gateway | ✅ REST API with Cognito authorizer + CORS |
| AWS SES | ⚠️ Configured but in sandbox mode (set EMAIL_ADAPTER=local) |
| AWS CDK | ✅ Full Infrastructure as Code |
| Google Calendar API | ✅ Direct OAuth2 integration (replaced Workato) — sync & pull events |
| .ics Import | ✅ Upload school timetable files directly |
| Workato → AWS SNS | ✅ Task deadline email notifications |

## Timetable & Google Calendar

### How it works
- **Add classes** manually, via `.ics` file import, or by pulling from Google Calendar
- **Sync to Google Calendar** — pushes your classes to your personal Google Calendar (OAuth2 popup)
- **Friend timetable overlay** — Filter View lets you check friends' names to overlay their schedule on your grid
- **Free slot detection** — green highlighted cells show times everyone selected is free
- **Backend sync** — class changes auto-save to DynamoDB so friends see your latest timetable

### Google Calendar Setup (already done)
- OAuth Client ID created in Google Cloud Console
- Authorized origin: `http://localhost:5173`
- Calendar API enabled
- Publishing status: Testing (teammates need to be added as test users)

### Dev Bypass Mode
Set `VITE_DEV_BYPASS_AUTH=true` in `.env` to skip Cognito login. Seed data (3 friends + 5 classes) auto-loads on first run.

## Quick Start

```bash
cd SyncCircle
pnpm install
```

### Frontend

```bash
cd apps/frontend
pnpm dev
```

Open `http://localhost:5173` — register with a real email to get started.

### Backend (deploy)

```bash
cd apps/backend
npx cdk deploy --require-approval never
```

Requires AWS credentials configured at `~/.aws/credentials`.

## Environment Variables

### Frontend (`apps/frontend/.env`)

```env
VITE_API_BASE_URL=https://951chm3o9k.execute-api.ap-southeast-1.amazonaws.com/prod
VITE_COGNITO_USER_POOL_ID=ap-southeast-1_pTCWS6fRL
VITE_COGNITO_CLIENT_ID=djuh7mtqdl2hudmmdk1veigsq
```

### Backend (configured via CDK env vars on Lambda)

- `USER_PROFILES_TABLE` — DynamoDB table name
- `FRIEND_REQUESTS_TABLE` — DynamoDB table name
- `FRIENDSHIPS_TABLE` — DynamoDB table name
- `SES_SENDER_EMAIL` — Verified SES sender
- `FRONTEND_BASE_URL` — For invitation email links
- `EMAIL_ADAPTER` — Set to "local" to skip SES (logs email instead)

## Deployed Resources (ap-southeast-1)

| Resource | Value |
|---|---|
| API URL | `https://951chm3o9k.execute-api.ap-southeast-1.amazonaws.com/prod/` |
| AWS Account | 368082409177 |
| Region | ap-southeast-1 |
| Stack | FriendsStack |
| Cognito User Pool | ap-southeast-1_pTCWS6fRL |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /friends/search | Search for a user by email + name |
| POST | /friend-requests | Send a friend request |
| POST | /friend-requests/{id}/accept | Accept a request |
| POST | /friend-requests/{id}/reject | Reject a request |
| POST | /friend-requests/{id}/cancel | Cancel a sent request |
| GET | /friend-requests/incoming | List pending incoming requests |
| GET | /friend-requests/outgoing | List sent requests |
| GET | /friend-requests/invite/{token} | Validate invitation token |
| GET | /friends | List active friends |
| DELETE | /friends/{friendId} | Remove a friend |
| GET | /friends/{userId}/relationship | Check relationship status |
| PUT | /timetable | Save user's timetable classes to DynamoDB |
| GET | /friends/{friendId}/timetable | Fetch a friend's timetable (must be friends) |

All endpoints require `Authorization: Bearer {id_token}` (Cognito ID token).

## Project Structure

```
SyncCircle/
├── apps/
│   ├── frontend/          React + Vite + TailwindCSS
│   │   └── src/app/
│   │       ├── hooks/     useAuth, useFriends, useFriendRequests, useGoogleCalendar
│   │       ├── pages/     Auth, Friends, Invitation, Dashboard, Timetable, etc.
│   │       └── lib/       api-client, google-calendar, ics-parser, sgt, storage, seed-data
│   └── backend/           AWS CDK + Lambda handlers
│       ├── src/
│       │   ├── handlers/  Lambda function handlers (friend-requests/, friends/, timetable/, triggers/)
│       │   ├── services/  validation, token, email services
│       │   ├── repositories/  DynamoDB data access layer
│       │   └── utils/     response helpers, logger, canonical pair
│       └── cdk/           CDK infrastructure code
│           └── lib/       Stack + constructs (DynamoDB, Cognito, Lambda, API, SES)
└── packages/
    └── shared/            TypeScript interfaces, API types, error codes
```

## Team Handover — Next Features

### 1. Timetable Friend Sync ✅ DONE

Backend built and wired into CDK. Needs `cdk deploy` to go live.

- `PUT /timetable` — saves your classes to `UserTimetables` DynamoDB table
- `GET /friends/{friendId}/timetable` — fetches a friend's timetable (checks friendship first)
- Frontend auto-PUTs on every class change (when real auth is active)
- Filter View fetches from API when toggling friends

**To deploy:** run `corepack pnpm exec cdk deploy --require-approval never` from `apps/backend` with AWS credentials configured.

### 2. AI Planner Friend Feature

Same relationship check applies. The friends list is available via:

```typescript
import { API_PATHS, type FriendsListResponse } from '@synccircle/shared';

const { friends } = await apiClient.get<FriendsListResponse>(API_PATHS.FRIENDS);
// friends = [{ friendId, displayName, createdAt }]
```

Use this to:
- Show friends' study schedules in the AI planner
- Suggest group study sessions based on overlapping free time
- Include friend availability in planning recommendations

### 3. SES Email (optional)

To enable real invitation emails:
1. Verify sender email in SES console (or request production access)
2. Change `EMAIL_ADAPTER` from `'local'` to `''` in `cdk/lib/lambda-construct.ts`
3. Redeploy

## Branches

| Branch | Description |
|---|---|
| `main` | Stable base |
| `alex-frontend-fixes` | Initial frontend fixes |
| `workato-google-calendar-sync` | Google Calendar integration |
| `aest-workato` | Task deadline email via AWS SNS ← current |

## Useful Commands

```bash
# Deploy backend changes
cd apps/backend && npx cdk deploy --require-approval never

# Run frontend
cd apps/frontend && pnpm dev

# Type check everything
cd apps/backend && npx tsc --noEmit
cd apps/frontend && npx tsc --noEmit

# Run backend tests
cd apps/backend && npx vitest run

# CDK synth (preview CloudFormation without deploying)
cd apps/backend && npx cdk synth
```
