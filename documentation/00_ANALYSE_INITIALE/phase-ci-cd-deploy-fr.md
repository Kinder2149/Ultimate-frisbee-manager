Frontend: Vercel (preset Angular) déploie à partir de `frontend/` via `@vercel/angular`, avec routing SPA (/(.*)→/index.html). Backend: Render Web Service (Node 20) construit via `cd backend && npm install && npm run deploy:render` et démarre `cd backend && npm start`; base PostgreSQL provisionnée par Render. Les variables d’environnement critiques incluent `DATABASE_URL`, `CORS_ORIGINS`, `JWT_SECRET` (et `JWT_REFRESH_SECRET`), ainsi que Cloudinary (`CLOUDINARY_URL` ou triplet CLOUDINARY_*). Côté frontend (Vercel), injecter `API_URL`, `SUPABASE_URL` et `SUPABASE_ANON_KEY` sans commit des valeurs.

Findings:
- Alignement doc/config: `render.yaml` utilise `deploy:render` (non détaillé dans la doc). Mettre à jour DEPLOYMENT.md avec les commandes réelles.
- Cloudinary manquant dans `render.yaml`: ajouter `CLOUDINARY_URL` ou le triplet.
- Secrets JWT Refresh absents: ajouter `JWT_REFRESH_SECRET` (+ durées optionnelles).
- Doc env.prod.ts partielle vs code: la doc ne mentionne pas Supabase alors que le code l’utilise; déplacer ces valeurs en env Vercel.
- CORS: maintenir une whitelist précise et brancher `cors()` sur `CORS_ORIGINS`.

CI recommandée (GitHub Actions) — lint/test/build: 
- Backend job: Node 20, `npm ci`, `npx prisma generate`, `npm test`, build optionnel.
- Frontend job: Node 20, `npm ci`, `npm run lint`, `npm run build`.
Déploiement: laisser Render/Vercel déployer sur push `main`; prévoir rotation immédiate des clés Supabase exposées et migration vers variables d’env.

Checklist déploiement:
- [ ] Secrets Render: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_URL` (ou triplet), `CORS_ORIGINS`.
- [ ] Env Vercel: `API_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- [ ] DEPLOYMENT.md aligné avec `render.yaml` (build/start) et envs front.
- [ ] CI GitHub: jobs backend+frontend (lint/test/build).
- [ ] Rotation des clés exposées et retrait des valeurs du repo.
