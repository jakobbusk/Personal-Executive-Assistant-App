# Personal Executive Assistant

A personal productivity app that generates daily executive summaries and weekly overviews from your calendar and RSS feeds.

## Architecture

```
.
├── apps/
│   ├── api/          # Express.js + TypeScript backend
│   └── web/          # Vue.js + Tailwind frontend
├── docker-compose.yml
└── .env.example
```

**Stack:**
- **Backend:** Node.js + Express.js (TypeScript), Prisma ORM, PostgreSQL
- **Frontend:** Vue.js 3 + Tailwind CSS + Chart.js
- **Jobs:** BullMQ with Redis (daily at 07:00, weekly Sundays at 18:00)
- **Auth:** Magic link email + JWT in httpOnly cookies
- **Logging:** Pino
- **Validation:** Zod
- **Testing:** Vitest + Supertest

## Quick Start (Docker)

1. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and set JWT_SECRET and ENCRYPTION_KEY to random 32+ character strings
   ```

2. Start all services:
   ```bash
   docker compose up -d
   ```

3. Access the dashboard at http://localhost

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Setup

1. Install dependencies:
   ```bash
   cd apps/api && npm install
   cd ../web && npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example apps/api/.env
   # Edit with your local credentials
   ```

3. Run database migrations:
   ```bash
   cd apps/api && npx prisma migrate dev
   ```

4. Seed demo data:
   ```bash
   cd apps/api && npm run db:seed
   ```

5. Start the API:
   ```bash
   cd apps/api && npm run dev
   ```

6. Start the web app (new terminal):
   ```bash
   cd apps/web && npm run dev
   ```

7. Open http://localhost:5173

## Features

### Daily Executive Summary (7:00 AM)
- Today's schedule grouped by morning / midday / afternoon
- Conflict and double-booking detection
- Travel buffer suggestions for back-to-back meetings at different locations
- Focus block suggestions based on free time
- Top RSS news items (deduplicated)
- 3 priorities derived from meetings and deadlines

### Weekly Overview (Sunday 6:00 PM)
- Meetings grouped by day
- Time allocation: meetings vs focus time
- Risk flags: overloaded days, context-switch heavy days
- Suggestions for best focus windows

### Dashboard
- **Home:** Today's summary card, recent summaries, quick stats
- **Summaries:** History list with type filter and pagination
- **Calendar Insights:** Meeting hours chart, summary statistics
- **News:** RSS feed management, recent articles
- **Integrations:** Google Calendar & Microsoft 365 status
- **Settings:** Name, timezone, email preferences

### Integrations
- Google Calendar (OAuth2)
- Microsoft 365 / Outlook (OAuth2)
- RSS feeds with hourly fetch and URL deduplication

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/magic-link` | Request magic link |
| GET | `/api/auth/verify` | Verify magic link token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET | `/api/users/profile` | User profile |
| PATCH | `/api/users/profile` | Update profile |
| GET | `/api/integrations` | List integrations |
| DELETE | `/api/integrations/:id` | Disconnect integration |
| GET | `/api/rss/feeds` | List RSS feeds |
| POST | `/api/rss/feeds` | Add RSS feed |
| PATCH | `/api/rss/feeds/:id` | Update feed |
| DELETE | `/api/rss/feeds/:id` | Delete feed |
| GET | `/api/rss/items` | List feed items |
| GET | `/api/summaries` | List summaries |
| GET | `/api/summaries/:id` | Get summary detail |
| GET | `/api/analytics/meeting-hours` | Meeting hours chart data |
| GET | `/api/analytics/summary-stats` | Summary counts |

## Security

- JWT tokens in httpOnly cookies (not accessible via JavaScript)
- AES-256-GCM encryption for OAuth tokens at rest
- Rate limiting: 10 auth requests / 15min, 100 API requests / 15min
- Helmet.js for security headers
- CORS configured to specific origin
- Zod validation on all inputs

## Testing

```bash
cd apps/api && npm test
```

Tests cover:
- Daily summary generation (schedule sections, conflict detection, focus blocks, priorities)
- Weekly summary generation (risk flags, time allocation)
- API endpoint authentication (401 for protected routes)
- Magic link request validation

## Environment Variables

See `.env.example` for all available configuration options.