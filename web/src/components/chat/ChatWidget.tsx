import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { ChatError, streamChat, type ChatMessage } from "../../api/chat";
import { readStoredProfile } from "../../lib/checklist-state";

const URL_PATTERN = /(https?:\/\/[^\s)]+)/g;

// Turns bare URLs in an answer into links; everything else stays plain text.
function Linkified({ text }: { text: string }) {
  return text.split(URL_PATTERN).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-teal underline">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export function ChatWidget() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || pending) return;

    const history: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setDraft("");
    setError(null);
    setPending(true);
    abortRef.current = new AbortController();

    try {
      await streamChat(
        { messages: history, profile: readStoredProfile(), language: i18n.language },
        (text) =>
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, content: last.content + text }];
          }),
        abortRef.current.signal,
      );
    } catch (err) {
      if (abortRef.current.signal.aborted) return;
      const code = err instanceof ChatError ? err.code : "unavailable";
      setError(t(`chat.errors.${code}`));
      // Drop the unanswered question and empty reply so the conversation stays consistent; keep the text to retry.
      setMessages(messages);
      setDraft(trimmed);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(draft);
  }

  const suggestions = t("chat.suggestions", { returnObjects: true }) as string[];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-20 rounded-full bg-ink px-5 py-3 font-semibold text-white shadow-lg hover:bg-ink-raised sm:right-6 sm:bottom-6"
      >
        {t("chat.open")}
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-labelledby="chat-title"
      className="fixed inset-x-2 bottom-2 z-20 flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[26rem]"
    >
      <header className="flex items-start justify-between gap-3 bg-ink px-4 py-3 text-white">
        <div>
          <h2 id="chat-title" className="font-display text-lg font-bold">
            {t("chat.title")}
          </h2>
          <p className="text-xs text-white/75">{t("chat.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("chat.close")}
          className="rounded-md px-2 text-xl leading-none hover:bg-white/10"
        >
          ×
        </button>
      </header>

      <div ref={logRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div>
            <p className="text-sm text-muted">{t("chat.intro")}</p>
            <ul className="mt-3 space-y-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => void ask(s)}
                    className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-left text-sm hover:border-teal"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user" ? "ml-auto bg-teal text-white" : "bg-paper text-ink"
            }`}
          >
            {m.role === "assistant" && m.content === "" ? (
              <span className="text-muted">{t("chat.thinking")}</span>
            ) : m.role === "assistant" ? (
              <Linkified text={m.content} />
            ) : (
              m.content
            )}
          </div>
        ))}
        {error && (
          <p role="alert" className="rounded-lg bg-amber/20 px-3 py-2 text-sm">
            {error}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-line p-3">
        <label htmlFor="chat-input" className="sr-only">
          {t("chat.label")}
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="chat-input"
            ref={inputRef}
            rows={2}
            maxLength={2000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void ask(draft);
              }
            }}
            placeholder={t("chat.placeholder")}
            className="min-h-10 flex-1 resize-none rounded-lg border border-line px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending || !draft.trim()}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-50"
          >
            {t("chat.send")}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">{t("chat.disclaimer")}</p>
      </form>
    </section>
  );
}
