-- AlterTable
ALTER TABLE "checklist_items" ADD COLUMN     "cost" TEXT,
ADD COLUMN     "key_facts" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "timeline" TEXT;
