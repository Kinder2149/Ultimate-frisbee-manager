-- Baseline schema generated from prisma/schema.prisma

-- CreateTable
CREATE TABLE "Exercice" (
  "id" TEXT NOT NULL,
  "nom" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT,
  "schemaUrl" TEXT,
  "points" TEXT,
  "schemaUrls" TEXT,
  "materiel" TEXT,
  "notes" TEXT,
  "critereReussite" TEXT,
  "variablesPlus" TEXT NOT NULL DEFAULT '',
  "variablesMinus" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "workspaceId" TEXT,
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
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "workspaceId" TEXT,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrainement" (
  "id" TEXT NOT NULL,
  "titre" TEXT NOT NULL,
  "date" TIMESTAMP(3),
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "echauffementId" TEXT,
  "situationMatchId" TEXT,
  "workspaceId" TEXT,
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
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "workspaceId" TEXT,
  CONSTRAINT "EntrainementExercice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Echauffement" (
  "id" TEXT NOT NULL,
  "nom" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "workspaceId" TEXT,
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
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "workspaceId" TEXT,
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
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "workspaceId" TEXT,
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
  "isTester" BOOLEAN NOT NULL DEFAULT false,
  "iconUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isBase" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceUser" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'MEMBER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable (junctions)
CREATE TABLE "_ExerciceTags" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

CREATE TABLE "_EntrainementTags" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

CREATE TABLE "_SituationMatchTags" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

-- Indexes
CREATE INDEX "Exercice_createdAt_idx" ON "Exercice"("createdAt");
CREATE INDEX "Exercice_workspaceId_idx" ON "Exercice"("workspaceId");
CREATE INDEX "Tag_createdAt_idx" ON "Tag"("createdAt");
CREATE UNIQUE INDEX "Tag_label_category_key" ON "Tag"("label", "category");
CREATE INDEX "Tag_workspaceId_idx" ON "Tag"("workspaceId");
CREATE INDEX "Entrainement_echauffementId_idx" ON "Entrainement"("echauffementId");
CREATE INDEX "Entrainement_situationMatchId_idx" ON "Entrainement"("situationMatchId");
CREATE INDEX "Entrainement_createdAt_idx" ON "Entrainement"("createdAt");
CREATE INDEX "Entrainement_workspaceId_idx" ON "Entrainement"("workspaceId");
CREATE INDEX "EntrainementExercice_entrainementId_idx" ON "EntrainementExercice"("entrainementId");
CREATE INDEX "EntrainementExercice_exerciceId_idx" ON "EntrainementExercice"("exerciceId");
CREATE INDEX "EntrainementExercice_createdAt_idx" ON "EntrainementExercice"("createdAt");
CREATE UNIQUE INDEX "EntrainementExercice_entrainementId_exerciceId_key" ON "EntrainementExercice"("entrainementId", "exerciceId");
CREATE INDEX "EntrainementExercice_workspaceId_idx" ON "EntrainementExercice"("workspaceId");
CREATE INDEX "Echauffement_createdAt_idx" ON "Echauffement"("createdAt");
CREATE INDEX "Echauffement_workspaceId_idx" ON "Echauffement"("workspaceId");
CREATE INDEX "BlocEchauffement_echauffementId_idx" ON "BlocEchauffement"("echauffementId");
CREATE INDEX "BlocEchauffement_createdAt_idx" ON "BlocEchauffement"("createdAt");
CREATE UNIQUE INDEX "BlocEchauffement_echauffementId_ordre_key" ON "BlocEchauffement"("echauffementId", "ordre");
CREATE INDEX "BlocEchauffement_workspaceId_idx" ON "BlocEchauffement"("workspaceId");
CREATE INDEX "SituationMatch_createdAt_idx" ON "SituationMatch"("createdAt");
CREATE INDEX "SituationMatch_workspaceId_idx" ON "SituationMatch"("workspaceId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "Workspace_createdAt_idx" ON "Workspace"("createdAt");
CREATE UNIQUE INDEX "WorkspaceUser_workspaceId_userId_key" ON "WorkspaceUser"("workspaceId", "userId");
CREATE INDEX "WorkspaceUser_workspaceId_idx" ON "WorkspaceUser"("workspaceId");
CREATE INDEX "WorkspaceUser_userId_idx" ON "WorkspaceUser"("userId");
CREATE UNIQUE INDEX "_ExerciceTags_AB_unique" ON "_ExerciceTags"("A", "B");
CREATE INDEX "_ExerciceTags_B_index" ON "_ExerciceTags"("B");
CREATE UNIQUE INDEX "_EntrainementTags_AB_unique" ON "_EntrainementTags"("A", "B");
CREATE INDEX "_EntrainementTags_B_index" ON "_EntrainementTags"("B");
CREATE UNIQUE INDEX "_SituationMatchTags_AB_unique" ON "_SituationMatchTags"("A", "B");
CREATE INDEX "_SituationMatchTags_B_index" ON "_SituationMatchTags"("B");

-- Foreign keys
ALTER TABLE "Entrainement" ADD CONSTRAINT "Entrainement_echauffementId_fkey" FOREIGN KEY ("echauffementId") REFERENCES "Echauffement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Entrainement" ADD CONSTRAINT "Entrainement_situationMatchId_fkey" FOREIGN KEY ("situationMatchId") REFERENCES "SituationMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EntrainementExercice" ADD CONSTRAINT "EntrainementExercice_entrainementId_fkey" FOREIGN KEY ("entrainementId") REFERENCES "Entrainement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntrainementExercice" ADD CONSTRAINT "EntrainementExercice_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlocEchauffement" ADD CONSTRAINT "BlocEchauffement_echauffementId_fkey" FOREIGN KEY ("echauffementId") REFERENCES "Echauffement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Exercice" ADD CONSTRAINT "Exercice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Entrainement" ADD CONSTRAINT "Entrainement_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EntrainementExercice" ADD CONSTRAINT "EntrainementExercice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Echauffement" ADD CONSTRAINT "Echauffement_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlocEchauffement" ADD CONSTRAINT "BlocEchauffement_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SituationMatch" ADD CONSTRAINT "SituationMatch_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ExerciceTags" ADD CONSTRAINT "_ExerciceTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ExerciceTags" ADD CONSTRAINT "_ExerciceTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_EntrainementTags" ADD CONSTRAINT "_EntrainementTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Entrainement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_EntrainementTags" ADD CONSTRAINT "_EntrainementTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_SituationMatchTags" ADD CONSTRAINT "_SituationMatchTags_A_fkey" FOREIGN KEY ("A") REFERENCES "SituationMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_SituationMatchTags" ADD CONSTRAINT "_SituationMatchTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

