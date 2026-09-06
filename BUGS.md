# BUGS CONNUS

| ID | Composant | Description | Priorité | Statut |
|---|---|---|---|---|
| B1 | ExerciceOptimizedService | Importait 3 services inexistants — le fichier `exercice-optimized.service.ts` n'existe plus du tout dans le code. `npm run build` confirmé propre (0 erreur, 2026-08-12). Deux résidus morts du nettoyage supprimés le même jour : `cache-stats.component.ts` (composant orphelin, import cassé vers `cache.service.ts` inexistant) et `entity-crud.service.spec.ts` (test orphelin, service testé déjà supprimé) | CRITIQUE | Résolu |
| B2 | admin/pages/stats | Vérifié fonctionnel : appel API réel vers `/api/admin/overview`, pas de mock | NORMALE | Résolu (n'était pas un bug) |
| B2b | admin/pages/activity | Shell vide confirmé, route `logs` non liée à aucun menu, aucun backend de logs d'activité. Composant et route supprimés le 2026-08-12 (décision : pas de valeur à garder une page fantôme sans backend) | NORMALE | Résolu (supprimé) |
| B3 | backend/.env.CLEAN (secrets) | **FUITE CRITIQUE** : fichier suivi par git (historique + GitHub) contenant de vrais secrets — `SUPABASE_JWT_SECRET`, `CLOUDINARY_API_SECRET`, `DATABASE_URL`. Combiné à l'acceptation HS256 dans `auth.middleware.js` → forge de token ADMIN possible. Actions : (1) rotate tous les secrets, (2) `git rm --cached backend/.env.CLEAN`, (3) purge historique. Détail : `_archives/AUDIT_2026-09-06.md` | CRITIQUE | Ouvert |
| B4 | frontend specs | 4 fichiers `.spec` importent des services inexistants (`EntityCrudService`, `HttpGenericService`, `CacheService`) → `npm test` plante : `entrainement`, `exercice`, `echauffement`, `situationmatch` `.service.spec.ts` | NORMALE | Ouvert |
| B5 | ExerciceService (doublon) | Deux `exercice.service.ts` : `core/services/` (utilisé) et `features/exercices/services/` (mort, référencé par un seul spec). Supprimer le doublon | NORMALE | Ouvert |
