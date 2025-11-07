Verrouillage CORS via whitelist (CORS_ORIGINS) — Branche: feat/security/cors-whitelist

- Emplacement modifié: backend/app.js
- Changement: remplacement de app.use(cors()) par une whitelist basée sur `CORS_ORIGINS` (CSV) avec `credentials: true`.

Exemple d’environnement (Render):
- CORS_ORIGINS=https://app.example.com,https://admin.example.com

Tests (depuis un poste ops):
- Origine autorisée:
  curl -i https://ultimate-frisbee-manager-api.onrender.com/api/health -H "Origin: https://app.example.com" -H "Accept: application/json"
- Origine bloquée:
  curl -i https://ultimate-frisbee-manager-api.onrender.com/api/health -H "Origin: https://evil.example" -H "Accept: application/json"

Attendus:
- Origin autorisée: 200 + en-têtes CORS présents.
- Origin non listée: erreur CORS côté navigateur (en curl, pas d’en-têtes CORS; la requête peut retourner 200/4xx mais sera bloquée par le navigateur).

Déploiement:
- Définir `CORS_ORIGINS` sur Render (prod) + éventuels environnements de prévisualisation.
- Redéployer le backend, puis vérifier via curl et via l’app frontend.
