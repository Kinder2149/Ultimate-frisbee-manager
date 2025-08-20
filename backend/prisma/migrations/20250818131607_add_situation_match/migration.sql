/*
  Warnings:

  - A unique constraint covering the columns `[echauffementId,ordre]` on the table `BlocEchauffement` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "SituationMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "temps" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_SituationMatchTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SituationMatchTags_A_fkey" FOREIGN KEY ("A") REFERENCES "SituationMatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SituationMatchTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Echauffement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Echauffement" ("createdAt", "description", "id", "nom") SELECT "createdAt", "description", "id", "nom" FROM "Echauffement";
DROP TABLE "Echauffement";
ALTER TABLE "new_Echauffement" RENAME TO "Echauffement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_SituationMatchTags_AB_unique" ON "_SituationMatchTags"("A", "B");

-- CreateIndex
CREATE INDEX "_SituationMatchTags_B_index" ON "_SituationMatchTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "BlocEchauffement_echauffementId_ordre_key" ON "BlocEchauffement"("echauffementId", "ordre");
