import { useTranslation } from "react-i18next";
import { PROFILE_TYPES, useChecklist } from "../api/checklist";
import { StepList, StepProgress } from "../components/checklist/StepList";
import { useCompletedSteps, useProfile } from "../lib/checklist-state";

export function ChecklistPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useProfile();
  const [completed, toggle] = useCompletedSteps();
  const { data, isPending, isError, refetch } = useChecklist(profile);

  const steps = data ?? [];
  const doneCount = steps.filter((step) => completed.includes(step.slug)).length;

  return (
    <section className="bg-white" aria-labelledby="checklist-title">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 id="checklist-title" className="font-display text-4xl font-extrabold tracking-tight">
              {t("checklist.heading")}
            </h1>
            <p className="mt-2 max-w-2xl text-muted">{t("checklist.lead")}</p>
          </div>
          {steps.length > 0 && <StepProgress done={doneCount} total={steps.length} />}
        </div>

        <fieldset className="mt-8">
          <legend className="text-sm font-semibold">{t("profile.heading")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROFILE_TYPES.map((type) => (
              <label
                key={type}
                className="cursor-pointer rounded-full border-2 border-line px-4 py-1.5 text-sm font-semibold hover:border-teal/60 has-checked:border-teal has-checked:bg-mint has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-teal"
              >
                <input
                  type="radio"
                  name="checklist-profile"
                  value={type}
                  checked={profile === type}
                  onChange={() => setProfile(type)}
                  className="sr-only"
                />
                {t(`profile.${type}.label`)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-8">
          <StepList
            steps={steps}
            isPending={isPending}
            isError={isError}
            onRetry={() => void refetch()}
            completed={completed}
            onToggle={toggle}
            placeholderCount={6}
          />
        </div>
      </div>
    </section>
  );
}
