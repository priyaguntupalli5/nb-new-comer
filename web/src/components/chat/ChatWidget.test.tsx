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
