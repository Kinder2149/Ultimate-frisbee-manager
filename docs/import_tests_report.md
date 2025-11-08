# Rapport de tests – Import UFM (V1 local-first)

- Date: 2025-11-07
- Branche: feature/export-import-service

## Scénarios testés

- Export/Import Entrainement (tags legacy → mapping auto):
  - Fichier: entrainement_basic.ufm.json
  - Résultat: success=true, insertedIds=[{type:'entrainement',id:'<auto>'}]
  - Conflicts: unknownFields=[], missingFields=[], tagMismatches=[échauffement→warmup]

- Export/Import Exercice (tag "défense"):
  - Fichier: exercice_defense.ufm.json
  - Résultat: success=true, insertedIds=[{type:'exercice',id:'<auto>'}]
  - Conflicts: tagMismatches=[défense→defense]

- Import non-interactif (legacy non mappé):
  - Fichier: exercice_legacy_tag.ufm.json
  - Résultat: success=true, insertedIds=[{type:'exercice',id:'<auto>'}]
  - Conflicts: tagMismatches=["customTag"→legacy:customTag]

- Import avec champ critique manquant (nom):
  - Fichier: entrainement_missing_nom.ufm.json
  - Résultat: success=false, message="Champs requis manquants: nom"
  - Conflicts: [{field:'nom', issue:'missing'}]

## Observations
- Le validateur détecte correctement les champs inconnus et les tags hérités.
- Les logs sont téléchargés si des conflits sont présents.
- Le mapping interactif fonctionne via la boîte de dialogue (MatDialog).

## Recommandations
- Étendre la validation des schémas `data` (ex: structure de `elements`).
- Ajouter des tests e2e pour le flux UI `/debug/export-import`.
