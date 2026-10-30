import { TipStatus } from "@prisma/client";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { viewerKey } from "../../middleware/cloudfront.js";
import { HttpError } from "../../middleware/error-handler.js";
import { requireAdmin } from "../../middleware/require-admin.js";

export const TIP_CATEGORIES = ["food", "worship", "cultural-group", "other"] as const;
export const TIP_CITIES = ["fredericton", "moncton", "saint-john", "other"] as const;

const publicFields = { id: true, category: true, title: true, city: true, link: true, body: true, createdAt: true } as const;

const submissionSchema = z.object({
  category: z.enum(TIP_CATEGORIES),
  title: z.string().trim().min(2).max(120),
  city: z.enum(TIP_CITIES),
  link: z
    .url({ protocol: /^https?$/ })
    .max(300)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  body: z.string().trim().min(10).max(1000),
  // Honeypot: hidden from people, so only bots fill it in.
  website: z.string().optional(),
});

const listSchema = z.object({
  category: z.enum(TIP_CATEGORIES).optional(),
  city: z.enum(TIP_CITIES).optional(),
});

// Public submissions are cheap to send, so each visitor gets a few per hour.
const submitLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: viewerKey,
});

export const tipsRouter = Router();

// New suggestions wait in the moderation queue; nothing is published until a moderator approves it.
tipsRouter.post("/", submitLimiter, async (req, res) => {
  const { website, ...data } = submissionSchema.parse(req.body);
  if (website) {
    res.status(201).json({ status: "received" });
    return;
  }
  await prisma.tip.create({ data });
  res.status(201).json({ status: "received" });
});

// Approved suggestions only.
tipsRouter.get("/", async (req, res) => {
  const { category, city } = listSchema.parse(req.query);
  const tips = await prisma.tip.findMany({
    where: { status: TipStatus.APPROVED, category, city },
    select: publicFields,
    orderBy: { reviewedAt: "desc" },
    take: 100,
  });
  res.json({ tips });
});

export const adminTipsRouter = Router();
adminTipsRouter.use(requireAdmin);

adminTipsRouter.get("/pending", async (_req, res) => {
  const tips = await prisma.tip.findMany({
    where: { status: TipStatus.PENDING },
    select: publicFields,
    orderBy: { createdAt: "asc" },
  });
  res.json({ tips });
});

const decisionSchema = z.object({ id: z.uuid(), decision: z.enum(["approve", "reject"]) });

adminTipsRouter.put("/:id/:decision", async (req, res) => {
  const { id, decision } = decisionSchema.parse(req.params);
  const { count } = await prisma.tip.updateMany({
    where: { id, status: TipStatus.PENDING },
    data: { status: decision === "approve" ? TipStatus.APPROVED : TipStatus.REJECTED, reviewedAt: new Date() },
  });
  if (count === 0) throw new HttpError(404, "No pending suggestion with that id");
  res.json({ id, status: decision === "approve" ? "approved" : "rejected" });
});
