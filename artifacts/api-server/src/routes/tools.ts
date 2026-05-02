import { Router } from "express";
import { db, toolsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateToolBody,
  UpdateToolBody,
  UpdateToolParams,
  DeleteToolParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/tools", async (req, res) => {
  try {
    const tools = await db.select().from(toolsTable).orderBy(sql`created_at DESC`);
    res.json(tools.map((t) => ({ ...t, monthlyCost: t.monthlyCost ? Number(t.monthlyCost) : 0 })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list tools" });
  }
});

router.post("/tools", async (req, res) => {
  try {
    const body = CreateToolBody.parse(req.body);
    const [tool] = await db.insert(toolsTable).values(body).returning();
    res.status(201).json({ ...tool, monthlyCost: tool.monthlyCost ? Number(tool.monthlyCost) : 0 });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to create tool" });
  }
});

router.put("/tools/:id", async (req, res) => {
  try {
    const { id } = UpdateToolParams.parse({ id: Number(req.params.id) });
    const body = UpdateToolBody.parse(req.body);
    const [tool] = await db.update(toolsTable).set(body).where(eq(toolsTable.id, id)).returning();
    if (!tool) return res.status(404).json({ error: "Not found" });
    res.json({ ...tool, monthlyCost: tool.monthlyCost ? Number(tool.monthlyCost) : 0 });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to update tool" });
  }
});

router.delete("/tools/:id", async (req, res) => {
  try {
    const { id } = DeleteToolParams.parse({ id: Number(req.params.id) });
    await db.delete(toolsTable).where(eq(toolsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete tool" });
  }
});

export default router;
