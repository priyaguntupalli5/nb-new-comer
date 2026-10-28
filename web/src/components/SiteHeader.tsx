import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { LogoMark } from "./Icon";

export function SiteHeader() {
  const { t, i18n } = useTranslation();
  const otherLanguage = i18n.language === "fr" ? "en" : "fr";

  const links = [
    { href: "/checklist", label: t("nav.checklist") },
    { href: "/#essentials", label: t("nav.essentials") },
    { href: "/#housing", label: t("nav.housing") },
    { href: "/#community", label: t("nav.community") },
  ];

  return (
    <header className="bg-paper">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 rounded-md font-display text-lg font-bold">
          <LogoMark />
          {t("brand")}
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <nav aria-label={t("nav.label")}>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
              {links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("/#") ? (
                    <a href={link.href} className="rounded hover:text-teal hover:underline">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="rounded hover:text-teal hover:underline">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            lang={otherLanguage}
            onClick={() => void i18n.changeLanguage(otherLanguage)}
            className="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-semibold hover:bg-ink hover:text-white"
          >
            {t("nav.switchLanguage")}
          </button>
        </div>
      </div>
    </header>
  );
}
