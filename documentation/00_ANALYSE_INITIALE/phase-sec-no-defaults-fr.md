Suppression des valeurs par défaut de secrets JWT et échec en production si absents — Branche: fix/security/jwt-config

- Emplacement modifié: backend/config/index.js
- Changement: retrait des defaults pour `JWT_SECRET` et `JWT_REFRESH_SECRET` et ajout d’un contrôle bloquant en production (process.exit(1) si manquants). En développement, un avertissement est loggé.

Pourquoi:
- Éviter tout démarrage avec des secrets faibles/figés en code, empêcher des tokens forgés.

Tests proposés:
- Production (doit échouer si secrets absents):
  $env:NODE_ENV='production'; node backend/server.js; echo $LASTEXITCODE; $env:NODE_ENV=''
- Développement (doit seulement alerter):
  $env:NODE_ENV='development'; node backend/server.js

Pré-requis déploiement:
- Définir `JWT_SECRET` et `JWT_REFRESH_SECRET` sur Render avant déploiement.
- Mettre à jour DEPLOYMENT.md pour documenter cette exigence.
