-- Migration pour normaliser les rôles utilisateurs en UPPERCASE
-- Convertit 'admin' -> 'ADMIN' et 'user' -> 'USER'

-- Mettre à jour tous les rôles en UPPERCASE
UPDATE "User"
SET role = UPPER(role)::text::"UserRole"
WHERE role IS NOT NULL;
