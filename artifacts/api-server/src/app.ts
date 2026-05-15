import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { requireAuth } from "./middleware/auth";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas públicas: /api/health, /api/auth/*
app.use("/api/health", router);
app.use("/api/auth", router);

// Todas as demais rotas exigem JWT válido
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  // Deixa passar rotas de auth e health sem autenticação
  if (req.path.startsWith("/auth/") || req.path === "/health") {
    return next();
  }
  return requireAuth(req, res, next);
}, router);

export default app;
