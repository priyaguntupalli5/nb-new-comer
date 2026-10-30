import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { CONTENT_DIR, SECTIONS, sourceHash } from "../modules/content/content.service.js";

// Lists every English guide with the state of its French version, and the fingerprint a fresh translation
// must record as `translatedFrom`. Run with: npm -w api run content:status
async function readOrNull(file: string) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

let needsWork = 0;
for (const section of SECTIONS) {
  const files = (await readdir(path.join(CONTENT_DIR, section))).filter((f) => /^[a-z0-9-]+\.md$/.test(f)).sort();
  for (const file of files) {
    const slug = file.slice(0, -3);
    const hash = sourceHash(await readFile(path.join(CONTENT_DIR, section, file), "utf8"));
    const french = await readOrNull(path.join(CONTENT_DIR, section, `${slug}.fr.md`));
    const status =
      french === null ? "missing" : matter(french).data.translatedFrom === hash ? "current" : "out of date";
    if (status !== "current") needsWork++;
    console.log(`${`${section}/${slug}`.padEnd(32)} ${status.padEnd(12)} ${hash}`);
  }
}
console.log(needsWork === 0 ? "\nAll French guides are current." : `\n${needsWork} guide(s) need a French update.`);
