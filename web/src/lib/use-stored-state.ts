import { useEffect, useState } from "react";

// Account-free MVP: profile choice and checklist progress live in the browser only.
export function useStoredState<T>(key: string, initial: T, isValid: (value: unknown) => value is T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (isValid(parsed)) return parsed;
      }
    } catch {
      // Blocked or corrupt storage: start fresh.
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Not critical: progress just won't survive a reload.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
