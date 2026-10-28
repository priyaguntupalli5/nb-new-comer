import { useTranslation } from "react-i18next";
import type { ChecklistItem } from "../../api/checklist";
import { formatDate } from "../../lib/content";
import { StepCard } from "./StepCard";

type Props = {
  steps: ChecklistItem[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  completed: string[];
  onToggle: (slug: string) => void;
  placeholderCount: number;
};

// Shared by the home page's urgent steps and the full checklist page.
export function StepList({ steps, isPending, isError, onRetry, completed, onToggle, placeholderCount }: Props) {
  const { t, i18n } = useTranslation();
  // Show the oldest check date so we never overstate how fresh the information is.
  const oldestCheck = steps.map((step) => step.lastCheckedAt).sort()[0];

  return (
    <>
      <div aria-live="polite" aria-busy={isPending}>
        {isPending ? (
          <ol className="grid gap-4 md:grid-cols-3" aria-label={t("steps.loading")}>
            {Array.from({ length: placeholderCount }, (_, i) => (
              <li key={i} className="h-64 animate-pulse rounded-2xl border-2 border-line bg-paper" />
            ))}
          </ol>
        ) : isError ? (
          <div className="rounded-2xl border-2 border-line bg-paper p-6">
            <p>{t("steps.error")}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-lg border-2 border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-white"
            >
              {t("steps.retry")}
            </button>
          </div>
        ) : steps.length === 0 ? (
          <p className="rounded-2xl border-2 border-line bg-paper p-6">{t("steps.empty")}</p>
        ) : (
          <ol className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                number={index + 1}
                done={completed.includes(step.slug)}
                onToggle={() => onToggle(step.slug)}
              />
            ))}
          </ol>
        )}
      </div>

      {oldestCheck && (
        <p className="mt-6 text-sm text-muted">
          {t("steps.lastChecked", { date: formatDate(oldestCheck, i18n.language) })}
        </p>
      )}
    </>
  );
}

export function StepProgress({ done, total }: { done: number; total: number }) {
  const { t } = useTranslation();

  return (
    <div className="w-full sm:w-60">
      <p id="steps-progress" className="text-sm font-semibold">
        {t("steps.progress", { done, total })}
      </p>
      <div
        role="progressbar"
        aria-labelledby="steps-progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="mt-2 h-2 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-300"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
