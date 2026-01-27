-- Migration: Ajouter le champ updatedAt à tous les modèles principaux
-- Date: 2026-01-27

-- Ajouter updatedAt à Exercice
ALTER TABLE "Exercice" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Ajouter updatedAt à Tag
ALTER TABLE "Tag" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Ajouter updatedAt à Entrainement
ALTER TABLE "Entrainement" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Ajouter updatedAt à Echauffement
ALTER TABLE "Echauffement" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Ajouter updatedAt à SituationMatch
ALTER TABLE "SituationMatch" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Créer des triggers pour mettre à jour automatiquement updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer les triggers
CREATE TRIGGER update_exercice_updated_at BEFORE UPDATE ON "Exercice" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tag_updated_at BEFORE UPDATE ON "Tag" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entrainement_updated_at BEFORE UPDATE ON "Entrainement" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_echauffement_updated_at BEFORE UPDATE ON "Echauffement" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_situationmatch_updated_at BEFORE UPDATE ON "SituationMatch" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
