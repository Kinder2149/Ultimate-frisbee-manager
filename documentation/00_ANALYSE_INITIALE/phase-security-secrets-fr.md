Synthèse sécurité & secrets (process strict)

- Fuites détectées (valeurs masquées):
  - SEC-LEAK-0001: frontend/src/environments/environment.ts (l7–8) supabaseUrl=<REDACTED>, supabaseKey=<REDACTED>.
  - SEC-LEAK-0002: frontend/src/environments/environment.prod.ts (l7–8) supabaseUrl=<REDACTED>, supabaseKey=<REDACTED>.
  - SEC-LEAK-0003: backend/.env (l11–13) CLOUDINARY_*=<REDACTED>; (l15, l17) JWT_SECRET/JWT_REFRESH_SECRET=<REDACTED>; (l4) DATABASE_URL=<REDACTED>.
  - SEC-LEAK-0007: backend/.env.test (l3) DATABASE_URL=<REDACTED>; (l6, l8) JWT_*=<REDACTED>.
  - SEC-LEAK-0010 (prone): backend/config/index.js secrets par défaut (jwt.secret/refreshSecret) si env absents.

- Gravité & urgences:
  - Haute: clés Supabase (même anon), secrets Cloudinary, JWT. Action immédiate: rotation + retrait du dépôt + purge de l’historique Git.
  - Moyenne: valeurs par défaut des secrets dans le code → interdire le démarrage sans variables de secrets en prod.

- CORS (recommandation stricte):
```js
const origins = (process.env.CORS_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // outillage local
    return origins.length === 0 || origins.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
```

- Remédiations (commandes PowerShell/CLI):
  - Supabase (rotate + purge):
    - Regénérer la clé dans Supabase (Project Settings → API).
    - Purge ciblée (après sauvegarde du repo):
```
pip install git-filter-repo
# Retirer les fichiers des historiques
git filter-repo --path frontend/src/environments/environment.ts --invert-paths --force
git filter-repo --path frontend/src/environments/environment.prod.ts --invert-paths --force
```
  - Cloudinary & JWT dans .env:
```
# Arrêter de tracker et purger
Add-Content .gitignore "backend/.env`nbackend/.env.test"
git rm --cached backend/.env backend/.env.test
git commit -m "chore(security): stop tracking env files"
pip install git-filter-repo
git filter-repo --path backend/.env --invert-paths --force
git filter-repo --path backend/.env.test --invert-paths --force
```
  - Secrets Render:
    - Définir/rotater JWT_SECRET, JWT_REFRESH_SECRET, CLOUDINARY_URL (ou triplet), DATABASE_URL via dashboard Render.
  - Code: supprimer les valeurs par défaut des secrets (backend/config/index.js) et faire échouer le démarrage si absents en prod.

- Bonnes pratiques complémentaires:
  - Déplacer SUPABASE_URL/SUPABASE_ANON_KEY en variables d’env Vercel (ne pas committer les valeurs); recompiler et déployer.
  - Documenter la politique de secrets/rotation dans DEPLOYMENT.md et ajouter un check CI (secret scanning, audit modéré).

- Checklist immédiate:
  - [ ] Rotater Supabase anon key + Cloudinary + JWT.
  - [ ] Purger l’historique Git des fichiers listés.
  - [ ] Brancher CORS sur CORS_ORIGINS (whitelist) et déployer.
  - [ ] Supprimer defaults de secrets dans le code et forcer présence en prod.
  - [ ] Déplacer les valeurs vers Vercel/Render (vars d’env) et retirer du repo.
