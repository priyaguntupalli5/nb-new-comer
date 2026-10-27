import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../i18n";
import type { ChecklistItem } from "../api/checklist";
import { HomePage } from "./HomePage";

const item = (slug: string, title: string): ChecklistItem => ({
  id: slug,
  slug,
  title,
  detail: `${title} detail`,
  bring: "Passport",
  where: "Online",
  officialSourceUrl: `https://example.gc.ca/${slug}`,
  lastCheckedAt: "2026-10-27T00:00:00.000Z",
});

const byProfile: Record<string, ChecklistItem[]> = {
  INTERNATIONAL_STUDENT: [
    item("sin", "Get your SIN"),
    item("student-health", "Check your health coverage"),
    item("bank", "Open a bank account"),
    item("licence", "Get a licence"),
  ],
  FAMILY: [item("sin", "Get your SIN"), item("medicare", "Apply for Medicare"), item("ccb", "Apply for the CCB")],
};

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const profile = new URL(url, "http://localhost").searchParams.get("profile")!;
        return new Response(JSON.stringify({ profile, items: byProfile[profile] ?? [] }));
      }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("shows only the first three steps for the selected profile", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Get your SIN" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open a bank account" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Get a licence" })).not.toBeInTheDocument();
    expect(screen.getByText("0 of 3 done")).toBeInTheDocument();
  });

  it("tracks progress and remembers it", async () => {
    renderPage();
    const [first] = await screen.findAllByRole("button", { name: "Mark as done" });
    fireEvent.click(first);
    expect(screen.getByText("1 of 3 done")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("nbg.completed")!)).toEqual(["sin"]);
  });

  it("switches steps when a different profile is picked", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Get your SIN" });
    fireEvent.click(screen.getByRole("radio", { name: /Family moving together/ }));
    expect(await screen.findByRole("heading", { name: "Apply for Medicare" })).toBeInTheDocument();
    expect(localStorage.getItem("nbg.profile")).toBe('"FAMILY"');
  });

  it("offers a retry when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    renderPage();
    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
