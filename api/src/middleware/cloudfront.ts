import { createHash, timingSafeEqual } from "node:crypto";
import type { Request, RequestHandler } from "express";
import { ipKeyGenerator } from "express-rate-limit";
import { HttpError } from "./error-handler.js";

const digest = (value: string) => createHash("sha256").update(value).digest();

// In production the API sits behind CloudFront, which adds a secret X-Origin-Verify header to every request it
// forwards. The Lambda URL is public too, so without this check anyone could call it directly, skip CloudFront
// and send a made-up X-Viewer-IP to dodge the rate limits. Unset ORIGIN_SECRET (local development) turns it off.
// The health check stays open because the Lambda Web Adapter calls it directly to see that the app is ready.
export const requireCloudFront: RequestHandler = (req, _res, next) => {
  const expected = process.env.ORIGIN_SECRET;
  if (!expected || req.path === "/api/health") return next();
  const header = req.get("x-origin-verify") ?? "";
  if (!header || !timingSafeEqual(digest(header), digest(expected))) {
    return next(new HttpError(403, "Forbidden"));
  }
  next();
};

// Rate limit key: the visitor's real IP. Behind CloudFront every request comes from an AWS address, so a
// CloudFront function copies the viewer IP into X-Viewer-IP, overwriting anything the visitor sent. That header
// is only trusted when requireCloudFront is on; locally the connection's own IP is used.
export function viewerKey(req: Request): string {
  const viaCloudFront = process.env.ORIGIN_SECRET ? req.get("x-viewer-ip") : undefined;
  return ipKeyGenerator(viaCloudFront || req.ip || "unknown");
}
