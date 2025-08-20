-- CreateTable
CREATE TABLE "TrainingTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT,
    "level" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Entrainement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "date" DATETIME,
    "dureeTotal" INTEGER,
    "theme" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entrainementId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "titre" TEXT,
    "duree" INTEGER,
    "notes" TEXT,
    "notesOrales" TEXT,
    CONSTRAINT "Phase_entrainementId_fkey" FOREIGN KEY ("entrainementId") REFERENCES "Entrainement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PhaseExercice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phaseId" TEXT NOT NULL,
    "exerciceId" TEXT,
    "ordre" INTEGER NOT NULL,
    "nom" TEXT,
    "description" TEXT,
    "duree" INTEGER,
    "variables" TEXT,
    "notesPerso" TEXT,
    "notesOrales" TEXT,
    CONSTRAINT "PhaseExercice_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PhaseExercice_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EntrainementTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EntrainementTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Entrainement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EntrainementTags_B_fkey" FOREIGN KEY ("B") REFERENCES "TrainingTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingTag_label_category_key" ON "TrainingTag"("label", "category");

-- CreateIndex
CREATE UNIQUE INDEX "PhaseExercice_phaseId_ordre_key" ON "PhaseExercice"("phaseId", "ordre");

-- CreateIndex
CREATE UNIQUE INDEX "_EntrainementTags_AB_unique" ON "_EntrainementTags"("A", "B");

-- CreateIndex
CREATE INDEX "_EntrainementTags_B_index" ON "_EntrainementTags"("B");
