# Suite de tests HTTP (VSCode REST Client)

Prérequis:
- Installer l’extension VSCode "REST Client" (humao.rest-client)
- Ouvrir le fichier `http-client.env.json` à la racine du repo et remplir:
  - API: URL de l’API (ex: http://localhost:3002)
  - TOKEN: Jeton Supabase (Bearer)
  - WS: WorkspaceId valide lié à l’utilisateur

Utilisation:
- Ouvrir un fichier `.http` dans `tests/http/`
- En haut à droite de l’éditeur, choisir l’environnement (dev/prod)
- Cliquer sur "Send Request" pour exécuter la requête

Ordre recommandé:
1. 01-health.http
2. 02-auth.http
3. 03-workspaces.http (récupérer un WS et mettre à jour WS dans env si besoin)
4. 10-tags.http (créer tags nécessaires)
5. 20-exercices.http (création exige 1 tag objectif et ≥1 tag travail_specifique)
6. 30-echauffements.http
7. 40-situations.http
8. 50-entrainements.http
9. 60-dashboard.http
10. 70-import.http (ADMIN selon `ALLOW_PUBLIC_IMPORT`)
11. 80-admin.http (ADMIN)

Notes:
- En production, `/api/debug` est désactivé (404 intentionnel).
- Pour autoriser les imports non-admin en dev, définir `ALLOW_PUBLIC_IMPORT=true` côté API.
