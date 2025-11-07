Activation des workspaces npm et création du package @ufm/shared — Branche: chore/workspaces/shared

- Modifications réalisées:
  - package.json (racine): ajout de "workspaces": ["frontend","backend","shared"].
  - backend/package.json: remplacement de la dépendance locale "file:.." par "@ufm/shared": "workspace:*".
  - frontend/package.json: ajout de "@ufm/shared": "workspace:*" dans dependencies.
  - shared/package.json: créé (name=@ufm/shared, main/types sur constants/tag-categories, scripts build/clean).
  - Frontend: imports migrés de `@shared/constants/tag-categories` vers `@ufm/shared/constants/tag-categories` dans 4 fichiers.

- Commandes de migration (à exécuter à la racine):
  1) Installation et build du package partagé
     - npm i
     - npm run -w shared build
  2) Vérification build front/back
     - npm --prefix frontend run build
     - npm --prefix backend run test (optionnel)

- Notes:
  - Les erreurs TS "Cannot find module '@ufm/shared'" disparaîtront après `npm i` (workspaces) et `npm run -w shared build`.
  - L’alias `@shared/*` du frontend peut être supprimé plus tard; il n’est plus utilisé par les imports migrés.

- Critères d’acceptation:
  - `npm i` à la racine réussit et crée le lien workspace du package `@ufm/shared`.
  - Le frontend et le backend compilent sans erreur d’import.
  - Plus aucune dépendance `file:..` dans les package.json.
