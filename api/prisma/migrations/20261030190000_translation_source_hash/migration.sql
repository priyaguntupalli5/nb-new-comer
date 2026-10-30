-- Existing translations get an empty fingerprint, so they count as outdated until the seed records the real one.
ALTER TABLE "checklist_item_translations" ADD COLUMN "source_hash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "checklist_item_translations" ALTER COLUMN "source_hash" DROP DEFAULT;
