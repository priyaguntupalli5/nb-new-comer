import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { requireCloudFront } from "./middleware/cloudfront.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { checklistRouter } from "./modules/checklist/checklist.routes.js";
import { chatRouter } from "./modules/chat/chat.routes.js";
import { adminTipsRouter, tipsRouter } from "./modules/community/tips.routes.js";
import { contentRouter } from "./modules/content/content.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(requireCloudFront);
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: "100kb" }));
  app.use(pinoHttp({ logger }));

  app.use("/api/health", healthRouter);
  app.use("/api/checklist", checklistRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/content", contentRouter);
  app.use("/api/tips", tipsRouter);
  app.use("/api/admin/tips", adminTipsRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
