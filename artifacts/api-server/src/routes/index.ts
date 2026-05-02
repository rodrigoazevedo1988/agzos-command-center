import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import sitesRouter from "./sites";
import clientsRouter from "./clients";
import projectsRouter from "./projects";
import tasksRouter from "./tasks";
import teamRouter from "./team";
import financialRouter from "./financial";
import toolsRouter from "./tools";
import mobileRouter from "./mobile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(sitesRouter);
router.use(clientsRouter);
router.use(projectsRouter);
router.use(tasksRouter);
router.use(teamRouter);
router.use(financialRouter);
router.use(toolsRouter);
router.use(mobileRouter);

export default router;
