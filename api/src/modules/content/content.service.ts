import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

// Guide articles live as Markdown files in api/content/<section>/<slug>.md, so edits show up in git history.
// A French version sits next to it as <slug>.fr.md. Resolves the same from src/ (dev) and dist/ (build).
export const CONTENT_DIR = path.resolve(import.meta.dirname, "../../../content");

export const SECTIONS = ["essentials", "housing", "community"] as const;
export type Section = (typeof SECTIONS)[number];

export const LANGUAGES = ["en", "fr"] as const;
export type Language = (typeof LANGUAGES)[number];

const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  lastChecked: z.iso.date(),
  sources: z.array(z.object({ title: z.string().min(1), url: z.url() })).min(1),
});

// A translation records the fingerprint of the English file it was made from.
const translationSchema = frontmatterSchema.extend({ translatedFrom: z.string().min(1) });

export type Article = z.infer<typeof frontmatterSchema> & { slug: string; body: string; lang: Language };

const SLUG_PATTERN = /^[a-z0-9-]+$/;

// Fingerprint of an English guide. Line endings are normalized so a Windows checkout hashes the same.
export function sourceHash(raw: string): string {
  return createHash("sha256").update(raw.replace(/\r\n/g, "\n")).digest("hex").slice(0, 16);
}

async function readContent(section: Section, file: string): Promise<string | null> {
  try {
    return await readFile(path.join(CONTENT_DIR, section, file), "utf8");
  } catch {
    return null;
  }
}

export async function loadArticle(section: Section, slug: string, lang: Language = "en"): Promise<Article | null> {
  if (!SLUG_PATTERN.test(slug)) return null;
  const raw = await readContent(section, `${slug}.md`);
  if (raw === null) return null;

  // Serve the translation only while it matches the current English, so readers never get outdated French.
  if (lang !== "en") {
    const translated = await readContent(section, `${slug}.${lang}.md`);
    if (translated !== null) {
      const { data, content } = matter(translated);
      const { translatedFrom, ...meta } = translationSchema.parse(data);
      if (translatedFrom === sourceHash(raw)) return { ...meta, slug, body: content.trim(), lang };
    }
  }

  const { data, content } = matter(raw);
  return { ...frontmatterSchema.parse(data), slug, body: content.trim(), lang: "en" };
}

// English guides of a section, e.g. for the chat assistant's knowledge.
export async function loadSection(section: Section): Promise<Article[]> {
  const files = (await readdir(path.join(CONTENT_DIR, section))).filter((f) => /^[a-z0-9-]+\.md$/.test(f)).sort();
  const articles = await Promise.all(files.map((f) => loadArticle(section, f.slice(0, -3))));
  return articles.filter((a): a is Article => a !== null);
}
