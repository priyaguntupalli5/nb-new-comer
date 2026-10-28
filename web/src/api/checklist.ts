import { useQuery } from "@tanstack/react-query";

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

async function fetchChecklist(profile: ProfileType): Promise<ChecklistItem[]> {
  const res = await fetch(`${API_URL}/api/checklist?profile=${profile}`);
  if (!res.ok) throw new Error(`Checklist request failed: ${res.status}`);
  const body: { items: ChecklistItem[] } = await res.json();
  return body.items;
}

export function useChecklist(profile: ProfileType) {
  return useQuery({
    queryKey: ["checklist", profile],
    queryFn: () => fetchChecklist(profile),
    staleTime: 5 * 60 * 1000,
  });
}
