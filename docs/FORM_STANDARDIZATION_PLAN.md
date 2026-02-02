# Mission — Standardisation des formulaires (Ultimate Frisbee Manager)

## 1) Objectif
Uniformiser les formulaires **Exercice / Échauffement / Situation-Match / Entraînement** autour d’un socle commun de composants et de conventions (UX + données), tout en conservant les spécificités métier de chaque entité.

### Décisions actées
- **Tags “Temps” & “Format”** : **single-select** avec option **“Aucun”**.
- **Champs “liste de texte”** (points, consignes, objectifs, etc.) : **UI en chips** (style variables), avec **Entrée = ajout** et **jamais submit**.
- **Situation-Match — Temps** : **Option B** → champ libre `temps: string` (ex: `"10 min"`).

---

## 2) Invariants UX (règles globales)
- **Enter/Submit**
  - Dans un champ “chips” : `Enter` ajoute un item et fait `preventDefault()`.
  - Le submit n’est déclenché que par le bouton principal (ou action explicite).
- **Tags**
  - Les `FormControl` UI contiennent des `Tag` / `Tag[]`.
  - Le backend reçoit **uniquement** `tagIds: string[]`.
- **Images**
  - Tous les formulaires passent un `context` cohérent à la résolution média.
  - Preview stable + comportement standard “supprimer”.

---

## 3) Contrat de données (Front ↔ Back)
### 3.1 Tags
- **Front (form)** :
  - Single: `Tag | null`
  - Multi: `Tag[]`
- **API (POST/PUT)** :
  - `tagIds: string[]`
- **Règle** : ne jamais envoyer des objets `Tag` au backend (exclure les champs UI du `FormData`).

### 3.2 Listes de texte
- **Front** : toujours `string[]`
- **Back cible** : toujours `string[]` (persisté proprement)
- **Rétrocompat** : accepter `string` / `JSON-string` / `string[]` en lecture via normalisation.

---

## 4) Lot A — Socle commun à implémenter (composants + utils)
### A1 — `TextChipsField` (ControlValueAccessor)
- Valeur: `string[]`
- Entrée: ajoute un chip (`trim`, ignore vide)
- Suppression chip
- `label`, `placeholder`, `maxItems`, `allowDuplicates=false`

### A2 — `TagSelectSingle` (ControlValueAccessor)
- Valeur: `Tag | null`
- `allowNone=true` (option “Aucun”)

### A3 — `TagSelectMulti` (ControlValueAccessor)
- Valeur: `Tag[]`

### A4 — `ImagePickerField` (wrapper de `ImageUploadComponent`)
- `context` obligatoire (`exercices|echauffements|situations|entrainements`)

### A5 — Utils
- `normalizeStringList(value: unknown): string[]`
- `tagsToTagIds(tags: (Tag|null|undefined)[]): string[]`

---

## 5) Matrice de standardisation (à remplir — inventaire exact du code)
> Cette section est volontairement structurée pour être complétée au fil de l’analyse des fichiers.

### 5.1 Exercice — `ExerciceFormComponent`
- **Sections UI**
  - Informations générales
  - Description
  - Contenu pédagogique (Points importants + Variables)
  - Tags
  - Image
  - Compléments
- **Champs**
  - `nom` (text)
  - `description` (rich)
  - `points` (chips) — UI-only à ce stade
  - `variablesPlus/variablesMinus` (spécifique)
  - `objectifTag` (single)
  - `travailSpecifiqueTags` (multi)
  - `niveauTags` (multi)
  - `tempsTag` (single, aucun)
  - `formatTag` (single, aucun)
  - `image`/`imageUrl`
  - `materiel`, `notes`, `critereReussite`

### 5.2 Échauffement — `EchauffementForm...`

#### Source (référence code)
- `frontend/src/app/features/echauffements/pages/echauffement-form/echauffement-form.component.ts`
- `frontend/src/app/shared/components/forms/echauffement-form/echauffement-form.component.ts`
- `frontend/src/app/shared/components/forms/echauffement-form/echauffement-form.component.html`

#### Sections UI (actuel)
- Informations générales
- Illustration (image)
- Blocs d’échauffement (FormArray)

#### Champs (FormGroup) (actuel)
- `nom: string` (required, minlength 3)
- `description: string` (optionnel)
- `imageUrl: string` (optionnel)
- `blocs: BlocEchauffement[]` (FormArray)

#### Bloc (FormGroup) (actuel)
- `id: string`
- `ordre: number`
- `titre: string` (required)
- `repetitions: string` (optionnel)
- `tempsValeur: number | null` (UI)
- `tempsUnite: 'min' | 'sec'` (UI)
- `informations: string` (rich)
- `fonctionnement: string` (rich)
- `notes: string` (rich)

#### Mapping API (actuel)
- Le composant shared émet `EchauffementFormData`:
  - `nom`
  - `description`
  - `blocs` avec `temps: string` reconstruit (`"${valeur} ${unite}"`) et `ordre` recalculé
  - `image?: File` si upload
  - sinon, en édition, si image supprimée: `imageUrl = ''`
- La page `features/.../echauffement-form.component.ts` envoie ensuite `formData as any` au service.

#### Points à standardiser (cible)
- Remplacer plus tard les champs “rich” (informations/fonctionnement/notes) par une convention identique aux autres formulaires (si souhaité).
- Image: passer partout un `context` cohérent (déjà corrigé côté shared `mediaUrl(..., 'echauffements')`).

### 5.3 Situation-Match — `SituationMatchForm...`

#### Source (référence code)
- `frontend/src/app/features/situations-matchs/pages/situationmatch-form/situationmatch-form.component.ts`
- `frontend/src/app/shared/components/forms/situationmatch-form/situationmatch-form.component.ts`
- `frontend/src/app/shared/components/forms/situationmatch-form/situationmatch-form.component.html`

#### Sections UI (actuel)
- Type
- Description
- Temps (valeur + unité)
- Image
- Tags (format/temps/niveau) via chips (sélection + suppression)

#### Champs (FormGroup) (actuel)
- `type: 'Match' | 'Situation'` (required)
- `description: string` (optionnel)
- `tempsValeur: number | null` (UI)
- `tempsUnite: 'min' | 'sec'` (UI)
- `imageUrl: string` (optionnel)

#### Données “hors form controls” (actuel)
- `selectedTags: Tag[]` (géré à la main)
- `selectedImageFile: File | null`

#### Mapping API (actuel)
- Le composant shared émet `SituationMatchFormData`:
  - `type`
  - `description?`
  - `temps?: string` reconstruit (`"${valeur} ${unite}"`) → **Option B confirmée** (champ texte libre côté API)
  - `tagIds: string[]` construit depuis `selectedTags`
  - `image?: File`
  - `imageUrl?: string` et si suppression: `imageUrl=''` (patchValue lors suppression)
- La page `features/.../situationmatch-form.component.ts` reconstruit un `FormData`:
  - `type`, `description`, `temps`, `tagIds` (JSON), `imageUrl` si suppression, `image` si présent.

#### Points à standardiser (cible)
- Tags: passer à `TagSelectSingle/TagSelectMulti` (et appliquer nos règles single/multi) au lieu d’une sélection manuelle via chips.
- Maintenir **temps en champ libre `string`** (Option B), mais uniformiser le composant d’input (ex: `TempsValeur+Unité` réutilisable si désiré).

### 5.4 Entraînement — `EntrainementForm...`

#### Source (référence code)
- `frontend/src/app/features/entrainements/pages/entrainement-form/entrainement-form.component.ts`
- `frontend/src/app/features/entrainements/pages/entrainement-form/entrainement-form.component.html`

#### Sections UI (actuel)
- Informations générales (titre, date, image)
- Thèmes entraînement (tags dédiés `theme_entrainement`)
- Échauffement (sélection via modal)
- Exercices (FormArray + gestion ordre/durée/notes)
- Situation/Match (sélection via modal)

#### Champs (FormGroup) (actuel)
- `titre: string` (required, minlength 3)
- `date: string` (optionnel)
- `imageUrl: string` (optionnel)
- `exercices: FormArray` (0..n)

#### Exercice d’entraînement (FormGroup) (actuel)
- `exerciceId: string` (required)
- `ordre: number` (required)
- `duree: number | null` (minutes)
- `notes: string` (optionnel)
- `exercice: Exercice` (objet pour affichage)

#### Données “hors form controls” (actuel)
- `selectedThemeTags: Tag[]` (gestion custom dropdown)
- `selectedEchauffement: Echauffement | null`
- `selectedSituationMatch: SituationMatch | null`
- `selectedImageFile: File | null` + `imagePreview: string | null`

#### Mapping API (actuel)
- Construction explicite `FormData` dans `onSubmit()`:
  - `titre`
  - `date` (ISO)
  - `exercices` JSON: `{ exerciceId, ordre?, duree?, notes? }` (filtre les entrées sans `exerciceId`)
  - `echauffementId` si présent
  - `situationMatchId` si présent
  - `tagIds` (JSON) basé sur `selectedThemeTags`
  - `imageUrl=''` si suppression en édition
  - `image` si upload

#### Points à standardiser (cible)
- Image: utiliser un wrapper `ImagePickerField` avec `context='entrainements'`.
- Tags thème entraînement: remplacer le dropdown custom par `TagSelectMulti` (catégorie dédiée) ou un composant “tag chips picker”.
- Les sections relations (échauffement/situation) restent spécifiques, mais on peut uniformiser la présentation (cards + actions).

---

## 8) État — Étape 1 (inventaire)
### Statut
- **Démarrée**

### Fichiers déjà analysés (inventaire basé sur le code)
- Exercice:
  - `frontend/src/app/features/exercices/pages/exercice-form/exercice-form.component.ts`
  - `frontend/src/app/features/exercices/pages/exercice-form/exercice-form.component.html`
- Échauffement:
  - `frontend/src/app/features/echauffements/pages/echauffement-form/echauffement-form.component.ts`
  - `frontend/src/app/shared/components/forms/echauffement-form/echauffement-form.component.ts`
  - `frontend/src/app/shared/components/forms/echauffement-form/echauffement-form.component.html`
- Situation/Match:
  - `frontend/src/app/features/situations-matchs/pages/situationmatch-form/situationmatch-form.component.ts`
  - `frontend/src/app/shared/components/forms/situationmatch-form/situationmatch-form.component.ts`
  - `frontend/src/app/shared/components/forms/situationmatch-form/situationmatch-form.component.html`
- Entraînement:
  - `frontend/src/app/features/entrainements/pages/entrainement-form/entrainement-form.component.ts`
  - `frontend/src/app/features/entrainements/pages/entrainement-form/entrainement-form.component.html`

---

## 6) Roadmap d’exécution (pas à pas)
### Étape 1 — Inventaire (analyse code)
- Lister pour chaque formulaire :
  - sections UI
  - champs du `FormGroup`
  - champs envoyés à l’API
  - champs UI-only
  - composants déjà existants réutilisables

### Étape 2 — Implémenter Lot A (socle commun)
- Créer/brancher les composants réutilisables.

### Étape 3 — Migrer Exercice (référence)
- Remplacer implémentations ad-hoc par composants communs.

### Étape 4 — Migrer Échauffement + Situation

### Étape 5 — Migrer Entraînement (spécificités conservées)

### Étape 6 — Harmonisation finale + checklist

---

## 7) Checklist de validation (manuelle)
- `Enter` dans un champ chips : ajoute un chip, ne soumet pas.
- Single-select `temps/format` : 0 ou 1 tag.
- Payload API : `tagIds` uniquement (pas d’objets tag).
- Image : preview immédiat + URL résolue via `context`.
- Mode edit : valeurs existantes correctement rechargées.
