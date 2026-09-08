-- CreateTable
CREATE TABLE "Lexique" (
    "id" TEXT NOT NULL,
    "terme" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "motImage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT,

    CONSTRAINT "Lexique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lexique_createdAt_idx" ON "Lexique"("createdAt");

-- CreateIndex
CREATE INDEX "Lexique_workspaceId_idx" ON "Lexique"("workspaceId");

-- AddForeignKey
ALTER TABLE "Lexique" ADD CONSTRAINT "Lexique_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
