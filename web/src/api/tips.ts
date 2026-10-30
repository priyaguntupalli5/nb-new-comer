import { useQuery } from "@tanstack/react-query";

export const TIP_CATEGORIES = ["food", "worship", "cultural-group", "other"] as const;
export const TIP_CITIES = ["fredericton", "moncton", "saint-john", "other"] as const;
export type TipCategory = (typeof TIP_CATEGORIES)[number];
export type TipCity = (typeof TIP_CITIES)[number];

export type Tip = {
  id: string;
  category: TipCategory;
  title: string;
  city: TipCity;
  link: string | null;
  body: string;
  createdAt: string;
};

export type TipSubmission = {
  category: TipCategory;
  title: string;
  city: TipCity;
  link: string;
  body: string;
  website: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";

export class TipRequestError extends Error {
  status: number;

  constructor(status: number) {
    super(`Request failed: ${status}`);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) throw new TipRequestError(res.status);
  return res.json();
}

export function submitTip(tip: TipSubmission) {
  return request<{ status: string }>("/api/tips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tip),
  });
}

export function useApprovedTips() {
  return useQuery({
    queryKey: ["tips", "approved"],
    queryFn: () => request<{ tips: Tip[] }>("/api/tips").then((r) => r.tips),
  });
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export function fetchPendingTips(token: string) {
  return request<{ tips: Tip[] }>("/api/admin/tips/pending", { headers: auth(token) }).then((r) => r.tips);
}

export function decideTip(token: string, id: string, decision: "approve" | "reject") {
  return request<{ status: string }>(`/api/admin/tips/${id}/${decision}`, { method: "PUT", headers: auth(token) });
}
