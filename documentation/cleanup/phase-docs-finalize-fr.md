# Rapport — Finalisation documentation

- Actions
  - Archivé les doublons:
    - docs/TAGS_SYSTEM.md → documentation/archive/removed/TAGS_SYSTEM.md (doublon de tags-documentation.md)
    - docs/MIGRATION_GUIDE.md → documentation/archive/removed/MIGRATION_GUIDE.md (doublon de MIGRATION.md)
  - Mis à jour docs/index.md (suppression lien cassé vers frontend-tests-guide.md)
  - Mis à jour README.md (instructions install: build shared + install backend/frontend, précisions Supabase)
  - Mis à jour DEPLOYMENT.md (section variables Supabase sur Vercel)
  - Nettoyé dépendances erronées `"ultimate-frisbee-manager": "file:.."` dans backend/frontend package.json

- Conserve
  - docs/tags-documentation.md, docs/MIGRATION.md, docs/ARCHITECTURE.md, docs/DEPLOYMENT-DETAILS.md
  - docs/api-endpoints.md, docs/api-tests-guide.md, docs/openapi-specification.yaml
  - docs/code-quality-recommendations.md, docs/entity-crud-pattern.md, docs/shared-components-guide.md, docs/index.md

- À faire (optionnel)
  - Ajouter un court README dans documentation/archive/removed/ pour décrire la politique d’archivage.
  - Vérifier régulièrement les liens internes avec un script de lint de docs.
