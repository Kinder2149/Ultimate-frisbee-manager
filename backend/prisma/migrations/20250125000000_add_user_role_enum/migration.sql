-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable: Convertir la colonne role de String vers UserRole
-- Étape 1: Normaliser toutes les valeurs existantes en UPPERCASE
UPDATE "User" SET role = UPPER(role) WHERE role IS NOT NULL;

-- Étape 2: Remplacer les valeurs invalides par USER
UPDATE "User" SET role = 'USER' WHERE role NOT IN ('USER', 'ADMIN');

-- Étape 3: Modifier le type de la colonne
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING (role::text::"UserRole");

-- Étape 4: Définir la valeur par défaut
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER'::"UserRole";
