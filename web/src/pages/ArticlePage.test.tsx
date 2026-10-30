import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import "../i18n";
import { ArticlePage } from "./ArticlePage";

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/essentials/:slug" element={<ArticlePage section="essentials" />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ArticlePage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the article, keeps guide links in the app and lists official sources", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          slug: "sin-id",
          title: "SIN and ID",
          summary: "What a SIN is.",
          lastChecked: "2026-10-29",
          sources: [{ title: "Protect your SIN", url: "https://www.canada.ca/sin/protection.html" }],
          body:
            "## Who can ask for your SIN\n\n- **Your employer**\n\nSee [your checklist](/checklist).\n\n" +
            "| Bank | Monthly fee |\n|---|---|\n| RBC | $0 for 1 year |\n",
        }),
      ),
    );

    renderAt("/essentials/sin-id");

    expect(await screen.findByRole("heading", { level: 1, name: "SIN and ID" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Who can ask for your SIN" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "your checklist" })).toHaveAttribute("href", "/checklist");
    expect(screen.getByRole("link", { name: /Protect your SIN/ })).toHaveAttribute("target", "_blank");
    expect(screen.getByText(/Last checked: October 29, 2026/)).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Monthly fee" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "$0 for 1 year" })).toBeInTheDocument();
  });

  it("shows the coming-soon page for an essential that is not written yet", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 404 })));
    renderAt("/essentials/banking");
    expect(await screen.findByRole("heading", { name: "This page is on its way" })).toBeInTheDocument();
  });
});
