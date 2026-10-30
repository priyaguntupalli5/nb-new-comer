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

  it("accepts a long earlier answer in the chat history but caps the new question", async () => {
    vi.stubEnv("AWS_REGION", "");
    vi.stubEnv("AWS_DEFAULT_REGION", "");
    const longAnswer = "a".repeat(5000);
    const ok = await request(app)
      .post("/api/chat")
      .send({
        messages: [
          { role: "user", content: "Tell me about the Child Benefit" },
          { role: "assistant", content: longAnswer },
          { role: "user", content: "Thanks. And the SIN?" },
        ],
      });
    // Passes validation, then stops at the missing Bedrock configuration.
    expect(ok.status).toBe(503);

    const tooLong = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "user", content: "a".repeat(2001) }] });
    expect(tooLong.status).toBe(400);
    vi.unstubAllEnvs();
  });

  it("reports the assistant as unavailable when Bedrock is not configured", async () => {
    vi.stubEnv("AWS_REGION", "");
    vi.stubEnv("AWS_DEFAULT_REGION", "");
    const res = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "user", content: "What do I bring for my SIN?" }] });
    expect(res.status).toBe(503);
    vi.unstubAllEnvs();
  });

  it("serves an essentials article with its official sources", async () => {
    const res = await request(app).get("/api/content/essentials/sin-id");
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("SIN and ID");
    expect(res.body.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(res.body.sources.length).toBeGreaterThan(0);
    expect(res.body.body).toContain("## What a SIN is");
  });

  it("serves every essentials article with valid frontmatter", async () => {
    for (const slug of ["sin-id", "health-card", "drivers-licence", "banking", "phone-plans", "getting-around", "winter"]) {
      const res = await request(app).get(`/api/content/essentials/${slug}`);
      expect(res.status, slug).toBe(200);
    }
  });

  it("serves every housing guide with valid frontmatter", async () => {
    for (const slug of ["renting", "tenant-rights", "rents", "campus"]) {
      const res = await request(app).get(`/api/content/housing/${slug}`);
      expect(res.status, slug).toBe(200);
    }
  });

  it("returns 404 for an unknown article and rejects path tricks", async () => {
    expect((await request(app).get("/api/content/essentials/not-written-yet")).status).toBe(404);
    expect((await request(app).get("/api/content/essentials/..%2F..%2F.env")).status).toBe(404);
    expect((await request(app).get("/api/content/secrets/sin-id")).status).toBe(400);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
  });
});
