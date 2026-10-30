import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Language } from "../i18n";

export type Article = {
  slug: string;
  title: string;
  summary: string;
  lastChecked: string;
  sources: { title: string; url: string }[];
  body: string;
  // The language actually served: English when a guide has no up-to-date translation yet.
  lang: Language;
};

export class NotFoundError extends Error {}

const API_URL = import.meta.env.VITE_API_URL ?? "";

async function fetchArticle(section: string, slug: string, lang: Language): Promise<Article> {
  const res = await fetch(`${API_URL}/api/content/${section}/${encodeURIComponent(slug)}?lang=${lang}`);
  if (res.status === 404) throw new NotFoundError();
  if (!res.ok) throw new Error(`Article request failed: ${res.status}`);
  return res.json();
}

// The language is part of the query key, so switching language reloads the guide in that language.
export function useArticle(section: string, slug: string) {
  const { i18n } = useTranslation();
  const lang: Language = i18n.language.startsWith("fr") ? "fr" : "en";
  return useQuery({
    queryKey: ["article", section, slug, lang],
    queryFn: () => fetchArticle(section, slug, lang),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => !(err instanceof NotFoundError) && count < 2,
  });
}
