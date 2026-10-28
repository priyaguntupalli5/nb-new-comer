import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import type { ChecklistItem } from "../../api/checklist";

type Props = {
  step: ChecklistItem;
  number: number;
  done: boolean;
  onToggle: () => void;
};

export function StepCard({ step, number, done, onToggle }: Props) {
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
