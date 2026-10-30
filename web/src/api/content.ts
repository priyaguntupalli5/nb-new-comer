import { useQuery } from "@tanstack/react-query";

export type Article = {
  slug: string;
  title: string;
  summary: string;
  lastChecked: string;
  sources: { title: string; url: string }[];
  body: string;
};

export class NotFoundError extends Error {}

const API_URL = import.meta.env.VITE_API_URL ?? "";

async function fetchArticle(section: string, slug: string): Promise<Article> {
  const res = await fetch(`${API_URL}/api/content/${section}/${encodeURIComponent(slug)}`);
  if (res.status === 404) throw new NotFoundError();
  if (!res.ok) throw new Error(`Article request failed: ${res.status}`);
  return res.json();
}

export function useArticle(section: string, slug: string) {
  return useQuery({
    queryKey: ["article", section, slug],
    queryFn: () => fetchArticle(section, slug),
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => !(err instanceof NotFoundError) && count < 2,
  });
}
