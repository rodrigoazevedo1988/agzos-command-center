import { Router } from "express";
import { db, clientsTable, activityTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateClientBody,
  UpdateClientBody,
  GetClientParams,
  UpdateClientParams,
  DeleteClientParams,
  ListClientsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/clients/funnel", async (req, res) => {
  try {
    const rows = await db
      .select({ stage: clientsTable.stage, count: sql<number>`count(*)::int`, total: sql<number>`coalesce(sum(monthly_value::numeric), 0)` })
      .from(clientsTable)
      .groupBy(clientsTable.stage);

    const funnel = { lead: 0, proposal: 0, contract: 0, active: 0, churned: 0, totalPipelineValue: 0 };
    for (const r of rows) {
      const s = r.stage as keyof typeof funnel;
      if (s in funnel && s !== "totalPipelineValue") {
        (funnel as any)[s] = r.count;
      }
      if (r.stage !== "churned") funnel.totalPipelineValue += Number(r.total);
    }
    res.json(funnel);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get funnel" });
  }
});

router.get("/clients", async (req, res) => {
  try {
    const parsed = ListClientsQueryParams.safeParse(req.query);
    const query = parsed.success ? parsed.data : {};

    let clients = await db.select().from(clientsTable).orderBy(sql`created_at DESC`);

    if (query.stage) clients = clients.filter((c) => c.stage === query.stage);
    if (query.search) {
      const q = query.search.toLowerCase();
      clients = clients.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.companyName ?? "").toLowerCase().includes(q)
      );
    }

    res.json(clients.map((c) => ({ ...c, monthlyValue: c.monthlyValue ? Number(c.monthlyValue) : null, totalRevenue: Number(c.totalRevenue ?? 0) })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list clients" });
  }
});

router.post("/clients", async (req, res) => {
  try {
    const body = CreateClientBody.parse(req.body);
    const [client] = await db.insert(clientsTable).values(body).returning();
    await db.insert(activityTable).values({
      type: "client_added",
      description: `New client added: ${client.name}`,
      entityName: client.name,
    });
    res.status(201).json({ ...client, monthlyValue: client.monthlyValue ? Number(client.monthlyValue) : null, totalRevenue: Number(client.totalRevenue ?? 0) });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to create client" });
  }
});

router.get("/clients/:id", async (req, res) => {
  try {
    const { id } = GetClientParams.parse({ id: Number(req.params.id) });
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, id));
    if (!client) return res.status(404).json({ error: "Not found" });
    res.json({ ...client, monthlyValue: client.monthlyValue ? Number(client.monthlyValue) : null, totalRevenue: Number(client.totalRevenue ?? 0) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get client" });
  }
});

router.put("/clients/:id", async (req, res) => {
  try {
    const { id } = UpdateClientParams.parse({ id: Number(req.params.id) });
    const body = UpdateClientBody.parse(req.body);
    const [client] = await db.update(clientsTable).set(body).where(eq(clientsTable.id, id)).returning();
    if (!client) return res.status(404).json({ error: "Not found" });
    res.json({ ...client, monthlyValue: client.monthlyValue ? Number(client.monthlyValue) : null, totalRevenue: Number(client.totalRevenue ?? 0) });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to update client" });
  }
});

router.delete("/clients/:id", async (req, res) => {
  try {
    const { id } = DeleteClientParams.parse({ id: Number(req.params.id) });
    await db.delete(clientsTable).where(eq(clientsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

export default router;
