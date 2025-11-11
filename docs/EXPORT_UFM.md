# Export UFM

## Objectif
Standardiser l’export des entités UFM (exercices, entrainements, échauffements, situations) dans un format JSON versionné, testable en local et en CI.

## Endpoints utilisés
- Authentification: POST /api/auth/login
- Listes admin par type (protégées):
  - GET /api/admin/list-exercices
  - GET /api/admin/list-entrainements
  - GET /api/admin/list-echauffements
  - GET /api/admin/list-situations-matchs
- Export générique: GET /api/admin/export-ufm?type=exercice|entrainement|echauffement|situation&id=<uuid>

## Script d’export
- Fichier: backend/scripts/export-ufm.js
- Comportements clés:
  - Map pluriel→singulier: exercices→exercice, entrainements→entrainement, echauffements→echauffement, situations-matchs→situation
  - Login automatique si --token absent (via --email/--password)
  - Retry sur les appels réseau (3 tentatives par défaut)
  - Génération des fichiers dans backend/exports

### Arguments
- --baseUrl=http://localhost:3002 (obligatoire)
- --token=<JWT> ou --email=<admin> --password=<pwd>
- --outDir=backend/exports (optionnel)
- --dryRun (mode simulation)
- --retry=3 (optionnel)

## Commandes
1. Seed (crée admin/tags et seed minimal 1 élément par type)
```
npm run db:deploy --prefix backend
npx prisma db seed --prefix backend
```
2. Export (simulation puis réel)
```
npm run export:dryrun --prefix backend
npm run export:run --prefix backend
```
3. Vérifier les fichiers
```
dir backend/exports
```

## Formats JSON (extraits)

### Exercice
```json
{
  "version": "1.0",
  "type": "exercice",
  "data": {
    "id": "<uuid>",
    "nom": "...",
    "description": "...",
    "imageUrl": null,
    "schemaUrl": null,
    "materiel": null,
    "notes": null,
    "critereReussite": null,
    "variablesPlus": "",
    "variablesMinus": "",
    "tags": [{"id":"<uuid>","label":"...","category":"...","level":null}]
  }
}
```

### Échauffement
```json
{
  "version": "1.0",
  "type": "echauffement",
  "data": {
    "id": "<uuid>",
    "nom": "...",
    "description": "...",
    "imageUrl": null,
    "blocs": [{"ordre":1,"titre":"...","repetitions":"...","temps":"...","informations":"...","fonctionnement":null,"notes":null}]
  }
}
```

### Situation
```json
{
  "version": "1.0",
  "type": "situation",
  "data": {
    "id": "<uuid>",
    "nom": "...",
    "type": "offensif|defensif|mixte",
    "description": "...",
    "temps": null,
    "imageUrl": null,
    "tags": [{"id":"<uuid>","label":"...","category":"...","level":null}]
  }
}
```

### Entrainement (format enrichi)
```json
{
  "version": "1.0",
  "type": "entrainement",
  "data": {
    "id": "<uuid>",
    "titre": "...",
    "date": "ISO",
    "imageUrl": null,
    "tags": [],
    "echauffement": { "id": "<uuid>", "nom": "...", "blocs": [...] },
    "situationMatch": { "id": "<uuid>", "nom": "...", "tags": [...] },
    "exercices": [
      { "ordre": 1, "duree": 10, "notes": null, "exercice": { "id": "<uuid>", "nom": "...", "tags": [...] } }
    ]
  }
}
```

Remarque: Si un parser strict le nécessite, on peut ajouter en V2 `echauffementId` et `situationMatchId` en plus des objets complets.

## Pré-requis
- backend/package.json contient "type": "module"
- Prisma seed configuré pour exécuter prisma/seed.js puis prisma/seed-minimal-content.js
- Variables d’environnement pour export: API, ADMIN_EMAIL, ADMIN_PASSWORD ou TOKEN

## Dépannage
- fetch failed / erreurs 5xx: le script réessaie automatiquement (3 tentatives). Relancer si échec persiste.
- Auth KO: vérifier ADMIN_EMAIL / ADMIN_PASSWORD, permissions (rôle ADMIN).
- Fichiers absents: vérifier les logs et le dossier backend/exports.
