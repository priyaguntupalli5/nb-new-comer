import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import "../i18n";
import { SuggestPage } from "./SuggestPage";

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <SuggestPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("SuggestPage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("lists approved suggestions and sends a new one for review", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === "POST"
        ? Response.json({ status: "received" }, { status: 201 })
        : Response.json({
            tips: [
              {
                id: "1",
                category: "food",
                title: "Halal Corner",
                city: "saint-john",
                link: null,
                body: "Halal meat and spices on Main St.",
                createdAt: "2026-10-30T00:00:00Z",
              },
            ],
          }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderPage();
    expect(await screen.findByText("Halal Corner")).toBeInTheDocument();
    expect(screen.getByText("Food or grocery store · Saint John")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "worship" } });
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "fredericton" } });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Hindu Temple" } });
    fireEvent.change(screen.getByLabelText("Details"), { target: { value: "Weekly prayers and festivals" } });
    fireEvent.click(screen.getByRole("button", { name: "Send suggestion" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Our team will review your suggestion");
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === "POST")!;
    expect(JSON.parse(post[1]!.body as string)).toMatchObject({
      category: "worship",
      city: "fredericton",
      title: "Hindu Temple",
      body: "Weekly prayers and festivals",
      website: "",
    });
  });

  it("explains when someone has sent too many suggestions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) =>
        init?.method === "POST" ? new Response("", { status: 429 }) : Response.json({ tips: [] }),
      ),
    );

    renderPage();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Store" } });
    fireEvent.change(screen.getByLabelText("Details"), { target: { value: "A store with food from home" } });
    fireEvent.click(screen.getByRole("button", { name: "Send suggestion" }));

    expect(await screen.findByRole("status")).toHaveTextContent("try again in an hour");
  });
});
