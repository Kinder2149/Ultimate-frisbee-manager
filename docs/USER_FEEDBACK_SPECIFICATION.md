# SPÉCIFICATION DES FEEDBACKS UTILISATEUR

**Document de référence** : Mission 4.4 - Uniformisation des feedbacks utilisateur  
**Date de création** : 29 janvier 2026  
**Version** : 1.0  
**Statut** : ✅ Validé

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Analyse de l'existant](#analyse-de-lexistant)
3. [Grille des feedbacks attendus](#grille-des-feedbacks-attendus)
4. [Socle minimal commun](#socle-minimal-commun)
5. [Mapping composants → Manques](#mapping-composants--manques)
6. [Règles transverses](#règles-transverses)
7. [Chevauchements avec Chantier 5](#chevauchements-avec-chantier-5)
8. [Critères de validation](#critères-de-validation)

---

## 1. INTRODUCTION

### 1.1 Objectif du document

Ce document formalise **une stratégie cohérente de feedback utilisateur** pour Ultimate Frisbee Manager, afin de :

- ✅ Garantir qu'aucun écran ne laisse l'utilisateur sans feedback
- ✅ Définir des règles cohérentes et applicables
- ✅ Éviter les doublons avec le Chantier 5 (Messages d'erreur)
- ✅ Établir un socle minimal commun pour tous les composants

### 1.2 Périmètre

**Inclus** :
- États de chargement (loading)
- États de succès (success)
- États d'erreur (error)
- États vides (empty/no data)
- Feedbacks visuels et textuels

**Exclus** :
- Refonte UI/UX
- Ajout de nouveaux composants
- Logique métier
- Micro-interactions avancées
- Messages d'erreur détaillés (Chantier 5)

---

## 2. ANALYSE DE L'EXISTANT

### 2.1 Composants avec feedback complet

**✅ Composants conformes** :

| Composant | Chargement | Succès | Erreur | Vide |
|-----------|------------|--------|--------|------|
| `SituationMatchModalComponent` | ✅ Spinner + message | ✅ Snackbar | ✅ Snackbar | ✅ Message + action |
| `WorkspaceSwitcherComponent` | ✅ Message texte | N/A | ✅ Snackbar | ✅ Message |
| `PreloadDialogComponent` | ✅ Progress bar + message | ✅ Message | ✅ Message | N/A |
| `EchauffementFormComponent` | ✅ Icon + texte | N/A | N/A | ✅ Message + action |
| `ExerciceSelectorComponent` | N/A | N/A | N/A | ✅ Message + suggestions |
| `ContentSectionsComponent` | N/A | N/A | N/A | ✅ Icon + message |

**Caractéristiques communes** :
- Utilisation de `mat-spinner` ou `mat-progress-bar`
- Messages contextuels clairs
- États vides avec actions suggérées
- Feedback via `MatSnackBar` pour erreurs/succès

---

### 2.2 Composants avec feedback partiel

**⚠️ Composants incomplets** :

| Composant | Manque | Impact |
|-----------|--------|--------|
| Listes (exercices, entraînements, etc.) | Pas de skeleton loader | Impression de lenteur |
| Formulaires génériques | Pas de feedback succès visuel | Utilisateur ne sait pas si action réussie |
| Navigation | Pas de feedback chargement page | Flash blanc entre pages |
| Upload images | Pas de progress bar | Utilisateur ne sait pas si upload en cours |
| Filtres | Pas de feedback "recherche en cours" | Impression d'application figée |

---

### 2.3 Patterns identifiés

**Pattern 1 : Chargement avec spinner**
```html
<div *ngIf="isLoading" class="loading-container">
  <mat-spinner diameter="30"></mat-spinner>
  <span>Chargement des données...</span>
</div>
```

**Pattern 2 : État vide avec action**
```html
<div *ngIf="!isLoading && items.length === 0" class="no-data">
  <p>Aucune donnée disponible.</p>
  <button mat-stroked-button (click)="onCreate()">
    Créer nouveau
  </button>
</div>
```

**Pattern 3 : Feedback succès/erreur**
```typescript
this.snackBar.open('Action réussie', 'Fermer', { duration: 3000 });
this.snackBar.open('Erreur lors de l\'action', 'Fermer', { duration: 5000 });
```

**Pattern 4 : Bouton avec état loading**
```html
<button [disabled]="loading">
  <mat-icon *ngIf="loading">hourglass_empty</mat-icon>
  {{ loading ? 'En cours...' : 'Valider' }}
</button>
```

---

## 3. GRILLE DES FEEDBACKS ATTENDUS

### 3.1 États obligatoires par type de composant

| Type de composant | Chargement | Succès | Erreur | Vide |
|-------------------|------------|--------|--------|------|
| **Liste** | ✅ Obligatoire | ⚪ Optionnel | ✅ Obligatoire | ✅ Obligatoire |
| **Formulaire** | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire | N/A |
| **Modal/Dialog** | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire | ⚪ Selon contexte |
| **Sélecteur** | ✅ Obligatoire | ⚪ Optionnel | ✅ Obligatoire | ✅ Obligatoire |
| **Upload** | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire | N/A |
| **Navigation** | ⚪ Optionnel | N/A | ✅ Obligatoire | N/A |

---

### 3.2 Détail par état

#### 3.2.1 État CHARGEMENT (Loading)

**Objectif** : Informer l'utilisateur qu'une opération est en cours

**Éléments visuels** :
- ✅ **Spinner** : `mat-spinner` (Material) ou équivalent
- ✅ **Message** : Texte explicite ("Chargement...", "Envoi en cours...")
- ⚪ **Progress bar** : Si progression mesurable (upload, preload)
- ⚪ **Skeleton loader** : Pour listes (optionnel mais recommandé)

**Règles** :
- Afficher dès le début de l'opération
- Désactiver interactions pendant chargement
- Timeout recommandé : 10s max
- Message contextuel (pas générique "Chargement...")

**Exemples** :
- ✅ "Chargement des exercices..."
- ✅ "Envoi en cours..."
- ✅ "Sauvegarde..."
- ❌ "Chargement..." (trop générique)

---

#### 3.2.2 État SUCCÈS (Success)

**Objectif** : Confirmer que l'action a réussi

**Éléments visuels** :
- ✅ **Snackbar** : Message temporaire (3-5s)
- ⚪ **Icon** : Checkmark vert (optionnel)
- ⚪ **Animation** : Transition douce (optionnel)

**Règles** :
- Afficher immédiatement après succès
- Durée : 3s (info) à 5s (action importante)
- Message positif et clair
- Pas de blocage utilisateur

**Exemples** :
- ✅ "Exercice créé avec succès"
- ✅ "Modifications enregistrées"
- ✅ "Fichier importé (12 exercices)"
- ❌ "OK" (pas assez informatif)

---

#### 3.2.3 État ERREUR (Error)

**Objectif** : Informer l'utilisateur du problème et suggérer action

**Éléments visuels** :
- ✅ **Snackbar** : Message temporaire (5-10s)
- ✅ **Message** : Texte explicite et actionnable
- ⚪ **Icon** : Warning/error icon (optionnel)
- ⚪ **Bouton retry** : Si action peut être réessayée

**Règles** :
- Afficher immédiatement après erreur
- Durée : 5s minimum (utilisateur doit avoir le temps de lire)
- Message clair et non technique (voir Chantier 5)
- Suggérer une action si possible

**Exemples** :
- ✅ "Impossible de charger les données. Veuillez réessayer."
- ✅ "La création a échoué. Vérifiez les informations saisies."
- ✅ "Connexion perdue. Vérifiez votre réseau."
- ❌ "Erreur 500" (trop technique)

**Note** : Messages détaillés gérés par Chantier 5 (Mission 5.2)

---

#### 3.2.4 État VIDE (Empty/No Data)

**Objectif** : Expliquer l'absence de données et guider l'utilisateur

**Éléments visuels** :
- ✅ **Icon** : Icon contextuel (inbox, search_off, etc.)
- ✅ **Message principal** : Explication claire
- ✅ **Message secondaire** : Suggestion d'action
- ⚪ **Bouton CTA** : Action principale (créer, modifier filtres)

**Règles** :
- Distinguer "vraiment vide" vs "filtres trop restrictifs"
- Proposer action constructive
- Ton encourageant (pas frustrant)
- Éviter "Aucune donnée" seul

**Exemples** :
- ✅ "Aucun exercice pour l'instant. Créez votre premier exercice !"
- ✅ "Aucun résultat. Essayez de modifier vos filtres."
- ✅ "Aucune situation/match disponible. Créer nouveau ?"
- ❌ "Vide" (pas assez informatif)

---

## 4. SOCLE MINIMAL COMMUN

### 4.1 Règle 1 : Chargement = Spinner + Message

**Obligatoire pour** : Toute opération > 200ms

**Implémentation minimale** :
```html
<div *ngIf="isLoading" class="loading-container">
  <mat-spinner diameter="30"></mat-spinner>
  <span>{{ loadingMessage }}</span>
</div>
```

**Variables requises** :
```typescript
isLoading: boolean = false;
loadingMessage: string = 'Chargement...';
```

---

### 4.2 Règle 2 : Erreur = Message explicite

**Obligatoire pour** : Toute erreur utilisateur

**Implémentation minimale** :
```typescript
this.snackBar.open(
  'Message d\'erreur clair et actionnable',
  'Fermer',
  { duration: 5000 }
);
```

**Note** : Messages détaillés via `HttpErrorInterceptor` (Mission 5.2)

---

### 4.3 Règle 3 : Vide = Explication + Action

**Obligatoire pour** : Listes, sélecteurs, résultats de recherche

**Implémentation minimale** :
```html
<div *ngIf="!isLoading && items.length === 0" class="empty-state">
  <mat-icon>inbox</mat-icon>
  <h3>{{ emptyTitle }}</h3>
  <p>{{ emptyMessage }}</p>
  <button mat-stroked-button (click)="onEmptyAction()">
    {{ emptyActionLabel }}
  </button>
</div>
```

**Variables requises** :
```typescript
emptyTitle: string = 'Aucune donnée';
emptyMessage: string = 'Explication contextuelle';
emptyActionLabel: string = 'Action suggérée';
```

---

### 4.4 Règle 4 : Succès = Confirmation visible

**Obligatoire pour** : Actions de création, modification, suppression

**Implémentation minimale** :
```typescript
this.snackBar.open(
  'Action réussie avec détail',
  'Fermer',
  { duration: 3000 }
);
```

---

## 5. MAPPING COMPOSANTS → MANQUES

### 5.1 Composants à compléter

| Composant | État manquant | Action recommandée | Priorité |
|-----------|---------------|-------------------|----------|
| **Listes (exercices, etc.)** | Skeleton loader | Ajouter skeleton pendant chargement | P1 |
| **Formulaires génériques** | Feedback succès | Ajouter snackbar après soumission | P1 |
| **Navigation** | Loader transition | Ajouter loader global entre pages | P2 |
| **Upload images** | Progress bar | Ajouter `mat-progress-bar` | P1 |
| **Filtres** | Feedback recherche | Ajouter spinner discret | P2 |
| **Dashboard** | État vide | Ajouter message si pas de données | P2 |
| **Tags** | Feedback création | Ajouter snackbar succès/erreur | P1 |
| **Import/Export** | Progress détaillé | Améliorer feedback progression | P2 |

---

### 5.2 Détail par composant

#### 5.2.1 Listes (exercices, entraînements, échauffements, situations)

**État actuel** :
- ✅ Chargement : Variable `isLoading` présente
- ❌ Skeleton loader : Absent
- ✅ État vide : Messages présents
- ⚠️ Erreur : Géré par intercepteur (Mission 5.2)

**Manques** :
- Pas de skeleton loader pendant chargement
- Impression de page blanche si chargement > 1s

**Recommandation** :
```html
<div *ngIf="isLoading" class="skeleton-list">
  <div class="skeleton-item" *ngFor="let i of [1,2,3,4,5]">
    <div class="skeleton-line"></div>
    <div class="skeleton-line short"></div>
  </div>
</div>
```

---

#### 5.2.2 Formulaires (création/édition)

**État actuel** :
- ✅ Chargement : Bouton désactivé + icon
- ⚠️ Succès : Snackbar parfois absent
- ✅ Erreur : Géré par intercepteur
- N/A État vide

**Manques** :
- Feedback succès incohérent entre formulaires
- Certains formulaires ferment sans confirmation

**Recommandation** :
```typescript
// Après création/modification réussie
this.snackBar.open('Exercice créé avec succès', 'Fermer', { duration: 3000 });
```

---

#### 5.2.3 Upload images

**État actuel** :
- ⚠️ Chargement : Pas de progress bar
- ⚠️ Succès : Pas de feedback visuel
- ✅ Erreur : Géré par intercepteur

**Manques** :
- Utilisateur ne sait pas si upload en cours
- Pas de progression visible

**Recommandation** :
```html
<mat-progress-bar 
  *ngIf="uploading" 
  mode="indeterminate">
</mat-progress-bar>
```

---

#### 5.2.4 Navigation entre pages

**État actuel** :
- ❌ Chargement : Pas de loader global
- N/A Succès
- ✅ Erreur : Géré par guards

**Manques** :
- Flash blanc entre pages
- Pas de feedback pendant lazy loading

**Recommandation** :
```typescript
// Router events pour afficher loader global
this.router.events.pipe(
  filter(event => event instanceof NavigationStart)
).subscribe(() => this.showGlobalLoader = true);
```

---

## 6. RÈGLES TRANSVERSES

### 6.1 Règle T1 : Cohérence visuelle

**Principe** : Tous les feedbacks utilisent les mêmes composants Material

**Composants autorisés** :
- `mat-spinner` : Chargement indéterminé
- `mat-progress-bar` : Chargement avec progression
- `mat-snack-bar` : Messages temporaires (succès/erreur)
- `mat-icon` : Icons contextuels

**Composants interdits** :
- ❌ Spinners custom (sauf design system spécifique)
- ❌ Alerts bloquantes (préférer snackbar)
- ❌ Toasts tiers (utiliser Material)

---

### 6.2 Règle T2 : Timing cohérent

**Durées standardisées** :

| Type | Durée | Justification |
|------|-------|---------------|
| Snackbar succès | 3s | Temps de lecture confortable |
| Snackbar erreur | 5s | Utilisateur doit comprendre le problème |
| Snackbar info | 4s | Intermédiaire |
| Spinner minimum | 200ms | Éviter flash si < 200ms |
| Timeout opération | 10s | Au-delà, considérer comme erreur |

---

### 6.3 Règle T3 : Messages actionnables

**Principe** : Tout message doit être compréhensible et actionnable

**Structure recommandée** :
1. **Constat** : Ce qui s'est passé
2. **Cause** : Pourquoi (si pertinent)
3. **Action** : Que faire

**Exemples** :
- ✅ "Impossible de charger les données. Vérifiez votre connexion et réessayez."
- ✅ "Aucun exercice trouvé. Essayez de modifier vos filtres."
- ❌ "Erreur" (pas actionnable)
- ❌ "Chargement..." (pas de contexte)

---

### 6.4 Règle T4 : États mutuellement exclusifs

**Principe** : Un composant ne peut être que dans UN état à la fois

**États possibles** :
1. **LOADING** : Chargement en cours
2. **SUCCESS** : Données chargées et affichées
3. **ERROR** : Erreur survenue
4. **EMPTY** : Pas de données (mais pas d'erreur)

**Implémentation** :
```html
<div *ngIf="isLoading"><!-- Spinner --></div>
<div *ngIf="!isLoading && hasError"><!-- Erreur --></div>
<div *ngIf="!isLoading && !hasError && items.length === 0"><!-- Vide --></div>
<div *ngIf="!isLoading && !hasError && items.length > 0"><!-- Données --></div>
```

---

### 6.5 Règle T5 : Accessibilité

**Principe** : Feedbacks accessibles aux technologies d'assistance

**Bonnes pratiques** :
- ✅ `aria-live="polite"` sur messages dynamiques
- ✅ `aria-busy="true"` pendant chargement
- ✅ `role="status"` sur snackbars
- ✅ Textes alternatifs sur icons

**Exemple** :
```html
<div *ngIf="isLoading" role="status" aria-live="polite">
  <mat-spinner></mat-spinner>
  <span>Chargement des exercices...</span>
</div>
```

---

## 7. CHEVAUCHEMENTS AVEC CHANTIER 5

### 7.1 Mission 5.2 : Messages d'erreur utilisateur

**Chantier 5 - Mission 5.2** : Améliorer messages d'erreur frontend

**Responsabilité Chantier 5** :
- ✅ Mapping codes HTTP → Messages utilisateur
- ✅ Messages d'erreur détaillés et contextuels
- ✅ Gestion erreurs réseau, serveur, validation
- ✅ `HttpErrorInterceptor` centralisé

**Responsabilité Mission 4.4** :
- ✅ Structure visuelle du feedback erreur (snackbar, placement)
- ✅ Durée d'affichage
- ✅ Cohérence avec autres feedbacks (succès, chargement)

**Frontière claire** :
- **Chantier 5** : QUOI dire (contenu du message)
- **Mission 4.4** : COMMENT le dire (présentation, timing)

---

### 7.2 Complémentarité

**Mission 4.4 fournit** :
- Cadre visuel pour afficher messages
- Règles de timing et placement
- Cohérence entre tous types de feedback

**Chantier 5 utilise** :
- Cadre défini par Mission 4.4
- Applique messages spécifiques
- Respecte règles transverses

**Exemple de collaboration** :
```typescript
// Mission 4.4 : Définit la structure
this.snackBar.open(message, 'Fermer', { duration: 5000 });

// Chantier 5 : Fournit le message
const message = this.errorService.getErrorMessage(error.status);
```

---

### 7.3 Pas de doublon

**Mission 4.4 NE fait PAS** :
- ❌ Définir messages d'erreur spécifiques
- ❌ Mapper codes HTTP
- ❌ Gérer intercepteurs
- ❌ Créer nouveaux services d'erreur

**Chantier 5 NE fait PAS** :
- ❌ Redéfinir structure visuelle feedbacks
- ❌ Changer durées d'affichage
- ❌ Créer nouveaux composants de feedback

---

## 8. CRITÈRES DE VALIDATION

### 8.1 Critères de complétude

✅ **Tous les états documentés** :
- Chargement : Règles, composants, exemples
- Succès : Règles, durées, messages
- Erreur : Règles, structure (contenu → Chantier 5)
- Vide : Règles, actions suggérées

✅ **Tous les composants mappés** :
- 8 types de composants analysés
- Manques identifiés
- Actions recommandées avec priorités

✅ **Socle minimal défini** :
- 4 règles minimales obligatoires
- Exemples de code fournis
- Variables requises listées

### 8.2 Critères de cohérence

✅ **Règles transverses applicables** :
- 5 règles transverses définies
- Cohérence visuelle (Material)
- Timing standardisé
- Messages actionnables
- États mutuellement exclusifs
- Accessibilité

✅ **Pas de doublon avec Chantier 5** :
- Frontière claire définie
- Complémentarité documentée
- Responsabilités distinctes

### 8.3 Critères d'exploitabilité

✅ **Document utilisable par développeurs** :
- Grille de feedbacks attendus
- Patterns de code réutilisables
- Mapping composants → actions
- Priorités définies (P1, P2)

✅ **Aucun écran sans feedback** :
- Tous les états couverts
- Règles minimales obligatoires
- Composants incomplets identifiés

---

## 9. CONCLUSION

Ce document formalise **une stratégie cohérente de feedback utilisateur** pour Ultimate Frisbee Manager.

**Garanties fournies** :
- ✅ Aucun écran ne laisse l'utilisateur sans feedback
- ✅ Règles cohérentes et applicables
- ✅ Pas de doublon avec Chantier 5
- ✅ Socle minimal commun défini

**Usage** :
- **Frontend** : Référence pour implémenter feedbacks
- **QA** : Checklist pour valider feedbacks
- **Design** : Cohérence visuelle garantie

**Maintenance** :
- Mettre à jour si nouveaux patterns ajoutés
- Versionner les changements de règles
- Synchroniser avec Chantier 5 si évolutions

---

**Document validé pour Mission 4.4 - Uniformisation des feedbacks utilisateur**
