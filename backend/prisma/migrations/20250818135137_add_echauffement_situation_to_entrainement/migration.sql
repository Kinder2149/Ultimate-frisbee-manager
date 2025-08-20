-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Entrainement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "date" DATETIME,
    "theme" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "echauffementId" TEXT,
    "situationMatchId" TEXT,
    CONSTRAINT "Entrainement_echauffementId_fkey" FOREIGN KEY ("echauffementId") REFERENCES "Echauffement" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entrainement_situationMatchId_fkey" FOREIGN KEY ("situationMatchId") REFERENCES "SituationMatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Entrainement" ("createdAt", "date", "id", "theme", "titre") SELECT "createdAt", "date", "id", "theme", "titre" FROM "Entrainement";
DROP TABLE "Entrainement";
ALTER TABLE "new_Entrainement" RENAME TO "Entrainement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
