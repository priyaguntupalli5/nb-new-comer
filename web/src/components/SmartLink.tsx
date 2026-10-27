import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

type Props = { to: string; className?: string; children: ReactNode };

// Official sources open in a new tab; our own pages stay in the app.
export function SmartLink({ to, className, children }: Props) {
  const { t } = useTranslation();

  if (/^https?:\/\//.test(to)) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
        <span className="sr-only"> {t("housing.newTab")}</span>
      </a>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
