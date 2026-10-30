import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { CITIES, RENTAL_SITES } from "../../lib/content";
import { SmartLink } from "../SmartLink";

const cardClass = "block h-full rounded-xl border border-ink-line bg-ink-raised p-5";
const linkCardClass = `${cardClass} transition-colors hover:border-mint-strong`;

export function Housing() {
  const { t } = useTranslation();
  const scamItems = t("housing.scam.items", { returnObjects: true }) as string[];

  return (
    <section id="housing" className="scroll-mt-4 bg-ink text-white" aria-labelledby="housing-title">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <h2 id="housing-title" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("housing.heading")}
        </h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-white/80">{t("housing.lead")}</p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <ul className="grid gap-4 sm:grid-cols-2">
            <li>
              <Link to="/housing/renting" className={linkCardClass}>
                <CardText title={t("housing.renting.title")} body={t("housing.renting.body")} />
              </Link>
            </li>
            <li>
              <Link to="/housing/tenant-rights" className={linkCardClass}>
                <CardText title={t("housing.rights.title")} body={t("housing.rights.body")} />
              </Link>
            </li>
            <li className={cardClass}>
              <h3 className="font-display text-lg font-bold">{t("housing.rents.title")}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <li key={city.slug}>
                    <Link
                      // One page compares all three cities side by side.
                      to="/housing/rents"
                      className="block rounded-full border border-ink-line bg-ink px-3 py-1 text-sm font-semibold hover:border-mint-strong"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{t("housing.rents.body")}</p>
            </li>
            <li>
              <Link to="/housing/campus" className={linkCardClass}>
                <CardText title={t("housing.campus.title")} body={t("housing.campus.body")} />
              </Link>
            </li>
          </ul>

          <aside className="rounded-xl bg-amber p-6 text-ink" aria-labelledby="scam-title">
            <h3 id="scam-title" className="font-display text-xl font-bold">
              {t("housing.scam.title")}
            </h3>
            <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed">
              {scamItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-5 font-semibold">{t("housing.scam.footer")}</p>
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <p className="font-semibold">{t("housing.whereToLook")}</p>
          <ul className="flex flex-wrap gap-3">
            {RENTAL_SITES.map((site) => (
              <li key={site.name}>
                <SmartLink
                  to={site.url}
                  className="block rounded-lg border-2 border-mint-strong px-4 py-2 text-sm font-semibold text-mint-strong hover:bg-mint-strong hover:text-ink"
                >
                  {site.name}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CardText({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/75">{body}</p>
    </>
  );
}
