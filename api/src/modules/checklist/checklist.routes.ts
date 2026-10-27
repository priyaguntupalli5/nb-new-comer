import { Router } from "express";
import { ProfileType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

export const checklistRouter = Router();

const querySchema = z.object({
  profile: z.enum(ProfileType),
});

// Public, account-free checklist for a profile type. Progress lives in the browser for the MVP.
checklistRouter.get("/", async (req, res) => {
  const { profile } = querySchema.parse(req.query);
  const items = await prisma.checklistItem.findMany({
    where: { profiles: { some: { profileType: profile } } },
    orderBy: { sortOrder: "asc" },
    omit: { sortOrder: true },
  });
  res.json({ profile, items });
});
