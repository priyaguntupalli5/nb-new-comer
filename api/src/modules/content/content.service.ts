import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

// Guide articles live as Markdown files in api/content/<section>/<slug>.md, so edits show up in git history.
// Resolves the same from src/ (dev) and dist/ (build).
const CONTENT_DIR = path.resolve(import.meta.dirname, "../../../content");

export const SECTIONS = ["essentials", "housing"] as const;
export type Section = (typeof SECTIONS)[number];

const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  lastChecked: z.iso.date(),
  sources: z.array(z.object({ title: z.string().min(1), url: z.url() })).min(1),
});

export type Article = z.infer<typeof frontmatterSchema> & { slug: string; body: string };

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export async function loadArticle(section: Section, slug: string): Promise<Article | null> {
  if (!SLUG_PATTERN.test(slug)) return null;
  let raw: string;
  try {
    raw = await readFile(path.join(CONTENT_DIR, section, `${slug}.md`), "utf8");
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  return { ...frontmatterSchema.parse(data), slug, body: content.trim() };
}

export async function loadSection(section: Section): Promise<Article[]> {
  const files = (await readdir(path.join(CONTENT_DIR, section))).filter((f) => f.endsWith(".md")).sort();
  const articles = await Promise.all(files.map((f) => loadArticle(section, f.slice(0, -3))));
  return articles.filter((a): a is Article => a !== null);
}
