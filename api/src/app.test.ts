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

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
  });
});
