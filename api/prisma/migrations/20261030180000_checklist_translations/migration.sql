-- CreateTable
CREATE TABLE "checklist_item_translations" (
    "checklist_item_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "bring" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "where" TEXT,
    "cost" TEXT,
    "timeline" TEXT,
    "key_facts" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "checklist_item_translations_pkey" PRIMARY KEY ("checklist_item_id","locale")
);

-- AddForeignKey
ALTER TABLE "checklist_item_translations" ADD CONSTRAINT "checklist_item_translations_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "checklist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
