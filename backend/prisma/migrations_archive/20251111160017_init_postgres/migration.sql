-- CreateTable
CREATE TABLE "Exercice" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "schemaUrl" TEXT,
    "materiel" TEXT,
    "notes" TEXT,
    "critereReussite" TEXT,
    "variablesPlus" TEXT NOT NULL DEFAULT '',
    "variablesMinus" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT,
    "level" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrainement" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "echauffementId" TEXT,
    "situationMatchId" TEXT,

    CONSTRAINT "Entrainement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrainementExercice" (
    "id" TEXT NOT NULL,
    "entrainementId" TEXT NOT NULL,
    "exerciceId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "duree" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntrainementExercice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Echauffement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Echauffement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlocEchauffement" (
    "id" TEXT NOT NULL,
    "echauffementId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "titre" TEXT NOT NULL,
    "repetitions" TEXT,
    "temps" TEXT,
    "informations" TEXT,
    "fonctionnement" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlocEchauffement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SituationMatch" (
    "id" TEXT NOT NULL,
    "nom" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "temps" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SituationMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "iconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExerciseTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_EntrainementTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SituationMatchTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Exercice_createdAt_idx" ON "Exercice"("createdAt");

-- CreateIndex
CREATE INDEX "Tag_createdAt_idx" ON "Tag"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_label_category_key" ON "Tag"("label", "category");

-- CreateIndex
CREATE INDEX "Entrainement_echauffementId_idx" ON "Entrainement"("echauffementId");

-- CreateIndex
CREATE INDEX "Entrainement_situationMatchId_idx" ON "Entrainement"("situationMatchId");

-- CreateIndex
CREATE INDEX "Entrainement_createdAt_idx" ON "Entrainement"("createdAt");

-- CreateIndex
CREATE INDEX "EntrainementExercice_entrainementId_idx" ON "EntrainementExercice"("entrainementId");

-- CreateIndex
CREATE INDEX "EntrainementExercice_exerciceId_idx" ON "EntrainementExercice"("exerciceId");

-- CreateIndex
CREATE INDEX "EntrainementExercice_createdAt_idx" ON "EntrainementExercice"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EntrainementExercice_entrainementId_exerciceId_key" ON "EntrainementExercice"("entrainementId", "exerciceId");

-- CreateIndex
CREATE INDEX "Echauffement_createdAt_idx" ON "Echauffement"("createdAt");

-- CreateIndex
CREATE INDEX "BlocEchauffement_echauffementId_idx" ON "BlocEchauffement"("echauffementId");

-- CreateIndex
CREATE INDEX "BlocEchauffement_createdAt_idx" ON "BlocEchauffement"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlocEchauffement_echauffementId_ordre_key" ON "BlocEchauffement"("echauffementId", "ordre");

-- CreateIndex
CREATE INDEX "SituationMatch_createdAt_idx" ON "SituationMatch"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_ExerciseTags_AB_unique" ON "_ExerciseTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ExerciseTags_B_index" ON "_ExerciseTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EntrainementTags_AB_unique" ON "_EntrainementTags"("A", "B");

-- CreateIndex
CREATE INDEX "_EntrainementTags_B_index" ON "_EntrainementTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SituationMatchTags_AB_unique" ON "_SituationMatchTags"("A", "B");

-- CreateIndex
CREATE INDEX "_SituationMatchTags_B_index" ON "_SituationMatchTags"("B");

-- AddForeignKey
ALTER TABLE "Entrainement" ADD CONSTRAINT "Entrainement_echauffementId_fkey" FOREIGN KEY ("echauffementId") REFERENCES "Echauffement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrainement" ADD CONSTRAINT "Entrainement_situationMatchId_fkey" FOREIGN KEY ("situationMatchId") REFERENCES "SituationMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrainementExercice" ADD CONSTRAINT "EntrainementExercice_entrainementId_fkey" FOREIGN KEY ("entrainementId") REFERENCES "Entrainement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrainementExercice" ADD CONSTRAINT "EntrainementExercice_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlocEchauffement" ADD CONSTRAINT "BlocEchauffement_echauffementId_fkey" FOREIGN KEY ("echauffementId") REFERENCES "Echauffement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseTags" ADD CONSTRAINT "_ExerciseTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseTags" ADD CONSTRAINT "_ExerciseTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EntrainementTags" ADD CONSTRAINT "_EntrainementTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Entrainement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EntrainementTags" ADD CONSTRAINT "_EntrainementTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SituationMatchTags" ADD CONSTRAINT "_SituationMatchTags_A_fkey" FOREIGN KEY ("A") REFERENCES "SituationMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SituationMatchTags" ADD CONSTRAINT "_SituationMatchTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
