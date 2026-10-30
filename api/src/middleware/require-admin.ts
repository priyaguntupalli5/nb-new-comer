import { createHash, timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { HttpError } from "./error-handler.js";

const digest = (value: string) => createHash("sha256").update(value).digest();

// Interim protection for moderation routes: a shared token from ADMIN_TOKEN, sent as "Authorization: Bearer <token>".
// Replace with role-based auth once user accounts exist.
export const requireAdmin: RequestHandler = (req, _res, next) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return next(new HttpError(503, "Moderation is not set up"));

  const header = req.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  // Compare fixed-length digests so the check takes the same time whatever the token.
  if (!token || !timingSafeEqual(digest(token), digest(expected))) {
    return next(new HttpError(401, "Not authorized"));
  }
  next();
};
