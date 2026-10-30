import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, useParams } from "react-router";
import { NotFoundError, useArticle } from "../api/content";
import { formatDate } from "../lib/content";
import { ComingSoonPage } from "./ComingSoonPage";

// Typography for the rendered Markdown, kept here so articles need no styling of their own.
const proseClass =
  "mt-8 text-[1.05rem] leading-relaxed text-ink " +
  "[&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-tight " +
  "[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ol]:mt-3 [&_ol]:list-decimal " +
  "[&_ol]:space-y-1.5 [&_ol]:pl-6 [&_li]:marker:text-teal [&_strong]:font-semibold " +
  "[&_a]:text-teal [&_a]:underline [&_a]:underline-offset-4 " +
  "[&_table]:w-full [&_table]:min-w-[44rem] [&_table]:border-collapse [&_table]:text-sm " +
  "[&_th]:border-b-2 [&_th]:border-line [&_th]:bg-paper [&_th]:p-3 [&_th]:text-left [&_th]:align-bottom [&_th]:font-semibold " +
  "[&_td]:border-b [&_td]:border-line [&_td]:p-3 [&_td]:align-top";

type Section = "essentials" | "housing";

export function ArticlePage({ section }: { section: Section }) {
  const { slug = "" } = useParams();
  const { t, i18n } = useTranslation();
  const { data: article, isPending, error, refetch } = useArticle(section, slug);

  // Essentials we have not written yet keep showing the "on its way" page.
  if (error instanceof NotFoundError) return <ComingSoonPage />;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-14" aria-busy={isPending}>
      {/* A plain link so the browser scrolls to the section; a router Link ignores the #hash. */}
      <a href={`/#${section}`} className="text-sm font-semibold text-teal underline underline-offset-4">
        ← {t(`article.back.${section}`)}
      </a>

      {isPending ? (
        <div className="mt-8 space-y-4" aria-label={t("article.loading")}>
          <div className="h-10 w-2/3 animate-pulse rounded bg-line" />
          <div className="h-5 w-full animate-pulse rounded bg-line" />
          <div className="h-5 w-5/6 animate-pulse rounded bg-line" />
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border-2 border-line bg-white p-6">
          <p>{t("article.error")}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-lg border-2 border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-white"
          >
            {t("steps.retry")}
          </button>
        </div>
      ) : (
        <>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{article.summary}</p>

          <div className={proseClass}>
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Wide comparison tables scroll sideways in their own box on phones instead of widening the page.
                table: ({ children }) => (
                  <div
                    className="mt-4 overflow-x-auto rounded-xl border border-line bg-white"
                    role="region"
                    aria-label={t("article.table")}
                    tabIndex={0}
                  >
                    <table>{children}</table>
                  </div>
                ),
                // Links inside the guide stay in the app; everything else is an official source in a new tab.
                a: ({ href = "", children }) =>
                  // Links to a section of the home page (/#housing) need a plain link so the browser scrolls.
                  href.startsWith("/#") ? (
                    <a href={href}>{children}</a>
                  ) : href.startsWith("/") ? (
                    <Link to={href}>{children}</Link>
                  ) : (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                      <span className="sr-only"> {t("housing.newTab")}</span>
                    </a>
                  ),
              }}
            >
              {article.body}
            </Markdown>
          </div>

          <aside className="mt-12 rounded-2xl border border-line bg-white p-6" aria-labelledby="sources-title">
            <h2 id="sources-title" className="font-display text-xl font-bold">
              {t("article.sources")}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal underline underline-offset-4 hover:text-teal-dark"
                  >
                    {source.title}
                    <span className="sr-only"> {t("housing.newTab")}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              {t("article.lastChecked", { date: formatDate(article.lastChecked, i18n.language) })}
            </p>
          </aside>
        </>
      )}
    </article>
  );
}
