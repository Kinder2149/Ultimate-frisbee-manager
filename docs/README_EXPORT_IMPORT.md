# Export/Import UFM – Guide d’utilisation

## Objectif
Standardiser l’échange de données entre environnements via le format `.ufm.json`, avec un service d’export/import robuste, tolérant aux tags hérités, et des outils de test en environnement de développement.

---

## Format `.ufm.json`
- Fichier JSON structuré en deux sections: `meta` et `data`.
- Référence de schéma: `shared/formats/ufm_export_format.json` (Draft-07).

Exemple (à inclure dans vos PRs/tests):
```json
{
  "meta": {
    "type": "entrainement",
    "schema_version": "1.0",
    "exported_at": "2025-11-05T12:00:00Z",
    "source": "frontend:dev",
    "origin_path": "entrainements/123"
  },
  "data": {
    "id": "123",
    "nom": "Séance endurance",
    "duree": 60,
    "tags": ["endurance", "échauffement"],
    "exercices": [
      {"id":"e1","nom":"Course 20'","duree":20}
    ]
  }
}
```

---

## Constantes & répertoires
- Constantes partagées: `@ufm/shared/constants/export-import`
  - `EXPORT_DIR = 'exports/ufm/'`
  - `FILE_EXT_UFM = '.ufm.json'`
  - `DEFAULT_SCHEMA_VERSION = '1.0'`
  - `ARCHIVE_DIR = 'archive/old_trainings_module/'`
  - `IMPORT_LOG_DIR = 'logs/imports/'`
- Côté backend (si utilisé): `backend/config/constants.js` – mêmes valeurs.

Note: En frontend navigateur, l’écriture disque directe n’est pas possible. Les fichiers sont téléchargés; en dev, sauvegardez-les dans les dossiers conventionnels ci-dessus.

---

## Procédures

### Export (UI)
1. Connectez-vous (AuthGuard requis).
2. En dev, rendez-vous sur `/debug/export-import` (protégé par DevGuard).
3. Choisissez `type` + `id`. Cliquez sur « Exporter ».
4. Un fichier `*.ufm.json` est téléchargé. La preview indique le nom logique.

### Import (UI)
1. Toujours depuis `/debug/export-import`.
2. Sélectionnez un fichier `.ufm.json` et cliquez « Importer (interactif) ».
3. Si des tags hérités sont détectés, une boîte de dialogue propose un mapping ou la conservation en `legacy:<valeur>`.
4. Le résultat (`ImportResult`) s’affiche; un log est téléchargé si des conflits existent.

### ImportResult (TypeScript)
```ts
export interface ImportResult {
  success: boolean;
  message: string;
  conflicts?: Array<{ field: string; issue: string; suggested?: any }>;
  inserted?: Array<{ type: string; id: string }>;
}
```

Note: L’implémentation actuelle renvoie `conflicts` et `insertedIds` dans le service; alignez vos types d’UI si nécessaire.

---

## Résolution des conflits (tags & champs)
- Unknown fields: ignorés et consignés dans `conflicts`.
- Missing fields:
  - Critiques (ex: `nom`): l’import échoue, à corriger avant réessai.
  - Non-critiques: normalisés à `null` si applicable et consignés.
- Tags legacy: mappés automatiquement si connus (`shared/constants/tag-mapping.ts`).
  - En mode interactif, une UI propose: utiliser le mapping proposé ou conserver `legacy:<tag>`.

---

## Emplacement des archives & logs
- Archives code/data de l’ancien module trainings: `archive/old_trainings_module/<timestamp>/`.
- Logs d’import: téléchargés côté navigateur avec un nom logique préfixé par `logs/imports/`.

---

## Bonnes pratiques
- Toujours vérifier `meta.schema_version` avant import.
- Préférer le mode interactif en cas de doute (résolution tags).
- Conserver les `.ufm.json` d’origine dans un dossier d’archives projet.
- Pour un import serveur (optionnel): implémenter `POST /api/admin/import-ufm` (auth requise) avec validation stricte.
