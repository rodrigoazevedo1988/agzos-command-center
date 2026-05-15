-- =============================================================================
-- Agzos Command Center — Migration completa
-- Gerado em: 2026-05-15
-- Banco: PostgreSQL
-- Executar com: psql $DATABASE_URL -f db/migrations/0001_initial_schema.sql
-- =============================================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tabela: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "users" (
  "id"              SERIAL PRIMARY KEY,
  "email"           TEXT NOT NULL UNIQUE,
  "name"            TEXT NOT NULL DEFAULT '',
  "password_hash"   TEXT,
  "role"            TEXT NOT NULL DEFAULT 'client_viewer',
  "invite_token"    TEXT UNIQUE,
  "invite_used_at"  TIMESTAMP,
  "created_at"      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabela: clients
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "clients" (
  "id"              SERIAL PRIMARY KEY,
  "name"            TEXT NOT NULL,
  "company_name"    TEXT,
  "email"           TEXT NOT NULL,
  "phone"           TEXT,
  "stage"           TEXT NOT NULL DEFAULT 'lead',
  "monthly_value"   NUMERIC(12, 2),
  "total_revenue"   NUMERIC(12, 2) DEFAULT 0,
  "industry"        TEXT,
  "notes"           TEXT,
  "avatar_url"      TEXT,
  "created_at"      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabela: team_members
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "team_members" (
  "id"          SERIAL PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "email"       TEXT NOT NULL UNIQUE,
  "role"        TEXT NOT NULL DEFAULT 'designer',
  "status"      TEXT NOT NULL DEFAULT 'invited',
  "avatar_url"  TEXT,
  "joined_at"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabela: sites
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "sites" (
  "id"                SERIAL PRIMARY KEY,
  "name"              TEXT NOT NULL,
  "url"               TEXT NOT NULL,
  "status"            TEXT NOT NULL DEFAULT 'development',
  "client_id"         INTEGER REFERENCES "clients"("id") ON DELETE SET NULL,
  "admin_url"         TEXT,
  "platform"          TEXT,
  "last_deployment"   TIMESTAMP,
  "monthly_visitors"  INTEGER DEFAULT 0,
  "notes"             TEXT,
  "created_at"        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabela: projects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "projects" (
  "id"            SERIAL PRIMARY KEY,
  "name"          TEXT NOT NULL,
  "description"   TEXT,
  "status"        TEXT NOT NULL DEFAULT 'planning',
  "client_id"     INTEGER REFERENCES "clients"("id") ON DELETE SET NULL,
  "assignee_id"   INTEGER REFERENCES "team_members"("id") ON DELETE SET NULL,
  "budget"        NUMERIC(12, 2),
  "start_date"    DATE,
  "due_date"      DATE,
  "completed_at"  TIMESTAMP,
  "progress"      INTEGER DEFAULT 0,
  "priority"      TEXT NOT NULL DEFAULT 'medium',
  "created_at"    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabela: tasks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "tasks" (
  "id"           SERIAL PRIMARY KEY,
  "title"        TEXT NOT NULL,
  "description"  TEXT,
  "status"       TEXT NOT NULL DEFAULT 'todo',
  "project_id"   INTEGER REFERENCES "projects"("id") ON DELETE CASCADE,
  "assignee_id"  INTEGER REFERENCES "team_members"("id") ON DELETE SET NULL,
  "priority"     TEXT NOT NULL DEFAULT 'medium',
  "due_date"     DATE,
  "created_at"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabela: invoices
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "invoices" (
  "id"           SERIAL PRIMARY KEY,
  "number"       TEXT NOT NULL,
  "client_id"    INTEGER REFERENCES "clients"("id") ON DELETE SET NULL,
  "project_id"   INTEGER REFERENCES "projects"("id") ON DELETE SET NULL,
  "amount"       NUMERIC(12, 2) NOT NULL,
  "status"       TEXT NOT NULL DEFAULT 'draft',
  "due_date"     DATE,
  "paid_at"      TIMESTAMP,
  "description"  TEXT,
  "created_at"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabela: tools
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "tools" (
  "id"            SERIAL PRIMARY KEY,
  "name"          TEXT NOT NULL,
  "category"      TEXT NOT NULL DEFAULT 'other',
  "url"           TEXT,
  "login_email"   TEXT,
  "monthly_cost"  NUMERIC(10, 2) DEFAULT 0,
  "status"        TEXT NOT NULL DEFAULT 'active',
  "notes"         TEXT,
  "created_at"    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabela: activity
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "activity" (
  "id"           SERIAL PRIMARY KEY,
  "type"         TEXT NOT NULL,
  "description"  TEXT NOT NULL,
  "entity_name"  TEXT NOT NULL,
  "created_at"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Índices
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sites_client_id       ON "sites"("client_id");
CREATE INDEX IF NOT EXISTS idx_projects_client_id    ON "projects"("client_id");
CREATE INDEX IF NOT EXISTS idx_projects_assignee_id  ON "projects"("assignee_id");
CREATE INDEX IF NOT EXISTS idx_tasks_project_id      ON "tasks"("project_id");
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id     ON "tasks"("assignee_id");
CREATE INDEX IF NOT EXISTS idx_invoices_client_id    ON "invoices"("client_id");
CREATE INDEX IF NOT EXISTS idx_invoices_project_id   ON "invoices"("project_id");
CREATE INDEX IF NOT EXISTS idx_activity_created_at   ON "activity"("created_at" DESC);
CREATE INDEX IF NOT EXISTS idx_users_email           ON "users"("email");
