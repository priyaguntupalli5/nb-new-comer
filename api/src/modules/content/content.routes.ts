import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../../middleware/error-handler.js";
import { loadArticle, SECTIONS } from "./content.service.js";

export const contentRouter = Router();

const paramsSchema = z.object({
  section: z.enum(SECTIONS),
  slug: z.string(),
});

// Public guide articles, e.g. GET /api/content/essentials/sin-id
contentRouter.get("/:section/:slug", async (req, res) => {
  const { section, slug } = paramsSchema.parse(req.params);
  const article = await loadArticle(section, slug);
  if (!article) throw new HttpError(404, "Article not found");
  res.json(article);
});
