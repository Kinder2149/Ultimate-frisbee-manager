# SPÉCIFICATION DES ÉTATS D'AUTHENTIFICATION

**Document de référence** : Mission 3.2 - Gestion des états intermédiaires d'authentification  
**Date de création** : 29 janvier 2026  
**Version** : 1.0  
**Statut** : ✅ Validé

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Architecture actuelle d'authentification](#architecture-actuelle-dauthentification)
3. [Machine d'état conceptuelle](#machine-détat-conceptuelle)
4. [États d'authentification exhaustifs](#états-dauthentification-exhaustifs)
5. [Transitions d'état](#transitions-détat)
6. [Cas problématiques identifiés](#cas-problématiques-identifiés)
7. [Trous fonctionnels](#trous-fonctionnels)
8. [Recommandations de stabilisation](#recommandations-de-stabilisation)
9. [Critères de validation](#critères-de-validation)

---

## 1. INTRODUCTION

### 1.1 Objectif du document

Ce document formalise **tous les états intermédiaires possibles** de l'authentification dans Ultimate Frisbee Manager, afin de :

- ✅ Éviter les comportements silencieux ou incohérents
- ✅ Garantir une réaction claire du frontend pour chaque état
- ✅ Sécuriser les transitions (session, workspace, token)
- ✅ Identifier les cas actuellement non gérés

### 1.2 Périmètre

**Cas analysés** :
- Session expirée
- Token invalide
- Token valide mais droits insuffisants
- Changement de workspace avec session invalide
- Chargement initial avec état auth inconnu
- Transitions Supabase (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED)

**Exclus** :
- Refactoring auth (documentation uniquement)
- Ajout de nouveaux mécanismes de sécurité
- Modifications backend
- UI redesign

---

## 2. ARCHITECTURE ACTUELLE D'AUTHENTIFICATION

### 2.1 Composants du système

**Frontend** :
- `AuthService` : Gestion état authentification
  - Observables : `currentUser$`, `isAuthenticated$`
  - Méthodes : login, logout, register, syncUserProfile
  - Cache : IndexedDB pour profil utilisateur
  
- `AuthGuard` : Protection routes
  - Vérifie `isAuthenticated$`
  - Redirige vers `/login` si non authentifié
  
- `WorkspaceSelectedGuard` : Protection workspace
  - Vérifie workspace sélectionné
  - Redirige vers `/select-workspace` si non sélectionné

**Backend** :
- `auth.middleware.js` : Vérification token Supabase
  - Cache utilisateur (15 min TTL)
  - Retry automatique sur erreurs DB transitoires
  - Bypass développement (si `DEV_BYPASS_AUTH=true`)

**Supabase** :
- Gestion authentification externe
- Événements : `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, `USER_UPDATED`, `PASSWORD_RECOVERY`

### 2.2 Flux actuel

```
1. Utilisateur → Supabase Auth (login)
2. Supabase → JWT (RS256/HS256)
3. Frontend → Stocke token + écoute événements
4. Frontend → Backend (Authorization: Bearer <token>)
5. Backend → Vérifie token via JWKS ou secret
6. Backend → Vérifie utilisateur en base
7. Backend → Autorise ou refuse
```

### 2.3 Observables clés

**`isAuthenticated$`** :
- Type : `BehaviorSubject<boolean>`
- Valeur initiale : `false`
- Mis à jour par : `listenToAuthStateChanges()`

**`currentUser$`** :
- Type : `BehaviorSubject<User | null>`
- Valeur initiale : `null`
- Mis à jour par : `syncUserProfile()`, cache IndexedDB

---

## 3. MACHINE D'ÉTAT CONCEPTUELLE

### 3.1 États principaux

```
┌─────────────────────────────────────────────────────────────┐
│                    ÉTATS D'AUTHENTIFICATION                  │
└─────────────────────────────────────────────────────────────┘

1. UNKNOWN (Initialisation)
   ↓
2. CHECKING (Vérification session)
   ↓
   ├─→ 3. AUTHENTICATED (Session valide)
   │   ↓
   │   ├─→ 4. WORKSPACE_REQUIRED (Auth OK, pas de workspace)
   │   │   ↓
   │   │   └─→ 5. READY (Auth OK + Workspace OK)
   │   │
   │   ├─→ 6. INSUFFICIENT_RIGHTS (Auth OK, droits insuffisants)
   │   │
   │   └─→ 7. TOKEN_EXPIRED (Session expirée)
   │
   └─→ 8. UNAUTHENTICATED (Pas de session)
       ↓
       └─→ 9. SIGNED_OUT (Déconnexion explicite)
```

### 3.2 États transitoires

```
10. REFRESHING_TOKEN (Rafraîchissement en cours)
11. SYNCING_PROFILE (Synchronisation profil backend)
12. LOADING_WORKSPACE (Chargement workspace)
13. SWITCHING_WORKSPACE (Changement workspace)
```

### 3.3 États d'erreur

```
14. AUTH_ERROR (Erreur authentification)
15. NETWORK_ERROR (Erreur réseau)
16. BACKEND_ERROR (Erreur backend)
17. WORKSPACE_INVALID (Workspace supprimé/inaccessible)
```

---

## 4. ÉTATS D'AUTHENTIFICATION EXHAUSTIFS

### 4.1 État 1 : UNKNOWN (Initialisation)

**Description** : État initial au démarrage de l'application

**État système** :
- `isAuthenticated$` : `false` (valeur initiale)
- `currentUser$` : `null`
- Session Supabase : Non vérifiée

**Visibilité utilisateur** :
- Écran de chargement (StartupLoader)
- Aucune interface visible

**Action attendue** :
- Appeler `initializeAuth()` automatiquement
- Vérifier session Supabase via `getSession()`
- Transition vers `CHECKING`

**Durée** : < 500ms (normale)

**Cas problématique** : Si durée > 3s, cold start backend

---

### 4.2 État 2 : CHECKING (Vérification session)

**Description** : Vérification de l'existence d'une session Supabase

**État système** :
- `isAuthenticated$` : `false` (en attente)
- `currentUser$` : `null`
- Session Supabase : En cours de vérification

**Visibilité utilisateur** :
- Écran de chargement
- Indicateur de progression possible

**Action attendue** :
- Attendre résultat `getSession()`
- Si session existe → Transition vers `AUTHENTICATED`
- Si pas de session → Transition vers `UNAUTHENTICATED`

**Durée** : < 200ms (normale)

**Cas problématique** : Timeout réseau

---

### 4.3 État 3 : AUTHENTICATED (Session valide)

**Description** : Session Supabase valide détectée

**État système** :
- `isAuthenticated$` : `true`
- `currentUser$` : `null` (pas encore chargé) ou User (depuis cache)
- Session Supabase : Valide

**Visibilité utilisateur** :
- Écran de chargement (si profil non chargé)
- Interface partielle (si profil en cache)

**Action attendue** :
- Charger profil depuis cache IndexedDB (si disponible)
- Synchroniser profil avec backend via `syncUserProfile()`
- Vérifier workspace sélectionné
- Transition vers `WORKSPACE_REQUIRED` ou `READY`

**Durée** : 200-1000ms

**Cas problématique** :
- Backend inaccessible → Reste en `AUTHENTICATED` avec cache
- Profil backend introuvable → Erreur 404

---

### 4.4 État 4 : WORKSPACE_REQUIRED (Auth OK, pas de workspace)

**Description** : Utilisateur authentifié mais aucun workspace sélectionné

**État système** :
- `isAuthenticated$` : `true`
- `currentUser$` : User
- Workspace : `null` ou invalide

**Visibilité utilisateur** :
- Page `/select-workspace`
- Liste des workspaces disponibles

**Action attendue** :
- Afficher liste workspaces via `GET /api/workspaces/me`
- Attendre sélection utilisateur
- Après sélection → Transition vers `LOADING_WORKSPACE`

**Durée** : Indéfinie (attente utilisateur)

**Cas problématique** :
- Aucun workspace disponible → Créer workspace par défaut (BASE)
- Erreur chargement liste → `BACKEND_ERROR`

---

### 4.5 État 5 : READY (Auth OK + Workspace OK)

**Description** : État opérationnel complet

**État système** :
- `isAuthenticated$` : `true`
- `currentUser$` : User
- Workspace : Sélectionné et valide

**Visibilité utilisateur** :
- Interface complète accessible
- Dashboard ou page demandée

**Action attendue** :
- Permettre navigation complète
- Surveiller événements Supabase
- Surveiller validité workspace

**Durée** : Indéfinie (session active)

**Transitions possibles** :
- `TOKEN_REFRESHED` → Reste `READY` (transparent)
- `SIGNED_OUT` → `SIGNED_OUT`
- Erreur 403 workspace → `WORKSPACE_INVALID`
- Erreur 401 → `TOKEN_EXPIRED`

---

### 4.6 État 6 : INSUFFICIENT_RIGHTS (Auth OK, droits insuffisants)

**Description** : Utilisateur authentifié mais tente d'accéder à ressource interdite

**État système** :
- `isAuthenticated$` : `true`
- `currentUser$` : User
- Erreur : 403 `FORBIDDEN`

**Visibilité utilisateur** :
- Message "Accès refusé"
- Redirection vers page autorisée

**Action attendue** :
- Afficher message d'erreur clair
- Rediriger vers dashboard ou page précédente
- Ne pas déconnecter l'utilisateur

**Durée** : Transitoire (affichage message)

**Cas problématique** :
- Changement de rôle non détecté (cache 15 min)

---

### 4.7 État 7 : TOKEN_EXPIRED (Session expirée)

**Description** : Token Supabase expiré

**État système** :
- `isAuthenticated$` : `true` → `false` (transition)
- `currentUser$` : User → `null`
- Erreur : 401 `INVALID_TOKEN`

**Visibilité utilisateur** :
- Message "Session expirée"
- Redirection vers `/login`

**Action attendue** :
- Supabase tente refresh automatique
- Si refresh réussit → `TOKEN_REFRESHED` → Reste `READY`
- Si refresh échoue → Transition vers `UNAUTHENTICATED`
- Nettoyer cache local

**Durée** : < 1s (refresh) ou immédiat (échec)

**Cas problématique actuel** :
- ⚠️ **Pas de refresh automatique visible** mentionné dans l'audit
- Comportement implicite de Supabase

---

### 4.8 État 8 : UNAUTHENTICATED (Pas de session)

**Description** : Aucune session active détectée

**État système** :
- `isAuthenticated$` : `false`
- `currentUser$` : `null`
- Session Supabase : Aucune

**Visibilité utilisateur** :
- Page `/login`
- Formulaire de connexion

**Action attendue** :
- Afficher formulaire login
- Attendre action utilisateur (login/register)
- Après login réussi → `SIGNED_IN`

**Durée** : Indéfinie (attente utilisateur)

---

### 4.9 État 9 : SIGNED_OUT (Déconnexion explicite)

**Description** : Utilisateur s'est déconnecté volontairement

**État système** :
- `isAuthenticated$` : `false`
- `currentUser$` : `null`
- Session Supabase : Détruite

**Visibilité utilisateur** :
- Message "Déconnexion réussie"
- Redirection vers `/login`

**Action attendue** :
- Nettoyer localStorage
- Nettoyer IndexedDB
- Nettoyer workspace
- Afficher message confirmation

**Durée** : Transitoire (< 500ms)

---

### 4.10 État 10 : REFRESHING_TOKEN (Rafraîchissement)

**Description** : Supabase rafraîchit le token automatiquement

**État système** :
- `isAuthenticated$` : `true` (maintenu)
- `currentUser$` : User (maintenu)
- Session Supabase : En cours de refresh

**Visibilité utilisateur** :
- **Transparent** (aucun changement visible)
- Pas de loader

**Action attendue** :
- Supabase gère automatiquement
- Frontend écoute événement `TOKEN_REFRESHED`
- Reste en état `READY`

**Durée** : < 500ms

**Cas problématique** :
- Si refresh échoue → `TOKEN_EXPIRED`

---

### 4.11 État 11 : SYNCING_PROFILE (Synchronisation profil)

**Description** : Synchronisation profil backend en cours

**État système** :
- `isAuthenticated$` : `true`
- `currentUser$` : User (cache) ou `null`
- Requête : `GET /api/auth/profile` en cours

**Visibilité utilisateur** :
- Loader si profil non en cache
- Interface partielle si profil en cache

**Action attendue** :
- Attendre réponse backend
- Mettre à jour `currentUser$`
- Mettre à jour cache IndexedDB
- Transition vers `WORKSPACE_REQUIRED` ou `READY`

**Durée** : 200-2000ms (selon backend)

**Cas problématique** :
- Backend inaccessible → Utiliser cache
- Profil introuvable (404) → Créer profil ou déconnecter

---

### 4.12 État 12 : LOADING_WORKSPACE (Chargement workspace)

**Description** : Préchargement données workspace

**État système** :
- `isAuthenticated$` : `true`
- `currentUser$` : User
- Workspace : Sélectionné, données en cours de chargement

**Visibilité utilisateur** :
- Dialog de préchargement (PreloadDialog)
- Barre de progression

**Action attendue** :
- Appeler `GET /api/workspaces/:id/preload`
- Charger exercices, tags, entraînements, etc.
- Mettre en cache IndexedDB
- Transition vers `READY`

**Durée** : 1-5s (selon volume données)

**Cas problématique** :
- Timeout (> 10s) → Continuer sans données
- Erreur 403 → `WORKSPACE_INVALID`

---

### 4.13 État 13 : SWITCHING_WORKSPACE (Changement workspace)

**Description** : Utilisateur change de workspace

**État système** :
- `isAuthenticated$` : `true`
- `currentUser$` : User
- Workspace : Transition ancien → nouveau

**Visibilité utilisateur** :
- Loader ou rechargement page
- Message "Changement d'espace..."

**Action attendue** :
- Nettoyer cache workspace précédent
- Mettre à jour localStorage
- Recharger page (`window.location.href = '/'`)
- Transition vers `LOADING_WORKSPACE`

**Durée** : < 1s + temps chargement

**Cas problématique actuel** :
- ⚠️ **Si nouveau workspace invalide** → Erreur 403 silencieuse

---

### 4.14 État 14 : AUTH_ERROR (Erreur authentification)

**Description** : Erreur lors de l'authentification

**État système** :
- `isAuthenticated$` : `false`
- `currentUser$` : `null`
- Erreur : Variable (401, 403, etc.)

**Visibilité utilisateur** :
- Message d'erreur contextuel
- Formulaire login avec erreur

**Action attendue** :
- Afficher message d'erreur clair
- Permettre nouvelle tentative
- Logger erreur en console

**Durée** : Indéfinie (attente utilisateur)

**Types d'erreur** :
- Identifiants invalides
- Email non confirmé
- Compte désactivé

---

### 4.15 État 15 : NETWORK_ERROR (Erreur réseau)

**Description** : Impossible de contacter Supabase ou backend

**État système** :
- `isAuthenticated$` : État précédent maintenu
- `currentUser$` : État précédent maintenu
- Erreur : Timeout, CORS, etc.

**Visibilité utilisateur** :
- Message "Problème de connexion"
- Bouton "Réessayer"

**Action attendue** :
- Afficher message réseau
- Permettre retry manuel
- Utiliser cache si disponible

**Durée** : Indéfinie (attente réseau)

**Cas problématique** :
- Mode hors ligne non géré

---

### 4.16 État 16 : BACKEND_ERROR (Erreur backend)

**Description** : Backend accessible mais erreur serveur

**État système** :
- `isAuthenticated$` : `true` (maintenu)
- `currentUser$` : User (cache)
- Erreur : 500, 502, 503

**Visibilité utilisateur** :
- Message "Problème serveur"
- Interface dégradée (cache uniquement)

**Action attendue** :
- Afficher message d'erreur
- Utiliser cache pour continuer
- Retry automatique après délai

**Durée** : Variable (selon disponibilité backend)

**Cas problématique** :
- Cold start Vercel → Délai augmenté

---

### 4.17 État 17 : WORKSPACE_INVALID (Workspace supprimé/inaccessible)

**Description** : Workspace sélectionné n'existe plus ou accès refusé

**État système** :
- `isAuthenticated$` : `true`
- `currentUser$` : User
- Erreur : 403 `WORKSPACE_FORBIDDEN`

**Visibilité utilisateur** :
- Message "Espace de travail inaccessible"
- Redirection vers `/select-workspace`

**Action attendue** :
- Nettoyer localStorage (`ufm.currentWorkspace`)
- Afficher notification
- Rediriger vers sélection workspace
- Recharger liste workspaces

**Durée** : Transitoire (< 1s)

**Cas problématique actuel** :
- ⚠️ **Mission 1.4 validée** mais comportement à vérifier en production

---

## 5. TRANSITIONS D'ÉTAT

### 5.1 Tableau des transitions

| État source | Événement | État cible | Action frontend |
|-------------|-----------|------------|-----------------|
| UNKNOWN | App start | CHECKING | `initializeAuth()` |
| CHECKING | Session trouvée | AUTHENTICATED | Charger profil |
| CHECKING | Pas de session | UNAUTHENTICATED | Rediriger login |
| AUTHENTICATED | Profil chargé + workspace OK | READY | Afficher interface |
| AUTHENTICATED | Profil chargé + pas de workspace | WORKSPACE_REQUIRED | Rediriger sélection |
| READY | `SIGNED_OUT` | SIGNED_OUT | Nettoyer + rediriger |
| READY | `TOKEN_REFRESHED` | READY | Transparent |
| READY | Erreur 401 | TOKEN_EXPIRED | Refresh ou déconnecter |
| READY | Erreur 403 workspace | WORKSPACE_INVALID | Nettoyer + rediriger |
| READY | Erreur 403 droits | INSUFFICIENT_RIGHTS | Message + rediriger |
| READY | Changement workspace | SWITCHING_WORKSPACE | Recharger |
| WORKSPACE_REQUIRED | Sélection workspace | LOADING_WORKSPACE | Précharger données |
| LOADING_WORKSPACE | Préchargement OK | READY | Afficher interface |
| LOADING_WORKSPACE | Erreur 403 | WORKSPACE_INVALID | Rediriger sélection |
| TOKEN_EXPIRED | Refresh réussi | READY | Transparent |
| TOKEN_EXPIRED | Refresh échoué | UNAUTHENTICATED | Rediriger login |
| UNAUTHENTICATED | Login réussi | AUTHENTICATED | Charger profil |
| * | Erreur réseau | NETWORK_ERROR | Message + retry |
| * | Erreur backend | BACKEND_ERROR | Message + cache |

### 5.2 Événements Supabase

| Événement Supabase | Action actuelle | État cible |
|-------------------|-----------------|------------|
| `SIGNED_IN` | `handleSignedIn()` | AUTHENTICATED |
| `SIGNED_OUT` | `handleSignedOut()` | SIGNED_OUT |
| `TOKEN_REFRESHED` | Log uniquement | READY (maintenu) |
| `USER_UPDATED` | `syncUserProfile()` | READY (maintenu) |
| `PASSWORD_RECOVERY` | Log uniquement | Aucun changement |

---

## 6. CAS PROBLÉMATIQUES IDENTIFIÉS

### 6.1 Cas 1 : Token expiré sans refresh visible

**Situation** : Token Supabase expire pendant l'utilisation

**Comportement actuel** :
- Supabase gère refresh automatiquement (implicite)
- Événement `TOKEN_REFRESHED` loggé mais pas traité
- Utilisateur ne voit rien

**Problème** :
- ⚠️ **Comportement implicite** non formalisé
- Si refresh échoue, comportement inconnu

**État attendu** :
- `REFRESHING_TOKEN` (transparent)
- Si échec → `TOKEN_EXPIRED` → Redirection login

**Action recommandée** :
- Formaliser gestion `TOKEN_REFRESHED`
- Gérer échec refresh explicitement

---

### 6.2 Cas 2 : Workspace supprimé

**Situation** : Workspace sélectionné est supprimé côté serveur

**Comportement actuel** :
- Frontend garde ID en localStorage
- Requête API → Erreur 403 `WORKSPACE_FORBIDDEN`
- **Mission 1.4 validée** : Redirection automatique implémentée

**Problème** :
- ✅ **Résolu** par Mission 1.4
- À vérifier en production

**État attendu** :
- `WORKSPACE_INVALID` → Redirection `/select-workspace`

**Action recommandée** :
- Tester comportement en conditions réelles
- Vérifier nettoyage localStorage

---

### 6.3 Cas 3 : Changement workspace avec session invalide

**Situation** : Utilisateur change de workspace alors que session a expiré

**Comportement actuel** :
- Changement workspace → Rechargement page
- Page recharge → Vérification session
- Session invalide → Redirection login
- **Workspace change perdu**

**Problème** :
- ⚠️ **Perte de contexte** : Utilisateur ne comprend pas pourquoi il est déconnecté

**État attendu** :
- Détecter session invalide AVANT changement
- Afficher message "Session expirée"
- Rediriger login avec `returnUrl`

**Action recommandée** :
- Vérifier session avant changement workspace
- Préserver intention utilisateur (returnUrl)

---

### 6.4 Cas 4 : Chargement initial avec état auth inconnu

**Situation** : Application démarre, état auth non encore déterminé

**Comportement actuel** :
- `isAuthenticated$` = `false` (valeur initiale)
- `AuthGuard` redirige immédiatement vers login
- `initializeAuth()` s'exécute en parallèle
- **Flash de redirection** possible

**Problème** :
- ⚠️ **Race condition** : Guard peut rediriger avant vérification session

**État attendu** :
- `UNKNOWN` → Attendre `CHECKING` → Décision

**Action recommandée** :
- Guard doit attendre fin de `initializeAuth()`
- Utiliser état `CHECKING` explicite
- Afficher loader pendant vérification

---

### 6.5 Cas 5 : Profil backend introuvable (404)

**Situation** : Session Supabase valide mais profil backend absent

**Comportement actuel** :
- `syncUserProfile()` → Erreur 404
- Comportement non documenté

**Problème** :
- ⚠️ **État incohérent** : Auth OK mais pas de profil

**État attendu** :
- Créer profil automatiquement via `POST /api/auth/register`
- Ou déconnecter utilisateur avec message

**Action recommandée** :
- Formaliser gestion erreur 404 profil
- Créer profil automatiquement si possible

---

### 6.6 Cas 6 : Cache utilisateur non invalidé (15 min)

**Situation** : Rôle utilisateur change côté backend

**Comportement actuel** :
- Cache backend : 15 min TTL
- **Mission 1.3 validée** : Invalidation cache implémentée

**Problème** :
- ✅ **Résolu** par Mission 1.3
- À vérifier en production

**État attendu** :
- Changement rôle → Invalidation immédiate
- Utilisateur voit nouveau rôle < 1s

**Action recommandée** :
- Tester invalidation cache en production

---

### 6.7 Cas 7 : Erreur réseau pendant opération critique

**Situation** : Perte réseau pendant login ou changement workspace

**Comportement actuel** :
- Timeout ou erreur réseau
- Comportement non formalisé

**Problème** :
- ⚠️ **État indéterminé** : Utilisateur ne sait pas si action réussie

**État attendu** :
- `NETWORK_ERROR` → Message clair + retry

**Action recommandée** :
- Formaliser gestion erreurs réseau
- Permettre retry manuel
- Afficher état réseau (online/offline)

---

## 7. TROUS FONCTIONNELS

### 7.1 Trou 1 : Pas d'état CHECKING explicite

**Description** : Pas d'état intermédiaire entre UNKNOWN et AUTHENTICATED/UNAUTHENTICATED

**Impact** :
- Race condition possible avec AuthGuard
- Flash de redirection
- UX dégradée

**Recommandation** :
- Créer état `CHECKING` explicite
- AuthGuard attend fin vérification
- Afficher loader pendant vérification

---

### 7.2 Trou 2 : Gestion refresh token implicite

**Description** : Refresh token géré par Supabase sans visibilité frontend

**Impact** :
- Comportement non documenté
- Échec refresh non géré explicitement
- Déconnexion silencieuse possible

**Recommandation** :
- Écouter événement `TOKEN_REFRESHED`
- Gérer échec refresh explicitement
- Logger refresh pour monitoring

---

### 7.3 Trou 3 : Pas de mode hors ligne

**Description** : Application non utilisable sans réseau

**Impact** :
- Erreur réseau → Blocage complet
- Cache disponible mais pas exploité

**Recommandation** :
- Détecter mode hors ligne
- Afficher interface dégradée (lecture seule)
- Utiliser cache IndexedDB

---

### 7.4 Trou 4 : Pas de gestion multi-onglets

**Description** : Déconnexion dans un onglet non propagée aux autres

**Impact** :
- Incohérence entre onglets
- Requêtes avec token invalide

**Recommandation** :
- Utiliser BroadcastChannel pour sync
- Propager événements auth entre onglets
- Déconnecter tous onglets si SIGNED_OUT

---

### 7.5 Trou 5 : Pas de timeout sur opérations auth

**Description** : Pas de timeout défini pour vérification session, sync profil

**Impact** :
- Attente infinie possible
- Utilisateur bloqué

**Recommandation** :
- Définir timeout (ex: 10s)
- Afficher erreur si timeout
- Permettre retry

---

### 7.6 Trou 6 : Pas de feedback visuel sur états transitoires

**Description** : États SYNCING_PROFILE, REFRESHING_TOKEN transparents

**Impact** :
- Utilisateur ne sait pas ce qui se passe
- Impression d'application figée

**Recommandation** :
- Afficher indicateur discret (spinner)
- Message contextuel si > 2s
- Permettre annulation si > 5s

---

### 7.7 Trou 7 : Pas de récupération après erreur backend

**Description** : Erreur 500 backend → Pas de retry automatique

**Impact** :
- Utilisateur doit recharger page
- UX dégradée

**Recommandation** :
- Retry automatique avec backoff
- Utiliser cache en attendant
- Afficher message "Reconnexion..."

---

## 8. RECOMMANDATIONS DE STABILISATION

### 8.1 Recommandation 1 : Créer enum d'états explicite

**Objectif** : Formaliser tous les états dans le code

**Implémentation suggérée** :
```typescript
enum AuthState {
  UNKNOWN = 'UNKNOWN',
  CHECKING = 'CHECKING',
  AUTHENTICATED = 'AUTHENTICATED',
  WORKSPACE_REQUIRED = 'WORKSPACE_REQUIRED',
  READY = 'READY',
  INSUFFICIENT_RIGHTS = 'INSUFFICIENT_RIGHTS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  SIGNED_OUT = 'SIGNED_OUT',
  REFRESHING_TOKEN = 'REFRESHING_TOKEN',
  SYNCING_PROFILE = 'SYNCING_PROFILE',
  LOADING_WORKSPACE = 'LOADING_WORKSPACE',
  SWITCHING_WORKSPACE = 'SWITCHING_WORKSPACE',
  AUTH_ERROR = 'AUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  BACKEND_ERROR = 'BACKEND_ERROR',
  WORKSPACE_INVALID = 'WORKSPACE_INVALID'
}
```

**Bénéfice** :
- États explicites et documentés
- Transitions traçables
- Debugging facilité

---

### 8.2 Recommandation 2 : Ajouter Observable authState$

**Objectif** : Exposer état auth complet, pas seulement boolean

**Implémentation suggérée** :
```typescript
private authStateSubject = new BehaviorSubject<AuthState>(AuthState.UNKNOWN);
public authState$ = this.authStateSubject.asObservable();
```

**Bénéfice** :
- Frontend peut réagir à chaque état
- Affichage contextuel possible
- Meilleure UX

---

### 8.3 Recommandation 3 : Gérer timeout sur opérations critiques

**Objectif** : Éviter attente infinie

**Implémentation suggérée** :
```typescript
this.supabaseService.supabase.auth.getSession()
  .pipe(
    timeout(10000), // 10s max
    catchError(err => {
      this.authStateSubject.next(AuthState.NETWORK_ERROR);
      return of(null);
    })
  )
```

**Bénéfice** :
- Pas de blocage utilisateur
- Erreur claire si timeout
- Retry possible

---

### 8.4 Recommandation 4 : Synchroniser multi-onglets

**Objectif** : Cohérence auth entre onglets

**Implémentation suggérée** :
```typescript
const authChannel = new BroadcastChannel('auth-sync');
authChannel.postMessage({ event: 'SIGNED_OUT' });
authChannel.onmessage = (msg) => {
  if (msg.data.event === 'SIGNED_OUT') {
    this.handleSignedOut();
  }
};
```

**Bénéfice** :
- Déconnexion propagée
- Changement workspace synchronisé
- Meilleure sécurité

---

### 8.5 Recommandation 5 : Formaliser gestion erreur 404 profil

**Objectif** : Gérer cas profil backend absent

**Implémentation suggérée** :
```typescript
syncUserProfile().pipe(
  catchError(err => {
    if (err.status === 404) {
      // Créer profil automatiquement
      return this.createProfile();
    }
    throw err;
  })
)
```

**Bénéfice** :
- Pas d'état incohérent
- Expérience fluide
- Auto-réparation

---

### 8.6 Recommandation 6 : Afficher feedback visuel états transitoires

**Objectif** : Utilisateur informé de ce qui se passe

**Implémentation suggérée** :
- Spinner discret pour SYNCING_PROFILE
- Message "Rafraîchissement..." si > 2s
- Barre de progression pour LOADING_WORKSPACE

**Bénéfice** :
- UX améliorée
- Pas d'impression d'application figée
- Confiance utilisateur

---

### 8.7 Recommandation 7 : Implémenter mode dégradé

**Objectif** : Application utilisable même avec backend inaccessible

**Implémentation suggérée** :
- Détecter erreur backend
- Basculer en mode lecture seule
- Utiliser cache IndexedDB
- Afficher bandeau "Mode hors ligne"

**Bénéfice** :
- Continuité service
- Données accessibles
- UX résiliente

---

## 9. CRITÈRES DE VALIDATION

### 9.1 Critères de complétude

✅ **Tous les états identifiés** :
- 17 états documentés (9 principaux + 4 transitoires + 4 erreur)
- Chaque état a : description, état système, visibilité, action

✅ **Toutes les transitions documentées** :
- Tableau de transitions complet
- Événements Supabase mappés
- Actions frontend définies

✅ **Tous les cas problématiques identifiés** :
- 7 cas problématiques analysés
- Solutions recommandées

### 9.2 Critères de non-ambiguïté

✅ **Aucun état implicite** :
- Tous les états formalisés
- Comportements documentés
- Pas de "magie" non expliquée

✅ **Chaque transition a un comportement clair** :
- Action frontend définie
- État cible connu
- Durée estimée

✅ **Frontend peut agir sans supposition** :
- Règles claires pour chaque état
- Pas d'interprétation requise

### 9.3 Critères d'exploitabilité

✅ **Document utilisable par développeurs** :
- Machine d'état conceptuelle
- Tableau de transitions
- Recommandations d'implémentation

✅ **Trous fonctionnels identifiés** :
- 7 trous documentés
- Impact évalué
- Solutions proposées

✅ **Recommandations de stabilisation** :
- 7 recommandations concrètes
- Exemples de code fournis
- Bénéfices décrits

---

## 10. CONCLUSION

Ce document formalise **de manière exhaustive** les états d'authentification de Ultimate Frisbee Manager.

**Garanties fournies** :
- ✅ Aucun état auth implicite ou silencieux
- ✅ Chaque transition a un comportement attendu clair
- ✅ Frontend peut agir sans supposition
- ✅ Cas problématiques identifiés et documentés

**Usage** :
- **Frontend** : Référence pour gérer états auth
- **Backend** : Compréhension des attentes frontend
- **QA** : Scénarios de test pour états auth

**Maintenance** :
- Mettre à jour si nouveaux états ajoutés
- Versionner les changements de comportement
- Communiquer les breaking changes

---

**Document validé pour Mission 3.2 - Gestion des états intermédiaires d'authentification**
