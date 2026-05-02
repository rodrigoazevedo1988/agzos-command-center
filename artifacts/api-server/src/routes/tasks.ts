import { Router } from "express";
import { db, tasksTable, projectsTable, teamMembersTable, activityTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateTaskBody,
  UpdateTaskBody,
  UpdateTaskParams,
  DeleteTaskParams,
  ListTasksQueryParams,
} from "@workspace/api-zod";

const router = Router();

async function enrichTask(t: typeof tasksTable.$inferSelect) {
  let projectName = null;
  let assigneeName = null;
  if (t.projectId) {
    const [p] = await db.select().from(projectsTable).where(eq(projectsTable.id, t.projectId));
    projectName = p?.name ?? null;
  }
  if (t.assigneeId) {
    const [m] = await db.select().from(teamMembersTable).where(eq(teamMembersTable.id, t.assigneeId));
    assigneeName = m?.name ?? null;
  }
  return { ...t, projectName, assigneeName };
}

router.get("/tasks", async (req, res) => {
  try {
    const parsed = ListTasksQueryParams.safeParse(req.query);
    const query = parsed.success ? parsed.data : {};

    let tasks = await db.select().from(tasksTable).orderBy(sql`created_at DESC`);

    if (query.projectId) tasks = tasks.filter((t) => t.projectId === query.projectId);
    if (query.assigneeId) tasks = tasks.filter((t) => t.assigneeId === query.assigneeId);
    if (query.status) tasks = tasks.filter((t) => t.status === query.status);

    const enriched = await Promise.all(tasks.map(enrichTask));
    res.json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list tasks" });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const body = CreateTaskBody.parse(req.body);
    const [task] = await db.insert(tasksTable).values(body).returning();
    if (task.status === "done") {
      await db.insert(activityTable).values({
        type: "task_completed",
        description: `Tarefa concluída: ${task.title}`,
        entityName: task.title,
      });
    }
    res.status(201).json(await enrichTask(task));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to create task" });
  }
});

router.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = UpdateTaskParams.parse({ id: Number(req.params.id) });
    const body = UpdateTaskBody.parse(req.body);
    const [task] = await db.update(tasksTable).set(body).where(eq(tasksTable.id, id)).returning();
    if (!task) return res.status(404).json({ error: "Not found" });
    if (body.status === "done") {
      await db.insert(activityTable).values({
        type: "task_completed",
        description: `Tarefa concluída: ${task.title}`,
        entityName: task.title,
      });
    }
    res.json(await enrichTask(task));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to update task" });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = DeleteTaskParams.parse({ id: Number(req.params.id) });
    await db.delete(tasksTable).where(eq(tasksTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
