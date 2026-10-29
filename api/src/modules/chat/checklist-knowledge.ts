import { ProfileType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export const PROFILE_LABELS: Record<ProfileType, string> = {
  INTERNATIONAL_STUDENT: "International student",
  PERMANENT_RESIDENT: "Permanent resident",
  WORK_PERMIT_HOLDER: "Work permit holder",
  FAMILY: "Family moving together",
};

// Renders every seeded checklist item as plain text for the assistant's system prompt.
// Output is deterministic (fixed ordering), so the prompt prefix stays cacheable between requests.
export async function buildChecklistKnowledge(): Promise<string> {
  const items = await prisma.checklistItem.findMany({
    include: { profiles: { select: { profileType: true } } },
    orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
  });

  return items
    .map((item) => {
      const profiles = item.profiles
        .map((p) => PROFILE_LABELS[p.profileType])
        .sort()
        .join(", ");
      const lines = [`## ${item.title}`, `For: ${profiles}`, `Summary: ${item.detail}`];
      if (item.bring.length > 0) lines.push("Bring:", ...item.bring.map((doc) => `- ${doc}`));
      if (item.where) lines.push(`Where: ${item.where}`);
      if (item.cost) lines.push(`Cost: ${item.cost}`);
      if (item.timeline) lines.push(`Processing time: ${item.timeline}`);
      if (item.keyFacts.length > 0) lines.push("What to know:", ...item.keyFacts.map((fact) => `- ${fact}`));
      lines.push(
        `Official source: ${item.officialSourceUrl} (last checked ${item.lastCheckedAt.toISOString().slice(0, 10)})`,
      );
      return lines.join("\n");
    })
    .join("\n\n");
}
