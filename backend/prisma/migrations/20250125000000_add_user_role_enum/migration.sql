-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable: Convertir la colonne role de String vers UserRole
-- NOTE: cette migration doit être tolérante si la table "User" n'existe pas encore
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'User'
  ) THEN
    -- Étape 1: Normaliser toutes les valeurs existantes en UPPERCASE
    EXECUTE 'UPDATE "User" SET role = UPPER(role) WHERE role IS NOT NULL';

    -- Étape 2: Remplacer les valeurs invalides par USER
    EXECUTE 'UPDATE "User" SET role = ''USER'' WHERE role NOT IN (''USER'', ''ADMIN'')';

    -- Étape 3: Modifier le type de la colonne
    EXECUTE 'ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING (role::text::"UserRole")';

    -- Étape 4: Définir la valeur par défaut
    EXECUTE 'ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT ''USER''::"UserRole"';
  END IF;
END $$;
