import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../../middleware/error-handler.js";
import { LANGUAGES, loadArticle, SECTIONS } from "./content.service.js";

export const contentRouter = Router();

const paramsSchema = z.object({
  section: z.enum(SECTIONS),
  slug: z.string(),
});

const querySchema = z.object({
  lang: z.enum(LANGUAGES).default("en"),
});

// Public guide articles, e.g. GET /api/content/essentials/sin-id?lang=fr
// Falls back to English when there is no up-to-date translation; the response's lang says which was served.
contentRouter.get("/:section/:slug", async (req, res) => {
  const { section, slug } = paramsSchema.parse(req.params);
  const { lang } = querySchema.parse(req.query);
  const article = await loadArticle(section, slug, lang);
  if (!article) throw new HttpError(404, "Article not found");
  res.json(article);
});
