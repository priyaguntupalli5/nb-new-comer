import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { decideTip, fetchPendingTips, TipRequestError, type Tip } from "../api/tips";

const TOKEN_KEY = "nbg.adminToken";

function signOut() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing stored.
  }
}

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

// Moderation queue for community suggestions. Not linked from the site; protected by the API's admin token.
// The token lives in sessionStorage, so it is forgotten when the tab closes.
export function AdminSuggestionsPage() {
  const { t } = useTranslation();
  const [token, setToken] = useState(readToken);
  const [draft, setDraft] = useState("");
  const [tips, setTips] = useState<Tip[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load the queue whenever we have a token (after signing in, or on return within the same tab).
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchPendingTips(token)
      .then((pending) => {
        if (!cancelled) setTips(pending);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const code = err instanceof TipRequestError ? err.status : 0;
        setError(t(code === 401 ? "admin.badToken" : code === 503 ? "admin.notSetUp" : "admin.error"));
        if (code === 401) {
          signOut();
          setToken("");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  function signIn(event: FormEvent) {
    event.preventDefault();
    try {
      sessionStorage.setItem(TOKEN_KEY, draft);
    } catch {
      // Storage blocked: keep the token in memory for this visit only.
    }
    setError(null);
    setToken(draft);
    setDraft("");
  }

  function leave() {
    signOut();
    setToken("");
    setTips(null);
  }

  async function decide(id: string, decision: "approve" | "reject") {
    try {
      await decideTip(token, id, decision);
      setTips((current) => current?.filter((tip) => tip.id !== id) ?? null);
    } catch {
      setError(t("admin.error"));
    }
  }

  if (!token) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold">{t("admin.title")}</h1>
        <form onSubmit={signIn} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">
            {t("admin.token")}
            <input
              type="password"
              required
              autoComplete="off"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2"
            />
          </label>
          <button type="submit" className="rounded-lg bg-ink px-5 py-2 font-semibold text-white">
            {t("admin.signIn")}
          </button>
          {error && <p role="alert" className="text-sm">{error}</p>}
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold">{t("admin.title")}</h1>
        <button type="button" onClick={leave} className="text-sm font-semibold underline">
          {t("admin.signOut")}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-amber/20 px-3 py-2 text-sm">
          {error}
        </p>
      )}
      {tips && tips.length === 0 && <p className="mt-6 text-muted">{t("admin.empty")}</p>}
      <ul className="mt-6 space-y-4">
        {tips?.map((tip) => (
          <li key={tip.id} className="rounded-xl border border-line bg-white p-5">
            <p className="font-semibold">{tip.title}</p>
            <p className="text-xs text-muted">
              {t(`suggest.categories.${tip.category}`)} · {t(`suggest.cities.${tip.city}`)} ·{" "}
              {new Date(tip.createdAt).toLocaleDateString()}
            </p>
            {tip.link && <p className="mt-1 break-all text-sm">{tip.link}</p>}
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{tip.body}</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => void decide(tip.id, "approve")}
                className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white"
              >
                {t("admin.approve")}
              </button>
              <button
                type="button"
                onClick={() => void decide(tip.id, "reject")}
                className="rounded-lg border-2 border-ink px-4 py-2 text-sm font-semibold"
              >
                {t("admin.reject")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
