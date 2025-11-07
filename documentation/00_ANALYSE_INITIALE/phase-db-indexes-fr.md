Ajout d’indexes Prisma sur FKs et timestamps — Branche: feat/db/indexes

- Fichier modifié: backend/prisma/schema.prisma
- Changements: ajout de `@@index` sur champs de relation et `createdAt` pour accélérer les requêtes et jointures.
  - Exercice: @@index([createdAt])
  - Tag: @@index([createdAt])
  - Entrainement: @@index([echauffementId]), @@index([situationMatchId]), @@index([createdAt])
  - EntrainementExercice: @@index([entrainementId]), @@index([exerciceId]), @@index([createdAt])
  - Echauffement: @@index([createdAt])
  - BlocEchauffement: @@index([echauffementId]), @@index([createdAt])
  - SituationMatch: @@index([createdAt])
  - User: @@index([createdAt])

Commandes (à exécuter localement):
- Validation: `npx prisma validate --schema ./backend/prisma/schema.prisma`
- Migration dev: `npx prisma migrate dev --schema ./backend/prisma/schema.prisma --name add_indexes`
- Déploiement prod: `npx prisma migrate deploy --schema ./backend/prisma/schema.prisma`

Critères d’acceptation:
- `prisma validate` sans erreur.
- Migration créée et appliquée (dossier `backend/prisma/migrations`).
- Requêtes clés plus rapides sur datasets significatifs (notamment jointures par FKs et tris par createdAt).

Notes:
- Gain limité sur SQLite local; impact plus net en PostgreSQL (prod). Ajouter d’autres indexes si des filtres/ordres spécifiques sont fréquents.
