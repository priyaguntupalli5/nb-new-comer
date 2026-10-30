import express from "express";
import { rateLimit } from "express-rate-limit";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler } from "./error-handler.js";
import { requireCloudFront, viewerKey } from "./cloudfront.js";

const SECRET = "a-test-origin-secret-of-at-least-32-chars";

function testApp() {
  const app = express();
  app.use(requireCloudFront);
  app.get("/api/health", (_req, res) => void res.json({ status: "ok" }));
  app.get("/api/limited", rateLimit({ windowMs: 60_000, limit: 1, keyGenerator: viewerKey }), (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorHandler);
  return app;
}

describe("CloudFront protection", () => {
  afterEach(() => {
    delete process.env.ORIGIN_SECRET;
  });

  it("lets every request through when no origin secret is set (local development)", async () => {
    expect((await request(testApp()).get("/api/limited")).status).toBe(200);
  });

  it("refuses requests that skip CloudFront, but keeps the health check open", async () => {
    process.env.ORIGIN_SECRET = SECRET;
    const app = testApp();
    expect((await request(app).get("/api/limited")).status).toBe(403);
    expect((await request(app).get("/api/limited").set("X-Origin-Verify", "wrong")).status).toBe(403);
    expect((await request(app).get("/api/health")).status).toBe(200);
    expect((await request(app).get("/api/limited").set("X-Origin-Verify", SECRET)).status).toBe(200);
  });

  it("rate-limits each visitor separately using the IP CloudFront passes on", async () => {
    process.env.ORIGIN_SECRET = SECRET;
    const app = testApp();
    const as = (ip: string) => request(app).get("/api/limited").set("X-Origin-Verify", SECRET).set("X-Viewer-IP", ip);
    expect((await as("203.0.113.1")).status).toBe(200);
    expect((await as("203.0.113.1")).status).toBe(429);
    expect((await as("203.0.113.2")).status).toBe(200);
  });
});
