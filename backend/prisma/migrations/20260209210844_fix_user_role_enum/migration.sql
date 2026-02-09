/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `BlocEchauffement` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `EntrainementExercice` table. All the data in the column will be lost.
  - You are about to drop the column `schemaUrl` on the `Exercice` table. All the data in the column will be lost.
  - You are about to drop the column `schemaUrls` on the `Exercice` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_ExerciceTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ExerciceTags" DROP CONSTRAINT "_ExerciceTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExerciceTags" DROP CONSTRAINT "_ExerciceTags_B_fkey";

-- DropIndex
DROP INDEX "Workspace_createdAt_idx";

-- AlterTable
ALTER TABLE "BlocEchauffement" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Echauffement" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Entrainement" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EntrainementExercice" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Exercice" DROP COLUMN "schemaUrl",
DROP COLUMN "schemaUrls",
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SituationMatch" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
-- Créer l'enum UserRole s'il n'existe pas déjà
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Supprimer le DEFAULT avant conversion
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

-- Convertir la colonne role de text vers UserRole en préservant les données
ALTER TABLE "User" 
  ALTER COLUMN "role" TYPE "UserRole" 
  USING (
    CASE 
      WHEN UPPER("role") = 'ADMIN' THEN 'ADMIN'::"UserRole"
      ELSE 'USER'::"UserRole"
    END
  );

-- Remettre le DEFAULT avec le bon type
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER'::"UserRole";

-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "_ExerciceTags";

-- CreateTable
CREATE TABLE "_ExerciseTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ExerciseTags_AB_unique" ON "_ExerciseTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ExerciseTags_B_index" ON "_ExerciseTags"("B");

-- AddForeignKey
ALTER TABLE "_ExerciseTags" ADD CONSTRAINT "_ExerciseTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Exercice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExerciseTags" ADD CONSTRAINT "_ExerciseTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
