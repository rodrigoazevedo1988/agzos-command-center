import { Router } from "express";
import { db } from "@workspace/db";
import {
  clientsTable,
  sitesTable,
  projectsTable,
  invoicesTable,
  teamMembersTable,
  activityTable,
  tasksTable,
} from "@workspace/db";
import { eq, sql, and, gte, inArray } from "drizzle-orm";

const router = Router();

/**
 * GET /api/mobile/summary
 * All-in-one dashboard data for the mobile app home screen.
 * Returns KPIs + recent activity + upcoming tasks in one request.
 */
router.get("/mobile/summary", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // ── KPIs ──────────────────────────────────────────────────────────────
    const [[activeProjectsRes], [sitesRes], [teamRes], [revenueRes], [overdueRes], [pendingInvoicesRes]] =
      await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(projectsTable).where(eq(projectsTable.status, "active")),
        db.select({ count: sql<number>`count(*)::int` }).from(sitesTable).where(eq(sitesTable.status, "active")),
        db.select({ count: sql<number>`count(*)::int` }).from(teamMembersTable).where(eq(teamMembersTable.status, "active")),
        db.select({ total: sql<number>`coalesce(sum(amount::numeric), 0)` }).from(invoicesTable)
          .where(sql`status = 'paid' AND (paid_at >= ${startOfMonth.toISOString()} OR created_at >= ${startOfMonth.toISOString()})`),
        db.select({ count: sql<number>`count(*)::int` }).from(projectsTable)
          .where(sql`due_date < now() AND status NOT IN ('completed', 'cancelled')`),
        db.select({ total: sql<number>`coalesce(sum(amount::numeric), 0)` }).from(invoicesTable)
          .where(sql`status IN ('draft', 'sent')`),
      ]);

    // ── Recent activity ────────────────────────────────────────────────────
    const recentActivity = await db
      .select()
      .from(activityTable)
      .orderBy(sql`created_at DESC`)
      .limit(10);

    // ── Upcoming tasks (next 30 days, not done) ────────────────────────────
    const upcomingTasks = await db
      .select({
        id: tasksTable.id,
        title: tasksTable.title,
        status: tasksTable.status,
        priority: tasksTable.priority,
        dueDate: tasksTable.dueDate,
        projectId: tasksTable.projectId,
        assigneeId: tasksTable.assigneeId,
      })
      .from(tasksTable)
      .where(
        sql`status != 'done' AND due_date IS NOT NULL AND due_date <= ${next30Days.toISOString()}`
      )
      .orderBy(tasksTable.dueDate)
      .limit(15);

    // Enrich tasks with project names
    const projectIds = [...new Set(upcomingTasks.map((t) => t.projectId).filter(Boolean))] as number[];
    const projects = projectIds.length
      ? await db.select({ id: projectsTable.id, name: projectsTable.name })
          .from(projectsTable)
          .where(inArray(projectsTable.id, projectIds))
      : [];
    const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

    const tasksEnriched = upcomingTasks.map((t) => ({
      ...t,
      projectName: t.projectId ? (projectMap[t.projectId] ?? null) : null,
      isOverdue: t.dueDate ? new Date(t.dueDate) < now : false,
    }));

    // ── Active projects (top 5) ─────────────────────────────────────────────
    const activeProjects = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        status: projectsTable.status,
        priority: projectsTable.priority,
        dueDate: projectsTable.dueDate,
        progress: projectsTable.progress,
        clientId: projectsTable.clientId,
      })
      .from(projectsTable)
      .where(eq(projectsTable.status, "active"))
      .orderBy(sql`due_date ASC NULLS LAST`)
      .limit(5);

    const clientIds = [...new Set(activeProjects.map((p) => p.clientId).filter(Boolean))] as number[];
    const clients = clientIds.length
      ? await db.select({ id: clientsTable.id, name: clientsTable.name })
          .from(clientsTable)
          .where(inArray(clientsTable.id, clientIds))
      : [];
    const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

    const projectsEnriched = activeProjects.map((p) => ({
      ...p,
      clientName: p.clientId ? (clientMap[p.clientId] ?? null) : null,
    }));

    res.json({
      kpis: {
        monthlyRevenue: Number(revenueRes?.total ?? 0),
        activeProjects: activeProjectsRes?.count ?? 0,
        managedSites: sitesRes?.count ?? 0,
        teamMembers: teamRes?.count ?? 0,
        overdueProjects: overdueRes?.count ?? 0,
        pendingInvoices: Number(pendingInvoicesRes?.total ?? 0),
      },
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        entityName: a.entityName,
        createdAt: a.createdAt,
      })),
      upcomingTasks: tasksEnriched,
      activeProjects: projectsEnriched,
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get mobile summary" });
  }
});

/**
 * GET /api/mobile/calendar?year=2026&month=5
 * Tasks and project deadlines for a given month.
 */
router.get("/mobile/calendar", async (req, res) => {
  try {
    const year = parseInt(String(req.query.year ?? new Date().getFullYear()));
    const month = parseInt(String(req.query.month ?? new Date().getMonth() + 1));

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const tasks = await db
      .select({
        id: tasksTable.id,
        title: tasksTable.title,
        status: tasksTable.status,
        priority: tasksTable.priority,
        dueDate: tasksTable.dueDate,
        projectId: tasksTable.projectId,
        assigneeId: tasksTable.assigneeId,
      })
      .from(tasksTable)
      .where(
        sql`due_date >= ${start.toISOString()} AND due_date < ${end.toISOString()}`
      );

    const projects = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        dueDate: projectsTable.dueDate,
        status: projectsTable.status,
        progress: projectsTable.progress,
        priority: projectsTable.priority,
      })
      .from(projectsTable)
      .where(
        sql`due_date >= ${start.toISOString().split("T")[0]} AND due_date < ${end.toISOString().split("T")[0]}`
      );

    const projectIds = [...new Set(tasks.map((t) => t.projectId).filter(Boolean))] as number[];
    const taskProjects = projectIds.length
      ? await db.select({ id: projectsTable.id, name: projectsTable.name })
          .from(projectsTable)
          .where(inArray(projectsTable.id, projectIds))
      : [];
    const projectMap = Object.fromEntries(taskProjects.map((p) => [p.id, p.name]));

    res.json({
      year,
      month,
      tasks: tasks.map((t) => ({
        ...t,
        projectName: t.projectId ? (projectMap[t.projectId] ?? null) : null,
      })),
      projectDeadlines: projects,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get calendar data" });
  }
});

/**
 * GET /api/mobile/notifications?limit=30
 * Recent activity feed for the mobile notifications screen.
 */
router.get("/mobile/notifications", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "30")), 100);
    const items = await db
      .select()
      .from(activityTable)
      .orderBy(sql`created_at DESC`)
      .limit(limit);

    res.json(items.map((a) => ({
      id: a.id,
      type: a.type,
      description: a.description,
      entityName: a.entityName,
      createdAt: a.createdAt,
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

export default router;
