CI/Envs Render & Vercel — Branche: ops/render/env

Objectif: s’assurer que les variables d’environnement requises sont bien définies sur Render (backend) et Vercel (frontend), et ajouter un contrôle CI pré-déploiement.

- Render (backend)
  - Présent: NODE_ENV=production, DATABASE_URL (managed), CORS_ORIGINS (CSV), JWT_SECRET (secret Render)
  - À ajouter: JWT_REFRESH_SECRET, CLOUDINARY_URL (ou triplet CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET)
  - Emplacement: Render → Service ultimate-frisbee-manager-api → Environment

- Vercel (frontend)
  - À ajouter: SUPABASE_URL, SUPABASE_ANON_KEY (clés publiques)
  - Emplacement: Vercel → Project (frontend) → Settings → Environment Variables (Production/Preview)

- Exemples de valeurs
  - CORS_ORIGINS: https://app.example.com,https://admin.example.com
  - CLOUDINARY_URL: cloudinary://<api_key>:<api_secret>@<cloud_name>

- Snippet GitHub Actions (pré-déploiement)
  - Fichier: .github/workflows/predeploy-env-check.yml
  - But: échouer la PR si une variable requise manque (backend ou frontend)

- Checklist d’acceptation
  - [ ] Render: toutes les variables présentes, backend démarre sans erreurs
  - [ ] Vercel: SUPABASE_* configurées, build frontend OK
  - [ ] CI: le job predeploy échoue si une variable requise est absente
