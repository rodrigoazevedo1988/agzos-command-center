# Agzos Hub

## Overview

Internal management system for Agzos Agency. A full-stack React + Express app for managing clients, sites, projects, team, financials, and tools.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/agzos-hub), wouter routing, shadcn/ui, Tailwind CSS, Recharts
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Modules

1. **Dashboard** — KPIs, revenue chart, recent activity
2. **Sites** — Manage all client sites (status, URL, platform, deployments)
3. **Projects** — Track projects with priority, progress, assignees, due dates; Kanban (dnd-kit), List, Gantt, live timers, task detail dialog
4. **Clients** — CRM funnel (Lead → Proposal → Contract → Active → Churned)
5. **Team** — RBAC-ready team roster with roles (admin, account_manager, traffic_manager, designer, developer, financial, client)
6. **Financial** — Invoice management, monthly summary, overdue tracking
7. **Tools** — Agency tools registry with categories and cost tracking
8. **Notifications** (`/notifications`) — Full notification history page with read/type filters, stats sidebar, settings; bell icon in topbar with dropdown (8 recent, mark read, clear); Web Push via browser Notification API; real-time simulation via setInterval (15s); Zustand store with `persist` (`agzos-notifications`)

## Frontend State (Zustand Stores)

All stores are in `artifacts/agzos-hub/src/store/`:
- `useAuthStore` — current user, RBAC permissions
- `useSitesStore` — 7 mock sites, CRUD, filters
- `useProjectsStore` — 5 projects, 12 tasks, team, kanban drag-and-drop, live timers
- `useNotificationsStore` — notifications (type `AppNotification`), push toggle, realtime simulation, persisted to localStorage

## API Routes

All under `/api`:
- `/dashboard/kpis`, `/dashboard/revenue-chart`, `/dashboard/recent-activity`
- `/sites`, `/sites/:id`, `/sites/stats`
- `/projects`, `/projects/:id`, `/projects/summary`
- `/tasks`, `/tasks/:id`
- `/clients`, `/clients/:id`, `/clients/funnel`
- `/team`, `/team/:id`
- `/financial/invoices`, `/financial/invoices/:id`, `/financial/summary`
- `/tools`, `/tools/:id`

## Design System

- Dark theme: near-black backgrounds (#0A0A0A, #111118)
- Primary: Purple gradient (#6B46C1 → #A855F7)
- Success/Performance: Green (#10B981)
- Font: Inter (Google Fonts)

## DB Schema (lib/db/src/schema/)

- `clients` — CRM clients with stage/value
- `sites` — managed websites
- `projects` — agency projects with progress/priority
- `tasks` — project tasks
- `team_members` — team with roles
- `invoices` — billing/invoices
- `tools` — agency tools registry
- `activity` — activity feed log

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
