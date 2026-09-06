# BUGS CONNUS

| ID | Composant | Description | Priorité | Statut |
|---|---|---|---|---|
| B1 | ExerciceOptimizedService | Importait 3 services inexistants — le fichier `exercice-optimized.service.ts` n'existe plus du tout dans le code. `npm run build` confirmé propre (0 erreur, 2026-08-12). Deux résidus morts du nettoyage supprimés le même jour : `cache-stats.component.ts` (composant orphelin, import cassé vers `cache.service.ts` inexistant) et `entity-crud.service.spec.ts` (test orphelin, service testé déjà supprimé) | CRITIQUE | Résolu |
| B2 | admin/pages/stats | Vérifié fonctionnel : appel API réel vers `/api/admin/overview`, pas de mock | NORMALE | Résolu (n'était pas un bug) |
| B2b | admin/pages/activity | Shell vide confirmé, route `logs` non liée à aucun menu, aucun backend de logs d'activité. Composant et route supprimés le 2026-08-12 (décision : pas de valeur à garder une page fantôme sans backend) | NORMALE | Résolu (supprimé) |
| B3 | backend/.env.CLEAN (secrets) | **FUITE CRITIQUE** (repo public) : `SUPABASE_JWT_SECRET`, `CLOUDINARY_API_SECRET`, `DATABASE_URL`. Résolu le 2026-09-06 : (1) `git rm --cached` ; (2) rotation mot de passe PostgreSQL + secret Cloudinary ; (3) Supabase migré vers JWT Signing Keys (ES256) et backend passé en vérification **asymétrique JWKS uniquement** — l'acceptation HS256 supprimée, donc le secret JWT fuité ne permet plus de forger un token. Reste optionnel (non bloquant) : retirer la variable `SUPABASE_JWT_SECRET` (inutilisée) de Vercel, migrer le front vers la clé `publishable` puis révoquer la clé legacy, purge historique git. | CRITIQUE | Résolu (options mineures restantes) |
| B4 | frontend specs | 4 specs importaient des services inexistants → supprimés le 2026-09-06 (reste 5 specs sains) | NORMALE | Résolu |
| B5 | ExerciceService (doublon) | Doublon mort `features/exercices/services/exercice.service.ts` supprimé le 2026-09-06 (le vrai est dans `core/services/`) | NORMALE | Résolu |
