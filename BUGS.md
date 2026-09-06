# BUGS CONNUS

| ID | Composant | Description | Priorité | Statut |
|---|---|---|---|---|
| B1 | ExerciceOptimizedService | Importait 3 services inexistants — le fichier `exercice-optimized.service.ts` n'existe plus du tout dans le code. `npm run build` confirmé propre (0 erreur, 2026-08-12). Deux résidus morts du nettoyage supprimés le même jour : `cache-stats.component.ts` (composant orphelin, import cassé vers `cache.service.ts` inexistant) et `entity-crud.service.spec.ts` (test orphelin, service testé déjà supprimé) | CRITIQUE | Résolu |
| B2 | admin/pages/stats | Vérifié fonctionnel : appel API réel vers `/api/admin/overview`, pas de mock | NORMALE | Résolu (n'était pas un bug) |
| B2b | admin/pages/activity | Shell vide confirmé, route `logs` non liée à aucun menu, aucun backend de logs d'activité. Composant et route supprimés le 2026-08-12 (décision : pas de valeur à garder une page fantôme sans backend) | NORMALE | Résolu (supprimé) |
| B3 | backend/.env.CLEAN (secrets) | **FUITE CRITIQUE** : fichier suivi par git (historique + GitHub) contenant de vrais secrets — `SUPABASE_JWT_SECRET`, `CLOUDINARY_API_SECRET`, `DATABASE_URL`. Combiné à l'acceptation HS256 dans `auth.middleware.js` → forge de token ADMIN possible. FAIT le 2026-09-06 : `git rm --cached`. **RESTE (pilote) : rotation des secrets** dans les dashboards — tant que non fait, les valeurs de l'historique restent valides. | CRITIQUE | Ouvert (rotation pilote requise) |
| B4 | frontend specs | 4 specs importaient des services inexistants → supprimés le 2026-09-06 (reste 5 specs sains) | NORMALE | Résolu |
| B5 | ExerciceService (doublon) | Doublon mort `features/exercices/services/exercice.service.ts` supprimé le 2026-09-06 (le vrai est dans `core/services/`) | NORMALE | Résolu |
