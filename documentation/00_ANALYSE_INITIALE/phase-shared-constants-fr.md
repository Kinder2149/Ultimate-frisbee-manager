Le dossier shared/ centralise des constantes partagées (catégories de tags) utilisées par le frontend via l’alias `@shared/*`. On y trouve `TAG_CATEGORIES`, `TagCategory`, `TAG_CATEGORY_LABELS`, `DEFAULT_TAG_COLORS`, `NIVEAU_LABELS`, et des helpers de validation (`isValidCategory`, `isValidLevel`). Ce contenu est stable, sans secrets, et pertinent pour un re-packaging.

Proposition: transformer `shared/` en package versionné `@ufm/shared` dans un workspace. Bénéfices: versioning explicite, suppression des liens fragiles (`file:..`), meilleure réutilisabilité (backend et frontend), CI/CD plus fiable. Arborescence cible: `shared/src/**` pour les sources, `shared/dist/**` pour le build, avec un `package.json` déclarant `main`/`types` et un script `build` (tsc). Ajouter `workspaces` dans le `package.json` racine et dépendre de `@ufm/shared@workspace:*` depuis `frontend` et `backend`.

Exemple minimal (à adapter):
- package.json (root):
```json
{
  "private": true,
  "workspaces": ["backend", "frontend", "shared"]
}
```
- shared/package.json:
```json
{
  "name": "@ufm/shared",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "clean": "rimraf dist"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "rimraf": "^5.0.5"
  }
}
```
- shared/tsconfig.build.json:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "module": "ES2022",
    "target": "ES2022",
    "moduleResolution": "node"
  },
  "include": ["src/**/*"]
}
```
- Commandes migration (npm):
```
# activer workspaces
npm pkg set workspaces='["backend","frontend","shared"]'
# initialiser le package shared
cd shared && npm init -y && npm i -D typescript rimraf && npm run build
# ajouter la dépendance workspace dans les apps
npm i -w frontend @ufm/shared@workspace:*
npm i -w backend @ufm/shared@workspace:*
```

Ces étapes permettront d’éliminer la dépendance locale `file:..` du backend et d’unifier l’utilisation des constantes entre projets, avec un contrôle de versions. 