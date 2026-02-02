-- Drop old global unique constraint on (label, category)
-- Prisma default name is: "Tag_label_category_key"
DROP INDEX IF EXISTS "Tag_label_category_key";

-- Create new unique constraint scoped by workspace
-- Prisma default name for @@unique([workspaceId, label, category]) is:
-- "Tag_workspaceId_label_category_key"
CREATE UNIQUE INDEX IF NOT EXISTS "Tag_workspaceId_label_category_key"
ON "Tag" ("workspaceId", "label", "category");
