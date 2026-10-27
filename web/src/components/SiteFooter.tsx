import { useTranslation } from "react-i18next";
import { CONTENT_CHECKED_AT, formatDate } from "../lib/content";

export function SiteFooter() {
  const { t, i18n } = useTranslation();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl space-y-1.5 px-4 py-8 sm:px-6">
        <p className="text-sm">{t("footer.disclaimer", { date: formatDate(CONTENT_CHECKED_AT, i18n.language) })}</p>
        <p className="text-xs text-muted">{t("footer.independent")}</p>
      </div>
    </footer>
  );
}
