import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useChecklist, type ProfileType } from "../../api/checklist";
import { StepList, StepProgress } from "../checklist/StepList";

const URGENT_COUNT = 3;

type Props = {
  profile: ProfileType;
  completed: string[];
  onToggle: (slug: string) => void;
};

export function UrgentSteps({ profile, completed, onToggle }: Props) {
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useChecklist(profile);

  const steps = data?.slice(0, URGENT_COUNT) ?? [];
  const doneCount = steps.filter((step) => completed.includes(step.slug)).length;
  const moreCount = (data?.length ?? 0) - steps.length;

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
          {steps.length > 0 && <StepProgress done={doneCount} total={steps.length} />}
        </div>

        <div className="mt-8">
          <StepList
            steps={steps}
            isPending={isPending}
            isError={isError}
            onRetry={() => void refetch()}
            completed={completed}
            onToggle={onToggle}
            placeholderCount={URGENT_COUNT}
          />
        </div>

        {moreCount > 0 && (
          <Link
            to="/checklist"
            className="mt-6 inline-block rounded-lg bg-teal px-5 py-2.5 font-semibold text-white hover:bg-teal-dark"
          >
            {t("steps.seeAll", { count: data!.length })}
          </Link>
        )}
      </div>
    </section>
  );
}
