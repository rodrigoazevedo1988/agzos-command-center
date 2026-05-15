import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
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

// Rotas públicas (sem autenticação)
router.use(healthRouter);
router.use(authRouter);

// Rotas protegidas (requireAuth aplicado no app.ts)
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
