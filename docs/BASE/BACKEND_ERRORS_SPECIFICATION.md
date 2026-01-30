# SPÉCIFICATION DES ERREURS BACKEND

**Document de référence** : Mission 2.3 - Gestion des erreurs backend normalisées  
**Date de création** : 29 janvier 2026  
**Version** : 1.0  
**Statut** : ✅ Validé

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Architecture de gestion des erreurs](#architecture-de-gestion-des-erreurs)
3. [Format standardisé des erreurs](#format-standardisé-des-erreurs)
4. [Typologie complète des erreurs](#typologie-complète-des-erreurs)
5. [Grille de normalisation](#grille-de-normalisation)
6. [Règles d'usage côté frontend](#règles-dusage-côté-frontend)
7. [Cas limites et non couverts](#cas-limites-et-non-couverts)
8. [Critères de validation](#critères-de-validation)

---

## 1. INTRODUCTION

### 1.1 Objectif du document

Ce document formalise **de manière exhaustive et non ambiguë** les erreurs renvoyées par le backend Ultimate Frisbee Manager, afin de :

- ✅ Garantir une interprétation cohérente des erreurs côté frontend
- ✅ Éviter toute dépendance implicite ou fragile
- ✅ Permettre au frontend (Chantier 5) de mapper correctement les erreurs utilisateur
- ✅ Servir de contrat API stable entre backend et frontend

### 1.2 Périmètre

**Inclus** :
- Toutes les erreurs HTTP renvoyées par le backend
- Structure des payloads d'erreur
- Codes d'erreur métier
- Distinction erreur technique / erreur fonctionnelle

**Exclus** :
- Modification du backend (documentation uniquement)
- Ajout de nouveaux codes HTTP
- Logique métier
- Implémentation frontend

---

## 2. ARCHITECTURE DE GESTION DES ERREURS

### 2.1 Middleware centralisé

**Fichier** : `backend/middleware/errorHandler.middleware.js`

**Responsabilité** :
- Intercepter toutes les erreurs non gérées
- Formater la réponse d'erreur de manière standardisée
- Masquer les détails techniques en production

**Comportement** :
```javascript
// Structure de réponse
{
  "error": "Message d'erreur",
  "code": "ERROR_CODE",
  "details": {...},        // Optionnel (validation)
  "stack": "..."           // Uniquement en développement
}
```

### 2.2 Middlewares spécialisés

#### 2.2.1 Auth Middleware
**Fichier** : `backend/middleware/auth.middleware.js`

**Responsabilités** :
- Vérification token Supabase (JWT)
- Gestion cache utilisateur (15 min TTL)
- Retry automatique sur erreurs DB transitoires
- Bypass développement (si `DEV_BYPASS_AUTH=true`)

#### 2.2.2 Workspace Middleware
**Fichier** : `backend/middleware/workspace.middleware.js`

**Responsabilités** :
- Vérification appartenance utilisateur au workspace
- Validation existence workspace
- Contrôle accès ressources workspace

### 2.3 Validators Zod

**Fichiers** :
- `validators/exercice.validator.js`
- `validators/entrainement.validator.js`
- `validators/echauffement.validator.js`
- `validators/situationmatch.validator.js`
- `validators/tag.validator.js`

**Responsabilités** :
- Validation schéma des données entrantes
- Messages d'erreur en français
- Retour détaillé des erreurs de validation

---

## 3. FORMAT STANDARDISÉ DES ERREURS

### 3.1 Structure de base

**Toutes les erreurs** suivent ce format :

```json
{
  "error": "Message d'erreur lisible",
  "code": "ERROR_CODE_UNIQUE"
}
```

### 3.2 Structure avec détails (validation)

**Erreurs de validation Zod** :

```json
{
  "error": "Les données fournies sont invalides.",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "path": ["nom"],
      "message": "Le nom doit contenir au moins 3 caractères."
    }
  ]
}
```

### 3.3 Structure en développement

**Mode développement uniquement** :

```json
{
  "error": "Message d'erreur",
  "code": "ERROR_CODE",
  "details": {...},
  "stack": "Error: ...\n    at ..."
}
```

---

## 4. TYPOLOGIE COMPLÈTE DES ERREURS

### 4.1 Erreurs d'authentification (401)

| Code | Message | Contexte |
|------|---------|----------|
| `NO_TOKEN` | Token d'authentification requis | Aucun token fourni |
| `INVALID_TOKEN` | Token invalide ou expiré | Token malformé, expiré ou signature invalide |
| `NO_USER` | Utilisateur non authentifié | Token valide mais utilisateur introuvable |

**Intention** : Rediriger vers login, rafraîchir token

---

### 4.2 Erreurs d'autorisation (403)

| Code | Message | Contexte |
|------|---------|----------|
| `FORBIDDEN` | Accès réservé aux administrateurs | Utilisateur non-admin tente d'accéder à route admin |
| `WORKSPACE_FORBIDDEN` | Accès refusé à ce workspace | Utilisateur n'appartient pas au workspace |

**Intention** : Afficher message d'accès refusé, ne pas réessayer

---

### 4.3 Erreurs de ressource introuvable (404)

| Code | Message | Contexte |
|------|---------|----------|
| `WORKSPACE_NOT_FOUND` | Workspace non trouvé | Workspace n'existe pas ou supprimé |
| `EXERCICE_NOT_FOUND` | Exercice non trouvé | Exercice n'existe pas |
| `ENTRAINEMENT_NOT_FOUND` | Entraînement non trouvé | Entraînement n'existe pas |
| `ECHAUFFEMENT_NOT_FOUND` | Échauffement non trouvé | Échauffement n'existe pas |
| `SITUATION_NOT_FOUND` | Situation/Match non trouvé | Situation n'existe pas |
| `TAG_NOT_FOUND` | Tag non trouvé | Tag n'existe pas |
| (générique) | Entité introuvable | Export : entité n'existe pas |

**Intention** : Afficher message "non trouvé", retour à la liste

---

### 4.4 Erreurs de validation (400)

#### 4.4.1 Validation Zod

| Code | Message | Contexte |
|------|---------|----------|
| `VALIDATION_ERROR` | Les données fournies sont invalides. | Échec validation schéma Zod |

**Détails fournis** : Tableau d'erreurs avec `path` et `message`

**Messages de validation courants** :
- "Le nom est requis."
- "Le nom doit contenir au moins 3 caractères."
- "La description est requise."
- "Le titre est requis."
- "Le type est requis et doit être 'Match' ou 'Situation'."
- "Le libellé est requis."
- "La catégorie est requise."
- "Format de couleur invalide."

#### 4.4.2 Validation métier

| Code | Message | Contexte |
|------|---------|----------|
| `INVALID_TAGS` | Certains tags n'appartiennent pas à ce workspace | Tags fournis n'existent pas dans le workspace |
| `WORKSPACE_NAME_REQUIRED` | Le nom du workspace est requis | Nom vide lors création workspace |
| `WORKSPACE_NAME_EMPTY` | Le nom du workspace ne peut pas être vide | Nom vide lors mise à jour workspace |
| `USERS_ARRAY_REQUIRED` | Format invalide: users doit être un tableau | Format incorrect pour gestion utilisateurs workspace |
| (import) | Payload invalide: attendez { files: [...] } | Format import Markdown invalide |
| (import) | Payload invalide: attendez { exercices: [...] } | Format import exercices invalide |
| (import) | Payload invalide: attendez { entrainements: [...] } | Format import entraînements invalide |
| (import) | Payload invalide: attendez { echauffements: [...] } | Format import échauffements invalide |
| (import) | Payload invalide: attendez { situations: [...] } | Format import situations invalide |
| (export) | Paramètres requis: type et id | Paramètres manquants pour export |

**Intention** : Afficher message de validation, permettre correction

---

### 4.5 Erreurs serveur (500)

| Code | Message | Contexte |
|------|---------|----------|
| `INTERNAL_SERVER_ERROR` | Une erreur interne est survenue sur le serveur. | Erreur non gérée |
| (import) | Erreur serveur durant import Markdown | Erreur lors import Markdown |
| (import) | Erreur serveur durant import exercices | Erreur lors import exercices |
| (import) | Erreur serveur durant import entrainements | Erreur lors import entraînements |
| (import) | Erreur serveur durant import echauffements | Erreur lors import échauffements |
| (import) | Erreur serveur durant import situations | Erreur lors import situations |
| (import) | Erreur serveur durant import | Erreur générique import |

**Détails fournis** : `details: error.message` (en développement)

**Intention** : Afficher message générique, suggérer réessai, logger côté client

---

### 4.6 Erreurs de configuration (500)

| Code | Message | Contexte |
|------|---------|----------|
| (auth) | Configuration serveur invalide (jose manquant) | Bibliothèque jose non installée |
| `SUPABASE_PROJECT_REF_MISSING` | FATAL ERROR: SUPABASE_PROJECT_REF is not defined | Variable d'environnement manquante |

**Intention** : Erreur critique, contacter support

---

## 5. GRILLE DE NORMALISATION

### 5.1 Tableau de correspondance

| Type d'erreur | Code HTTP | Code métier | Payload | Intention frontend |
|---------------|-----------|-------------|---------|-------------------|
| **Authentification** | 401 | `NO_TOKEN` | `{error, code}` | Rediriger vers login |
| **Authentification** | 401 | `INVALID_TOKEN` | `{error, code}` | Rafraîchir token ou rediriger login |
| **Authentification** | 401 | `NO_USER` | `{error, code}` | Rediriger vers login |
| **Autorisation** | 403 | `FORBIDDEN` | `{error, code}` | Afficher "Accès refusé" |
| **Autorisation** | 403 | `WORKSPACE_FORBIDDEN` | `{error, code}` | Rediriger vers sélection workspace |
| **Ressource** | 404 | `*_NOT_FOUND` | `{error, code}` | Afficher "Non trouvé", retour liste |
| **Validation** | 400 | `VALIDATION_ERROR` | `{error, code, details[]}` | Afficher erreurs par champ |
| **Validation métier** | 400 | `INVALID_TAGS` | `{error, code, invalidIds[]}` | Afficher tags invalides |
| **Validation métier** | 400 | Divers | `{error, code}` | Afficher message, permettre correction |
| **Serveur** | 500 | `INTERNAL_SERVER_ERROR` | `{error, code}` | Afficher message générique, réessai |
| **Configuration** | 500 | Divers | `{error, code}` | Erreur critique, contacter support |

### 5.2 Distinction technique / fonctionnelle

#### Erreurs techniques (ne pas afficher tel quel)
- 500 : Erreurs serveur
- Erreurs de configuration
- Stack traces

**Action frontend** : Mapper vers message utilisateur générique

#### Erreurs fonctionnelles (affichables)
- 401 : Authentification
- 403 : Autorisation
- 404 : Ressource introuvable
- 400 : Validation

**Action frontend** : Afficher message tel quel ou mapper vers message contextuel

---

## 6. RÈGLES D'USAGE CÔTÉ FRONTEND

### 6.1 Ce que le frontend PEUT faire

#### 6.1.1 Afficher directement
- Messages d'erreur de validation (400)
- Messages "non trouvé" (404)
- Messages d'accès refusé (403)

**Exemple** :
```typescript
if (error.code === 'VALIDATION_ERROR' && error.details) {
  // Afficher erreurs par champ
  error.details.forEach(detail => {
    showFieldError(detail.path, detail.message);
  });
}
```

#### 6.1.2 Mapper vers action
- `NO_TOKEN`, `INVALID_TOKEN`, `NO_USER` → Rediriger vers login
- `WORKSPACE_FORBIDDEN` → Rediriger vers sélection workspace
- `FORBIDDEN` → Afficher page "Accès refusé"
- `*_NOT_FOUND` → Retour à la liste

**Exemple** :
```typescript
if (error.code === 'WORKSPACE_FORBIDDEN') {
  router.navigate(['/select-workspace']);
  localStorage.removeItem('ufm.currentWorkspace');
}
```

#### 6.1.3 Mapper vers message utilisateur
- 500 → "Un problème est survenu. Veuillez réessayer."
- 0 (réseau) → "Impossible de se connecter. Vérifiez votre connexion."

**Exemple** :
```typescript
if (error.status === 500) {
  showMessage('Un problème est survenu sur le serveur. Veuillez réessayer dans quelques instants.');
}
```

### 6.2 Ce que le frontend NE DOIT PAS faire

❌ **Interpréter le message d'erreur** (parsing de chaîne)
- Ne pas chercher "404" dans le message
- Ne pas parser le texte pour extraire des informations

❌ **Deviner le code d'erreur**
- Toujours utiliser `error.code` fourni par le backend
- Ne pas assumer un code basé sur le statut HTTP seul

❌ **Afficher les stack traces**
- Jamais afficher `error.stack` à l'utilisateur
- Logger en console uniquement

❌ **Réessayer automatiquement les erreurs 4xx**
- 400, 401, 403, 404 : Ne pas réessayer
- 500, 502, 503 : Réessai possible

### 6.3 Traitement silencieux

**Cas autorisés** :
- Retry automatique sur erreurs réseau (0, 502, 503)
- Refresh token sur `INVALID_TOKEN` (si mécanisme en place)
- Redirection automatique sur `WORKSPACE_FORBIDDEN`

**Cas interdits** :
- Ignorer les erreurs de validation
- Masquer les erreurs 500 sans feedback utilisateur

---

## 7. CAS LIMITES ET NON COUVERTS

### 7.1 Cas limites identifiés

#### 7.1.1 Workspace supprimé
**Situation** : Utilisateur garde workspace ID en localStorage, workspace supprimé côté serveur

**Erreur renvoyée** : 403 `WORKSPACE_FORBIDDEN`

**Action frontend recommandée** :
- Intercepter cette erreur spécifiquement
- Nettoyer localStorage
- Rediriger vers `/select-workspace`

#### 7.1.2 Erreurs DB transitoires
**Situation** : Erreur temporaire de connexion base de données

**Gestion backend** : Retry automatique (3 tentatives, 800ms total)

**Erreur renvoyée** : 500 si échec après retry

**Action frontend** : Afficher message générique, suggérer réessai

#### 7.1.3 Cold start Vercel
**Situation** : Première requête après période d'inactivité

**Gestion backend** : Aucune erreur, délai de réponse augmenté

**Action frontend** : Afficher loader, pas d'erreur

### 7.2 Cas non couverts

#### 7.2.1 Timeout réseau
**Situation** : Requête prend trop de temps

**Erreur** : Timeout côté client (pas de réponse backend)

**Action frontend** : Gérer timeout côté client, afficher message approprié

#### 7.2.2 Erreurs CORS
**Situation** : Origine non autorisée

**Erreur** : Erreur CORS côté navigateur (pas de réponse backend)

**Action frontend** : Détecter erreur CORS, afficher message connexion

#### 7.2.3 Erreurs de parsing JSON
**Situation** : Réponse backend non-JSON

**Erreur** : Exception parsing côté client

**Action frontend** : Catch exception, afficher message générique

---

## 8. CRITÈRES DE VALIDATION

### 8.1 Critères de complétude

✅ **Toutes les erreurs backend sont documentées**
- Authentification : 3 codes
- Autorisation : 2 codes
- Ressources : 6+ codes
- Validation : 15+ messages
- Serveur : 7+ codes

✅ **Format standardisé défini**
- Structure de base
- Structure avec détails
- Structure développement

✅ **Règles d'usage frontend claires**
- Ce qui PEUT être fait
- Ce qui NE DOIT PAS être fait
- Cas de traitement silencieux

### 8.2 Critères de non-ambiguïté

✅ **Aucune interprétation implicite requise**
- Chaque code d'erreur a un sens unique
- Chaque erreur a une action frontend définie

✅ **Distinction technique / fonctionnelle claire**
- Erreurs techniques identifiées
- Erreurs fonctionnelles identifiées

✅ **Cas limites documentés**
- Workspace supprimé
- Erreurs DB transitoires
- Cold start

### 8.3 Critères d'exploitabilité

✅ **Frontend peut consommer sans hypothèse**
- Grille de normalisation complète
- Tableau de correspondance erreur → intention
- Exemples de code fournis

✅ **Chantier 5 peut s'appuyer sur ce cadrage**
- Messages d'erreur utilisateur mappables
- Actions frontend définies
- Aucune ambiguïté

---

## 9. CONCLUSION

Ce document formalise **de manière exhaustive** les erreurs backend de Ultimate Frisbee Manager.

**Garanties fournies** :
- ✅ Contrat API stable entre backend et frontend
- ✅ Aucune ambiguïté sur le sens des erreurs
- ✅ Actions frontend clairement définies
- ✅ Distinction technique / fonctionnelle établie

**Usage** :
- **Frontend** : Référence pour mapper erreurs → messages utilisateur
- **Backend** : Documentation des erreurs existantes (pas de modification)
- **Chantier 5** : Base pour amélioration messages d'erreur utilisateur

**Maintenance** :
- Mettre à jour ce document si nouvelles erreurs ajoutées au backend
- Versionner les changements de format
- Communiquer les breaking changes

---

**Document validé pour Mission 2.3 - Gestion des erreurs backend normalisées**
