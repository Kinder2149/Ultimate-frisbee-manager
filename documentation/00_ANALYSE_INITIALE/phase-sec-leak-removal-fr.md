Cette tâche retire les secrets exposés et prépare la purge d’historique.

- Fuites traitées (valeurs masquées):
  - SEC-LEAK-0001/0002: frontend/src/environments/environment*.ts → `supabaseUrl`/`supabaseKey` redacts `<REDACTED>`.
- Fichiers `.env` (backend/.env, backend/.env.test) déjà ignorés par `.gitignore`, mais doivent être retirés de l’index git et purgés de l’historique.

Actions urgentes:
- Arrêter le tracking des fichiers sensibles: `git rm --cached backend/.env backend/.env.test` puis commit.
- Purge ciblée de l’historique (git-filter-repo) sur `frontend/src/environments/environment.ts`, `frontend/src/environments/environment.prod.ts`, `backend/.env`, `backend/.env.test`.
- Rotation des clés (Supabase anon, Cloudinary, JWT) et déplacement vers Vercel/Render (variables d’env).
- Vérifier qu’aucune valeur sensible ne subsiste: `Select-String -Path .\ -Pattern "SUPABASE|JWT_SECRET|CLOUDINARY|DATABASE_URL" -List`.

Acceptation:
- `git ls-files` ne liste plus de fichiers secrets; `.env*` non trackés; environments redacts; procédures de purge et de backup documentées.
