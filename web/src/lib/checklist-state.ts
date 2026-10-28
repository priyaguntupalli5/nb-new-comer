import { PROFILE_TYPES, type ProfileType } from "../api/checklist";
import { useStoredState } from "./use-stored-state";

const isProfile = (value: unknown): value is ProfileType => PROFILE_TYPES.includes(value as ProfileType);
const isSlugList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((slug) => typeof slug === "string");

export function useProfile() {
  return useStoredState<ProfileType>("nbg.profile", "INTERNATIONAL_STUDENT", isProfile);
}

// Progress is keyed by item slug, so a step done under one profile stays done under another.
export function useCompletedSteps() {
  const [completed, setCompleted] = useStoredState<string[]>("nbg.completed", [], isSlugList);
  const toggle = (slug: string) =>
    setCompleted((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  return [completed, toggle] as const;
}
