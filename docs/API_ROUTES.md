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
