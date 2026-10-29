import Anthropic from "@anthropic-ai/sdk";
import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import { ProfileType } from "@prisma/client";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { logger } from "../../lib/logger.js";
import { buildChecklistKnowledge, PROFILE_LABELS } from "./checklist-knowledge.js";

export const chatRouter = Router();

// Claude runs on Amazon Bedrock through the bedrock-runtime endpoint (the one the Bedrock console playground uses).
// Haiku 4.5 must be called through an inference profile: the catalog model ID with a "global." or "us." prefix.
const MODEL = process.env.BEDROCK_MODEL_ID || "global.anthropic.claude-haiku-4-5-20251001-v1:0";

const SYSTEM_PROMPT = `You are the assistant for NB Newcomer Guide, a website that helps newcomers through their first 90 days in New Brunswick, Canada. People ask you about the steps in their checklist: what to bring, where to go, what it costs, how long it takes, and what to watch out for.

Answer only from the checklist information below. It was collected from official government sources, and it is the only information you can rely on. If the answer is not in it, say that you do not have that information and point the person to the most relevant official source link or phone number from the checklist. Do not fill gaps from general knowledge, and never guess fees, processing times, documents or eligibility, because a wrong answer can cost a newcomer a wasted trip or a rejected application.

Some steps have a separate version for each category of newcomer: international student, permanent resident, work permit holder, and family moving together. Use the version that matches the person's category. If the answer depends on their category and you do not know it, ask them which one applies.

Many readers are reading in their second language. Use short sentences and plain words. List documents and steps as short bullet points starting with "- ". Write plain text: no headings, tables, bold or other formatting. Keep answers brief and give only what the question needs. End with the official source link for the step you used.

Reply in the language the person writes in. If they write in French, translate the checklist information into French.

If someone asks about something unrelated to settling in New Brunswick, say kindly that you can only help with the newcomer checklist. This is general information, not legal or immigration advice; if someone's situation is unusual, suggest they contact the office or phone number listed for that step.

Latency-sensitive; begin your visible answer immediately.`;

const bodySchema = z.object({
  messages: z
    .array(
      // Questions are capped at what the input box allows; earlier answers are sent back as history and can be longer.
      z.discriminatedUnion("role", [
        z.object({ role: z.literal("user"), content: z.string().trim().min(1).max(2000) }),
        z.object({ role: z.literal("assistant"), content: z.string().trim().min(1).max(10000) }),
      ]),
    )
    .min(1)
    .max(20)
    .refine((messages) => messages.at(-1)?.role === "user", "The last message must be from the user"),
  profile: z.enum(ProfileType).optional(),
  language: z.enum(["en", "fr"]).optional(),
});

// Public endpoint that costs money per call, so keep each visitor to a reasonable pace.
const chatLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false });

let client: AnthropicBedrock | undefined;

// AWS credentials come from the standard chain (env vars, profile, SSO, or an IAM role on AWS),
// so the region is the one setting we can check up front.
function isConfigured() {
  return Boolean(process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION);
}

// Streams the answer as newline-delimited JSON: {"type":"text","text":...} chunks, then "done" or "error".
chatRouter.post("/", chatLimiter, async (req, res) => {
  const { messages, profile, language } = bodySchema.parse(req.body);

  if (!isConfigured()) {
    res.status(503).json({ error: "The assistant is not set up yet" });
    return;
  }
  client ??= new AnthropicBedrock();

  const knowledge = await buildChecklistKnowledge();
  const context = [
    profile
      ? `The person has selected this category on the site: ${PROFILE_LABELS[profile]}. Use it unless they say otherwise.`
      : "The person has not selected a category on the site.",
    `The site is currently shown in ${language === "fr" ? "French" : "English"}.`,
  ].join(" ");

  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  const send = (event: object) => res.write(`${JSON.stringify(event)}\n`);

  const abort = new AbortController();
  res.on("close", () => abort.abort());

  try {
    const stream = client.messages.stream(
      {
        model: MODEL,
        max_tokens: 8000,
        system: [
          { type: "text", text: SYSTEM_PROMPT },
          {
            type: "text",
            text: `<checklist>\n${knowledge}\n</checklist>`,
            cache_control: { type: "ephemeral" },
          },
          // After the cache breakpoint, so a different category or language doesn't invalidate the cached checklist.
          { type: "text", text: context },
        ],
        messages,
      },
      { signal: abort.signal },
    );

    stream.on("text", (text) => send({ type: "text", text }));
    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      send({ type: "error", error: "refused" });
    } else {
      send({ type: "done" });
    }
  } catch (err) {
    if (abort.signal.aborted) return;
    if (err instanceof Anthropic.RateLimitError) {
      logger.warn({ err }, "Claude rate limit reached");
      send({ type: "error", error: "busy" });
    } else if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      logger.error({ err }, "AWS credentials were rejected, or Bedrock model access is not enabled for this model");
      send({ type: "error", error: "unavailable" });
    } else {
      logger.error({ err }, "Chat request failed");
      send({ type: "error", error: "unavailable" });
    }
  }
  res.end();
});
