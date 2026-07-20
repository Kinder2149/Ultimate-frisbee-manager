# STRATÉGIE DE SYNCHRONISATION SUPABASE AUTH ↔ BASE DE DONNÉES

**Statut** : REFERENCE  
**Date de création** : 9 février 2026  
**Version** : 1.0

---

## 📋 ARCHITECTURE

### Double système d'authentification

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE AUTH                         │
└─────────────────────────────────────────────────────────────┘

1. SUPABASE AUTH (externe)
   ├─ Gère authentification (email/password, OAuth, etc.)
   ├─ Stocke utilisateurs avec UUID
   ├─ Émet JWT tokens
   └─ Dashboard : https://supabase.com/dashboard

2. BASE DE DONNÉES APPLICATIVE (PostgreSQL)
   ├─ Table User (id = supabaseUserId)
   ├─ Profil utilisateur (nom, prenom, role, iconUrl, etc.)
   ├─ Relations métier (workspaces, exercices, etc.)
   └─ Gérée par Prisma
```

**Lien critique** : `User.id` (base applicative) = `auth.users.id` (Supabase)

---

## 🔄 FLUX D'AUTHENTIFICATION

### Connexion utilisateur

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Supabase    │────▶│   Backend    │
│   (Angular)  │     │    Auth      │     │  (Node.js)   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                     │
       │ 1. Login           │                     │
       │───────────────────▶│                     │
       │                    │                     │
       │ 2. JWT Token       │                     │
       │◀───────────────────│                     │
       │                    │                     │
       │ 3. GET /api/auth/profile (+ token)       │
       │─────────────────────────────────────────▶│
       │                    │                     │
       │                    │ 4. Vérifier token   │
       │                    │◀────────────────────│
       │                    │                     │
       │                    │ 5. Token valide     │
       │                    │─────────────────────▶
       │                    │                     │
       │                    │ 6. Chercher User.id │
       │                    │    (= token.sub)    │
       │                    │                     │
       │ 7. Profil utilisateur                    │
       │◀─────────────────────────────────────────│
       │                    │                     │
```

---

## ⚠️ PROBLÈME : UTILISATEURS ORPHELINS

### Définition

**Utilisateur orphelin** : Utilisateur existant dans Supabase Auth mais sans profil dans la base de données applicative.

### Causes possibles

1. **Migration destructrice** : Suppression accidentelle de la table User
2. **Seed incomplet** : Seed qui ne crée pas les profils pour tous les utilisateurs Supabase
3. **Inscription incomplète** : Utilisateur créé dans Supabase mais erreur lors de la création du profil backend
4. **Import/export** : Restauration partielle de la base de données

### Symptôme

```
Erreur 403 : "Compte non trouvé. Veuillez vous inscrire."
Code: USER_NOT_FOUND
```

**Code concerné** : `backend/middleware/auth.middleware.js` ligne 272-279

---

## ✅ SOLUTIONS

### Solution 1 : Synchronisation manuelle (utilisateurs existants)

**Script** : `backend/prisma/sync-supabase-users.js`

**Objectif** : Créer les profils manquants pour tous les utilisateurs Supabase existants.

**Usage** :
```bash
cd backend
node prisma/sync-supabase-users.js
```

**Fonctionnement** :
1. Récupère tous les utilisateurs de Supabase Auth via API Admin
2. Vérifie pour chaque utilisateur si un profil existe en base
3. Crée les profils manquants avec :
   - `id` = `supabaseUserId`
   - `email` = email Supabase
   - `role` = USER (par défaut)
   - `nom`, `prenom` = extraits de `user_metadata` ou email
4. Associe chaque utilisateur au workspace BASE avec rôle VIEWER

**Sortie** :
```
🔄 SYNCHRONISATION SUPABASE AUTH → BASE DE DONNÉES
============================================================
📡 Récupération des utilisateurs Supabase...
✅ 5 utilisateur(s) trouvé(s) dans Supabase

🔍 Vérification des profils manquants...
  ❌ Profil manquant: user1@example.com
  ✅ Profil existant: user2@example.com

📊 Résumé: 1 profil(s) à créer sur 5 utilisateur(s)

🔧 Création des profils manquants...
  ✅ Créé: user1@example.com (role: USER, workspace: BASE/VIEWER)

✅ 1 profil(s) créé(s) avec succès
============================================================
```

---

### Solution 2 : Auto-création au premier login (nouveaux utilisateurs)

**Implémentation** : `frontend/src/app/core/services/auth.service.ts` ligne 420-429

**Objectif** : Créer automatiquement le profil backend si absent lors du premier login.

**Fonctionnement** :
1. Utilisateur se connecte via Supabase ✅
2. Frontend demande profil : `GET /api/auth/profile`
3. Backend retourne 403 (USER_NOT_FOUND)
4. Frontend intercepte l'erreur 403
5. Frontend appelle `POST /api/auth/register` avec :
   - `supabaseUserId` = ID Supabase
   - `email` = email Supabase
6. Backend crée le profil et l'associe au workspace BASE
7. Frontend récupère le profil créé
8. Utilisateur accède à l'application ✅

**Code** :
```typescript
private syncUserProfile(): Observable<User> {
  return this.http.get<{ user: User }>(`${this.apiUrl}/profile`).pipe(
    catchError(error => {
      // Si l'utilisateur n'existe pas en base (403), créer automatiquement le profil
      if (error.status === 403) {
        console.log('[Auth] Profil non trouvé, création automatique...');
        return this.createProfileFromSupabase().pipe(
          tap(user => {
            this.currentUserSubject.next(user);
            this.cacheUserProfile(user);
            console.log('[Auth] Profil créé automatiquement:', user.email);
          })
        );
      }
      return throwError(() => error);
    })
  );
}
```

---

## 🔧 MAINTENANCE

### Vérification régulière

**Commande** :
```bash
cd backend
node prisma/sync-supabase-users.js
```

**Fréquence recommandée** :
- Après chaque migration majeure
- Après restauration de base de données
- Si des utilisateurs signalent des erreurs de connexion

---

### Cas d'usage : Migration destructrice

**Scénario** : Une migration supprime accidentellement la table User ou des données.

**Procédure de récupération** :
1. Restaurer le schéma : `npx prisma migrate dev`
2. Exécuter le seed : `npx prisma db seed`
3. Synchroniser Supabase : `node prisma/sync-supabase-users.js`
4. Vérifier les invariants : `node prisma/verify-invariants.js`

---

### Cas d'usage : Nouvel environnement

**Scénario** : Déploiement sur un nouvel environnement (staging, production).

**Procédure** :
1. Configurer les variables d'environnement (`.env`)
2. Exécuter les migrations : `npx prisma migrate deploy`
3. Exécuter le seed : `npx prisma db seed`
4. Synchroniser Supabase : `node prisma/sync-supabase-users.js`

---

## 📊 MONITORING

### Indicateurs clés

**Nombre d'utilisateurs Supabase** :
- Dashboard Supabase : https://supabase.com/dashboard/project/{PROJECT_REF}/auth/users

**Nombre d'utilisateurs en base** :
```sql
SELECT COUNT(*) FROM "User";
```

**Utilisateurs orphelins** :
```bash
node prisma/sync-supabase-users.js
# Affiche le nombre de profils manquants
```

**Alerte** : Si le nombre d'utilisateurs Supabase > nombre d'utilisateurs en base, exécuter la synchronisation.

---

## 🚨 ERREURS COURANTES

### Erreur 1 : "USER_NOT_FOUND" (403)

**Cause** : Utilisateur existe dans Supabase mais pas en base.

**Solution** :
1. Vérifier que l'auto-création est activée (frontend)
2. Exécuter `node prisma/sync-supabase-users.js`

---

### Erreur 2 : "SUPABASE_SERVICE_ROLE_KEY manquant"

**Cause** : Variable d'environnement non définie.

**Solution** :
```bash
# backend/.env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Où trouver la clé** :
1. Dashboard Supabase : https://supabase.com/dashboard/project/{PROJECT_REF}/settings/api
2. Section "Service Role" (secret)
3. Copier la clé `service_role` (JWT)

---

### Erreur 3 : "Workspace BASE introuvable"

**Cause** : Seed non exécuté ou workspace BASE supprimé.

**Solution** :
```bash
node prisma/seed.js
# Puis
node prisma/sync-supabase-users.js
```

---

## 🔐 SÉCURITÉ

### Service Role Key

**⚠️ CRITIQUE** : La `SUPABASE_SERVICE_ROLE_KEY` donne un accès ADMIN complet à Supabase.

**Règles** :
- ✅ Stocker dans `.env` (jamais commiter)
- ✅ Utiliser uniquement côté backend
- ✅ Limiter l'accès aux scripts admin
- ❌ Ne JAMAIS exposer côté frontend
- ❌ Ne JAMAIS commiter dans Git

---

## 📚 RÉFÉRENCES

**Scripts** :
- `backend/prisma/sync-supabase-users.js` — Synchronisation Supabase → Backend
- `backend/prisma/verify-invariants.js` — Vérification invariants
- `backend/prisma/repair-data.js` — Réparation données critiques

**Code** :
- `backend/middleware/auth.middleware.js` — Vérification JWT et profil
- `backend/controllers/auth.controller.js` — Endpoint `/api/auth/register`
- `frontend/src/app/core/services/auth.service.ts` — Auto-création profil

**Documentation** :
- `docs/reference/database/MIGRATION_STRATEGY.md` — Stratégie de migration
- Supabase Auth API : https://supabase.com/docs/reference/javascript/auth-admin-listusers

---

**FIN DU DOCUMENT DE RÉFÉRENCE**
