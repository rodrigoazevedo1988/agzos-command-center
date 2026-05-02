import { Router } from "express";
import { db, sitesTable, clientsTable, activityTable } from "@workspace/db";
import { eq, sql, ilike, and } from "drizzle-orm";
import {
  CreateSiteBody,
  UpdateSiteBody,
  GetSiteParams,
  UpdateSiteParams,
  DeleteSiteParams,
  ListSitesQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/sites/stats", async (req, res) => {
  try {
    const rows = await db
      .select({ status: sitesTable.status, count: sql<number>`count(*)::int` })
      .from(sitesTable)
      .groupBy(sitesTable.status);

    const stats = { total: 0, active: 0, development: 0, maintenance: 0, paused: 0 };
    for (const r of rows) {
      const s = r.status as keyof typeof stats;
      if (s in stats) stats[s] = r.count;
      stats.total += r.count;
    }
    res.json(stats);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get site stats" });
  }
});

router.get("/sites", async (req, res) => {
  try {
    const parsed = ListSitesQueryParams.safeParse(req.query);
    const query = parsed.success ? parsed.data : {};

    const sites = await db.select().from(sitesTable).orderBy(sql`created_at DESC`);

    const clientIds = [...new Set(sites.map((s) => s.clientId).filter(Boolean))] as number[];
    const clients = clientIds.length
      ? await db.select().from(clientsTable).where(sql`id = ANY(ARRAY[${sql.join(clientIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
      : [];
    const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

    let result = sites.map((s) => ({
      ...s,
      clientName: s.clientId ? clientMap[s.clientId] ?? null : null,
      monthlyVisitors: s.monthlyVisitors ?? 0,
    }));

    if (query.status) result = result.filter((s) => s.status === query.status);
    if (query.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q)
      );
    }

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list sites" });
  }
});

router.post("/sites", async (req, res) => {
  try {
    const body = CreateSiteBody.parse(req.body);
    const [site] = await db.insert(sitesTable).values(body).returning();
    await db.insert(activityTable).values({
      type: "site_added",
      description: `New site added: ${site.name}`,
      entityName: site.name,
    });
    res.status(201).json({ ...site, clientName: null, monthlyVisitors: site.monthlyVisitors ?? 0 });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to create site" });
  }
});

router.get("/sites/:id", async (req, res) => {
  try {
    const { id } = GetSiteParams.parse({ id: Number(req.params.id) });
    const [site] = await db.select().from(sitesTable).where(eq(sitesTable.id, id));
    if (!site) return res.status(404).json({ error: "Not found" });

    let clientName = null;
    if (site.clientId) {
      const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, site.clientId));
      clientName = client?.name ?? null;
    }
    res.json({ ...site, clientName, monthlyVisitors: site.monthlyVisitors ?? 0 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get site" });
  }
});

router.put("/sites/:id", async (req, res) => {
  try {
    const { id } = UpdateSiteParams.parse({ id: Number(req.params.id) });
    const body = UpdateSiteBody.parse(req.body);
    const [site] = await db.update(sitesTable).set(body).where(eq(sitesTable.id, id)).returning();
    if (!site) return res.status(404).json({ error: "Not found" });
    res.json({ ...site, clientName: null, monthlyVisitors: site.monthlyVisitors ?? 0 });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to update site" });
  }
});

router.delete("/sites/:id", async (req, res) => {
  try {
    const { id } = DeleteSiteParams.parse({ id: Number(req.params.id) });
    await db.delete(sitesTable).where(eq(sitesTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete site" });
  }
});

export default router;
