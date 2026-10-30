import { Router } from "express";
import { ProfileType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

export const checklistRouter = Router();

const querySchema = z.object({
  profile: z.enum(ProfileType),
  lang: z.enum(["en", "fr"]).default("en"),
});

// Public, account-free checklist for a profile type. Progress lives in the browser for the MVP.
checklistRouter.get("/", async (req, res) => {
  const { profile, lang } = querySchema.parse(req.query);
  const rows = await prisma.checklistItem.findMany({
    where: { profiles: { some: { profileType: profile } } },
    orderBy: { sortOrder: "asc" },
    omit: { sortOrder: true },
    include: { translations: { where: { locale: lang } } },
  });

  // English lives on the item itself. Any translated field replaces it; untranslated items stay in English.
  const items = rows.map(({ translations, ...item }) => {
    const t = translations[0];
    if (!t) return item;
    return {
      ...item,
      title: t.title,
      detail: t.detail,
      bring: t.bring.length > 0 ? t.bring : item.bring,
      where: t.where ?? item.where,
      cost: t.cost ?? item.cost,
      timeline: t.timeline ?? item.timeline,
      keyFacts: t.keyFacts.length > 0 ? t.keyFacts : item.keyFacts,
    };
  });
  res.json({ profile, lang, items });
});
