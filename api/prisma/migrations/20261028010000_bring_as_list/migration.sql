-- Turn "bring" into a list so cards can show one document per bullet. Existing text becomes a one-item list.
ALTER TABLE "checklist_items"
  ALTER COLUMN "bring" TYPE TEXT[] USING CASE WHEN "bring" IS NULL THEN ARRAY[]::TEXT[] ELSE ARRAY["bring"] END,
  ALTER COLUMN "bring" SET DEFAULT ARRAY[]::TEXT[];
