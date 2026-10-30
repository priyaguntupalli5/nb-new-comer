import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { checklistFingerprint } from "../lib/fingerprint.js";
import { prisma } from "../lib/prisma.js";
import { CONTENT_DIR, SECTIONS, sourceHash } from "../modules/content/content.service.js";

// Lists every English guide and checklist step with the state of its French version, and the fingerprint
// a fresh translation must record. Run with: npm -w api run content:status
async function readOrNull(file: string) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

let needsWork = 0;
function report(name: string, hash: string, translatedFrom: string | undefined) {
  const status = translatedFrom === undefined ? "missing" : translatedFrom === hash ? "current" : "out of date";
  if (status !== "current") needsWork++;
  console.log(`${name.padEnd(44)} ${status.padEnd(12)} ${hash}`);
}

console.log("Guides");
for (const section of SECTIONS) {
  const files = (await readdir(path.join(CONTENT_DIR, section))).filter((f) => /^[a-z0-9-]+\.md$/.test(f)).sort();
  for (const file of files) {
    const slug = file.slice(0, -3);
    const hash = sourceHash(await readFile(path.join(CONTENT_DIR, section, file), "utf8"));
    const french = await readOrNull(path.join(CONTENT_DIR, section, `${slug}.fr.md`));
    report(`  ${section}/${slug}`, hash, french === null ? undefined : String(matter(french).data.translatedFrom));
  }
}

console.log("\nChecklist steps");
const items = await prisma.checklistItem.findMany({
  orderBy: { sortOrder: "asc" },
  include: { translations: { where: { locale: "fr" } } },
});
for (const { translations, ...item } of items) {
  report(`  ${item.slug}`, checklistFingerprint(item), translations[0]?.sourceHash);
}
await prisma.$disconnect();

console.log(needsWork === 0 ? "\nAll French content is current." : `\n${needsWork} item(s) need a French update.`);
