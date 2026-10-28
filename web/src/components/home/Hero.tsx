import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { PROFILE_TYPES, type ProfileType } from "../../api/checklist";

type Props = {
  profile: ProfileType;
  onProfileChange: (profile: ProfileType) => void;
};

export function Hero({ profile, onProfileChange }: Props) {
  const { t } = useTranslation();

  return (
    <section className="bg-paper" aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:pt-14 lg:pb-20">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-teal uppercase">{t("hero.eyebrow")}</p>
          <h1
            id="hero-title"
            className="mt-4 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]"
          >
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t("hero.lead")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              to="/checklist"
              className="rounded-lg bg-teal px-6 py-3 font-semibold text-white shadow-sm hover:bg-teal-dark"
            >
              {t("hero.cta")}
            </Link>
            <a href="#housing" className="rounded font-semibold underline underline-offset-4 hover:text-teal">
              {t("hero.housingLink")}
            </a>
          </div>
        </div>

        <fieldset className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
          <legend className="contents">
            <span className="block font-display text-xl font-bold">{t("profile.heading")}</span>
          </legend>
          <p className="mt-1 text-sm text-muted">{t("profile.hint")}</p>
          <div className="mt-4 space-y-2.5">
            {PROFILE_TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-line px-4 py-3 transition-colors hover:border-teal/60 has-checked:border-teal has-checked:bg-mint has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-teal"
              >
                <input
                  type="radio"
                  name="profile"
                  value={type}
                  checked={profile === type}
                  onChange={() => onProfileChange(type)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-muted peer-checked:border-teal peer-checked:[&>span]:block"
                >
                  <span className="hidden size-2.5 rounded-full bg-teal" />
                </span>
                <span>
                  <span className="block font-semibold">{t(`profile.${type}.label`)}</span>
                  <span className="block text-sm text-muted">{t(`profile.${type}.sub`)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  );
}
