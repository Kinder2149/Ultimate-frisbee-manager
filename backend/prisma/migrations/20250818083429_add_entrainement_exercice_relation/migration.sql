/*
  Warnings:

  - You are about to drop the `Phase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhaseExercice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrainingTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EntrainementTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `dureeTotal` on the `Entrainement` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PhaseExercice_phaseId_ordre_key";

-- DropIndex
DROP INDEX "TrainingTag_label_category_key";

-- DropIndex
DROP INDEX "_EntrainementTags_B_index";

-- DropIndex
DROP INDEX "_EntrainementTags_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Phase";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PhaseExercice";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TrainingTag";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_EntrainementTags";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "EntrainementExercice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entrainementId" TEXT NOT NULL,
    "exerciceId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "duree" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EntrainementExercice_entrainementId_fkey" FOREIGN KEY ("entrainementId") REFERENCES "Entrainement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntrainementExercice_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Entrainement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "date" DATETIME,
    "theme" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Entrainement" ("createdAt", "date", "id", "theme", "titre") SELECT "createdAt", "date", "id", "theme", "titre" FROM "Entrainement";
DROP TABLE "Entrainement";
ALTER TABLE "new_Entrainement" RENAME TO "Entrainement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EntrainementExercice_entrainementId_exerciceId_key" ON "EntrainementExercice"("entrainementId", "exerciceId");
