import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

createApp().listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`);
});
