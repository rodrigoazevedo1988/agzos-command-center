import { Router } from "express";
import { db, invoicesTable, clientsTable, projectsTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";
import {
  CreateInvoiceBody,
  UpdateInvoiceBody,
  UpdateInvoiceParams,
  DeleteInvoiceParams,
  ListInvoicesQueryParams,
} from "@workspace/api-zod";

const router = Router();

function generateInvoiceNumber() {
  const now = new Date();
  return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
}

router.get("/financial/summary", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [paidRes] = await db
      .select({ total: sql<number>`coalesce(sum(amount::numeric), 0)`, count: sql<number>`count(*)::int` })
      .from(invoicesTable)
      .where(and(eq(invoicesTable.status, "paid"), gte(invoicesTable.paidAt, startOfMonth)));

    const [pendingRes] = await db
      .select({ total: sql<number>`coalesce(sum(amount::numeric), 0)` })
      .from(invoicesTable)
      .where(sql`status IN ('draft', 'sent')`);

    const [overdueRes] = await db
      .select({ total: sql<number>`coalesce(sum(amount::numeric), 0)` })
      .from(invoicesTable)
      .where(eq(invoicesTable.status, "overdue"));

    const [invoiceCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(invoicesTable);

    const totalRevenue = Number(paidRes?.total ?? 0);
    const totalExpenses = totalRevenue * 0.4;

    res.json({
      totalRevenue,
      totalExpenses: Math.round(totalExpenses),
      profit: Math.round(totalRevenue - totalExpenses),
      pendingInvoices: Number(pendingRes?.total ?? 0),
      overdueInvoices: Number(overdueRes?.total ?? 0),
      paidThisMonth: Number(paidRes?.total ?? 0),
      invoiceCount: invoiceCountRes?.count ?? 0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get financial summary" });
  }
});

router.get("/financial/invoices", async (req, res) => {
  try {
    const parsed = ListInvoicesQueryParams.safeParse(req.query);
    const query = parsed.success ? parsed.data : {};

    let invoices = await db.select().from(invoicesTable).orderBy(sql`created_at DESC`);

    if (query.clientId) invoices = invoices.filter((i) => i.clientId === query.clientId);
    if (query.status) invoices = invoices.filter((i) => i.status === query.status);

    const clientIds = [...new Set(invoices.map((i) => i.clientId).filter(Boolean))] as number[];
    const projectIds = [...new Set(invoices.map((i) => i.projectId).filter(Boolean))] as number[];

    const clients = clientIds.length
      ? await db.select().from(clientsTable).where(sql`id = ANY(${clientIds})`)
      : [];
    const projects = projectIds.length
      ? await db.select().from(projectsTable).where(sql`id = ANY(${projectIds})`)
      : [];

    const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));
    const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

    res.json(
      invoices.map((i) => ({
        ...i,
        amount: Number(i.amount),
        clientName: i.clientId ? clientMap[i.clientId] ?? null : null,
        projectName: i.projectId ? projectMap[i.projectId] ?? null : null,
      }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list invoices" });
  }
});

router.post("/financial/invoices", async (req, res) => {
  try {
    const body = CreateInvoiceBody.parse(req.body);
    const paidAt = body.status === "paid" ? new Date() : undefined;
    const [invoice] = await db
      .insert(invoicesTable)
      .values({ ...body, number: generateInvoiceNumber(), paidAt })
      .returning();
    res.status(201).json({ ...invoice, amount: Number(invoice.amount), clientName: null, projectName: null });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to create invoice" });
  }
});

router.put("/financial/invoices/:id", async (req, res) => {
  try {
    const { id } = UpdateInvoiceParams.parse({ id: Number(req.params.id) });
    const body = UpdateInvoiceBody.parse(req.body);
    const updateData: any = { ...body };
    if (body.status === "paid" && !updateData.paidAt) updateData.paidAt = new Date();
    const [invoice] = await db
      .update(invoicesTable)
      .set(updateData)
      .where(eq(invoicesTable.id, id))
      .returning();
    if (!invoice) return res.status(404).json({ error: "Not found" });
    res.json({ ...invoice, amount: Number(invoice.amount), clientName: null, projectName: null });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to update invoice" });
  }
});

router.delete("/financial/invoices/:id", async (req, res) => {
  try {
    const { id } = DeleteInvoiceParams.parse({ id: Number(req.params.id) });
    await db.delete(invoicesTable).where(eq(invoicesTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

export default router;
