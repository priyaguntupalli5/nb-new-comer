import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  LOG_LEVEL: z.string().default("info"),
  // Shared secret for the moderation endpoints until accounts and roles exist. Unset means moderation is off.
  ADMIN_TOKEN: z.string().min(24).optional(),
  // Production only: secret CloudFront sends as X-Origin-Verify, so the public Lambda URL can't be called directly.
  ORIGIN_SECRET: z.string().min(32).optional(),
});

export const env = schema.parse(process.env);
