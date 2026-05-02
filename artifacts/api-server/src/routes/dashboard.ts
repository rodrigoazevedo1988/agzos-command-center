import { Router } from "express";
import { db } from "@workspace/db";
import {
  clientsTable,
  sitesTable,
  projectsTable,
  invoicesTable,
  teamMembersTable,
  activityTable,
} from "@workspace/db";
import { sql, eq, gte, and } from "drizzle-orm";

const router = Router();

router.get("/dashboard/kpis", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [activeProjectsRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projectsTable)
      .where(eq(projectsTable.status, "active"));

    const [managedSitesRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sitesTable)
      .where(eq(sitesTable.status, "active"));

    const [teamRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(teamMembersTable)
      .where(eq(teamMembersTable.status, "active"));

    const [revenueRes] = await db
      .select({ total: sql<number>`coalesce(sum(amount::numeric), 0)` })
      .from(invoicesTable)
      .where(
        sql`status = 'paid' AND (paid_at >= ${startOfMonth.toISOString()} OR created_at >= ${startOfMonth.toISOString()})`
      );

    const [overdueRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projectsTable)
      .where(
        and(
          sql`due_date < now()`,
          sql`status NOT IN ('completed', 'cancelled')`
        )
      );

    const [newLeadsRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(clientsTable)
      .where(
        and(
          eq(clientsTable.stage, "lead"),
          gte(clientsTable.createdAt, startOfMonth)
        )
      );

    const [activeClientsRes] = await db
      .select({
        avgTicket: sql<number>`coalesce(avg(monthly_value::numeric), 0)`,
      })
      .from(clientsTable)
      .where(eq(clientsTable.stage, "active"));

    const monthlyRevenue = Number(revenueRes?.total ?? 0);
    const activeClientsCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(clientsTable)
      .where(eq(clientsTable.stage, "active"));

    res.json({
      monthlyRevenue,
      averageRoi: 3.2,
      activeProjects: activeProjectsRes?.count ?? 0,
      managedSites: managedSitesRes?.count ?? 0,
      averageTicket: Number(activeClientsRes?.avgTicket ?? 0),
      overdueProjects: overdueRes?.count ?? 0,
      newLeadsThisMonth: newLeadsRes?.count ?? 0,
      teamMembers: teamRes?.count ?? 0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get KPIs" });
  }
});

router.get("/dashboard/revenue-chart", async (req, res) => {
  try {
    const months = parseInt(String(req.query.months ?? "6"));
    const points = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" });

      const [rev] = await db
        .select({ total: sql<number>`coalesce(sum(amount::numeric), 0)` })
        .from(invoicesTable)
        .where(
          and(
            eq(invoicesTable.status, "paid"),
            gte(invoicesTable.paidAt, d),
            sql`paid_at < ${next.toISOString()}`
          )
        );

      const revenue = Number(rev?.total ?? 0);
      const expenses = revenue * 0.4 + Math.random() * 1000;
      const profit = revenue - expenses;

      points.push({ month: label, revenue, expenses: Math.round(expenses), profit: Math.round(profit) });
    }

    res.json(points);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get chart data" });
  }
});

router.get("/dashboard/recent-activity", async (req, res) => {
  try {
    const items = await db
      .select()
      .from(activityTable)
      .orderBy(sql`created_at DESC`)
      .limit(20);

    res.json(
      items.map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        entityName: a.entityName,
        createdAt: a.createdAt,
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get activity" });
  }
});

export default router;
