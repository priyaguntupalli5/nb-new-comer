import { Fragment } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useChecklist, type ChecklistItem, type ProfileType } from "../../api/checklist";
import { formatDate } from "../../lib/content";

const URGENT_COUNT = 3;

type Props = {
  profile: ProfileType;
  completed: string[];
  onToggle: (slug: string) => void;
};

export function UrgentSteps({ profile, completed, onToggle }: Props) {
  const { t, i18n } = useTranslation();
  const { data, isPending, isError, refetch } = useChecklist(profile);

  const steps = data?.slice(0, URGENT_COUNT) ?? [];
  const doneCount = steps.filter((step) => completed.includes(step.slug)).length;
  // Show the oldest check date so we never overstate how fresh the information is.
  const oldestCheck = steps.map((step) => step.lastCheckedAt).sort()[0];

  return (
    <section id="steps" className="scroll-mt-4 border-y border-line bg-white" aria-labelledby="steps-title">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="steps-title" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("steps.heading")}
            </h2>
            <p className="mt-2 text-muted">
              <Trans
                i18nKey="steps.forProfile"
                values={{ profile: t(`profile.${profile}.label`) }}
                components={{ b: <strong className="font-semibold text-ink" /> }}
              />
            </p>
          </div>
          {steps.length > 0 && (
            <div className="w-full sm:w-60">
              <p id="steps-progress" className="text-sm font-semibold">
                {t("steps.progress", { done: doneCount, total: steps.length })}
              </p>
              <div
                role="progressbar"
                aria-labelledby="steps-progress"
                aria-valuemin={0}
                aria-valuemax={steps.length}
                aria-valuenow={doneCount}
                className="mt-2 h-2 overflow-hidden rounded-full bg-line"
              >
                <div
                  className="h-full rounded-full bg-teal transition-[width] duration-300"
                  style={{ width: `${(doneCount / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8" aria-live="polite" aria-busy={isPending}>
          {isPending ? (
            <ol className="grid gap-4 md:grid-cols-3" aria-label={t("steps.loading")}>
              {Array.from({ length: URGENT_COUNT }, (_, i) => (
                <li key={i} className="h-64 animate-pulse rounded-2xl border-2 border-line bg-paper" />
              ))}
            </ol>
          ) : isError ? (
            <div className="rounded-2xl border-2 border-line bg-paper p-6">
              <p>{t("steps.error")}</p>
              <button
                type="button"
                onClick={() => void refetch()}
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
      </div>
    </section>
  );
}

type StepCardProps = {
  step: ChecklistItem;
  number: number;
  done: boolean;
  onToggle: () => void;
};

function StepCard({ step, number, done, onToggle }: StepCardProps) {
  const { t } = useTranslation();
  const facts = [
    { label: t("steps.where"), value: step.where },
    { label: t("steps.cost"), value: step.cost },
    { label: t("steps.timeline"), value: step.timeline },
  ];

  return (
    <li
      className={`flex flex-col rounded-2xl border-2 p-5 transition-colors sm:p-6 ${
        done ? "border-teal bg-mint" : "border-line bg-paper"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white ${
            done ? "bg-teal" : "bg-ink"
          }`}
        >
          {done ? "✓" : number}
        </span>
        <h3 className="font-display text-lg leading-snug font-bold">{step.title}</h3>
      </div>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{step.detail}</p>
      {step.bring.length > 0 && (
        <div className="mt-4 text-sm">
          <h4 className="font-semibold">{t("steps.bring")}</h4>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 leading-snug text-muted marker:text-teal">
            {step.bring.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        </div>
      )}
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        {facts.map(
          ({ label, value }) =>
            value && (
              <Fragment key={label}>
                <dt className="font-semibold">{label}</dt>
                <dd className="text-muted">{value}</dd>
              </Fragment>
            ),
        )}
      </dl>
      {step.keyFacts.length > 0 && (
        <details className="group mt-4 rounded-lg border border-line bg-white text-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 font-semibold [&::-webkit-details-marker]:hidden">
            {t("steps.keyFacts", { count: step.keyFacts.length })}
            <span aria-hidden="true" className="transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <ul className="list-disc space-y-2 border-t border-line py-3 pr-3 pl-8 leading-relaxed text-muted">
            {step.keyFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </details>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-6">
        <button
          type="button"
          aria-pressed={done}
          onClick={onToggle}
          className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold ${
            done ? "border-teal bg-teal text-white hover:bg-teal-dark" : "border-ink hover:bg-ink hover:text-white"
          }`}
        >
          {done ? `✓ ${t("steps.done")}` : t("steps.markDone")}
        </button>
        <a
          href={step.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded text-sm font-medium text-teal underline underline-offset-4 hover:text-teal-dark"
        >
          {t("steps.officialSource")}
          <span className="sr-only"> {t("housing.newTab")}</span>
        </a>
      </div>
    </li>
  );
}
