<div align="center">

<img src="artifacts/agzos-hub/public/brand/logo-light.svg" alt="Agzos Command Center" height="60" />

# Agzos Command Center

**Sistema interno de gestão da Agzos Agency**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspaces-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License](https://img.shields.io/badge/uso-privado-D10A11?style=flat-square)](#)

</div>

---

## Índice

- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Estrutura do Monorepo](#estrutura-do-monorepo)
- [Módulos](#módulos)
- [Setup](#setup)
- [Comandos](#comandos)
- [API Routes](#api-routes)
- [Schema do Banco](#schema-do-banco)
- [Design System](#design-system)
- [Permissões (RBAC)](#permissões-rbac)

---

## Visão Geral

O **Agzos Command Center** é o sistema interno da [Agzos Agency](https://agzos.agency) — uma plataforma full-stack para gestão de clientes, projetos, sites, equipe, financeiro e ferramentas da agência.

```
Frontend (React + Vite)  ──►  API (Express 5)  ──►  PostgreSQL
        │                           │
   Zustand stores            Drizzle ORM
   shadcn/ui + Tailwind      Zod validation
   Recharts + dnd-kit        JWT auth + RBAC
```

---

## Stack

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework |
| [Vite](https://vitejs.dev) | 6 | Build tool |
| [TypeScript](https://typescriptlang.org) | 5.9 | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Estilização |
| [shadcn/ui](https://ui.shadcn.com) | new-york | Componentes |
| [Wouter](https://github.com/molefrog/wouter) | 3 | Roteamento |
| [Zustand](https://zustand-demo.pmnd.rs) | 5 | Estado global |
| [Recharts](https://recharts.org) | 2 | Gráficos |
| [dnd-kit](https://dndkit.com) | 6 | Drag & drop (Kanban) |
| [TanStack Query](https://tanstack.com/query) | 5 | Data fetching |

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| [Node.js](https://nodejs.org) | 24 | Runtime |
| [Express](https://expressjs.com) | 5 | API framework |
| [Drizzle ORM](https://orm.drizzle.team) | latest | ORM type-safe |
| [PostgreSQL](https://postgresql.org) | 16 | Banco de dados |
| [Zod](https://zod.dev) | v4 | Validação de schemas |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | latest | Hash de senhas |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | latest | JWT auth |

### Tooling
| Ferramenta | Uso |
|---|---|
| [pnpm workspaces](https://pnpm.io/workspaces) | Monorepo |
| [Orval](https://orval.dev) | Codegen API client a partir do OpenAPI |
| [esbuild](https://esbuild.github.io) | Build do servidor |
| [tsx](https://github.com/privatenumber/tsx) | Execução de scripts TS |

---

## Estrutura do Monorepo

```
agzos-command-center/
├── artifacts/
│   ├── agzos-hub/          # Frontend React + Vite
│   │   ├── src/
│   │   │   ├── components/ # Layout, AppTopNav, BrandLogo, UI
│   │   │   ├── pages/      # Dashboard, Projetos, Clientes...
│   │   │   ├── store/      # Zustand stores
│   │   │   └── lib/        # Permissões, brand, nav-groups
│   │   └── public/
│   │       └── brand/      # Logos SVG oficiais
│   └── api-server/         # Express 5 API
│       └── src/
│           ├── routes/     # Endpoints REST
│           ├── middleware/ # Auth JWT
│           └── scripts/    # seed.ts, seed-admins.ts
├── lib/
│   ├── db/                 # Drizzle schema + migrations
│   ├── api-spec/           # OpenAPI spec (orval codegen)
│   ├── api-client-react/   # Hooks gerados (TanStack Query)
│   └── api-zod/            # Schemas Zod gerados
├── db/
│   └── migrations/         # SQL migrations versionadas
├── .env                    # Variáveis de ambiente (não commitado)
└── pnpm-workspace.yaml
```

---

## Módulos

| Módulo | Rota | Descrição |
|---|---|---|
| 🏠 **Dashboard** | `/` | KPIs, gráfico de receita, atividade recente |
| 🌐 **Sites** | `/sites` | Gestão de sites dos clientes (status, plataforma, deploys) |
| 📋 **Projetos** | `/projects` | Kanban, lista, Gantt, timers, tarefas, prioridades |
| 👥 **Clientes** | `/clients` | CRM: Lead → Proposta → Contrato → Ativo → Churned |
| 👤 **Equipe** | `/team` | Roster com papéis e permissões |
| 💰 **Financeiro** | `/financial` | Faturas, resumo mensal, controle de inadimplência |
| 🔧 **Ferramentas** | `/tools` | Registro de ferramentas da agência com custos |
| 📅 **Calendário** | `/calendar` | Visão de eventos e prazos |
| 📊 **Relatórios** | `/reports` | Exportação de relatórios em PDF |
| 🔔 **Notificações** | `/notifications` | Central de notificações com Web Push |
| ⚙️ **Configurações** | `/settings` | Identidade, integrações, API keys |

---

## Setup

### Pré-requisitos

- Node.js 24+
- pnpm 9+
- PostgreSQL 16+ rodando localmente

### 1. Clonar e instalar

```bash
git clone https://github.com/rodrigoazevedo1988/agzos-command-center.git
cd agzos-command-center
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais
```

```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/agzos
JWT_SECRET=seu_secret_aqui
JWT_EXPIRES_IN=7d
PORT=8080
```

### 3. Criar o banco e rodar a migration

```bash
# Criar o banco
createdb agzos

# Rodar a migration completa
psql $DATABASE_URL -f db/migrations/0001_initial_schema.sql

# Ou via Drizzle (dev)
pnpm --filter @workspace/db run push
```

### 4. Popular o banco (seed)

```bash
# Seed completo com dados realistas
pnpm --filter @workspace/api-server tsx src/scripts/seed.ts

# Apenas admins (produção)
pnpm --filter @workspace/api-server tsx src/scripts/seed-admins.ts
```

### 5. Rodar em desenvolvimento

```bash
# Terminal 1 — API
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
pnpm --filter @workspace/agzos-hub run dev
```

Acesse: **http://localhost:5173**

---

## Comandos

```bash
# Typecheck completo (todos os pacotes)
pnpm run typecheck

# Build completo
pnpm run build

# Regenerar API client a partir do OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push de schema Drizzle (dev only)
pnpm --filter @workspace/db run push
```

---

## API Routes

Todas as rotas sob `/api`:

```
GET  /api/health

# Auth
POST /api/auth/login
POST /api/auth/setup
GET  /api/auth/me

# Dashboard
GET  /api/dashboard/kpis
GET  /api/dashboard/revenue-chart
GET  /api/dashboard/recent-activity

# Sites
GET    /api/sites
POST   /api/sites
GET    /api/sites/:id
PUT    /api/sites/:id
DELETE /api/sites/:id
GET    /api/sites/stats

# Projects & Tasks
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

# Clients
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
GET    /api/clients/funnel

# Team
GET    /api/team
POST   /api/team
GET    /api/team/:id
PUT    /api/team/:id

# Financial
GET    /api/financial/invoices
POST   /api/financial/invoices
GET    /api/financial/invoices/:id
PUT    /api/financial/invoices/:id
GET    /api/financial/summary

# Tools
GET    /api/tools
POST   /api/tools
PUT    /api/tools/:id
DELETE /api/tools/:id
```

---

## Schema do Banco

```
users           — autenticação e papéis
clients         — CRM com estágio e valor mensal
team_members    — equipe com papéis
sites           — sites gerenciados
projects        — projetos com progresso e prioridade
tasks           — tarefas vinculadas a projetos
invoices        — faturas e controle financeiro
tools           — ferramentas da agência
activity        — log de atividades
```

Migration completa em [`db/migrations/0001_initial_schema.sql`](db/migrations/0001_initial_schema.sql).

---

## Design System

| Token | Valor | Uso |
|---|---|---|
| `--primary` | `#D10A11` | Vermelho Agzos — CTAs, links ativos |
| `--background` | `#0E0E0E` | Fundo dark |
| `--foreground` | `#FFFDFD` | Texto principal |
| `--font-sans` | Figtree | Tipografia principal (self-hosted) |
| `--radius` | `0.5rem` | Border radius base |

Componentes via **shadcn/ui** (estilo `new-york`) + **Tailwind CSS 4**.

Header horizontal fixo com `backdrop-blur`, navegação em grupos dropdown, suporte a dark/light mode persistido.

---

## Permissões (RBAC)

| Papel | Acesso |
|---|---|
| `admin` | Acesso total |
| `account_manager` | Clientes, projetos, relatórios, equipe |
| `traffic_manager` | Projetos, ferramentas, calendário |
| `designer` | Sites, projetos, ferramentas |
| `developer` | Sites, projetos, ferramentas |
| `financial` | Financeiro, clientes |
| `client_viewer` | Dashboard, sites, projetos (leitura) |

---

<div align="center">

Feito com ❤️ pela equipe **[Agzos Agency](https://agzos.agency)**

</div>
