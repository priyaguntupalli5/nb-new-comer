import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export function ComingSoonPage() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">{t("comingSoon.title")}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{t("comingSoon.body")}</p>
      <Link to="/" className="mt-8 inline-block rounded-lg bg-teal px-6 py-3 font-semibold text-white hover:bg-teal-dark">
        {t("comingSoon.back")}
      </Link>
    </section>
  );
}
