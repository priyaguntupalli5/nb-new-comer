import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { submitTip, TIP_CATEGORIES, TIP_CITIES, TipRequestError, useApprovedTips, type TipSubmission } from "../api/tips";

const emptyForm: TipSubmission = { category: "food", title: "", city: "moncton", link: "", body: "", website: "" };
const fieldClass = "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2";

export function SuggestPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "invalid" | "busy" | "error">("idle");
  const approved = useApprovedTips();

  const set = <K extends keyof TipSubmission>(key: K, value: TipSubmission[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    try {
      await submitTip(form);
      setForm(emptyForm);
      setStatus("sent");
    } catch (err) {
      const code = err instanceof TipRequestError ? err.status : 0;
      setStatus(code === 400 ? "invalid" : code === 429 ? "busy" : "error");
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-14">
      <a href="/#community" className="text-sm font-semibold text-teal underline underline-offset-4">
        ← {t("article.back.community")}
      </a>
      <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight">{t("suggest.title")}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{t("suggest.lead")}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            {t("suggest.category")}
            <select value={form.category} onChange={(e) => set("category", e.target.value as TipSubmission["category"])} className={fieldClass}>
              {TIP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`suggest.categories.${c}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            {t("suggest.city")}
            <select value={form.city} onChange={(e) => set("city", e.target.value as TipSubmission["city"])} className={fieldClass}>
              {TIP_CITIES.map((c) => (
                <option key={c} value={c}>
                  {t(`suggest.cities.${c}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-semibold">
          {t("suggest.name")}
          <input required minLength={2} maxLength={120} value={form.title} onChange={(e) => set("title", e.target.value)} className={fieldClass} />
        </label>
        <label className="block text-sm font-semibold">
          {t("suggest.link")}
          <input type="url" maxLength={300} placeholder="https://" value={form.link} onChange={(e) => set("link", e.target.value)} className={fieldClass} />
        </label>
        <label className="block text-sm font-semibold">
          {t("suggest.body")}
          <textarea
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder={t("suggest.bodyHint")}
            className={fieldClass}
          />
        </label>
        {/* Honeypot: hidden from people and screen readers, so only bots fill it in. */}
        <div aria-hidden="true" className="hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
          </label>
        </div>

        <p className="text-sm text-muted">{t("suggest.privacy")}</p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-lg bg-teal px-6 py-3 font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
        >
          {t("suggest.submit")}
        </button>
        {status !== "idle" && status !== "sending" && (
          <p role="status" className={`rounded-lg px-3 py-2 text-sm ${status === "sent" ? "bg-mint" : "bg-amber/20"}`}>
            {t(`suggest.status.${status}`)}
          </p>
        )}
      </form>

      <h2 className="mt-12 font-display text-2xl font-extrabold tracking-tight">{t("suggest.approvedTitle")}</h2>
      <p className="mt-1 text-sm text-muted">{t("suggest.approvedLead")}</p>
      {approved.data && approved.data.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {approved.data.map((tip) => (
            <li key={tip.id} className="rounded-xl border border-line bg-white p-4">
              <p className="font-semibold">
                {tip.link ? (
                  <a href={tip.link} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-teal underline underline-offset-4">
                    {tip.title}
                  </a>
                ) : (
                  tip.title
                )}
              </p>
              <p className="text-xs text-muted">
                {t(`suggest.categories.${tip.category}`)} · {t(`suggest.cities.${tip.city}`)}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{tip.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">{approved.isPending ? t("suggest.loading") : t("suggest.noneYet")}</p>
      )}
    </section>
  );
}
