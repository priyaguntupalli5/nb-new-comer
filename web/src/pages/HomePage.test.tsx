import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../i18n";
import type { ChecklistItem } from "../api/checklist";
import { ChecklistPage } from "./ChecklistPage";
import { HomePage } from "./HomePage";

const item = (slug: string, title: string): ChecklistItem => ({
  id: slug,
  slug,
  title,
  detail: `${title} detail`,
  bring: ["Passport", "Proof of address"],
  where: "Online",
  cost: slug === "sin" ? "Free" : null,
  timeline: null,
  keyFacts: slug === "sin" ? ["Your SIN starts with 9 if you are a temporary resident."] : [],
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

function renderPage(page = <HomePage />) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{page}</MemoryRouter>
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
    expect(screen.getAllByRole("listitem").filter((li) => li.textContent === "Proof of address")).toHaveLength(3);
  });

  it("shows cost and key facts only for steps that have them", async () => {
    renderPage();
    expect(await screen.findByText("Free")).toBeInTheDocument();
    expect(screen.getAllByText("Cost")).toHaveLength(1);
    expect(screen.getByText("What to know (1)")).toBeInTheDocument();
    expect(screen.getByText("Your SIN starts with 9 if you are a temporary resident.")).toBeInTheDocument();
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

  it("links to the full checklist when there are more than three steps", async () => {
    renderPage();
    expect(await screen.findByRole("link", { name: "See all 4 steps" })).toHaveAttribute("href", "/checklist");
  });

  it("shows every step on the checklist page and shares progress with the home page", async () => {
    localStorage.setItem("nbg.completed", JSON.stringify(["sin"]));
    renderPage(<ChecklistPage />);
    expect(await screen.findByRole("heading", { name: "Get a licence" })).toBeInTheDocument();
    expect(screen.getByText("1 of 4 done")).toBeInTheDocument();
  });

  it("offers a retry when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    renderPage();
    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
