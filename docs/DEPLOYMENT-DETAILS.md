# DEPLOYMENT-DETAILS

Ce document décrit en détail le déploiement Front/Back, variables d’environnement et CI.

## Backend — Render
- Service: ultimate-frisbee-manager-api
- Build: `cd backend && npm install && npm run deploy:render`
- Start: `cd backend && npm start`
- Envs requis:
  - `NODE_ENV=production`
  - `DATABASE_URL` (Render managed DB)
  - `CORS_ORIGINS` (CSV, whitelist)
  - `JWT_SECRET` (secret Render)
  - `JWT_REFRESH_SECRET` (secret Render)
  - `CLOUDINARY_URL` (ou triplet: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- Sécurité:
  - Démarrage interdit si JWT secrets manquants (prod)
  - CORS strict (`credentials: true`)
  - Logging HTTP avec redaction (Authorization/Cookie)

## Frontend — Vercel
- Root: `frontend`
- Preset: Angular
- Build: `ng build --configuration production`
- Envs requis:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

## CORS
- Exemple: `CORS_ORIGINS=https://app.example.com,https://admin.example.com`
- Code appliqué (backend/app.js): callback origin, whitelist CSV, `credentials: true`.

## CI — Predeploy check
- Ajouter `.github/workflows/predeploy-env-check.yml` pour vérifier la présence des envs (voir phase-ci-env-technical.json pour le snippet exact).

## Post-déploiement
- Tester `/api/health` et la navigation front.
- Vérifier les logs Render et analytics Vercel.

## Références
- DEPLOYMENT.md (guide utilisateur)
- documentation/00_ANALYSE_INITIALE/phase-ci-env-technical.json
