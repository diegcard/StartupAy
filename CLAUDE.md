# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**StartupAy** — ticket support system for a fintech platform. Tickets arrive via web form, email, and WhatsApp (through n8n), are automatically classified by Google Gemini 1.5 Flash, and tracked with SLA deadlines. Agents/supervisors manage them through a React dashboard.

## Development commands

### Infrastructure (run first)
```bash
docker compose up postgres redis -d   # start DB + Redis
docker compose up n8n -d              # optional: webhook automation
```

### Backend
```bash
cd backend
npm run dev           # NestJS watch mode (port 3001)
npm run build         # compile to dist/
npm run db:seed       # seed categories + default users
npm run db:migrate    # run TypeORM migrations (production)
npm run db:migrate:gen   # generate new migration from entity changes
npm run db:migrate:revert
```

### Frontend
```bash
cd frontend
npm run dev           # Vite dev server (port 5173)
npm run build         # tsc + vite build
```

### Reset database (needed after schema changes in dev)
```bash
docker compose down -v && docker compose up postgres -d
cd backend && npm run dev   # synchronize:true recreates tables automatically
npm run db:seed
```

## Architecture

### Backend — NestJS modular

```
src/
  entities/           # TypeORM entities + shared enums (single source of truth for types)
  shared/
    gemini/           # GeminiService — AI classification via Google Generative AI
    sla/              # SlaService — deadline calculation with priority multipliers
  modules/
    auth/             # JWT login, JwtAuthGuard, RolesGuard, @CurrentAgent decorator, @Roles decorator
    tickets/          # Full CRUD + AI classify endpoint
    categories/       # Read-only list
    agents/           # Read-only list (SUPERVISOR/ADMIN only)
    webhooks/         # n8n ingestion endpoints (email + WhatsApp)
    metrics/          # KPI aggregations (SUPERVISOR/ADMIN only)
```

**Key conventions:**
- All enums live in `src/entities/enums.ts` — never import from `@prisma/client` or define inline.
- `TypeOrmModule.forRoot()` is in `AppModule` with `synchronize: true` for dev / `false` for prod. Each module imports `TypeOrmModule.forFeature([...])` for its own entities.
- `GeminiModule` and `SlaModule` are **not** global — modules that need them (tickets, webhooks) import them explicitly.
- `PrismaModule` no longer exists; use `@InjectRepository(Entity)` everywhere.
- Transactions use `DataSource.transaction(async manager => { ... })` — inject `DataSource` directly into services that need it.
- `@CurrentAgent()` param decorator extracts `{ agentId, role }` from the JWT payload on `request.user`.
- `POST /api/tickets` is intentionally **public** (no auth) — it's the web form intake endpoint.
- Webhooks authenticate via `X-Webhook-Secret` header (WebhookSecretGuard), not JWT.

### Frontend — React + Vite

```
src/
  entities/           # (none — types live in types/index.ts)
  types/index.ts      # All TypeScript interfaces mirroring backend responses
  lib/api.ts          # Axios instance; auto-attaches Bearer token; redirects to /login on 401
  store/auth.ts       # Zustand store (persisted to localStorage key "auth")
  services/           # One file per domain: ticketsService, metricsService, etc.
                      # Each function calls api.get/post/put and returns .data
  hooks/              # useTickets, useTicket, useMetrics, useCategories, useAgents
                      # Thin wrappers over React Query — query keys always start with the resource name
  components/
    layout/           # Layout.tsx (shell) + Sidebar.tsx (nav + logout)
    ui/               # Button, Card, FormField (+ inputClass export), Spinner, Badge, SlaIndicator
  pages/
    login/            # LoginPage
    tickets/list/     # TicketListPage → TicketFilters + TicketTable
    tickets/detail/   # TicketDetailPage → TicketInfo, AiBanner, TicketHistory, TicketSidebar, UpdateTicketForm
    tickets/new/      # NewTicketPage
    metrics/          # MetricsPage → KpiCard, SlaCard, CategoryChart, ChannelChart
```

**Key conventions:**
- API calls always go through `src/services/*.service.ts` — pages and hooks never call `api` directly.
- Hooks are the only place React Query is used — components call hooks, not `useQuery` directly.
- `inputClass` is a constant exported from `components/ui/FormField.tsx` — use it on every `<input>`, `<select>`, and `<textarea>` for consistent styling.
- Vite proxies `/api` to `http://localhost:3001` in dev (configured in `vite.config.ts` if present, otherwise set in `frontend/nginx.conf` for production Docker).

## Data flow for a new ticket

1. Frontend `NewTicketPage` → `ticketsService.create()` → `POST /api/tickets` (no auth)
2. `TicketsService.create()` calls `GeminiService.classifyTicket()` → Gemini API
3. `SlaService.calculateDeadline(categoryId, priority)` — base SLA from `Category.slaHours` × priority multiplier (CRITICAL=0.25×, HIGH=0.5×, MEDIUM=1×, LOW=2×)
4. Ticket saved with `aiSuggestedCategory`, `aiConfidence`, `aiSummary` fields populated
5. Same flow runs for webhook ingestion (`WebhooksService`)

## Environment variables (backend `.env`)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tickets_db
JWT_SECRET=
GEMINI_API_KEY=
WEBHOOK_SECRET=
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

`NODE_ENV=production` disables TypeORM `synchronize` — use migrations instead.

## Default seed credentials

| Email | Password | Role |
|-------|----------|------|
| admin@startupay.com | Admin1234! | ADMIN |
| maria@startupay.com | Agent1234! | SUPERVISOR |
| ana@startupay.com | Agent1234! | AGENT |
| carlos@startupay.com | Agent1234! | AGENT |
