/*
  Warnings:

  - You are about to drop the column `elementsTravail` on the `Exercice` table. All the data in the column will be lost.
  - You are about to drop the column `objectif` on the `Exercice` table. All the data in the column will be lost.
  - You are about to drop the column `variables` on the `Exercice` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exercice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "schemaUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Exercice" ("createdAt", "description", "id", "nom", "schemaUrl") SELECT "createdAt", "description", "id", "nom", "schemaUrl" FROM "Exercice";
DROP TABLE "Exercice";
ALTER TABLE "new_Exercice" RENAME TO "Exercice";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
