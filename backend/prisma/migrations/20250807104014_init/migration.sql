-- CreateTable
CREATE TABLE "Exercice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectif" TEXT NOT NULL,
    "elementsTravail" TEXT NOT NULL,
    "variables" TEXT NOT NULL,
    "schemaUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
