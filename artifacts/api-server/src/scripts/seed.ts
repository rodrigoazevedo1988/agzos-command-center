/**
 * Seed completo — Agzos Command Center
 * Popula todas as tabelas com dados realistas de agência.
 *
 * Execute: pnpm --filter @workspace/api-server tsx src/scripts/seed.ts
 *
 * ATENÇÃO: idempotente — verifica existência antes de inserir.
 */

import "dotenv/config";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  usersTable,
  clientsTable,
  teamMembersTable,
  sitesTable,
  projectsTable,
  tasksTable,
  invoicesTable,
  toolsTable,
  activityTable,
} from "@workspace/db";
import { count as drizzleCount } from "drizzle-orm";

// ─── helpers ─────────────────────────────────────────────────────────────────

async function count(table: any): Promise<number> {
  const [{ value }] = await db.select({ value: drizzleCount() }).from(table);
  return Number(value);
}

// ─── 1. Users ─────────────────────────────────────────────────────────────────

async function seedUsers() {
  if ((await count(usersTable)) > 0) {
    console.log("⏭  users — já populado, pulando.");
    return;
  }

  const hash = await bcrypt.hash("Agzos@2026!", 10);

  await db.insert(usersTable).values([
    {
      email: "rodrigo.azevedo1988@gmail.com",
      name: "Rodrigo Azevedo",
      passwordHash: hash,
      role: "admin",
      inviteToken: null,
      inviteUsedAt: new Date(),
    },
    {
      email: "darnaldo00@gmail.com",
      name: "Arnaldo",
      passwordHash: hash,
      role: "admin",
      inviteToken: null,
      inviteUsedAt: new Date(),
    },
    {
      email: "gerente@agzos.agency",
      name: "Carla Mendes",
      passwordHash: hash,
      role: "account_manager",
      inviteToken: null,
      inviteUsedAt: new Date(),
    },
    {
      email: "trafego@agzos.agency",
      name: "Felipe Souza",
      passwordHash: hash,
      role: "traffic_manager",
      inviteToken: null,
      inviteUsedAt: new Date(),
    },
    {
      email: "design@agzos.agency",
      name: "Mariana Costa",
      passwordHash: hash,
      role: "designer",
      inviteToken: null,
      inviteUsedAt: new Date(),
    },
    {
      email: "dev@agzos.agency",
      name: "Lucas Ferreira",
      passwordHash: hash,
      role: "developer",
      inviteToken: null,
      inviteUsedAt: new Date(),
    },
    {
      email: "financeiro@agzos.agency",
      name: "Ana Paula Lima",
      passwordHash: hash,
      role: "financial",
      inviteToken: null,
      inviteUsedAt: new Date(),
    },
    {
      email: "cliente@techcorp.com.br",
      name: "Roberto Alves",
      passwordHash: hash,
      role: "client_viewer",
      inviteToken: randomUUID(),
    },
  ]);

  console.log("✅ users — 8 registros inseridos.");
}

// ─── 2. Clients ───────────────────────────────────────────────────────────────

async function seedClients() {
  if ((await count(clientsTable)) > 0) {
    console.log("⏭  clients — já populado, pulando.");
    return;
  }

  await db.insert(clientsTable).values([
    {
      name: "Roberto Alves",
      companyName: "TechCorp Soluções",
      email: "roberto@techcorp.com.br",
      phone: "(11) 99999-1001",
      stage: "active",
      monthlyValue: "8500.00",
      totalRevenue: "102000.00",
      industry: "Tecnologia",
      notes: "Cliente desde 2024. Contrato de retainer mensal.",
    },
    {
      name: "Juliana Martins",
      companyName: "FoodBrand Co",
      email: "juliana@foodbrand.com.br",
      phone: "(11) 99999-1002",
      stage: "active",
      monthlyValue: "6000.00",
      totalRevenue: "72000.00",
      industry: "Alimentação",
      notes: "Gestão de redes sociais e campanhas sazonais.",
    },
    {
      name: "Carlos Eduardo",
      companyName: "EduTech Academy",
      email: "carlos@edutech.com.br",
      phone: "(21) 99999-2001",
      stage: "active",
      monthlyValue: "4500.00",
      totalRevenue: "54000.00",
      industry: "Educação",
      notes: "Foco em tráfego pago para captação de alunos.",
    },
    {
      name: "Patrícia Nunes",
      companyName: "HealthPlus Clínica",
      email: "patricia@healthplus.com.br",
      phone: "(31) 99999-3001",
      stage: "active",
      monthlyValue: "5200.00",
      totalRevenue: "31200.00",
      industry: "Saúde",
      notes: "Iniciou em jan/2026. SEO + Google Ads.",
    },
    {
      name: "Marcos Vieira",
      companyName: "RetailMax",
      email: "marcos@retailmax.com.br",
      phone: "(41) 99999-4001",
      stage: "negotiation",
      monthlyValue: "9000.00",
      totalRevenue: "0.00",
      industry: "Varejo",
      notes: "Em negociação — proposta enviada em mai/2026.",
    },
    {
      name: "Fernanda Rocha",
      companyName: "StartupX",
      email: "fernanda@startupx.io",
      phone: "(11) 99999-1003",
      stage: "lead",
      monthlyValue: null,
      totalRevenue: "0.00",
      industry: "Tecnologia",
      notes: "Lead captado via LinkedIn. Aguardando reunião.",
    },
    {
      name: "André Batista",
      companyName: "FinanceHub",
      email: "andre@financehub.com.br",
      phone: "(11) 99999-1004",
      stage: "churned",
      monthlyValue: "3500.00",
      totalRevenue: "21000.00",
      industry: "Finanças",
      notes: "Encerrou contrato em mar/2026. Motivo: corte de budget.",
    },
    {
      name: "Isabela Torres",
      companyName: "ModaStyle",
      email: "isabela@modastyle.com.br",
      phone: "(11) 99999-1005",
      stage: "active",
      monthlyValue: "3800.00",
      totalRevenue: "45600.00",
      industry: "Moda",
      notes: "E-commerce + Instagram Ads.",
    },
  ]);

  console.log("✅ clients — 8 registros inseridos.");
}

// ─── 3. Team members ──────────────────────────────────────────────────────────

async function seedTeam() {
  if ((await count(teamMembersTable)) > 0) {
    console.log("⏭  team_members — já populado, pulando.");
    return;
  }

  await db.insert(teamMembersTable).values([
    { name: "Rodrigo Azevedo",  email: "rodrigo.azevedo1988@gmail.com", role: "admin",           status: "active" },
    { name: "Arnaldo",          email: "darnaldo00@gmail.com",          role: "admin",           status: "active" },
    { name: "Carla Mendes",     email: "gerente@agzos.agency",          role: "account_manager", status: "active" },
    { name: "Felipe Souza",     email: "trafego@agzos.agency",          role: "traffic_manager", status: "active" },
    { name: "Mariana Costa",    email: "design@agzos.agency",           role: "designer",        status: "active" },
    { name: "Lucas Ferreira",   email: "dev@agzos.agency",              role: "developer",       status: "active" },
    { name: "Ana Paula Lima",   email: "financeiro@agzos.agency",       role: "financial",       status: "active" },
    { name: "Bruno Nascimento", email: "bruno@agzos.agency",            role: "designer",        status: "invited" },
  ]);

  console.log("✅ team_members — 8 registros inseridos.");
}

// ─── 4. Sites ─────────────────────────────────────────────────────────────────

async function seedSites() {
  if ((await count(sitesTable)) > 0) {
    console.log("⏭  sites — já populado, pulando.");
    return;
  }

  await db.insert(sitesTable).values([
    {
      name: "TechCorp Website",
      url: "https://techcorp.com.br",
      status: "live",
      clientId: 1,
      adminUrl: "https://techcorp.com.br/wp-admin",
      platform: "WordPress",
      lastDeployment: new Date("2026-05-01"),
      monthlyVisitors: 12400,
      notes: "Hospedado na Vercel. Deploy automático via GitHub.",
    },
    {
      name: "FoodBrand Landing",
      url: "https://foodbrand.com.br",
      status: "live",
      clientId: 2,
      adminUrl: "https://foodbrand.com.br/admin",
      platform: "Next.js",
      lastDeployment: new Date("2026-04-20"),
      monthlyVisitors: 8700,
      notes: "Landing page de conversão para campanhas Meta.",
    },
    {
      name: "EduTech Academy Portal",
      url: "https://edutech.com.br",
      status: "live",
      clientId: 3,
      adminUrl: "https://edutech.com.br/painel",
      platform: "WordPress",
      lastDeployment: new Date("2026-03-15"),
      monthlyVisitors: 5200,
      notes: "Portal de cursos online.",
    },
    {
      name: "HealthPlus Clínica",
      url: "https://healthplus.com.br",
      status: "development",
      clientId: 4,
      adminUrl: null,
      platform: "Next.js",
      lastDeployment: null,
      monthlyVisitors: 0,
      notes: "Em desenvolvimento. Previsão de lançamento: jun/2026.",
    },
    {
      name: "ModaStyle E-commerce",
      url: "https://modastyle.com.br",
      status: "live",
      clientId: 8,
      adminUrl: "https://modastyle.com.br/admin",
      platform: "Shopify",
      lastDeployment: new Date("2026-05-10"),
      monthlyVisitors: 22000,
      notes: "Loja Shopify com integração Meta Pixel.",
    },
    {
      name: "Agzos Agency Website",
      url: "https://agzos.agency",
      status: "live",
      clientId: null,
      adminUrl: "https://agzos.agency/admin",
      platform: "Next.js",
      lastDeployment: new Date("2026-05-14"),
      monthlyVisitors: 3100,
      notes: "Site institucional da própria agência.",
    },
  ]);

  console.log("✅ sites — 6 registros inseridos.");
}

// ─── 5. Projects ──────────────────────────────────────────────────────────────

async function seedProjects() {
  if ((await count(projectsTable)) > 0) {
    console.log("⏭  projects — já populado, pulando.");
    return;
  }

  await db.insert(projectsTable).values([
    {
      name: "Redesign TechCorp",
      description: "Redesign completo do site institucional com nova identidade visual.",
      status: "in_progress",
      clientId: 1,
      assigneeId: 5,
      budget: "18000.00",
      startDate: "2026-04-01",
      dueDate: "2026-06-30",
      progress: 65,
      priority: "high",
    },
    {
      name: "Campanha Verão FoodBrand",
      description: "Campanha de tráfego pago para o verão 2026/2027.",
      status: "planning",
      clientId: 2,
      assigneeId: 4,
      budget: "12000.00",
      startDate: "2026-06-01",
      dueDate: "2026-08-31",
      progress: 10,
      priority: "medium",
    },
    {
      name: "SEO EduTech Q2",
      description: "Otimização SEO on-page e off-page para captação orgânica.",
      status: "in_progress",
      clientId: 3,
      assigneeId: 3,
      budget: "6000.00",
      startDate: "2026-04-15",
      dueDate: "2026-07-15",
      progress: 40,
      priority: "medium",
    },
    {
      name: "Site HealthPlus",
      description: "Desenvolvimento do novo site institucional da clínica.",
      status: "in_progress",
      clientId: 4,
      assigneeId: 6,
      budget: "15000.00",
      startDate: "2026-03-01",
      dueDate: "2026-06-15",
      progress: 80,
      priority: "high",
    },
    {
      name: "Social Media ModaStyle",
      description: "Gestão mensal de redes sociais e criação de conteúdo.",
      status: "in_progress",
      clientId: 8,
      assigneeId: 5,
      budget: "4500.00",
      startDate: "2026-01-01",
      dueDate: "2026-12-31",
      progress: 42,
      priority: "low",
    },
    {
      name: "Proposta RetailMax",
      description: "Elaboração e apresentação de proposta comercial.",
      status: "planning",
      clientId: 5,
      assigneeId: 3,
      budget: "2000.00",
      startDate: "2026-05-10",
      dueDate: "2026-05-31",
      progress: 50,
      priority: "high",
    },
    {
      name: "Identidade Visual Agzos",
      description: "Atualização do brand book e materiais institucionais.",
      status: "completed",
      clientId: null,
      assigneeId: 5,
      budget: "8000.00",
      startDate: "2026-01-15",
      dueDate: "2026-03-31",
      completedAt: new Date("2026-03-28"),
      progress: 100,
      priority: "medium",
    },
  ]);

  console.log("✅ projects — 7 registros inseridos.");
}

// ─── 6. Tasks ─────────────────────────────────────────────────────────────────

async function seedTasks() {
  if ((await count(tasksTable)) > 0) {
    console.log("⏭  tasks — já populado, pulando.");
    return;
  }

  await db.insert(tasksTable).values([
    // Projeto 1 — Redesign TechCorp
    { title: "Wireframes das páginas principais",  projectId: 1, assigneeId: 5, status: "done",        priority: "high",   dueDate: "2026-04-15" },
    { title: "Aprovação do layout pelo cliente",   projectId: 1, assigneeId: 3, status: "done",        priority: "high",   dueDate: "2026-04-30" },
    { title: "Desenvolvimento frontend",           projectId: 1, assigneeId: 6, status: "in_progress", priority: "high",   dueDate: "2026-06-15" },
    { title: "Testes de responsividade",           projectId: 1, assigneeId: 6, status: "todo",        priority: "medium", dueDate: "2026-06-20" },
    { title: "Deploy em produção",                 projectId: 1, assigneeId: 6, status: "todo",        priority: "high",   dueDate: "2026-06-30" },
    // Projeto 3 — SEO EduTech
    { title: "Auditoria técnica do site",          projectId: 3, assigneeId: 3, status: "done",        priority: "high",   dueDate: "2026-04-20" },
    { title: "Pesquisa de palavras-chave",         projectId: 3, assigneeId: 3, status: "done",        priority: "medium", dueDate: "2026-04-30" },
    { title: "Otimização on-page (10 páginas)",    projectId: 3, assigneeId: 6, status: "in_progress", priority: "medium", dueDate: "2026-06-01" },
    { title: "Link building — 20 backlinks",       projectId: 3, assigneeId: 3, status: "todo",        priority: "low",    dueDate: "2026-07-01" },
    // Projeto 4 — Site HealthPlus
    { title: "Briefing e arquitetura de informação", projectId: 4, assigneeId: 3, status: "done",      priority: "high",   dueDate: "2026-03-10" },
    { title: "Design das páginas (Figma)",         projectId: 4, assigneeId: 5, status: "done",        priority: "high",   dueDate: "2026-04-01" },
    { title: "Desenvolvimento Next.js",            projectId: 4, assigneeId: 6, status: "in_progress", priority: "high",   dueDate: "2026-06-01" },
    { title: "Integração formulário de agendamento", projectId: 4, assigneeId: 6, status: "todo",      priority: "medium", dueDate: "2026-06-10" },
    { title: "QA e testes finais",                 projectId: 4, assigneeId: 3, status: "todo",        priority: "high",   dueDate: "2026-06-12" },
    // Projeto 5 — Social Media ModaStyle
    { title: "Calendário editorial maio",          projectId: 5, assigneeId: 5, status: "done",        priority: "medium", dueDate: "2026-04-28" },
    { title: "Criação de posts semana 1",          projectId: 5, assigneeId: 5, status: "done",        priority: "low",    dueDate: "2026-05-05" },
    { title: "Criação de posts semana 2",          projectId: 5, assigneeId: 5, status: "in_progress", priority: "low",    dueDate: "2026-05-12" },
    { title: "Relatório mensal maio",              projectId: 5, assigneeId: 3, status: "todo",        priority: "medium", dueDate: "2026-06-05" },
  ]);

  console.log("✅ tasks — 18 registros inseridos.");
}

// ─── 7. Invoices ──────────────────────────────────────────────────────────────

async function seedInvoices() {
  if ((await count(invoicesTable)) > 0) {
    console.log("⏭  invoices — já populado, pulando.");
    return;
  }

  await db.insert(invoicesTable).values([
    // TechCorp
    { number: "INV-2026-0001", clientId: 1, projectId: 1,    amount: "18000.00", status: "paid",    dueDate: "2026-04-30", paidAt: new Date("2026-04-28"), description: "Redesign TechCorp — entrada 50%." },
    { number: "INV-2026-0002", clientId: 1, projectId: null, amount: "8500.00",  status: "paid",    dueDate: "2026-04-30", paidAt: new Date("2026-04-30"), description: "Retainer mensal — abril/2026." },
    { number: "INV-2026-0003", clientId: 1, projectId: null, amount: "8500.00",  status: "pending", dueDate: "2026-05-31", description: "Retainer mensal — maio/2026." },
    // FoodBrand
    { number: "INV-2026-0004", clientId: 2, projectId: null, amount: "6000.00",  status: "paid",    dueDate: "2026-04-30", paidAt: new Date("2026-04-29"), description: "Retainer mensal — abril/2026." },
    { number: "INV-2026-0005", clientId: 2, projectId: null, amount: "6000.00",  status: "pending", dueDate: "2026-05-31", description: "Retainer mensal — maio/2026." },
    { number: "INV-2026-0006", clientId: 2, projectId: 2,    amount: "6000.00",  status: "draft",   dueDate: "2026-06-30", description: "Campanha Verão — entrada 50%." },
    // EduTech
    { number: "INV-2026-0007", clientId: 3, projectId: 3,    amount: "3000.00",  status: "paid",    dueDate: "2026-04-15", paidAt: new Date("2026-04-14"), description: "SEO Q2 — entrada." },
    { number: "INV-2026-0008", clientId: 3, projectId: null, amount: "4500.00",  status: "overdue", dueDate: "2026-04-30", description: "Retainer mensal — abril/2026." },
    // HealthPlus
    { number: "INV-2026-0009", clientId: 4, projectId: 4,    amount: "7500.00",  status: "paid",    dueDate: "2026-03-15", paidAt: new Date("2026-03-14"), description: "Site HealthPlus — entrada 50%." },
    { number: "INV-2026-0010", clientId: 4, projectId: 4,    amount: "7500.00",  status: "pending", dueDate: "2026-06-15", description: "Site HealthPlus — saldo 50%." },
    { number: "INV-2026-0011", clientId: 4, projectId: null, amount: "5200.00",  status: "pending", dueDate: "2026-05-31", description: "Retainer mensal — maio/2026." },
    // ModaStyle
    { number: "INV-2026-0012", clientId: 8, projectId: 5,    amount: "3800.00",  status: "paid",    dueDate: "2026-04-30", paidAt: new Date("2026-04-30"), description: "Social Media — abril/2026." },
    { number: "INV-2026-0013", clientId: 8, projectId: 5,    amount: "3800.00",  status: "pending", dueDate: "2026-05-31", description: "Social Media — maio/2026." },
    // FinanceHub (churned)
    { number: "INV-2026-0014", clientId: 7, projectId: null, amount: "3500.00",  status: "overdue", dueDate: "2026-03-31", description: "Retainer março/2026 — em aberto." },
  ]);

  console.log("✅ invoices — 14 registros inseridos.");
}

// ─── 8. Tools ─────────────────────────────────────────────────────────────────

async function seedTools() {
  if ((await count(toolsTable)) > 0) {
    console.log("⏭  tools — já populado, pulando.");
    return;
  }

  await db.insert(toolsTable).values([
    { name: "Google Ads",       category: "advertising",   url: "ads.google.com",          loginEmail: "ads@agzos.agency",       monthlyCost: "0.00",   status: "active" },
    { name: "Meta Business",    category: "advertising",   url: "business.facebook.com",   loginEmail: "ads@agzos.agency",       monthlyCost: "0.00",   status: "active" },
    { name: "Google Analytics", category: "analytics",     url: "analytics.google.com",    loginEmail: "analytics@agzos.agency", monthlyCost: "0.00",   status: "active" },
    { name: "SEMrush",          category: "seo",           url: "semrush.com",             loginEmail: "seo@agzos.agency",       monthlyCost: "450.00", status: "active",   notes: "Plano Pro. Renova jul/2026." },
    { name: "Figma",            category: "design",        url: "figma.com",               loginEmail: "design@agzos.agency",    monthlyCost: "180.00", status: "active",   notes: "Plano Organization." },
    { name: "Vercel",           category: "development",   url: "vercel.com",              loginEmail: "dev@agzos.agency",       monthlyCost: "120.00", status: "active" },
    { name: "Slack",            category: "communication", url: "slack.com",               loginEmail: "admin@agzos.agency",     monthlyCost: "240.00", status: "active" },
    { name: "Notion",           category: "crm",           url: "notion.so",               loginEmail: "admin@agzos.agency",     monthlyCost: "96.00",  status: "active" },
    { name: "Stripe",           category: "finance",       url: "stripe.com",              loginEmail: "financeiro@agzos.agency",monthlyCost: "0.00",   status: "active" },
    { name: "Hotjar",           category: "analytics",     url: "hotjar.com",              loginEmail: "analytics@agzos.agency", monthlyCost: "280.00", status: "inactive", notes: "Avaliar renovação em mai/2026." },
    { name: "Ahrefs",           category: "seo",           url: "ahrefs.com",              loginEmail: "seo@agzos.agency",       monthlyCost: "990.00", status: "inactive", notes: "Suspenso — custo alto." },
    { name: "GitHub",           category: "development",   url: "github.com",              loginEmail: "dev@agzos.agency",       monthlyCost: "72.00",  status: "active" },
  ]);

  console.log("✅ tools — 12 registros inseridos.");
}

// ─── 9. Activity ──────────────────────────────────────────────────────────────

async function seedActivity() {
  if ((await count(activityTable)) > 0) {
    console.log("⏭  activity — já populado, pulando.");
    return;
  }

  await db.insert(activityTable).values([
    { type: "project_created",  description: "Projeto criado",          entityName: "Redesign TechCorp" },
    { type: "invoice_paid",     description: "Fatura paga",             entityName: "INV-2026-0001" },
    { type: "client_created",   description: "Novo cliente cadastrado", entityName: "HealthPlus Clínica" },
    { type: "site_deployed",    description: "Deploy realizado",        entityName: "TechCorp Website" },
    { type: "project_updated",  description: "Progresso atualizado",    entityName: "Site HealthPlus" },
    { type: "invoice_created",  description: "Fatura gerada",           entityName: "INV-2026-0013" },
    { type: "task_completed",   description: "Tarefa concluída",        entityName: "Wireframes das páginas principais" },
    { type: "client_created",   description: "Novo lead cadastrado",    entityName: "RetailMax" },
    { type: "invoice_overdue",  description: "Fatura em atraso",        entityName: "INV-2026-0008" },
    { type: "site_deployed",    description: "Deploy realizado",        entityName: "ModaStyle E-commerce" },
    { type: "project_created",  description: "Projeto criado",          entityName: "Campanha Verão FoodBrand" },
    { type: "task_completed",   description: "Tarefa concluída",        entityName: "Auditoria técnica do site" },
  ]);

  console.log("✅ activity — 12 registros inseridos.");
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Iniciando seed — Agzos Command Center\n");

  await seedUsers();
  await seedClients();
  await seedTeam();
  await seedSites();
  await seedProjects();
  await seedTasks();
  await seedInvoices();
  await seedTools();
  await seedActivity();

  console.log("\n🎉 Seed concluído com sucesso!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
