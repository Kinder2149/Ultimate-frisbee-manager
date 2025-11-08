# API Import/Export — Ultimate Frisbee Manager

Cette documentation formalise les endpoints et le format standard `.ufm.json` pour l’échange d’entités.

---

## Endpoints disponibles

### Import
- POST `/api/import/markdown?dryRun=true|false`
  - Body: `{ files: Array<{ name?: string, content: string }> }`
  - Effet: parse Markdown → exercices. `dryRun=true` simule, `false` applique (tags upsert, exercices create/update).
- POST `/api/import/exercices?dryRun=true|false`
  - Body: `{ exercices: Array<ExerciceInput> }`
  - Effet: import d’exercices structurés JSON.

Auth: JWT requis (`authenticateToken`).

### Export
- GET `/api/admin/export-ufm?type=exercice|entrainement|echauffement|situation&id=UUID`
  - Headers: `Content-Type: application/json`, `Content-Disposition: attachment; filename="{type}-{id}.ufm.json"`
  - Auth: JWT + rôle admin (`authenticateToken` + `requireAdmin`).

---

## Format `.ufm.json`

Format générique:
```json
{
  "version": "1.0",
  "type": "exercice | entrainement | echauffement | situation",
  "data": { /* selon type */ }
}
```

### Exercice
Champs:
- Requis: `id`, `nom`, `description`
- Optionnels: `imageUrl`, `schemaUrl`, `materiel`, `notes`, `critereReussite`, `variablesPlus`, `variablesMinus`, `tags[]`
- `tags[]`: `{ id?, label, category, level? }`

Exemple:
```json
{
  "version": "1.0",
  "type": "exercice",
  "data": {
    "id": "<uuid>",
    "nom": "Passe à 3",
    "description": "Travail de passes en triangle",
    "variablesPlus": "[]",
    "variablesMinus": "[]",
    "tags": [ { "label": "10min", "category": "temps" } ]
  }
}
```

### Entrainement
Champs:
- Requis: `id`, `titre`
- Optionnels: `date`, `imageUrl`, `tags[]`, `echauffement`, `situationMatch`, `exercices[]`
- `exercices[]`: `{ ordre, duree?, notes?, exercice: Exercice }`

Exemple:
```json
{
  "version": "1.0",
  "type": "entrainement",
  "data": {
    "id": "<uuid>",
    "titre": "Séance U17",
    "date": "2025-11-08T10:00:00.000Z",
    "tags": [ { "label": "Thème A", "category": "theme_entrainement" } ],
    "echauffement": { "id": "<uuid>", "nom": "Warmup", "blocs": [ { "ordre": 1, "titre": "Course" } ] },
    "situationMatch": { "id": "<uuid>", "type": "Match" },
    "exercices": [
      { "ordre": 1, "duree": 10, "exercice": { "id": "<uuid>", "nom": "Exo 1", "description": "..." } }
    ]
  }
}
```

### Echauffement
Champs:
- Requis: `id`, `nom`
- Optionnels: `description`, `imageUrl`, `blocs[]`

Exemple:
```json
{
  "version": "1.0",
  "type": "echauffement",
  "data": {
    "id": "<uuid>",
    "nom": "Warmup",
    "blocs": [ { "ordre": 1, "titre": "Bloc 1" } ]
  }
}
```

### Situation
Champs:
- Requis: `id`, `type` ("Match" | "Situation")
- Optionnels: `nom`, `description`, `temps`, `imageUrl`, `tags[]`

Exemple:
```json
{
  "version": "1.0",
  "type": "situation",
  "data": {
    "id": "<uuid>",
    "type": "Match",
    "description": "Match amical",
    "tags": [ { "label": "5v5", "category": "format" } ]
  }
}
```

---

## Champs obligatoires / optionnels (récap)
- Exercice: `nom`, `description` requis; le reste optionnel.
- Entrainement: `titre` requis; le reste optionnel.
- Echauffement: `nom` requis; le reste optionnel.
- Situation: `type` requis; le reste optionnel.

---

## Notes d’implémentation
- L’export renvoie `variablesPlus`/`variablesMinus` tels que stockés (chaîne JSON). Pour un format tableau, prévoir une conversion lors de l’import/affichage.
- Les tags sont exportés avec `{ label, category, level? }`. L’import crée/associe les tags via contrainte unique `[label, category]`.
