import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { fingerprint } from "../../lib/fingerprint.js";

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

// Fingerprint of an English guide file, recorded by its translations as `translatedFrom`.
export const sourceHash = fingerprint;

// Guides only change with a deploy, so production keeps each one in memory after the first read.
// Development always reads the file, so edits show up without a restart. Only found guides are cached,
// so requests for made-up slugs cannot grow the cache.
const cache = process.env.NODE_ENV === "production" ? new Map<string, Article>() : null;

async function readContent(section: Section, file: string): Promise<string | null> {
  try {
    return await readFile(path.join(CONTENT_DIR, section, file), "utf8");
  } catch {
    return null;
  }
}

export async function loadArticle(section: Section, slug: string, lang: Language = "en"): Promise<Article | null> {
  if (!SLUG_PATTERN.test(slug)) return null;
  const key = `${section}/${slug}/${lang}`;
  const cached = cache?.get(key);
  if (cached) return cached;
  const article = await readArticle(section, slug, lang);
  if (article) cache?.set(key, article);
  return article;
}

async function readArticle(section: Section, slug: string, lang: Language): Promise<Article | null> {
  const raw = await readContent(section, `${slug}.md`);
  if (raw === null) return null;

  // Serve the translation only while it matches the current English, so readers never get outdated French.
  if (lang !== "en") {
    const translated = await readContent(section, `${slug}.${lang}.md`);
    if (translated !== null) {
      const { data, content } = matter(translated);
      // A translation with a broken header falls back to English rather than breaking the page.
      const parsed = translationSchema.safeParse(data);
      if (parsed.success && parsed.data.translatedFrom === sourceHash(raw)) {
        const { translatedFrom: _, ...meta } = parsed.data;
        return { ...meta, slug, body: content.trim(), lang };
      }
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
