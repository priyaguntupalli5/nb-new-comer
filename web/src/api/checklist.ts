import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { Language } from "../i18n";

export const PROFILE_TYPES = [
  "INTERNATIONAL_STUDENT",
  "PERMANENT_RESIDENT",
  "WORK_PERMIT_HOLDER",
  "FAMILY",
] as const;
export type ProfileType = (typeof PROFILE_TYPES)[number];

export type ChecklistItem = {
  id: string;
  slug: string;
  title: string;
  detail: string;
  bring: string[];
  where: string | null;
  cost: string | null;
  timeline: string | null;
  keyFacts: string[];
  officialSourceUrl: string;
  lastCheckedAt: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";

async function fetchChecklist(profile: ProfileType, lang: Language): Promise<ChecklistItem[]> {
  const res = await fetch(`${API_URL}/api/checklist?profile=${profile}&lang=${lang}`);
  if (!res.ok) throw new Error(`Checklist request failed: ${res.status}`);
  const body: { items: ChecklistItem[] } = await res.json();
  return body.items;
}

// The language is part of the query key, so switching language refetches the steps in that language.
export function useChecklist(profile: ProfileType) {
  const { i18n } = useTranslation();
  const lang: Language = i18n.language.startsWith("fr") ? "fr" : "en";
  return useQuery({
    queryKey: ["checklist", profile, lang],
    queryFn: () => fetchChecklist(profile, lang),
    staleTime: 5 * 60 * 1000,
  });
}
