/*
  Warnings:

  - You are about to drop the column `theme` on the `Entrainement` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_EntrainementTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EntrainementTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Entrainement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EntrainementTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Entrainement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "date" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "echauffementId" TEXT,
    "situationMatchId" TEXT,
    CONSTRAINT "Entrainement_echauffementId_fkey" FOREIGN KEY ("echauffementId") REFERENCES "Echauffement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entrainement_situationMatchId_fkey" FOREIGN KEY ("situationMatchId") REFERENCES "SituationMatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Entrainement" ("createdAt", "date", "echauffementId", "id", "situationMatchId", "titre") SELECT "createdAt", "date", "echauffementId", "id", "situationMatchId", "titre" FROM "Entrainement";
DROP TABLE "Entrainement";
ALTER TABLE "new_Entrainement" RENAME TO "Entrainement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_EntrainementTags_AB_unique" ON "_EntrainementTags"("A", "B");

-- CreateIndex
CREATE INDEX "_EntrainementTags_B_index" ON "_EntrainementTags"("B");
