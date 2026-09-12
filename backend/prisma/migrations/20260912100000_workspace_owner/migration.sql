-- Espace personnel : propriétaire d'un espace (null = espace collectif comme Ulti Coach ou BASE)
ALTER TABLE "Workspace" ADD COLUMN "ownerId" TEXT;

CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
