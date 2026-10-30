-- Community resource suggestions: a short name, the city, an optional link, and when a moderator reviewed it.
-- The tips table has no rows yet, so the new required columns need no default.
ALTER TABLE "tips"
  ADD COLUMN "title" TEXT NOT NULL,
  ADD COLUMN "city" TEXT NOT NULL,
  ADD COLUMN "link" TEXT,
  ADD COLUMN "reviewed_at" TIMESTAMP(3);
