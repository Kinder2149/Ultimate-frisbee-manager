# API Routes — Ultimate Frisbee Manager

Cette page recense les routes disponibles, leurs alias et les méthodes supportées. Les routes françaises historiques sont conservées, et des alias REST en anglais sont fournis pour cohérence.

## Auth & Health (public/semiprotect)
- /api/health
  - GET — Statut API et connectivité DB
- /api/auth
  - GET /profile — Profil utilisateur (JWT requis)
  - PUT /profile — Mise à jour du profil (upload image supporté)
  - POST /logout — Déconnexion symbolique

## Tags
- /api/tags
  - GET / — Liste
  - GET /:id — Détail
  - POST / — Création
  - PUT /:id — Mise à jour
  - DELETE /:id — Suppression

## Exercices (alias: /api/exercises)
- /api/exercices
  - GET / — Liste
  - GET /:id — Détail
  - POST / — Création (multipart, champ `image`)
  - PUT /:id — Mise à jour (multipart, champ `image`)
  - POST /:id/duplicate — Duplication
  - DELETE /:id — Suppression

## Entrainements (alias: /api/trainings)
- /api/entrainements
  - GET / — Liste
  - GET /:id — Détail
  - POST / — Création (multipart, champ `image`)
  - PUT /:id — Mise à jour (multipart, champ `image`)
  - POST /:id/duplicate — Duplication
  - DELETE /:id — Suppression

## Échauffements (alias: /api/warmups)
- /api/echauffements
  - GET / — Liste
  - GET /:id — Détail
  - POST / — Création (multipart, champ `image`)
  - PUT /:id — Mise à jour (multipart, champ `image`)
  - POST /:id/duplicate — Duplication
  - DELETE /:id — Suppression

## Situations / Matchs (alias: /api/matches)
- /api/situations-matchs
  - GET / — Liste
  - GET /:id — Détail
  - POST / — Création (multipart, champ `image`)
  - PUT /:id — Mise à jour (multipart, champ `image`)
  - POST /:id/duplicate — Duplication
  - DELETE /:id — Suppression

## Dashboard
- /api/dashboard
  - GET /stats — Statistiques

## Import (protégé; certaines routes requièrent Admin)
- /api/import
  - POST /markdown?dryRun=true|false — Import Markdown (fichiers)
  - POST /exercices?dryRun=true|false — Import Exercices
  - POST /entrainements?dryRun=true|false — Import Entrainements (Admin)
  - POST /echauffements?dryRun=true|false — Import Échauffements (Admin)
  - POST /situations-matchs?dryRun=true|false — Import Situations (Admin)

## Admin (JWT + rôle Admin)
- /api/admin
  - GET /overview — Vue d’ensemble
  - GET /all-content — Contenu global
  - GET /all-tags — Tags
  - GET /export-ufm?type=exercice|entrainement|echauffement|situation&id=… — Export .ufm.json
  - GET /users — Liste utilisateurs
  - PATCH /users/:id — Mise à jour utilisateur
  - POST /users — Création utilisateur
  - POST /bulk-delete — Suppression en masse
  - POST /bulk-duplicate — Duplication en masse

## Notes
- Tous les endpoints (hors /api/health, certaines /api/auth) sont protégés par JWT.
- Uploads image: champ `image`, stockage Cloudinary via middleware centralisé.
- Alias REST en anglais sont montés en parallèle et pointent vers les mêmes routeurs que les routes FR historiques.

---

# Endpoints clés détaillés

## POST /api/auth/login
- **Description**: Authentification par email/mot de passe.
- **Protection**: Public (rate-limit 5 requêtes / 15 minutes / IP).
- **Input** (JSON):
  ```json
  { "email": "admin@ultimate.com", "password": "Ultim@t+" }
  ```
- **Output** (200):
  ```json
  {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "user": {
      "id": "...", "email": "admin@ultimate.com",
      "nom": "...", "prenom": "...",
      "role": "ADMIN", "isActive": true, "iconUrl": null
    }
  }
  ```
- **Erreurs**:
  - 400 `{ error: "Champs requis: email et password", code: "BAD_REQUEST" }`
  - 401 `{ error: "Identifiants invalides", code: "INVALID_CREDENTIALS" }`
  - 403 `{ error: "Compte inactif", code: "INACTIVE_ACCOUNT" }`
  - 429 `{ error: "Trop de tentatives de connexion. Réessayez plus tard.", code: "RATE_LIMIT" }`
- **curl**:
  ```bash
  curl -X POST http://localhost:3002/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@ultimate.com","password":"Ultim@t+"}'
  ```

## GET /api/admin/list-<type>
- **Description**: Liste les IDs et titres pour un type donné.
- **Protection**: JWT + rôle Admin.
- **Types supportés**: `exercices`, `entrainements`, `echauffements`, `situations-matchs`.
- **Output** (200): Tableau d'objets `{ id, titre }`.
- **Erreurs**: 401 (non authentifié), 403 (non admin), 500 (erreur serveur).
- **curl**:
  ```bash
  # Exemple pour exercices
  curl http://localhost:3002/api/admin/list-exercices \
    -H "Authorization: Bearer <ACCESS_TOKEN>"
  ```

## GET /api/admin/export-ufm
- **Description**: Exporte une entité au format `.ufm.json`.
- **Protection**: JWT + rôle Admin.
- **Query**: `type=exercice|entrainement|echauffement|situation`, `id=<uuid>`
- **Output** (200): Fichier JSON avec headers `Content-Type: application/json` et `Content-Disposition: attachment; filename="<type>-<id>.ufm.json"`.
- **Erreurs**:
  - 400 `{ error: "Paramètres requis: type et id" }`
  - 404 `{ error: "Entité introuvable" }`
  - 500 `{ error: "..." }`
- **curl**:
  ```bash
  curl -L "http://localhost:3002/api/admin/export-ufm?type=exercice&id=<UUID>" \
    -H "Authorization: Bearer <ACCESS_TOKEN>" -o exercice-<UUID>.ufm.json
  ```

## GET /api/health
- **Description**: Statut de l'API et de la connectivité base de données.
- **Protection**: Public.
- **Output** (200):
  ```json
  { "status": "ok", "db": true, "timestamp": "...", "uptime": 123.45, "responseTimeMs": 3 }
  ```
- **Output** (503):
  ```json
  { "status": "degraded", "db": false, "timestamp": "...", "uptime": 123.45, "responseTimeMs": 7, "error": "database_unreachable" }
  ```
- **curl**:
  ```bash
  curl http://localhost:3002/api/health
  ```
