-- ============================================
-- Requêtes SQL de Vérification Production
-- Ultimate Frisbee Manager
-- ============================================
-- À exécuter dans Supabase Dashboard → Database → SQL Editor
-- ============================================

-- 1. VÉRIFIER L'UTILISATEUR ADMIN
-- ============================================
SELECT 
  id,
  email,
  role,
  "isActive",
  nom,
  prenom,
  "createdAt"
FROM "User" 
WHERE email = 'admin@ultimate.com';

-- Résultat attendu:
-- - id: UUID Supabase de l'utilisateur (à vérifier dans Auth Users)
-- - email: admin@ultimate.com
-- - role: ADMIN
-- - isActive: true


-- 2. VÉRIFIER LE WORKSPACE BASE
-- ============================================
SELECT 
  id,
  name,
  "createdAt",
  "updatedAt"
FROM "Workspace" 
WHERE name = 'BASE';

-- Résultat attendu:
-- - id: bb0acaee-5698-4160-bee5-d85bff72dbda
-- - name: BASE


-- 3. VÉRIFIER LA LIAISON UTILISATEUR <-> WORKSPACE
-- ============================================
-- IMPORTANT: Remplacer 'VOTRE-UUID-ADMIN' par l'UUID réel de l'admin
SELECT 
  wu.id,
  wu."workspaceId",
  wu."userId",
  wu.role,
  w.name as workspace_name,
  u.email as user_email
FROM "WorkspaceUser" wu
JOIN "Workspace" w ON wu."workspaceId" = w.id
JOIN "User" u ON wu."userId" = u.id
WHERE wu."userId" = 'VOTRE-UUID-ADMIN';

-- Résultat attendu:
-- Au moins une ligne avec workspaceId = bb0acaee-5698-4160-bee5-d85bff72dbda


-- 4. LISTER TOUS LES UTILISATEURS (DEBUG)
-- ============================================
SELECT 
  id,
  email,
  role,
  "isActive",
  "createdAt"
FROM "User"
ORDER BY "createdAt" DESC;


-- 5. LISTER TOUS LES WORKSPACES (DEBUG)
-- ============================================
SELECT 
  w.id,
  w.name,
  COUNT(wu.id) as member_count,
  w."createdAt"
FROM "Workspace" w
LEFT JOIN "WorkspaceUser" wu ON w.id = wu."workspaceId"
GROUP BY w.id, w.name, w."createdAt"
ORDER BY w."createdAt" DESC;


-- ============================================
-- REQUÊTES DE CORRECTION (SI NÉCESSAIRE)
-- ============================================

-- 6. CRÉER L'UTILISATEUR ADMIN (si absent)
-- ============================================
-- IMPORTANT: Remplacer 'VOTRE-UUID-SUPABASE' par l'UUID de Supabase Auth
/*
INSERT INTO "User" (
  id,
  email,
  "passwordHash",
  nom,
  prenom,
  role,
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  'VOTRE-UUID-SUPABASE',
  'admin@ultimate.com',
  '$2a$12$dummy.hash.not.used.with.supabase.auth',
  'Admin',
  'Ultimate',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
*/


-- 7. CRÉER LE WORKSPACE BASE (si absent)
-- ============================================
/*
INSERT INTO "Workspace" (
  id,
  name,
  "createdAt",
  "updatedAt"
)
VALUES (
  'bb0acaee-5698-4160-bee5-d85bff72dbda',
  'BASE',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
*/


-- 8. LIER L'UTILISATEUR AU WORKSPACE (si absent)
-- ============================================
-- IMPORTANT: Remplacer 'VOTRE-UUID-ADMIN' par l'UUID réel de l'admin
/*
INSERT INTO "WorkspaceUser" (
  id,
  "workspaceId",
  "userId",
  role,
  "createdAt"
)
VALUES (
  gen_random_uuid(),
  'bb0acaee-5698-4160-bee5-d85bff72dbda',
  'VOTRE-UUID-ADMIN',
  'OWNER',
  NOW()
)
ON CONFLICT ("workspaceId", "userId") DO NOTHING;
*/


-- 9. CORRIGER LE RÔLE ADMIN (si nécessaire)
-- ============================================
-- IMPORTANT: Remplacer 'VOTRE-UUID-ADMIN' par l'UUID réel de l'admin
/*
UPDATE "User"
SET 
  role = 'ADMIN',
  "isActive" = true,
  "updatedAt" = NOW()
WHERE id = 'VOTRE-UUID-ADMIN';
*/


-- 10. VÉRIFICATION FINALE COMPLÈTE
-- ============================================
-- Cette requête affiche toutes les informations nécessaires
-- IMPORTANT: Remplacer 'VOTRE-UUID-ADMIN' par l'UUID réel de l'admin
/*
SELECT 
  'User Info' as section,
  u.id as user_id,
  u.email,
  u.role as user_role,
  u."isActive" as user_active,
  NULL as workspace_id,
  NULL as workspace_name,
  NULL as workspace_role
FROM "User" u
WHERE u.id = 'VOTRE-UUID-ADMIN'

UNION ALL

SELECT 
  'Workspace Memberships' as section,
  u.id as user_id,
  u.email,
  NULL as user_role,
  NULL as user_active,
  w.id as workspace_id,
  w.name as workspace_name,
  wu.role as workspace_role
FROM "User" u
JOIN "WorkspaceUser" wu ON u.id = wu."userId"
JOIN "Workspace" w ON wu."workspaceId" = w.id
WHERE u.id = 'VOTRE-UUID-ADMIN';
*/


-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 
-- 1. L'UUID de l'utilisateur en base PostgreSQL DOIT correspondre
--    à l'UUID Supabase Auth de cet utilisateur
--
-- 2. Le passwordHash en base n'est pas utilisé car l'authentification
--    est gérée par Supabase Auth
--
-- 3. Le workspace BASE (id: bb0acaee-5698-4160-bee5-d85bff72dbda)
--    est le workspace par défaut pour tous les utilisateurs
--
-- 4. Toutes les requêtes INSERT utilisent ON CONFLICT DO NOTHING
--    pour être idempotentes (peuvent être exécutées plusieurs fois)
--
-- ============================================
