-- CreateTable
CREATE TABLE "Echauffement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BlocEchauffement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "echauffementId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "repetitions" TEXT,
    "temps" TEXT,
    "informations" TEXT,
    "fonctionnement" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlocEchauffement_echauffementId_fkey" FOREIGN KEY ("echauffementId") REFERENCES "Echauffement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
