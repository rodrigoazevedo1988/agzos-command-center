import { Router } from "express";
import { db, projectsTable, clientsTable, teamMembersTable, activityTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  ListProjectsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/projects/summary", async (req, res) => {
  try {
    const rows = await db
      .select({ status: projectsTable.status, count: sql<number>`count(*)::int` })
      .from(projectsTable)
      .groupBy(projectsTable.status);

    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      byStatus[r.status] = r.count;
      total += r.count;
    }

    const [overdueRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projectsTable)
      .where(sql`due_date < now() AND status NOT IN ('completed', 'cancelled')`);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [completedRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projectsTable)
      .where(
        and(eq(projectsTable.status, "completed"), sql`completed_at >= ${startOfMonth.toISOString()}`)
      );

    res.json({
      total,
      byStatus,
      overdue: overdueRes?.count ?? 0,
      completedThisMonth: completedRes?.count ?? 0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get project summary" });
  }
});

async function enrichProject(p: typeof projectsTable.$inferSelect) {
  let clientName = null;
  let assigneeName = null;
  if (p.clientId) {
    const [c] = await db.select().from(clientsTable).where(eq(clientsTable.id, p.clientId));
    clientName = c?.name ?? null;
  }
  if (p.assigneeId) {
    const [t] = await db.select().from(teamMembersTable).where(eq(teamMembersTable.id, p.assigneeId));
    assigneeName = t?.name ?? null;
  }
  return { ...p, clientName, assigneeName, budget: p.budget ? Number(p.budget) : null, progress: p.progress ?? 0 };
}

router.get("/projects", async (req, res) => {
  try {
    const parsed = ListProjectsQueryParams.safeParse(req.query);
    const query = parsed.success ? parsed.data : {};

    let projects = await db.select().from(projectsTable).orderBy(sql`created_at DESC`);

    if (query.status) projects = projects.filter((p) => p.status === query.status);
    if (query.clientId) projects = projects.filter((p) => p.clientId === query.clientId);
    if (query.search) {
      const q = query.search.toLowerCase();
      projects = projects.filter((p) => p.name.toLowerCase().includes(q));
    }

    const enriched = await Promise.all(projects.map(enrichProject));
    res.json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list projects" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const body = CreateProjectBody.parse(req.body);
    const [project] = await db.insert(projectsTable).values({ ...body, progress: 0 }).returning();
    await db.insert(activityTable).values({
      type: "project_created",
      description: `New project created: ${project.name}`,
      entityName: project.name,
    });
    const enriched = await enrichProject(project);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to create project" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse({ id: Number(req.params.id) });
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(await enrichProject(project));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get project" });
  }
});

router.put("/projects/:id", async (req, res) => {
  try {
    const { id } = UpdateProjectParams.parse({ id: Number(req.params.id) });
    const body = UpdateProjectBody.parse(req.body);
    const updateData: any = { ...body };
    if (body.status === "completed") updateData.completedAt = new Date();
    const [project] = await db.update(projectsTable).set(updateData).where(eq(projectsTable.id, id)).returning();
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(await enrichProject(project));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to update project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = DeleteProjectParams.parse({ id: Number(req.params.id) });
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
