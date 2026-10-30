import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "../Icon";
import { SmartLink } from "../SmartLink";

const cards: { key: string; icon: IconName; to: string }[] = [
  { key: "sin", icon: "idCard", to: "/essentials/sin-id" },
  { key: "health", icon: "heart", to: "/essentials/health-card" },
  { key: "driving", icon: "car", to: "/essentials/drivers-licence" },
  { key: "banking", icon: "bank", to: "/essentials/banking" },
  { key: "phone", icon: "phone", to: "/essentials/phone-plans" },
  { key: "transit", icon: "bus", to: "/essentials/getting-around" },
  { key: "winter", icon: "snowflake", to: "/essentials/winter" },
];

export function Essentials() {
  const { t } = useTranslation();

  return (
    <section id="essentials" className="scroll-mt-4 bg-paper" aria-labelledby="essentials-title">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <h2 id="essentials-title" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("essentials.heading")}
        </h2>
        <p className="mt-2 text-muted">{t("essentials.lead")}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <li key={card.key} className="flex flex-col rounded-2xl border border-line bg-white p-5">
              <span className="grid size-10 place-items-center rounded-lg bg-mint text-teal">
                <Icon name={card.icon} />
              </span>
              <h3 className="mt-4 font-display text-lg leading-snug font-bold">{t(`essentials.${card.key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`essentials.${card.key}.body`)}</p>
              <SmartLink
                to={card.to}
                className="mt-auto self-start rounded pt-4 text-sm font-medium text-teal underline underline-offset-4 hover:text-teal-dark"
              >
                {t(`essentials.${card.key}.link`)}
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
