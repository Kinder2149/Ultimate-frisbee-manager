# Usage des environnements Frontend

Ce document explique comment le frontend Angular utilise les environnements et les variables associées.

---

## 1. Fichiers d’environnement Angular

- `src/environments/environment.ts`  
  Utilisé en **développement local** (`ng serve`).
  - `production = false`
  - `apiUrl = 'http://localhost:3002/api'`
  - `supabaseUrl`, `supabaseKey` (clé publishable)

- `src/environments/environment.prod.ts`  
  Utilisé pour les **builds de production** (`ng build --configuration production` → Vercel).
  - `production = true`
  - `apiUrl = 'https://ultimate-frisbee-manager-api.onrender.com/api'`
  - `supabaseUrl`, `supabaseKey`

> **Règle stricte :**  
> Il est **interdit de modifier `environment.prod.ts` pour adapter la dev local**.  
> Pour le dev local, seul `environment.ts` peut être ajusté si nécessaire.

---

## 2. Fichier `frontend/.env.example`

Ce fichier ne sert pas directement au runtime Angular.  
Il documente les valeurs attendues pour :

- `NG_APP_API_URL_DEV` / `NG_APP_API_URL_PROD`
- `NG_APP_SUPABASE_URL_*` / `NG_APP_SUPABASE_KEY_*`

Objectif :

- garder une référence claire des URLs/API utilisées côté front,
- préparer la migration vers des variables d’environnement Vercel (Sprint 2).

---

## 3. Comment lancer le frontend en local

1. Assurer que le backend tourne sur `http://localhost:3002` (voir doc backend).
2. Vérifier `src/environments/environment.ts` :

   ```ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3002/api',
     supabaseUrl: 'https://YOUR_REF.supabase.co',
     supabaseKey: 'sb_publishable_YOUR_KEY'
   };
   ```

3. Lancer le frontend :

   ```bash
   npm start --prefix frontend
   ```

4. Ouvrir `http://localhost:4200`.

> **Important :** aucun changement de `environment.prod.ts` n’est nécessaire pour tester en local.

---

## 4. Préparation pour les runtime-env (Sprint 2)

Actuellement :

- les URLs d’API et de Supabase sont définies **en dur** dans `environment*.ts`.
- Vercel ne fournit pas encore ces valeurs via des variables d’environnement.

Pour Sprint 2, l’objectif sera :

- de définir dans Vercel des variables comme :
  - `API_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- et d’introduire un mécanisme (script de génération ou autre) pour construire `environment.prod.ts` à partir de ces env, **sans** changer les règles de dev local.

Ce document sera alors complété avec les étapes exactes de cette migration.
