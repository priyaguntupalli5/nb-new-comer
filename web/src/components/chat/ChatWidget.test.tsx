import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "../../i18n";
import { ChatWidget } from "./ChatWidget";

function ndjsonResponse(events: object[]) {
  const body = events.map((e) => `${JSON.stringify(e)}\n`).join("");
  return new Response(body, { headers: { "Content-Type": "application/x-ndjson" } });
}

describe("ChatWidget", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends the question with the saved profile and shows the streamed answer", async () => {
    localStorage.setItem("nbg.profile", JSON.stringify("INTERNATIONAL_STUDENT"));
    const fetchMock = vi.fn(async () =>
      ndjsonResponse([
        { type: "text", text: "Bring your study permit" },
        { type: "text", text: " and your passport." },
        { type: "done" },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Ask a question" }));
    fireEvent.change(screen.getByLabelText("Your question"), { target: { value: "What do I bring for my SIN?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Bring your study permit and your passport.")).toBeInTheDocument();
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({
      profile: "INTERNATIONAL_STUDENT",
      messages: [{ role: "user", content: "What do I bring for my SIN?" }],
    });
  });

  it("sends at most the 20 most recent messages, starting with a question", async () => {
    let answerNo = 0;
    const fetchMock = vi.fn(async () => ndjsonResponse([{ type: "text", text: `Answer ${++answerNo}` }, { type: "done" }]));
    vi.stubGlobal("fetch", fetchMock);

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Ask a question" }));
    for (let i = 1; i <= 11; i++) {
      fireEvent.change(screen.getByLabelText("Your question"), { target: { value: `Question ${i}` } });
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
      await screen.findByText(`Answer ${i}`);
    }

    const [, init] = fetchMock.mock.calls[10] as unknown as [string, RequestInit];
    const sent = JSON.parse(init.body as string).messages as { role: string; content: string }[];
    expect(sent.length).toBeLessThanOrEqual(20);
    expect(sent[0].role).toBe("user");
    expect(sent.at(-1)).toEqual({ role: "user", content: "Question 11" });
  });

  it("explains when the assistant is not set up and keeps the question to retry", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Ask a question" }));
    fireEvent.change(screen.getByLabelText("Your question"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("not available yet");
    expect(screen.getByLabelText("Your question")).toHaveValue("Hello");
  });
});
