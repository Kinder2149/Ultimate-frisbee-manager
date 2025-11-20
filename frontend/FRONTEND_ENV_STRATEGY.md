# Stratégie Frontend pour l’API et les variables d’environnement

_Date : 2025-11-20_

Ce document décrit comment éviter de **hardcoder les URLs d’API** dans le frontend Angular et comment utiliser efficacement :

- les fichiers `environment.ts` / `environment.prod.ts`,
- les **variables d’environnement Vercel**,
- un éventuel **script de génération d’environnement** au build.

> Objectif : ne plus modifier le code Angular à chaque changement d’URL backend, tout en gardant un workflow simple et robuste.

---

## 1. Rappel de la situation actuelle

### 1.1. Environnements Angular

- `frontend/src/environments/environment.ts` (dev) :

  ```ts
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:3002/api',
    supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
    supabaseKey: 'sb_publishable_5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
  };
  ```

- `frontend/src/environments/environment.prod.ts` (prod) :

  ```ts
  export const environment = {
    production: true,
    apiUrl: 'https://ultimate-frisbee-manager-api.onrender.com/api',
    supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
    supabaseKey: 'sb_publishable_5C5PlWrOG7Krvpo6YEQZMg_rEEuKzVw'
  };
  ```

- Angular remplace `environment.ts` par `environment.prod.ts` lors d’un build `--configuration production` (utilisé par Vercel pour la prod).

### 1.2. Problème

- Chaque fois que l’URL de l’API backend change (nouveau domaine Render, staging, etc.), il faut **modifier et re-committer** `environment.prod.ts`.
- Vercel permet de définir des **variables d’environnement**, mais le code front actuel ne les exploite pas : tout est codé en dur dans `environment*.ts`.

---

## 2. Comment Vercel injecte les variables d’environnement

- Sur Vercel, tu peux définir des variables dans :
  - **Project Settings → Environment Variables**.
- Ces variables sont disponibles :
  - **au build** : via `process.env.MA_VAR` dans les scripts de build Node (ou dans la config Angular si on passe par un script intermédiaire),
  - éventuellement au runtime si l’app est serverless (ce qui n’est pas le cas ici : Angular est une app statique).
- Dans ton cas :
  - L’app Angular est buildée **côté serveur Vercel** puis servie comme **JS statique**.
  - Pour appliquer les variables Vercel, il faut les consommer **au moment du build**, par exemple dans un script Node qui génère `environment.prod.ts`.

---

## 3. Deux options possibles

### Option A – Discipline sur `environment*.ts` (sans script automate)

**Idée** :
- Continuer à utiliser `environment.ts` / `environment.prod.ts` comme aujourd’hui,
- mais documenter et discipliner leur mise à jour avec une **procédure claire + checklist**.

**Principe** :
- Dev local :
  - `environment.ts.apiUrl = 'http://localhost:3002/api'`.
- Prod :
  - `environment.prod.ts.apiUrl = 'https://ultimate-frisbee-manager-api.onrender.com/api'` (ou autre URL Render).
- À chaque changement d’URL backend, on modifie **uniquement** `environment.prod.ts` et éventuellement la doc associée (`frontend/.env.example`, `DEPLOYMENT.md`).

**Avantages** :
- Simple, sans nouvelle logique.
- Zero magie : l’URL est visible directement dans le code.

**Inconvénients** :
- Nécessite de **toucher le code** à chaque changement d’URL backend.
- Risque d’oubli si on ne suit pas la checklist (ex : changement d’URL Render non répercuté dans le front).

**Usage recommandé** :
- Si les changements d’URL backend sont rares.
- Si tu veux rester minimaliste et éviter la logique supplémentaire.

---

### Option B – Utiliser les env Vercel + génération d’`environment.prod.ts`

**Idée** :
- Les URLs d’API et paramètres sensibles (Supabase, etc.) sont définis dans **les variables d’environnement Vercel**.
- Un **script Node** est exécuté au moment du build pour générer `environment.prod.ts` à partir de ces env.
- Le code Angular ne contient plus de hardcode d’URL, seulement des placeholders générés.

**Principe** :
1. Dans Vercel → Project Settings → Environment Variables, définir :
   - `API_URL` (ex : `https://ultimate-frisbee-manager-api.onrender.com/api`),
   - `SUPABASE_URL`,
   - `SUPABASE_ANON_KEY`.
2. Ajouter un script Node dans le repo (par ex. `frontend/scripts/generate-environment.mjs`) qui :
   - lit `process.env.API_URL`, `process.env.SUPABASE_URL`, `process.env.SUPABASE_ANON_KEY`,
   - génère un fichier `frontend/src/environments/environment.prod.ts`.
3. Modifier la commande de build Vercel pour :
   - lancer d’abord le script de génération,
   - puis lancer `ng build --configuration production`.

**Avantages** :
- Changement d’URL backend = **changement uniquement dans Vercel**, pas dans le code.
- Plus aligné avec la philosophie "config via env".

**Inconvénients** :
- Ajoute une couche de complexité (script Node, ordre des commandes de build).
- Il faut être rigoureux :
  - si une env manque, le script doit planter proprement,
  - la gestion locale doit être pensée (dev local sans Vercel).

**Usage recommandé** :
- Si tu veux **centraliser la config prod dans Vercel** et minimiser les commits liés au changement d’URL.
- Si tu acceptes une légère augmentation de complexité build.

---

## 4. Détail de l’Option B – Script de génération (proposition)

> Cette section propose un script **prêt à coller**, mais il n’est PAS encore utilisé tant que tu ne modifies pas la commande de build.

### 4.1. Script Node : `frontend/scripts/generate-environment.mjs`

```js
// frontend/scripts/generate-environment.mjs
// Génère frontend/src/environments/environment.prod.ts à partir des env Vercel.

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[generate-environment] Variable d'environnement manquante : ${name}`);
  }
  return value;
}

function main() {
  const apiUrl = requireEnv('API_URL');
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const supabaseKey = requireEnv('SUPABASE_ANON_KEY');

  const targetPath = resolve(
    dirname(new URL(import.meta.url).pathname),
    '..',
    'src',
    'environments',
    'environment.prod.ts'
  );

  const content = `/**
 * Fichier généré automatiquement par scripts/generate-environment.mjs
 * Ne pas éditer à la main en production.
 */
export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
  supabaseUrl: '${supabaseUrl}',
  supabaseKey: '${supabaseKey}'
};
`;

  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, content, { encoding: 'utf8' });
  console.log(`[generate-environment] environment.prod.ts généré vers : ${targetPath}`);
}

main();
```

> Remarque : le chemin est calculé à partir du script; à adapter si besoin selon l’endroit exact où tu places le fichier.

### 4.2. Intégration côté Vercel (commande de build)

Dans le dashboard Vercel, pour le projet frontend :

- **Avant** (exemple) :
  - Build Command : `ng build --configuration production`
- **Après** (proposition) :
  - Build Command : `node frontend/scripts/generate-environment.mjs && ng build --configuration production`

Et définir dans **Environment Variables** :

- `API_URL` = `https://ultimate-frisbee-manager-api.onrender.com/api`
- `SUPABASE_URL` = `https://YOUR_REF.supabase.co`
- `SUPABASE_ANON_KEY` = `sb_publishable_YOUR_KEY`

### 4.3. Gestion du développement local

Pour le dev local, il y a deux possibilités :

1. **Conserver `environment.ts` tel quel**
   - `environment.ts.apiUrl = 'http://localhost:3002/api'` (hardcodé, mais local seulement).
   - On ne génère que `environment.prod.ts` via Vercel.

2. **Utiliser aussi un script local** (optionnel)
   - Tu peux définir `API_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` dans un `.env.local` et lancer :
     ```bash
     node frontend/scripts/generate-environment.mjs
     ng serve
     ```
   - Cette variante ajoute de la souplesse mais aussi un peu de complexité.

---

## 5. Patch/PR type (proposition, à ne pas appliquer automatiquement)

> Ce qui suit est un canevas de patch/PR si tu choisis d’implémenter l’Option B. **Aucun changement de code n’a été appliqué** pour l’instant.

### 5.1. Résumé de la PR proposée

- Ajouter `frontend/scripts/generate-environment.mjs`.
- Adapter la commande de build Vercel pour appeler ce script avant `ng build`.
- (Optionnel) Mettre à jour `frontend/.env.example` pour documenter les variables `API_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

### 5.2. Exemple de description de PR

```markdown
## Objet

Générer `environment.prod.ts` à partir des variables d'environnement Vercel pour éviter de hardcoder l'URL de l'API et les paramètres Supabase côté frontend.

## Changements

- Ajout de `frontend/scripts/generate-environment.mjs`.
- Utilisation de `process.env.API_URL`, `process.env.SUPABASE_URL`, `process.env.SUPABASE_ANON_KEY` pour générer `environment.prod.ts`.
- Mise à jour de la commande de build Vercel (documentation dans DEPLOYMENT.md).

## Check-list

- [ ] Variables Vercel définies :
  - [ ] `API_URL`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
- [ ] Build local avec génération testée (facultatif si script uniquement pour Vercel).
- [ ] DEPLOYMENT.md mis à jour (section frontend/env).
```

---

## 6. Recommandation

- **Court terme / simplicité** :
  - Option A est suffisante si tu acceptes de modifier `environment.prod.ts` à chaque changement d’URL backend.
  - Dans ce cas, la clé est d’avoir une **checklist** dans `DEPLOYMENT.md` pour ne pas oublier.

- **Moyen terme / flexibilité** :
  - Option B est plus adaptée si tu veux que tous les changements d’URL/API se fassent **dans Vercel**, sans commit de code.
  - Dans ce cas, la prochaine étape serait :
    - valider ensemble le script proposé,
    - l’ajouter au repo,
    - puis ajuster la commande de build Vercel.

Ce fichier sert de guide de décision. Tant que tu ne donnes pas ton accord, **aucun script ni patch de code n’est appliqué** dans le projet.```}
