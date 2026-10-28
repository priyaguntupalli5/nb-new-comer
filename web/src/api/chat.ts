import type { ProfileType } from "./checklist";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatErrorCode = "busy" | "refused" | "unavailable" | "not-configured";

export class ChatError extends Error {
  code: ChatErrorCode;

  constructor(code: ChatErrorCode) {
    super(code);
    this.code = code;
  }
}

const API_URL = import.meta.env.VITE_API_URL ?? "";

// Sends the conversation and calls onText with each chunk of the answer as it streams in.
export async function streamChat(
  body: { messages: ChatMessage[]; profile?: ProfileType; language: string },
  onText: (text: string) => void,
  signal?: AbortSignal,
) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (res.status === 503) throw new ChatError("not-configured");
  if (res.status === 429) throw new ChatError("busy");
  if (!res.ok || !res.body) throw new ChatError("unavailable");

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffered = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffered += value;
    const lines = buffered.split("\n");
    buffered = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as { type: "text"; text: string } | { type: "done" } | { type: "error"; error: ChatErrorCode };
      if (event.type === "text") onText(event.text);
      else if (event.type === "error") throw new ChatError(event.error);
      else return;
    }
  }
  throw new ChatError("unavailable");
}
