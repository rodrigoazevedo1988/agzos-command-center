import { Router } from "express";
import { db, teamMembersTable, projectsTable, activityTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateTeamMemberBody,
  UpdateTeamMemberBody,
  UpdateTeamMemberParams,
  DeleteTeamMemberParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/team", async (req, res) => {
  try {
    const members = await db.select().from(teamMembersTable).orderBy(sql`joined_at DESC`);

    const enriched = await Promise.all(
      members.map(async (m) => {
        const [res] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(projectsTable)
          .where(sql`assignee_id = ${m.id} AND status = 'active'`);
        return { ...m, activeProjects: res?.count ?? 0 };
      })
    );

    res.json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list team members" });
  }
});

router.post("/team", async (req, res) => {
  try {
    const body = CreateTeamMemberBody.parse(req.body);
    const [member] = await db
      .insert(teamMembersTable)
      .values({ ...body, status: "invited" })
      .returning();
    await db.insert(activityTable).values({
      type: "team_invited",
      description: `Team member invited: ${member.name}`,
      entityName: member.name,
    });
    res.status(201).json({ ...member, activeProjects: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to create team member" });
  }
});

router.put("/team/:id", async (req, res) => {
  try {
    const { id } = UpdateTeamMemberParams.parse({ id: Number(req.params.id) });
    const body = UpdateTeamMemberBody.parse(req.body);
    const [member] = await db
      .update(teamMembersTable)
      .set(body)
      .where(eq(teamMembersTable.id, id))
      .returning();
    if (!member) return res.status(404).json({ error: "Not found" });
    const [res2] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projectsTable)
      .where(sql`assignee_id = ${member.id} AND status = 'active'`);
    res.json({ ...member, activeProjects: res2?.count ?? 0 });
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Failed to update team member" });
  }
});

router.delete("/team/:id", async (req, res) => {
  try {
    const { id } = DeleteTeamMemberParams.parse({ id: Number(req.params.id) });
    await db.delete(teamMembersTable).where(eq(teamMembersTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete team member" });
  }
});

export default router;
