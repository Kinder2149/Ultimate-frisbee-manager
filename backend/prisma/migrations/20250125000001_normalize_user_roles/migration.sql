-- Migration pour normaliser les rôles utilisateurs en UPPERCASE
-- Convertit 'admin' -> 'ADMIN' et 'user' -> 'USER'

-- Mettre à jour tous les rôles en UPPERCASE
-- NOTE: cette migration doit être tolérante si la table "User" n'existe pas encore
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'User'
  ) THEN
    EXECUTE 'UPDATE "User" SET role = UPPER(role)::text::"UserRole" WHERE role IS NOT NULL';
  END IF;
END $$;
