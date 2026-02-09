# Procédure de récupération ADMIN

- **Statut** : REFERENCE
- **Version** : 1.0
- **Date** : 2026-02-09

---

## Contexte

Le système doit **toujours** avoir au moins un utilisateur avec `role = ADMIN` et `isActive = true` (invariant ADM-1).

Si cet invariant est violé (bug, manipulation DB directe, migration défaillante), aucun utilisateur ne peut accéder aux fonctions d'administration et les protections applicatives empêchent toute correction via l'interface.

## Diagnostic

### Via script (recommandé)

```bash
cd backend
node scripts/check-admin-count.js
```

Ce script affiche :
- Le nombre total d'utilisateurs
- Le nombre d'admins actifs et inactifs
- Un code de sortie `1` si aucun admin actif

### Via SQL direct

```sql
SELECT id, email, nom, role, "isActive", "createdAt"
FROM "User"
WHERE role = 'ADMIN'
ORDER BY "createdAt" ASC;
```

## Procédure de restauration

### Prérequis

- Accès à la base PostgreSQL (via Supabase Dashboard > SQL Editor, ou client psql)
- Connaître l'email du compte à promouvoir

### Étapes

**1. Identifier le compte à restaurer**

```sql
SELECT id, email, nom, role, "isActive" FROM "User" ORDER BY "createdAt" ASC;
```

Choisir le premier utilisateur créé ou le compte principal connu.

**2. Restaurer le rôle ADMIN**

```sql
UPDATE "User"
SET role = 'ADMIN', "isActive" = true
WHERE email = '<email_admin_principal>';
```

**3. Vérifier le résultat**

```sql
SELECT count(*) AS admin_count
FROM "User"
WHERE role = 'ADMIN' AND "isActive" = true;
-- Doit retourner >= 1
```

**4. Invalider le cache backend**

Le middleware auth backend utilise un cache mémoire de 15 minutes. Après modification directe en DB :

- **Option A** : Redémarrer le backend (le cache est en mémoire)
- **Option B** : Attendre 15 minutes (TTL du cache)

### Vérification post-restauration

1. Se connecter avec le compte restauré
2. Accéder à `/admin/dashboard`
3. Vérifier que la liste des utilisateurs est accessible
4. Exécuter `node scripts/check-admin-count.js` → doit afficher 🟢

## Prévention

### Protections applicatives en place

| Point de mutation | Protection |
|-------------------|-----------|
| `PATCH /api/admin/users/:id` | `ensureMinOneAdmin()` bloque le retrait du dernier admin |
| `PUT /api/auth/profile` | `ensureMinOneAdmin()` bloque l'auto-retrait du dernier admin |
| `POST /api/admin/users` | Validation `UserRole` enum (USER/ADMIN uniquement) |

### Recommandations

- Toujours avoir **au moins 2 admins actifs** (le script affiche un avertissement si un seul)
- Exécuter `check-admin-count.js` dans le pipeline CI/CD avant chaque déploiement
- Ne jamais modifier la colonne `role` directement en DB sans vérifier le count des admins restants

## Proposition de trigger DB (non implémenté)

Le SQL ci-dessous est fourni comme **proposition uniquement**. Ne pas appliquer sans validation explicite.

```sql
-- Trigger PostgreSQL empêchant la suppression du dernier admin actif
CREATE OR REPLACE FUNCTION check_min_admin_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.role = 'ADMIN' AND (NEW.role != 'ADMIN' OR NEW."isActive" = false)) THEN
    IF (SELECT count(*) FROM "User" WHERE role = 'ADMIN' AND "isActive" = true AND id != OLD.id) < 1 THEN
      RAISE EXCEPTION 'Cannot remove the last active ADMIN user';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_min_admin
  BEFORE UPDATE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION check_min_admin_count();
```
