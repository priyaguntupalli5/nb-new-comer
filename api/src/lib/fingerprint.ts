import { createHash } from "node:crypto";

// Short fingerprint of English content. A translation stores the fingerprint of the English it was made from,
// so a later change to the English shows up as a mismatch. Line endings are normalized so Windows and Linux agree.
export function fingerprint(text: string): string {
  return createHash("sha256").update(text.replace(/\r\n/g, "\n")).digest("hex").slice(0, 16);
}

type ChecklistText = {
  title: string;
  detail: string;
  bring: string[];
  where: string | null;
  cost: string | null;
  timeline: string | null;
  keyFacts: string[];
};

// Fingerprint of the translatable fields of a checklist item, as stored in the database.
export function checklistFingerprint(item: ChecklistText): string {
  const { title, detail, bring, where, cost, timeline, keyFacts } = item;
  return fingerprint(JSON.stringify([title, detail, bring, where, cost, timeline, keyFacts]));
}
