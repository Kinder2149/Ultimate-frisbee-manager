# BUGS CONNUS

| ID | Composant | Description | Priorité | Statut |
|---|---|---|---|---|
| B1 | ExerciceOptimizedService | Importait 3 services inexistants — le fichier `exercice-optimized.service.ts` n'existe plus du tout dans le code. `npm run build` confirmé propre (0 erreur, 2026-08-12). Deux résidus morts du nettoyage supprimés le même jour : `cache-stats.component.ts` (composant orphelin, import cassé vers `cache.service.ts` inexistant) et `entity-crud.service.spec.ts` (test orphelin, service testé déjà supprimé) | CRITIQUE | Résolu |
| B2 | admin/pages/activity et stats | Composants présents dans le routing admin mais sans données réelles — UI shell vide affiché aux utilisateurs | NORMALE | Ouvert (à re-tester, non vérifié dans l'audit du 2026-08-06) |
