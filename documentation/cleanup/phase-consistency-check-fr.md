# Vérification de cohérence — Rapport synthèse

- tsconfig
  - frontend/tsconfig.json: alias `@shared/* -> ../../shared/*` encore présent. Contexte: migration vers package workspace `@ufm/shared` réalisée.
    - Reco: supprimer l’alias `@shared/*` ou le faire pointer vers `node_modules/@ufm/shared/*` si vous souhaitez conserver un alias.
  - shared/tsconfig.json: OK (declaration: true, outDir/rootDir=constants).
  - backend: pas de tsconfig (projet JS), cohérent.

- Packages
  - Racine: workspaces configurés ["frontend","backend","shared"].
  - Frontend: dépendance `@ufm/shared": "workspace:*"` présente.
  - Backend: dépendance `@ufm/shared": "workspace:*"` présente.
  - Reco: exécuter `npm i` à la racine puis `npm run -w shared build` pour générer les d.ts/js avant build front/back.

- Alias/imports partagés
  - Import résiduel trouvé: `frontend/src/app/core/models/tag.model.ts` → `import { TAG_CATEGORIES } from "@shared/constants/tag-categories";`
    - Reco: remplacer par `@ufm/shared/constants/tag-categories`.
  - Le reste des imports migrés vers `@ufm/shared` est OK.

- Environnements & secrets
  - frontend/src/environments/environment(.prod).ts: valeurs Supabase redacted `<REDACTED>` (OK). Reco: fournir via Vercel (SUPABASE_URL, SUPABASE_ANON_KEY).
  - backend/.env: contient des secrets (DATABASE_URL, CLOUDINARY_*, JWT_*). OK en local (fichier ignoré par Git). En prod: secrets à définir dans Render.

## Commandes de vérification
- `Select-String -Path .\frontend\src\**\*.ts -Pattern '@shared/' -List`
- `Select-String -Path .\frontend\tsconfig.json -Pattern '"@shared/*"' -List`
- `Select-String -Path .\frontend\src\environments\environment*.ts -Pattern 'supabase' -List`
- `Select-String -Path .\backend\package.json -Pattern '@ufm/shared'`
- `Select-String -Path .\frontend\package.json -Pattern '@ufm/shared'`

## Prochaines actions
- Remplacer l’import résiduel `@shared` dans `frontend/src/app/core/models/tag.model.ts`.
- Optionnel: retirer l’alias `@shared/*` de `frontend/tsconfig.json` (ou le recâbler vers `@ufm/shared`).
- Vérifier la build front après `npm i` et `npm run -w shared build`.
