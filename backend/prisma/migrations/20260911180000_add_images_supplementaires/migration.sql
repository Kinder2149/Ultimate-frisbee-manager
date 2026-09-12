-- Galerie : images supplémentaires par fiche (l'image principale reste imageUrl)
ALTER TABLE "Exercice" ADD COLUMN "imagesSupplementaires" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Echauffement" ADD COLUMN "imagesSupplementaires" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SituationMatch" ADD COLUMN "imagesSupplementaires" TEXT[] DEFAULT ARRAY[]::TEXT[];
