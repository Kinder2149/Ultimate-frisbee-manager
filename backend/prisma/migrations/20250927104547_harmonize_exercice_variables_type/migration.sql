/*
  Warnings:

  - The `variablesPlus` column on the `Exercice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `variablesMinus` column on the `Exercice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Exercice" DROP COLUMN "variablesPlus",
ADD COLUMN     "variablesPlus" TEXT[],
DROP COLUMN "variablesMinus",
ADD COLUMN     "variablesMinus" TEXT[];
