import request from "supertest";
import { describe, expect, it, vi } from "vitest";
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

  it("rejects a chat request that does not end with a user message", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "assistant", content: "Hello" }] });
    expect(res.status).toBe(400);
  });

  it("reports the assistant as unavailable when no Claude credentials are set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("ANTHROPIC_AUTH_TOKEN", "");
    const res = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "user", content: "What do I bring for my SIN?" }] });
    expect(res.status).toBe(503);
    vi.unstubAllEnvs();
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
  });
});
