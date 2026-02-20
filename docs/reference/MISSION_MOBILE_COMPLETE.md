# MISSION MOBILE COMPLÈTE - ULTIMATE FRISBEE MANAGER

**Statut** : REFERENCE - DOCUMENT CONTRACTUEL  
**Version** : 1.0  
**Date** : 2026-02-20  
**Objectif** : Finaliser la version mobile à 100% - équivalence fonctionnelle avec desktop

---

## 📋 DOCUMENT DE PILOTAGE UNIQUE

Ce document est **la source de vérité unique** pour finaliser la version mobile.  
Il contient :
1. **Besoin utilisateur** (en français, non technique)
2. **Mapping complet desktop → mobile**
3. **État actuel** (ce qui existe, ce qui manque)
4. **Plan technique complet** (étapes d'implémentation)
5. **Critères de validation** (tests à créer/valider)

---

## 1. BESOIN UTILISATEUR (NON TECHNIQUE)

### Ce que je veux

**Une version mobile COMPLÈTE** qui fonctionne exactement comme la version desktop :

#### Accueil (Dashboard)
- Voir mon profil (nom, email, photo)
- Voir mon workspace actuel (nom, rôle)
- Voir les statistiques (nombre d'exercices, entraînements, échauffements, situations)
- Voir mes tags organisés
- **Naviguer facilement** vers chaque section
- **Tout doit être lisible** (couleurs, contrastes, tailles de texte)

#### Bibliothèque
- Voir TOUS mes contenus organisés par type (4 onglets)
- Voir TOUTES les informations importantes sur chaque carte :
  - Titre
  - Durée (si applicable)
  - Nombre de joueurs (si applicable)
  - Matériel (si applicable)
  - Tags (avec leurs noms, pas des ronds vides)
  - Description (texte propre, pas de HTML brut)
- Rechercher dans mes contenus
- Cliquer sur une carte pour voir le détail

#### Détail d'un contenu
- Voir TOUTES les informations (comme sur desktop)
- Voir les images en grand
- Ajouter aux favoris
- Dupliquer
- Modifier
- Supprimer
- **Boutons bien dimensionnés** (pas trop gros)

#### Création/Édition
- Créer un nouveau contenu (exercice, entraînement, échauffement, situation)
- Modifier un contenu existant
- Formulaires clairs et guidés (stepper)
- Upload d'images
- Sélection de tags
- **Tout doit fonctionner** comme sur desktop

#### Profil
- Voir mes informations
- Changer de workspace
- Me déconnecter
- **Pas d'erreur** quand j'accède à mon profil

#### Gestion des tags
- Voir tous mes tags
- Créer/modifier/supprimer des tags
- **Navigation qui fonctionne** (pas d'erreur)

### Ce que je ne veux PAS

❌ Des erreurs rouges partout  
❌ Des champs vides alors qu'il y a des données  
❌ Du HTML brut affiché (`<p>texte</p>`)  
❌ Des tags qui affichent des ronds vides  
❌ Des couleurs illisibles (texte blanc sur fond blanc)  
❌ Des boutons qui ne mènent nulle part  
❌ Des fonctionnalités à moitié implémentées  
❌ Une version mobile "simplifiée" - je veux TOUT comme sur desktop

---

## 2. MAPPING COMPLET DESKTOP → MOBILE

### 2.1 Routes Desktop vs Mobile

| Fonctionnalité | Route Desktop | Route Mobile | Statut |
|----------------|---------------|--------------|--------|
| **Dashboard** | `/dashboard` | `/mobile/home` | ⚠️ PARTIEL |
| **Liste exercices** | `/exercices` | `/mobile/library` (tab 0) | ✅ EXISTE |
| **Détail exercice** | `/exercices/voir/:id` | `/mobile/detail/exercice/:id` | ⚠️ PARTIEL |
| **Créer exercice** | `/exercices/ajouter` | `/mobile/create/exercice` | ✅ EXISTE |
| **Éditer exercice** | `/exercices/modifier/:id` | `/mobile/edit/exercice/:id` | ✅ EXISTE |
| **Liste entraînements** | `/entrainements` | `/mobile/library` (tab 1) | ✅ EXISTE |
| **Détail entraînement** | Modale | `/mobile/detail/entrainement/:id` | ⚠️ PARTIEL |
| **Créer entraînement** | `/entrainements/nouveau` | `/mobile/create/entrainement` | ✅ EXISTE |
| **Éditer entraînement** | `/entrainements/modifier/:id` | `/mobile/edit/entrainement/:id` | ✅ EXISTE |
| **Liste échauffements** | `/echauffements` | `/mobile/library` (tab 2) | ✅ EXISTE |
| **Détail échauffement** | Modale | `/mobile/detail/echauffement/:id` | ⚠️ PARTIEL |
| **Créer échauffement** | `/echauffements/ajouter` | `/mobile/create/echauffement` | ✅ EXISTE |
| **Éditer échauffement** | `/echauffements/modifier/:id` | `/mobile/edit/echauffement/:id` | ✅ EXISTE |
| **Liste situations** | `/situations-matchs` | `/mobile/library` (tab 3) | ✅ EXISTE |
| **Détail situation** | Modale | `/mobile/detail/situation/:id` | ⚠️ PARTIEL |
| **Créer situation** | `/situations-matchs/ajouter` | `/mobile/create/situation` | ✅ EXISTE |
| **Éditer situation** | `/situations-matchs/modifier/:id` | `/mobile/edit/situation/:id` | ✅ EXISTE |
| **Gestion tags** | `/tags` | `/mobile/library` (onglet tags) | ❌ MANQUE |
| **Profil** | `/settings` | `/mobile/profile` | ⚠️ ERREUR |
| **Sélection workspace** | `/select-workspace` | `/select-workspace` | ✅ EXISTE |
| **Mode terrain** | N/A | `/mobile/terrain` | ✅ EXISTE |

### 2.2 API Backend (Toutes disponibles)

| Endpoint | Méthode | Usage | Statut Backend |
|----------|---------|-------|----------------|
| `/api/auth/profile` | GET | Profil utilisateur | ✅ OK |
| `/api/workspaces/me` | GET | Mes workspaces | ✅ OK |
| `/api/workspaces/:id/preload` | GET | Précharger workspace | ✅ OK |
| `/api/exercises` | GET | Liste exercices | ✅ OK |
| `/api/exercises/:id` | GET | Détail exercice | ✅ OK |
| `/api/exercises` | POST | Créer exercice | ✅ OK |
| `/api/exercises/:id` | PUT | Modifier exercice | ✅ OK |
| `/api/exercises/:id` | DELETE | Supprimer exercice | ✅ OK |
| `/api/exercises/:id/duplicate` | POST | Dupliquer exercice | ✅ OK |
| `/api/trainings` | GET | Liste entraînements | ✅ OK |
| `/api/trainings/:id` | GET | Détail entraînement | ✅ OK |
| `/api/trainings` | POST | Créer entraînement | ✅ OK |
| `/api/trainings/:id` | PUT | Modifier entraînement | ✅ OK |
| `/api/trainings/:id` | DELETE | Supprimer entraînement | ✅ OK |
| `/api/trainings/:id/duplicate` | POST | Dupliquer entraînement | ✅ OK |
| `/api/warmups` | GET | Liste échauffements | ✅ OK |
| `/api/warmups/:id` | GET | Détail échauffement | ✅ OK |
| `/api/warmups` | POST | Créer échauffement | ✅ OK |
| `/api/warmups/:id` | PUT | Modifier échauffement | ✅ OK |
| `/api/warmups/:id` | DELETE | Supprimer échauffement | ✅ OK |
| `/api/warmups/:id/duplicate` | POST | Dupliquer échauffement | ✅ OK |
| `/api/matches` | GET | Liste situations | ✅ OK |
| `/api/matches/:id` | GET | Détail situation | ✅ OK |
| `/api/matches` | POST | Créer situation | ✅ OK |
| `/api/matches/:id` | PUT | Modifier situation | ✅ OK |
| `/api/matches/:id` | DELETE | Supprimer situation | ✅ OK |
| `/api/matches/:id/duplicate` | POST | Dupliquer situation | ✅ OK |
| `/api/tags` | GET | Liste tags | ✅ OK |
| `/api/tags/grouped` | GET | Tags groupés | ✅ OK |
| `/api/tags` | POST | Créer tag | ✅ OK |
| `/api/tags/:id` | PUT | Modifier tag | ✅ OK |
| `/api/tags/:id` | DELETE | Supprimer tag | ✅ OK |
| `/api/dashboard/stats` | GET | Stats dashboard | ✅ OK |

### 2.3 Services Frontend (Tous disponibles)

| Service | Fichier | Usage | Statut |
|---------|---------|-------|--------|
| `AuthService` | `auth.service.ts` | Authentification | ✅ OK |
| `WorkspaceService` | `workspace.service.ts` | Gestion workspaces | ✅ OK |
| `WorkspaceDataStore` | `workspace-data.store.ts` | Store réactif données | ✅ OK |
| `ExerciceService` | `exercice.service.ts` | CRUD exercices | ✅ OK |
| `EntrainementService` | `entrainement.service.ts` | CRUD entraînements | ✅ OK |
| `EchauffementService` | `echauffement.service.ts` | CRUD échauffements | ✅ OK |
| `SituationMatchService` | `situationmatch.service.ts` | CRUD situations | ✅ OK |
| `TagService` | `tag.service.ts` | CRUD tags | ✅ OK |
| `PermissionsService` | `permissions.service.ts` | Permissions workspace | ✅ OK |
| `MobileNavigationService` | `mobile-navigation.service.ts` | Navigation mobile | ✅ OK |

### 2.4 Composants Desktop Réutilisables

| Composant Desktop | Fichier | Usage | Réutilisable Mobile |
|-------------------|---------|-------|---------------------|
| `ExerciceFiltersComponent` | `exercice-filters.component.ts` | Filtres recherche | ✅ OUI |
| `ExerciceCardComponent` | `exercice-card.component.ts` | Carte exercice | ⚠️ ADAPTER |
| `DuplicateButtonComponent` | `duplicate-button.component.ts` | Bouton dupliquer | ✅ OUI |
| `RichTextViewComponent` | `rich-text-view.component.ts` | Affichage HTML riche | ✅ OUI |
| `RichTextEditorComponent` | `rich-text-editor.component.ts` | Éditeur HTML | ✅ OUI |
| `ImageUploadComponent` | `image-upload.component.ts` | Upload image | ✅ OUI |
| `TagSelectMultiComponent` | `tag-select-multi.component.ts` | Sélection tags | ✅ OUI |
| `ConfirmDialogComponent` | `confirm-dialog.component.ts` | Confirmation | ✅ OUI |

---

## 3. ÉTAT ACTUEL (CE QUI EXISTE)

### 3.1 Composants Mobile Existants

#### Pages
- ✅ `mobile-home.component` - Dashboard (REFACTORÉ récemment)
- ✅ `mobile-library.component` - Bibliothèque (REFACTORÉ récemment)
- ✅ `mobile-terrain.component` - Mode terrain
- ⚠️ `mobile-profile.component` - Profil (ERREUR)
- ✅ `mobile-create.component` - Sélection type création
- ✅ `mobile-create-exercice.component` - Création exercice
- ✅ `mobile-create-entrainement.component` - Création entraînement
- ✅ `mobile-create-echauffement.component` - Création échauffement
- ✅ `mobile-create-situation.component` - Création situation
- ⚠️ `mobile-detail-simple.component` - Détail (INCOMPLET)
- ⚠️ `mobile-edit.component` - Édition (INCOMPLET)

#### Composants
- ✅ `mobile-layout.component` - Layout avec bottom nav
- ✅ `mobile-header.component` - Header mobile
- ✅ `mobile-navigation.component` - Bottom navigation

#### Pipes
- ✅ `StripHtmlPipe` - Nettoie HTML (CRÉÉ récemment)

### 3.2 Routes Mobile Existantes

```typescript
/mobile
  ├── /home                          ✅ Dashboard
  ├── /library                       ✅ Bibliothèque
  ├── /terrain                       ✅ Mode terrain
  ├── /profile                       ⚠️ Profil (ERREUR)
  ├── /create                        ✅ Sélection type
  │   ├── /exercice                  ✅ Création exercice
  │   ├── /entrainement              ✅ Création entraînement
  │   ├── /echauffement              ✅ Création échauffement
  │   ├── /situation                 ✅ Création situation
  ├── /edit/:type/:id                ⚠️ Édition (INCOMPLET)
  │   ├── /exercice/:id              ✅ Édition exercice
  │   ├── /entrainement/:id          ✅ Édition entraînement
  │   ├── /echauffement/:id          ✅ Édition échauffement
  │   ├── /situation/:id             ✅ Édition situation
  ├── /detail/:type/:id              ⚠️ Détail (INCOMPLET)
```

---

## 4. PROBLÈMES IDENTIFIÉS (ANALYSE CAPTURES D'ÉCRAN)

### 4.1 Dashboard (`/mobile/home`)

#### ❌ Carte workspace illisible
- **Problème** : Fond blanc différent des autres cartes, texte peu visible
- **Cause** : Styles incohérents avec le reste du dashboard
- **Correction** : Uniformiser le style avec gradient violet/bleu comme les autres cartes

#### ⚠️ Compteurs modules vides
- **Problème** : Pas de chiffres affichés (0 exercices, 0 entraînements, etc.)
- **Cause** : `WorkspaceDataStore.stats$` ne charge pas les données
- **Correction** : Vérifier que le préchargement workspace fonctionne

#### ❌ Navigation tags ne fonctionne pas
- **Problème** : Bouton "Gestion des tags" mène à `/mobile/library` avec erreur
- **Cause** : Route `/tags` n'existe pas en mobile, navigation incorrecte
- **Correction** : Créer composant `mobile-tags` ou rediriger vers desktop `/tags`

### 4.2 Bibliothèque (`/mobile/library`)

#### ✅ HTML brut - CORRIGÉ
- **Problème** : `<p>texte</p>` affiché au lieu du texte
- **Correction** : Pipe `stripHtml` créé et appliqué ✅

#### ✅ Tags vides - CORRIGÉ
- **Problème** : Ronds bleus vides au lieu des noms
- **Correction** : `tag.nom` → `tag.label` ✅

#### ❌ Champs manquants (CRITIQUE)
- **Problème** : Durée, nombre de joueurs, matériel non affichés
- **Cause** : **Champs absents du schéma Prisma** (`duree_minutes`, `nombre_joueurs`)
- **Correction** : **Migration DB requise** (voir section 6.1)

### 4.3 Détail (`/mobile/detail/:type/:id`)

#### ❌ Champs vides
- **Problème** : Durée affiche "min" sans valeur, tags vides
- **Cause** : Champs DB manquants + composant détail incomplet
- **Correction** : Migration DB + compléter composant détail

#### ⚠️ Boutons trop gros
- **Problème** : Boutons favoris/dupliquer/supprimer prennent trop de place
- **Correction** : Réduire padding, utiliser grille horizontale

### 4.4 Profil (`/mobile/profile`)

#### ❌ Erreur au chargement
- **Problème** : Message d'erreur rouge "Une erreur inattendue est survenue"
- **Cause** : Composant génère une erreur (vérifier logs console)
- **Correction** : Debugger composant profil

### 4.5 Navigation générale

#### ❌ Modules dashboard → bibliothèque
- **Problème** : Cliquer sur une carte module ne sélectionne pas le bon onglet
- **Cause** : Navigation ne passe pas le paramètre de tab
- **Correction** : Ajouter queryParams `?tab=0` (exercices), `?tab=1` (entraînements), etc.

---

## 5. PLAN TECHNIQUE COMPLET

### 5.1 Migration Base de Données (PRIORITÉ 1 - BLOQUANT)

#### Problème
Les champs `duree_minutes` et `nombre_joueurs` sont absents du schéma Prisma.

#### Solution

**Fichier** : `backend/prisma/schema.prisma`

```prisma
model Exercice {
  id              String   @id @default(uuid())
  nom             String
  description     String
  imageUrl        String?
  points          String?
  materiel        String?
  notes           String?
  critereReussite String?
  variablesPlus   String   @default("")
  variablesMinus  String   @default("")
  
  // ✅ AJOUTER CES CHAMPS
  duree_minutes   Int?     // Durée en minutes
  nombre_joueurs  Int?     // Nombre de joueurs
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  entrainements   EntrainementExercice[]
  tags            Tag[]    @relation("ExerciseTags")
  workspaceId     String?
  workspace       Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([createdAt])
  @@index([workspaceId])
}

model SituationMatch {
  id            String   @id @default(uuid())
  nom           String?
  type          String
  description   String?
  temps         String?
  imageUrl      String?
  
  // ✅ AJOUTER CE CHAMP
  nombre_joueurs Int?     // Nombre de joueurs
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  entrainements Entrainement[]
  tags          Tag[]    @relation("SituationMatchTags")
  workspaceId   String?
  workspace     Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([createdAt])
  @@index([workspaceId])
}
```

**Commandes** :
```bash
cd backend
npx prisma migrate dev --name add_duree_joueurs_fields
npx prisma generate
npm start
```

**Impact** :
- ✅ Durée exercices affichée
- ✅ Nombre joueurs exercices affiché
- ✅ Nombre joueurs situations affiché

---

### 5.2 Corrections Dashboard (`mobile-home`)

#### 5.2.1 Uniformiser style carte workspace

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-home/mobile-home.component.scss`

**Problème** : Carte workspace a un fond blanc, différent des autres

**Solution** :
```scss
.workspace-card {
  // ✅ APPLIQUER LE MÊME GRADIENT QUE LES AUTRES CARTES
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  .workspace-icon {
    font-size: 2rem;
    background: rgba(255, 255, 255, 0.2);
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .workspace-info {
    flex: 1;

    h3 {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: white;
    }

    .workspace-role {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 600;
      color: white;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      display: inline-block;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
  }

  .card-action {
    background: white;
    color: #667eea;
    border: none;
    font-weight: 600;
    padding: 12px 20px;
    border-radius: 12px;
    margin-top: 16px;

    &:active {
      background: rgba(255, 255, 255, 0.9);
    }
  }
}
```

#### 5.2.2 Navigation modules vers bibliothèque avec bon onglet

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-home/mobile-home.component.ts`

**Problème** : Cliquer sur "Exercices" ne sélectionne pas l'onglet exercices

**Solution** :
```typescript
navigateToModule(type: string): void {
  const tabIndex = {
    'exercice': 0,
    'entrainement': 1,
    'echauffement': 2,
    'situation': 3
  }[type] || 0;

  this.router.navigate(['/mobile/library'], {
    queryParams: { tab: tabIndex }
  });
}
```

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-library/mobile-library.component.ts`

**Ajouter** :
```typescript
ngOnInit(): void {
  // ... code existant

  // ✅ AJOUTER : Lire le paramètre tab de l'URL
  this.route.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe(params => {
      const tabIndex = parseInt(params['tab'], 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 3) {
        this.selectedTabIndex = tabIndex;
      }
    });
}
```

**Import requis** :
```typescript
import { ActivatedRoute } from '@angular/router';

constructor(
  // ... autres injections
  private route: ActivatedRoute
) {}
```

---

### 5.3 Corrections Bibliothèque (`mobile-library`)

#### 5.3.1 Afficher durée et joueurs (après migration DB)

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-library/mobile-library.component.html`

**Ajouter dans les cartes exercices** :
```html
<div class="item-details">
  <!-- ✅ AJOUTER -->
  <div class="detail-row" *ngIf="exercice.duree_minutes">
    <span class="detail-icon">⏱️</span>
    <span>{{ exercice.duree_minutes }} min</span>
  </div>
  <div class="detail-row" *ngIf="exercice.nombre_joueurs">
    <span class="detail-icon">👥</span>
    <span>{{ exercice.nombre_joueurs }} joueurs</span>
  </div>
  <div class="detail-row" *ngIf="exercice.materiel">
    <span class="detail-icon">🎯</span>
    <span>{{ exercice.materiel }}</span>
  </div>
</div>
```

**Ajouter dans les cartes situations** :
```html
<div class="item-details">
  <!-- ✅ AJOUTER -->
  <div class="detail-row" *ngIf="situation.nombre_joueurs">
    <span class="detail-icon">👥</span>
    <span>{{ situation.nombre_joueurs }} joueurs</span>
  </div>
  <div class="detail-row" *ngIf="situation.temps">
    <span class="detail-icon">⏱️</span>
    <span>{{ situation.temps }}</span>
  </div>
</div>
```

---

### 5.4 Corrections Détail (`mobile-detail-simple`)

#### 5.4.1 Compléter affichage champs

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-detail/mobile-detail-simple.component.html`

**Vérifier que tous les champs sont affichés** :
- Titre
- Image (cliquable)
- Durée (si `duree_minutes` existe)
- Nombre joueurs (si `nombre_joueurs` existe)
- Matériel
- Description (avec `| stripHtml`)
- Tags (avec `tag.label`)
- Points importants
- Variables +/-
- Critère de réussite

#### 5.4.2 Réduire taille boutons actions

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-detail/mobile-detail-simple.component.scss`

**Solution** :
```scss
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;

  .btn-favorite {
    grid-column: 1 / -1; // Pleine largeur
    padding: 14px;
    font-size: 1rem;
  }

  .btn-duplicate,
  .btn-delete {
    padding: 12px;
    font-size: 0.9rem;
  }
}
```

---

### 5.5 Corrections Profil (`mobile-profile`)

#### 5.5.1 Debugger erreur

**Étapes** :
1. Ouvrir console navigateur sur `/mobile/profile`
2. Identifier l'erreur exacte
3. Vérifier imports/dépendances du composant
4. Vérifier que `AuthService.currentUser$` fonctionne
5. Vérifier que `WorkspaceService.currentWorkspace$` fonctionne

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-profile/mobile-profile.component.ts`

**Vérifier** :
```typescript
ngOnInit(): void {
  // ✅ VÉRIFIER que ces observables fonctionnent
  this.authService.currentUser$
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      console.log('[MobileProfile] User:', user);
      this.user = user;
    });

  this.workspaceService.currentWorkspace$
    .pipe(takeUntil(this.destroy$))
    .subscribe(workspace => {
      console.log('[MobileProfile] Workspace:', workspace);
      this.currentWorkspace = workspace;
    });
}
```

---

### 5.6 Gestion Tags Mobile

#### Option 1 : Redirection vers desktop (RAPIDE)

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-home/mobile-home.component.ts`

```typescript
navigateToTags(): void {
  // Rediriger vers la page desktop des tags
  this.router.navigate(['/tags']);
}
```

#### Option 2 : Créer composant mobile tags (COMPLET)

**Créer** : `frontend/src/app/features/mobile/pages/mobile-tags/mobile-tags.component.ts`

**Réutiliser** : Composant desktop `TagsManagerComponent` avec adaptation mobile

**Route** : Ajouter dans `mobile.routes.ts`
```typescript
{
  path: 'tags',
  loadComponent: () => import('./pages/mobile-tags/mobile-tags.component').then(c => c.MobileTagsComponent),
}
```

---

### 5.7 Améliorer Édition Mobile

#### 5.7.1 Vérifier réutilisation composants création

**Fichier** : `frontend/src/app/features/mobile/pages/mobile-edit/mobile-edit.component.ts`

**Vérifier que** :
- Les composants de création sont réutilisés en mode édition
- Les données sont pré-remplies correctement
- La sauvegarde fonctionne (PUT au lieu de POST)

---

## 6. CRITÈRES DE VALIDATION

### 6.1 Tests Manuels (Checklist)

#### Dashboard
- [ ] Nom workspace affiché (ou "Aucun workspace" si null)
- [ ] Rôle affiché avec badge lisible
- [ ] Carte workspace avec gradient violet/bleu (comme les autres)
- [ ] Compteurs modules affichent les bons chiffres
- [ ] Navigation "Exercices" → bibliothèque onglet 0
- [ ] Navigation "Entraînements" → bibliothèque onglet 1
- [ ] Navigation "Échauffements" → bibliothèque onglet 2
- [ ] Navigation "Situations" → bibliothèque onglet 3
- [ ] Navigation "Tags" fonctionne (pas d'erreur)

#### Bibliothèque
- [ ] Descriptions sans HTML brut (texte propre)
- [ ] Tags affichent le nom (pas de ronds vides)
- [ ] Durée exercices affichée (si champ DB existe)
- [ ] Nombre joueurs exercices affiché (si champ DB existe)
- [ ] Nombre joueurs situations affiché (si champ DB existe)
- [ ] Matériel affiché
- [ ] Recherche fonctionne
- [ ] Clic sur carte → détail

#### Détail
- [ ] Tous les champs affichés
- [ ] Images cliquables → visualiseur
- [ ] Durée affichée (si champ DB existe)
- [ ] Nombre joueurs affiché (si champ DB existe)
- [ ] Tags affichent les noms
- [ ] Description sans HTML brut
- [ ] Boutons bien dimensionnés (pas trop gros)
- [ ] Bouton "Favoris" fonctionne
- [ ] Bouton "Dupliquer" fonctionne
- [ ] Bouton "Éditer" → édition
- [ ] Bouton "Supprimer" fonctionne (avec confirmation)

#### Création/Édition
- [ ] Formulaires exercice fonctionnent
- [ ] Formulaires entraînement fonctionnent
- [ ] Formulaires échauffement fonctionnent
- [ ] Formulaires situation fonctionnent
- [ ] Upload images fonctionne
- [ ] Sélection tags fonctionne
- [ ] Sauvegarde fonctionne
- [ ] Redirection après sauvegarde

#### Profil
- [ ] Pas d'erreur au chargement
- [ ] Nom, email affichés
- [ ] Workspace actuel affiché
- [ ] Rôle affiché
- [ ] Bouton "Changer workspace" fonctionne
- [ ] Bouton "Déconnexion" fonctionne

#### Navigation générale
- [ ] Bottom nav fonctionne (5 onglets)
- [ ] Onglet actif surligné
- [ ] Transitions fluides
- [ ] Pas d'erreur console

### 6.2 Tests E2E à Créer/Valider

**Fichier** : `frontend/cypress/e2e/mobile/`

#### Tests à créer
1. `mobile-dashboard.cy.ts` - Dashboard complet
2. `mobile-library.cy.ts` - Bibliothèque + recherche
3. `mobile-detail.cy.ts` - Détail + actions
4. `mobile-create.cy.ts` - Création tous types
5. `mobile-edit.cy.ts` - Édition tous types
6. `mobile-profile.cy.ts` - Profil + déconnexion
7. `mobile-navigation.cy.ts` - Navigation bottom nav

#### Structure type
```typescript
describe('Mobile Dashboard', () => {
  beforeEach(() => {
    cy.loginAsTestUser();
    cy.visit('/mobile/home');
  });

  it('affiche le nom du workspace', () => {
    cy.get('.workspace-card h3').should('contain', 'Mon Workspace');
  });

  it('affiche les compteurs modules', () => {
    cy.get('.module-card').should('have.length', 4);
    cy.get('.module-count').each($count => {
      expect($count.text()).to.match(/\d+/);
    });
  });

  it('navigue vers bibliothèque exercices', () => {
    cy.get('.module-card').first().click();
    cy.url().should('include', '/mobile/library');
    cy.url().should('include', 'tab=0');
  });
});
```

---

## 7. ORDRE D'IMPLÉMENTATION

### Phase 1 : Corrections Critiques (BLOQUANTES)
1. ✅ Migration DB (duree_minutes, nombre_joueurs)
2. ✅ Uniformiser style carte workspace
3. ✅ Corriger navigation modules → bibliothèque
4. ✅ Debugger erreur profil

### Phase 2 : Compléter Affichage Données
5. ✅ Afficher durée/joueurs dans bibliothèque
6. ✅ Afficher durée/joueurs dans détail
7. ✅ Compléter composant détail (tous champs)
8. ✅ Réduire taille boutons détail

### Phase 3 : Gestion Tags
9. ✅ Créer composant mobile-tags OU redirection desktop

### Phase 4 : Vérifications Édition
10. ✅ Vérifier édition exercices
11. ✅ Vérifier édition entraînements
12. ✅ Vérifier édition échauffements
13. ✅ Vérifier édition situations

### Phase 5 : Tests
14. ✅ Créer tests E2E complets
15. ✅ Valider tous les tests manuels
16. ✅ Corriger bugs détectés

---

## 8. FICHIERS À MODIFIER/CRÉER

### Migration DB
- `backend/prisma/schema.prisma` - Ajouter champs

### Dashboard
- `frontend/src/app/features/mobile/pages/mobile-home/mobile-home.component.scss` - Uniformiser styles
- `frontend/src/app/features/mobile/pages/mobile-home/mobile-home.component.ts` - Navigation modules

### Bibliothèque
- `frontend/src/app/features/mobile/pages/mobile-library/mobile-library.component.ts` - Lire queryParams tab
- `frontend/src/app/features/mobile/pages/mobile-library/mobile-library.component.html` - Afficher durée/joueurs

### Détail
- `frontend/src/app/features/mobile/pages/mobile-detail/mobile-detail-simple.component.html` - Compléter champs
- `frontend/src/app/features/mobile/pages/mobile-detail/mobile-detail-simple.component.scss` - Réduire boutons
- `frontend/src/app/features/mobile/pages/mobile-detail/mobile-detail-simple.component.ts` - Logique complète

### Profil
- `frontend/src/app/features/mobile/pages/mobile-profile/mobile-profile.component.ts` - Debugger erreur

### Tags (Option 2)
- `frontend/src/app/features/mobile/pages/mobile-tags/mobile-tags.component.ts` - NOUVEAU
- `frontend/src/app/features/mobile/pages/mobile-tags/mobile-tags.component.html` - NOUVEAU
- `frontend/src/app/features/mobile/pages/mobile-tags/mobile-tags.component.scss` - NOUVEAU
- `frontend/src/app/features/mobile/mobile.routes.ts` - Ajouter route

### Tests
- `frontend/cypress/e2e/mobile/mobile-dashboard.cy.ts` - NOUVEAU
- `frontend/cypress/e2e/mobile/mobile-library.cy.ts` - NOUVEAU
- `frontend/cypress/e2e/mobile/mobile-detail.cy.ts` - NOUVEAU
- `frontend/cypress/e2e/mobile/mobile-create.cy.ts` - NOUVEAU
- `frontend/cypress/e2e/mobile/mobile-edit.cy.ts` - NOUVEAU
- `frontend/cypress/e2e/mobile/mobile-profile.cy.ts` - NOUVEAU
- `frontend/cypress/e2e/mobile/mobile-navigation.cy.ts` - NOUVEAU

---

## 9. COMMANDES UTILES

### Démarrage
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start

# Accès mobile
http://192.168.1.XXX:4200/mobile/home
```

### Migration DB
```bash
cd backend
npx prisma migrate dev --name add_duree_joueurs_fields
npx prisma generate
npm start
```

### Tests
```bash
cd frontend
npm run cypress:open  # Mode interactif
npm run cypress:run   # Mode headless
```

---

## 10. DOCUMENTS DE RÉFÉRENCE

- `docs/reference/MOBILE_SPECIFICATION.md` - Spécification mobile complète
- `docs/reference/MOBILE_IMPLEMENTATION.md` - État implémentation + config réseau
- `docs/work/20260220_CORRECTIONS_MOBILE_ANALYSE_SCREENSHOTS.md` - Analyse problèmes actuels
- `docs/work/20260220_REFONTE_MOBILE_HOME_LIBRARY.md` - Refonte récente dashboard/bibliothèque

---

**FIN DU DOCUMENT DE RÉFÉRENCE**

Ce document doit être utilisé comme **source de vérité unique** pour finaliser la version mobile.  
Toute modification doit être documentée dans ce fichier avec une nouvelle version.
