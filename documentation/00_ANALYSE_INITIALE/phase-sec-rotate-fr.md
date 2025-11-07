Procédure de rotation des clés (Supabase, Cloudinary, JWT) — Branche: ops/rotate-20251105

1) Préparation
- Sauvegarder les envs actuels (captures d’écran ou export). Planifier une fenêtre de bascule (les JWT existants seront invalidés).
- Vérifier les accès: Vercel (frontend), Render (backend), Supabase, Cloudinary.

2) Supabase (anon/public key)
- Console: Supabase → Project Settings → API → Generate new anon/public key.
- Mettre à jour sur Vercel: SUPABASE_URL (si besoin), SUPABASE_ANON_KEY (Production + Preview).
- Redéployer le frontend.
- Validation:
  - curl -I https://<your-vercel-app>.vercel.app (build actif)
  - Naviguer sur l’app; vérifier que les appels Supabase renvoient 200.
- Rollback: réinjecter l’ancienne SUPABASE_ANON_KEY sur Vercel et redéployer.

3) Cloudinary
- Console: Cloudinary → Settings → Access Keys → Regenerate ou créer une nouvelle paire.
- Mettre à jour sur Render: CLOUDINARY_URL (ou triplet CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET).
- Redéployer le backend.
- Validation:
  - curl -i https://ultimate-frisbee-manager-api.onrender.com/api/health || curl -i https://ultimate-frisbee-manager-api.onrender.com/api/
  - Vérifier logs Render (aucune erreur Cloudinary).
- Rollback: remettre l’ancienne valeur sur Render et redéployer.

4) JWT (backend)
- Générer de nouveaux secrets forts (>= 32 bytes) pour JWT_SECRET et JWT_REFRESH_SECRET.
- Mettre à jour sur Render (Environment → Add Secret), redéployer le backend.
- Impact: invalidation des sessions existantes (401 sur anciens tokens).
- Validation:
  - curl -i https://ultimate-frisbee-manager-api.onrender.com/api/tags -H "Authorization: Bearer <OLD_TOKEN>" (doit 401)
  - Reconnexion côté front, puis réessayer (doit 200 sur routes protégées).
- Rollback: remettre temporairement les anciens secrets (si nécessaire) et planifier une nouvelle rotation.

5) Checklist finale
- [ ] Envs Vercel/Render mis à jour (Production + Preview si applicable)
- [ ] Front redéployé (Vercel) et back redéployé (Render)
- [ ] Tests curl et navigation manuelle passés
- [ ] Anciennes clés révoquées/archivées en lieu sûr
- [ ] DEPLOYMENT.md mis à jour pour refléter la politique de rotation et d’injection d’env
