# CONTRIBUTING — Documentation

## Objectif
Ce guide définit les règles de contribution à la documentation du projet.

## Dossiers

- `docs/reference/` : documents contractuels (spécifications validées). Modification = nouvelle version.
- `docs/work/` : documents de travail (brouillons, audits, analyses).
- `docs/history/` : archive (lecture seule).
- `docs/_meta/` : index et règles documentaires.

## Règles

- Créer tout nouveau document dans `docs/work/`.
- Ne pas ajouter de documents temporaires dans `docs/reference/`.
- Avant de promouvoir un document en `reference/`:
  - revue technique obligatoire
  - en-tête clair (statut, version, date)
  - absence de redondance

## Archivage

- Tout document obsolète doit être déplacé dans `docs/history/`.
- Ajouter une preuve d’archivage (fichier `_ARCHIVED_YYYY-MM-DD.txt` dans le dossier concerné).
