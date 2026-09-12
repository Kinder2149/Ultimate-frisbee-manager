-- Envoi d'un élément d'un utilisateur à un autre (accepté ou refusé par le destinataire)
CREATE TYPE "StatutEnvoi" AS ENUM ('EN_ATTENTE', 'ACCEPTE', 'REFUSE');

CREATE TABLE "Envoi" (
  "id" TEXT NOT NULL,
  "famille" TEXT NOT NULL,
  "nom" TEXT NOT NULL,
  "contenu" JSONB NOT NULL,
  "message" TEXT,
  "statut" "StatutEnvoi" NOT NULL DEFAULT 'EN_ATTENTE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decideAt" TIMESTAMP(3),
  "resultatVu" BOOLEAN NOT NULL DEFAULT false,
  "elementCreeId" TEXT,
  "espaceCibleId" TEXT,
  "expediteurId" TEXT NOT NULL,
  "destinataireId" TEXT NOT NULL,
  CONSTRAINT "Envoi_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Envoi_destinataireId_statut_idx" ON "Envoi"("destinataireId", "statut");
CREATE INDEX "Envoi_expediteurId_idx" ON "Envoi"("expediteurId");
CREATE INDEX "Envoi_createdAt_idx" ON "Envoi"("createdAt");

ALTER TABLE "Envoi" ADD CONSTRAINT "Envoi_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Envoi" ADD CONSTRAINT "Envoi_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
