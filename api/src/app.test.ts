import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const app = createApp();

describe("API", () => {
  it("reports liveness", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("rejects an unknown profile type", async () => {
    const res = await request(app).get("/api/checklist?profile=TOURIST");
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
  });
});
