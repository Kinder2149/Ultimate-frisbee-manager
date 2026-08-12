# BUGS CONNUS

| ID | Composant | Description | Priorité | Statut |
|---|---|---|---|---|
| B1 | ExerciceOptimizedService | Importait 3 services inexistants — le fichier `exercice-optimized.service.ts` n'existe plus du tout dans le code. `npm run build` confirmé propre (0 erreur, 2026-08-12). Deux résidus morts du nettoyage supprimés le même jour : `cache-stats.component.ts` (composant orphelin, import cassé vers `cache.service.ts` inexistant) et `entity-crud.service.spec.ts` (test orphelin, service testé déjà supprimé) | CRITIQUE | Résolu |
| B2 | admin/pages/stats | Vérifié fonctionnel : appel API réel vers `/api/admin/overview`, pas de mock | NORMALE | Résolu (n'était pas un bug) |
| B2b | admin/pages/activity | Shell vide confirmé, route `logs` non liée à aucun menu, aucun backend de logs d'activité. Composant et route supprimés le 2026-08-12 (décision : pas de valeur à garder une page fantôme sans backend) | NORMALE | Résolu (supprimé) |
