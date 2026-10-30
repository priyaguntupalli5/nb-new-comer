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

  it("rejects a checklist language the site does not offer", async () => {
    const res = await request(app).get("/api/checklist?profile=FAMILY&lang=de");
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

  it("serves an essentials article in French", async () => {
    const res = await request(app).get("/api/content/essentials/sin-id?lang=fr");
    expect(res.status).toBe(200);
    expect(res.body.lang).toBe("fr");
    expect(res.body.title).toBe("NAS et pièces d'identité");
    expect(res.body.body).toContain("## Qu'est-ce qu'un NAS");
  });

  it("serves every essentials article when French is asked for", async () => {
    for (const slug of ["sin-id", "health-card", "drivers-licence", "banking", "phone-plans", "getting-around", "winter"]) {
      const res = await request(app).get(`/api/content/essentials/${slug}?lang=fr`);
      expect(res.status, slug).toBe(200);
    }
  });

  it("falls back to English for a guide with no French version", async () => {
    const res = await request(app).get("/api/content/housing/renting?lang=fr");
    expect(res.status).toBe(200);
    expect(res.body.lang).toBe("en");
  });

  it("rejects a guide language the site does not offer", async () => {
    expect((await request(app).get("/api/content/essentials/sin-id?lang=de")).status).toBe(400);
  });

  it("serves every housing guide with valid frontmatter", async () => {
    for (const slug of ["renting", "tenant-rights", "rents", "campus"]) {
      const res = await request(app).get(`/api/content/housing/${slug}`);
      expect(res.status, slug).toBe(200);
    }
  });

  it("serves every community guide with valid frontmatter", async () => {
    for (const slug of ["food", "faith"]) {
      const res = await request(app).get(`/api/content/community/${slug}`);
      expect(res.status, slug).toBe(200);
    }
  });

  it("returns 404 for an unknown article and rejects path tricks", async () => {
    expect((await request(app).get("/api/content/essentials/not-written-yet")).status).toBe(404);
    expect((await request(app).get("/api/content/essentials/..%2F..%2F.env")).status).toBe(404);
    expect((await request(app).get("/api/content/secrets/sin-id")).status).toBe(400);
  });

  it("rejects an invalid resource suggestion", async () => {
    const res = await request(app)
      .post("/api/tips")
      .send({ category: "restaurant", title: "X", city: "halifax", body: "short" });
    expect(res.status).toBe(400);
  });

  it("quietly accepts a suggestion that fills the bot honeypot without saving it", async () => {
    const res = await request(app).post("/api/tips").send({
      category: "food",
      title: "Spam Store",
      city: "moncton",
      body: "Buy cheap things at our store today",
      website: "http://spam.example",
    });
    expect(res.status).toBe(201);
  });

  it("protects the moderation queue with the admin token", async () => {
    vi.stubEnv("ADMIN_TOKEN", "");
    expect((await request(app).get("/api/admin/tips/pending")).status).toBe(503);

    vi.stubEnv("ADMIN_TOKEN", "a-very-long-test-admin-token-123");
    expect((await request(app).get("/api/admin/tips/pending")).status).toBe(401);
    expect(
      (await request(app).get("/api/admin/tips/pending").set("Authorization", "Bearer wrong-token")).status,
    ).toBe(401);
    vi.unstubAllEnvs();
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
  });
});
