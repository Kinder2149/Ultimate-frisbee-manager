# 🎨 AUDIT EXPÉRIENCE UTILISATEUR (UI/UX)

**Date** : 26 janvier 2026  
**Statut** : ⏳ En cours d'analyse

---

## 🎯 OBJECTIF

Vérifier que l'interface utilisateur est :
- **Cohérente** : Design uniforme sur toute l'application
- **Intuitive** : Actions claires et prévisibles
- **Responsive** : Fonctionnelle sur desktop ET mobile
- **Accessible** : Utilisable par tous
- **Performante** : Réactive et fluide

---

## 🎨 COHÉRENCE VISUELLE

### Design System

#### Composants Material Design
```typescript
// Angular Material utilisé
@angular/material: ^17.0.0
```

**Composants attendus** :
- [ ] Boutons (mat-button, mat-raised-button, mat-icon-button)
- [ ] Cartes (mat-card)
- [ ] Formulaires (mat-form-field, mat-input)
- [ ] Dialogs (mat-dialog)
- [ ] Snackbars (mat-snack-bar)
- [ ] Menus (mat-menu)
- [ ] Tables (mat-table)
- [ ] Chips (mat-chip)

#### Palette de Couleurs
**À vérifier** :
- [ ] Couleurs primaires/secondaires définies
- [ ] Cohérence des couleurs par catégorie :
  - 🟢 Vert : Ajouter
  - 🔴 Rouge : Exercices
  - 🔵 Bleu : Entraînements
  - 🟠 Orange : Échauffements
  - 🟣 Violet : Situations de match
- [ ] Contraste suffisant (accessibilité)
- [ ] Mode sombre disponible ?

#### Typographie
- [ ] Police cohérente (Roboto par défaut avec Material)
- [ ] Hiérarchie claire (h1, h2, h3, body, caption)
- [ ] Tailles lisibles sur mobile

---

## 📱 RESPONSIVE DESIGN

### Breakpoints à Tester

| Device | Largeur | Statut | Notes |
|--------|---------|--------|-------|
| **Mobile** | < 768px | ⏳ | Navigation adaptée ? |
| **Tablet** | 768-1024px | ⏳ | Layout optimisé ? |
| **Desktop** | > 1024px | ⏳ | Utilisation de l'espace ? |

### Navigation Mobile

#### Système de Bulles (d'après mémoire)
```scss
// Transformation de la navigation desktop en bulles mobiles
- Bulles colorées par catégorie
- Layout centré avec flex-wrap
- Dropdowns → menus contextuels
- Animations douces (slideInUp, hover)
- Taille tactile optimisée (36px min-height)
- Header sticky
```

**À vérifier** :
- [ ] Navigation accessible sur mobile
- [ ] Bulles cliquables facilement (zone tactile suffisante)
- [ ] Menus contextuels fonctionnels
- [ ] Pas de débordement horizontal
- [ ] Header reste visible en scroll

### Composants Responsives

#### Cartes d'Exercices
- [ ] Adaptation de la densité d'information
- [ ] Images redimensionnées correctement
- [ ] Texte lisible sans zoom
- [ ] Actions accessibles (boutons pas trop petits)

#### Formulaires
- [ ] Champs de saisie adaptés au mobile
- [ ] Clavier approprié (email, number, etc.)
- [ ] Labels visibles
- [ ] Validation en temps réel

#### Listes et Tableaux
- [ ] Scroll horizontal si nécessaire
- [ ] Pagination adaptée
- [ ] Filtres accessibles

---

## 🧭 NAVIGATION ET ARCHITECTURE DE L'INFORMATION

### Menu Principal

**Structure attendue** :
```
├── Dashboard (accueil)
├── Exercices
│   ├── Liste
│   └── Créer
├── Échauffements
│   ├── Liste
│   └── Créer
├── Situations de Match
│   ├── Liste
│   └── Créer
├── Entraînements
│   ├── Liste
│   └── Créer
└── Profil / Déconnexion
```

**À vérifier** :
- [ ] Menu accessible depuis toutes les pages
- [ ] Élément actif mis en évidence
- [ ] Breadcrumb si navigation profonde
- [ ] Retour arrière fonctionnel (bouton ou navigateur)

### Flux de Navigation

#### Création d'un Exercice
```
Liste Exercices → Bouton "Créer" → Formulaire → Sauvegarde → Détail ou Liste
```
- [ ] Chemin clair et logique
- [ ] Possibilité d'annuler à chaque étape
- [ ] Confirmation avant de quitter si modifications non sauvegardées

#### Création d'un Entraînement
```
Liste Entraînements → Créer → Formulaire de base → Ajouter exercices → Réorganiser → Sauvegarder
```
- [ ] Workflow en plusieurs étapes clair
- [ ] Possibilité de revenir en arrière
- [ ] Sauvegarde intermédiaire (brouillon) ?

---

## 💬 FEEDBACK UTILISATEUR

### Messages de Succès

**Après chaque action** :
- [ ] Création : "Exercice créé avec succès"
- [ ] Modification : "Modifications enregistrées"
- [ ] Suppression : "Exercice supprimé"
- [ ] Upload : "Image uploadée avec succès"

**Format** :
- [ ] Toast/Snackbar visible mais non intrusif
- [ ] Durée appropriée (3-5 secondes)
- [ ] Possibilité de fermer manuellement

### Messages d'Erreur

**Clarté** :
- [ ] Message explicite (pas juste "Erreur")
- [ ] Indication de la cause ("Le titre est obligatoire")
- [ ] Suggestion de correction ("Veuillez remplir le champ titre")

**Visibilité** :
- [ ] Couleur rouge ou icône d'alerte
- [ ] Positionnement près du champ concerné
- [ ] Persistant jusqu'à correction

### États de Chargement

**Indicateurs** :
- [ ] Spinner lors du chargement de données
- [ ] Skeleton screens pour les listes
- [ ] Boutons désactivés pendant l'envoi
- [ ] Texte "Chargement..." ou "Enregistrement..."

**Performance perçue** :
- [ ] Feedback immédiat (< 100ms)
- [ ] Pas de freeze de l'interface
- [ ] Annulation possible pour les actions longues

---

## 🎯 ACTIONS ET BOUTONS

### Boutons Principaux

| Action | Couleur | Icône | Position | Statut |
|--------|---------|-------|----------|--------|
| **Créer** | Vert (primary) | add | En haut à droite | ⏳ |
| **Modifier** | Bleu | edit | Détail/Carte | ⏳ |
| **Supprimer** | Rouge | delete | Détail/Carte | ⏳ |
| **Sauvegarder** | Vert | save | Formulaire | ⏳ |
| **Annuler** | Gris | close | Formulaire | ⏳ |
| **Retour** | Gris | arrow_back | En haut à gauche | ⏳ |

**À vérifier** :
- [ ] Cohérence des couleurs et icônes
- [ ] Taille tactile suffisante (min 44x44px)
- [ ] États hover/active/disabled
- [ ] Confirmation pour actions destructives

### Actions Contextuelles

**Menu "3 points"** :
- [ ] Modifier
- [ ] Dupliquer (si applicable)
- [ ] Exporter (si applicable)
- [ ] Supprimer

**Actions rapides** :
- [ ] Favoris / Épingler
- [ ] Partager
- [ ] Imprimer

---

## 📝 FORMULAIRES

### Ergonomie

#### Champs de Saisie
- [ ] Labels clairs et explicites
- [ ] Placeholders informatifs
- [ ] Validation en temps réel
- [ ] Messages d'erreur sous le champ
- [ ] Champs obligatoires marqués (*)

#### Types de Champs
- [ ] **Texte court** : input text
- [ ] **Texte long** : textarea ou éditeur riche (Quill)
- [ ] **Nombre** : input number avec +/-
- [ ] **Date** : datepicker
- [ ] **Durée** : input number + unité (min)
- [ ] **Tags** : chips avec autocomplete
- [ ] **Image** : zone de drag & drop + preview

#### Éditeur Riche (Quill)
```typescript
// ngx-quill utilisé
ngx-quill: 25.3.2
```

**Fonctionnalités** :
- [ ] Formatage de texte (gras, italique, souligné)
- [ ] Listes (ordonnées, non ordonnées)
- [ ] Titres (h1, h2, h3)
- [ ] Liens
- [ ] Images (si applicable)
- [ ] Preview du rendu

**À vérifier** :
- [ ] Toolbar visible et accessible
- [ ] Responsive sur mobile
- [ ] Sauvegarde du HTML correctement
- [ ] Affichage correct dans les détails

### Validation

#### Côté Frontend
- [ ] Validation immédiate (on blur ou on change)
- [ ] Messages d'erreur clairs
- [ ] Bouton submit désactivé si invalide
- [ ] Champs requis marqués visuellement

#### Côté Backend
- [ ] Validation des données reçues
- [ ] Messages d'erreur renvoyés au frontend
- [ ] Codes HTTP appropriés (400 Bad Request)

---

## 🖼️ GESTION DES IMAGES

### Upload

**Interface** :
- [ ] Zone de drag & drop
- [ ] Bouton "Parcourir"
- [ ] Preview de l'image avant upload
- [ ] Barre de progression
- [ ] Possibilité d'annuler

**Validation** :
- [ ] Formats acceptés (jpg, png, webp)
- [ ] Taille maximale (ex: 5 MB)
- [ ] Message d'erreur si non conforme

### Affichage

**Dans les listes** :
- [ ] Thumbnail optimisé (petit format)
- [ ] Lazy loading
- [ ] Placeholder si pas d'image

**Dans les détails** :
- [ ] Image en taille réelle ou optimisée
- [ ] Possibilité d'agrandir (lightbox)
- [ ] Alt text pour accessibilité

---

## 🔍 RECHERCHE ET FILTRES

### Barre de Recherche

**Fonctionnalités** :
- [ ] Recherche textuelle (titre, description)
- [ ] Recherche en temps réel (debounce)
- [ ] Icône de recherche visible
- [ ] Bouton pour effacer la recherche
- [ ] Indication du nombre de résultats

### Filtres par Tags

**Interface** :
- [ ] Dropdowns par catégorie de tags
- [ ] Sélection multiple
- [ ] Chips pour les tags sélectionnés
- [ ] Bouton "Effacer les filtres"
- [ ] Indication du nombre de filtres actifs

**Comportement** :
- [ ] Filtres combinés (ET ou OU ?)
- [ ] Mise à jour immédiate de la liste
- [ ] Conservation des filtres en navigation
- [ ] URL reflète les filtres (deep linking)

---

## ♿ ACCESSIBILITÉ

### Standards WCAG

#### Niveau A (Minimum)
- [ ] Texte alternatif pour les images
- [ ] Navigation au clavier
- [ ] Contraste suffisant (4.5:1 pour texte normal)
- [ ] Pas de contenu clignotant

#### Niveau AA (Recommandé)
- [ ] Contraste renforcé (7:1 pour texte important)
- [ ] Taille de texte redimensionnable
- [ ] Focus visible sur les éléments interactifs
- [ ] Labels pour tous les champs de formulaire

### Navigation au Clavier

**Touches à supporter** :
- [ ] Tab : Navigation entre éléments
- [ ] Enter : Validation/Activation
- [ ] Espace : Activation (boutons, checkboxes)
- [ ] Échap : Fermeture (dialogs, menus)
- [ ] Flèches : Navigation dans les listes/menus

### ARIA

**Attributs à vérifier** :
- [ ] `aria-label` sur les boutons icônes
- [ ] `aria-describedby` pour les messages d'erreur
- [ ] `role` approprié (dialog, menu, etc.)
- [ ] `aria-live` pour les notifications

---

## 🎭 ÉTATS DES COMPOSANTS

### Cartes d'Exercices

**États** :
- [ ] Normal (au repos)
- [ ] Hover (survol souris)
- [ ] Active (clic)
- [ ] Expanded (détails visibles)
- [ ] Collapsed (détails cachés)
- [ ] Selected (sélection multiple)

**Transitions** :
- [ ] Animations douces (300ms)
- [ ] Pas de saccades
- [ ] Respect du `prefers-reduced-motion`

### Boutons

**États** :
- [ ] Normal
- [ ] Hover
- [ ] Active (pressed)
- [ ] Disabled (grisé, non cliquable)
- [ ] Loading (spinner)

### Champs de Formulaire

**États** :
- [ ] Empty (vide)
- [ ] Filled (rempli)
- [ ] Focus (en cours de saisie)
- [ ] Valid (valide)
- [ ] Invalid (erreur)
- [ ] Disabled (non modifiable)

---

## 📊 AFFICHAGE DES DONNÉES

### Listes

**Formats** :
- [ ] Cartes (grid)
- [ ] Liste (linéaire)
- [ ] Tableau (si beaucoup de colonnes)

**Fonctionnalités** :
- [ ] Tri (par titre, date, durée)
- [ ] Pagination ou scroll infini
- [ ] Sélection multiple (si actions groupées)
- [ ] Actions rapides (modifier, supprimer)

### Détails

**Structure** :
- [ ] Titre principal
- [ ] Métadonnées (date, durée, auteur)
- [ ] Image (si présente)
- [ ] Description complète
- [ ] Tags
- [ ] Actions (modifier, supprimer, exporter)

**Navigation** :
- [ ] Bouton retour vers la liste
- [ ] Précédent/Suivant (si applicable)

### Dashboard

**Widgets attendus** :
- [ ] Statistiques (nombre d'exercices, entraînements, etc.)
- [ ] Derniers éléments créés
- [ ] Entraînements à venir
- [ ] Graphiques (si pertinent)

---

## 🎨 CHECKLIST UI/UX PAR PAGE

### Page de Connexion

- [ ] Formulaire centré et clair
- [ ] Champs email et password
- [ ] Bouton "Se connecter" visible
- [ ] Lien "Mot de passe oublié" (si implémenté)
- [ ] Message d'erreur si identifiants incorrects
- [ ] Redirection vers dashboard après connexion
- [ ] Design cohérent avec le reste de l'app

### Dashboard

- [ ] Vue d'ensemble claire
- [ ] Accès rapide aux actions principales
- [ ] Statistiques pertinentes
- [ ] Derniers éléments affichés
- [ ] Navigation vers les sections principales

### Liste d'Exercices

- [ ] Cartes d'exercices claires
- [ ] Image, titre, tags visibles
- [ ] Bouton "Créer un exercice" visible
- [ ] Filtres par tags accessibles
- [ ] Barre de recherche fonctionnelle
- [ ] Indication si liste vide
- [ ] Actions rapides (modifier, supprimer)

### Formulaire d'Exercice

- [ ] Tous les champs présents et labellisés
- [ ] Éditeur riche pour description/consignes
- [ ] Upload d'image fonctionnel
- [ ] Sélection de tags
- [ ] Boutons "Sauvegarder" et "Annuler"
- [ ] Validation des champs
- [ ] Messages d'erreur clairs

### Détail d'Exercice

- [ ] Toutes les informations affichées
- [ ] Image en grand format
- [ ] Tags visibles
- [ ] Boutons "Modifier" et "Supprimer"
- [ ] Bouton "Retour"
- [ ] Formatage du texte respecté

### Liste d'Entraînements

- [ ] Cartes d'entraînements claires
- [ ] Date, durée, nombre d'exercices visibles
- [ ] Bouton "Créer un entraînement"
- [ ] Filtres et recherche
- [ ] Actions rapides

### Formulaire d'Entraînement

- [ ] Champs de base (titre, date, lieu, etc.)
- [ ] Section "Ajouter des exercices"
- [ ] Liste des exercices ajoutés
- [ ] Possibilité de réorganiser
- [ ] Durée totale calculée
- [ ] Boutons "Sauvegarder" et "Annuler"

### Détail d'Entraînement

- [ ] Informations générales
- [ ] Liste ordonnée des exercices/échauffements/situations
- [ ] Durée de chaque élément
- [ ] Durée totale
- [ ] Boutons "Modifier", "Exporter", "Supprimer"

---

## 🚨 PROBLÈMES UX COURANTS À VÉRIFIER

### Incohérences

- [ ] Boutons avec des labels différents pour la même action
- [ ] Couleurs différentes pour des actions similaires
- [ ] Positions changeantes des éléments entre pages
- [ ] Terminologie incohérente (exercice vs activité)

### Manque de Feedback

- [ ] Action sans confirmation visuelle
- [ ] Chargement sans indicateur
- [ ] Erreur silencieuse
- [ ] Succès non communiqué

### Navigation Confuse

- [ ] Pas de retour arrière
- [ ] Breadcrumb manquant
- [ ] Élément actif non visible
- [ ] Liens morts ou non fonctionnels

### Formulaires Frustrants

- [ ] Champs obligatoires non marqués
- [ ] Validation trop stricte ou floue
- [ ] Perte de données en cas d'erreur
- [ ] Pas de sauvegarde automatique

### Performance

- [ ] Chargement lent sans indicateur
- [ ] Images non optimisées
- [ ] Pas de lazy loading
- [ ] Interface qui freeze

---

## 🎯 ACTIONS PRIORITAIRES

### 🔴 BLOQUANT

1. **Tester la navigation complète**
   - Vérifier que toutes les pages sont accessibles
   - Tester les boutons retour/annuler
   - Vérifier la cohérence des menus

2. **Valider les formulaires**
   - Tous les champs fonctionnels
   - Validation et messages d'erreur
   - Sauvegarde effective

### 🟠 MAJEUR

3. **Vérifier le responsive mobile**
   - Navigation adaptée
   - Formulaires utilisables
   - Cartes lisibles

4. **Tester les feedbacks utilisateur**
   - Messages de succès/erreur
   - États de chargement
   - Confirmations de suppression

### 🟡 MINEUR

5. **Optimiser l'accessibilité**
   - Navigation au clavier
   - Contraste des couleurs
   - Labels ARIA

6. **Améliorer la performance perçue**
   - Skeleton screens
   - Lazy loading
   - Optimisation des images

---

## 📝 GRILLE D'ÉVALUATION UX

| Critère | Note /5 | Commentaires |
|---------|---------|--------------|
| **Cohérence visuelle** | ⏳ | À évaluer |
| **Clarté de la navigation** | ⏳ | À évaluer |
| **Qualité des formulaires** | ⏳ | À évaluer |
| **Feedback utilisateur** | ⏳ | À évaluer |
| **Responsive design** | ⏳ | À évaluer |
| **Accessibilité** | ⏳ | À évaluer |
| **Performance perçue** | ⏳ | À évaluer |
| **Gestion des erreurs** | ⏳ | À évaluer |

**Score global** : ⏳ / 40

---

**Statut** : ⏳ Analyse en cours  
**Prochaine étape** : Tester les parcours utilisateurs critiques
