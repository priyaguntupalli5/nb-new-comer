import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { OFFICIAL_LINKS } from "../../lib/content";
import { SmartLink } from "../SmartLink";

const cards = [
  { key: "orgs", to: OFFICIAL_LINKS.newcomerOrgs },
  { key: "food", to: "/community/food" },
  { key: "faith", to: "/community/faith" },
];

export function Community() {
  const { t } = useTranslation();

  return (
    <section id="community" className="scroll-mt-4 bg-paper" aria-labelledby="community-title">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <h2 id="community-title" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("community.heading")}
        </h2>
        <p className="mt-2 text-muted">{t("community.lead")}</p>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <li key={card.key}>
              <SmartLink
                to={card.to}
                className="block h-full rounded-2xl border border-line bg-white p-5 transition-colors hover:border-teal sm:p-6"
              >
                <h3 className="font-display text-lg font-bold">{t(`community.${card.key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(`community.${card.key}.body`)}</p>
              </SmartLink>
            </li>
          ))}
        </ul>
        <Link
          to="/community/suggest"
          className="mt-8 inline-block rounded-lg border-2 border-ink px-5 py-2.5 font-semibold hover:bg-ink hover:text-white"
        >
          {t("community.suggest")}
        </Link>
      </div>
    </section>
  );
}
