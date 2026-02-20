-- AlterTable
ALTER TABLE "Exercice" ADD COLUMN     "duree_minutes" INTEGER,
ADD COLUMN     "nombre_joueurs" INTEGER;

-- AlterTable
ALTER TABLE "SituationMatch" ADD COLUMN     "nombre_joueurs" INTEGER;
