import cors from "cors";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import { authPublicRouter, createAuthMeRouter } from "./routes/auth.routes.js";
import { catalogRouter } from "./routes/catalog.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { inscriptionsRouter } from "./routes/inscription.routes.js";
import { paymentsRouter } from "./routes/payment.routes.js";
import { studentPublicRouter, studentsRouter } from "./routes/student.routes.js";
import { promotionsRouter } from "./routes/promotion.routes.js";
import { prisma } from "./lib/prisma.js";
import { authMiddleware } from "./middleware/auth.js";
import { asyncHandler } from "./utils/asyncHandler.js";

export function createApp() {
  const app = express();
  const allowedOrigins = (
    process.env.FRONTEND_ORIGIN ??
    "http://localhost:5173,http://127.0.0.1:5173,https://consultorainnova-oq866oit4-lets04s-projects.vercel.app"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({ service: "innova-server", docs: "/api/health" });
  });

  const api = express.Router();
  api.get(
    "/health",
    asyncHandler(async (_req, res) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: "ok", database: "up" });
      } catch {
        res.status(503).json({ status: "degraded", database: "down" });
      }
    }),
  );
  api.use(authPublicRouter);
  api.use(studentPublicRouter);

  const secured = express.Router();
  secured.use(authMiddleware);

  secured.use(createAuthMeRouter());
  secured.use(dashboardRouter);
  secured.use(studentsRouter);
  secured.use(inscriptionsRouter);
  secured.use(paymentsRouter);
  secured.use(catalogRouter);
  secured.use(promotionsRouter);

  api.use(secured);
  app.use("/api", api);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  });

  return app;
}
