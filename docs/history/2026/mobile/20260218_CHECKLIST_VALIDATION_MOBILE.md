# CHECKLIST VALIDATION REFONTE MOBILE

**Date :** 18 février 2026  
**Document de référence :** `docs/MISSION_MOBILE_VERSION_FINALE_2.0.md`  
**Statut :** Prêt pour validation

---

## ✅ VALIDATION CONTRAINTES TECHNIQUES STRICTES

### Contraintes d'exclusion (ce qui NE doit PAS exister)
- [ ] ❌ Aucun Service Worker avancé
- [ ] ❌ Aucun IndexedDB
- [ ] ❌ Aucune synchronisation différée
- [ ] ❌ Aucune résolution de conflits
- [ ] ❌ Aucun Background sync
- [ ] ❌ Aucune notification push
- [ ] ❌ Aucune architecture offline dédiée
- [ ] ❌ Aucune modification backend
- [ ] ❌ Aucun mock de données
- [ ] ❌ Aucune donnée fictive

### Contraintes de réutilisation (ce qui DOIT exister)
- [ ] ✅ Réutilisation services CRUD existants (ExerciceService, etc.)
- [ ] ✅ Réutilisation modèles données existants (Exercice, Entrainement, etc.)
- [ ] ✅ Aucune duplication logique métier
- [ ] ✅ Respect architecture Angular actuelle
- [ ] ✅ Standalone components
- [ ] ✅ Lazy loading routes

---

## ✅ VALIDATION NAVIGATION (BOTTOM NAV)

### Structure attendue (5 onglets)
- [ ] 1. Accueil
- [ ] 2. Bibliothèque
- [ ] 3. **Créer** (nouveau)
- [ ] 4. Terrain
- [ ] 5. Profil

### Vérifications
- [ ] Onglet "Créer" présent et fonctionnel
- [ ] Navigation entre onglets fluide
- [ ] Tracking route actif correct
- [ ] Icônes appropriées

---

## ✅ VALIDATION CRÉATION (STEPPER MULTI-ÉTAPES)

### Exercice
- [ ] Route `/mobile/create/exercice` fonctionne
- [ ] Stepper 5 étapes :
  - [ ] Étape 1 : Nom, Description
  - [ ] Étape 2 : Durée, Joueurs, Matériel, Critère réussite, Notes
  - [ ] Étape 3 : Image (optionnel)
  - [ ] Étape 4 : Tags par catégorie
  - [ ] Étape 5 : Résumé + validation
- [ ] Validation formulaire fonctionnelle
- [ ] Navigation étapes (Suivant/Précédent/Annuler)
- [ ] Upload image fonctionne
- [ ] Sélection tags fonctionne
- [ ] Sauvegarde en base réussie
- [ ] Redirection vers détail après création

### Entraînement
- [ ] Route `/mobile/create/entrainement` fonctionne
- [ ] Stepper 6 étapes :
  - [ ] Étape 1 : Titre, Date
  - [ ] Étape 2 : Échauffement (optionnel)
  - [ ] Étape 3 : Exercices (sélection + ordre)
  - [ ] Étape 4 : Situation (optionnel)
  - [ ] Étape 5 : Tags (optionnel)
  - [ ] Étape 6 : Résumé
- [ ] Sélection exercices avec drag & drop
- [ ] Ordre exercices modifiable
- [ ] Durée totale calculée
- [ ] Relations correctement sauvegardées

### Échauffement
- [ ] Route `/mobile/create/echauffement` fonctionne
- [ ] Stepper 3 étapes :
  - [ ] Étape 1 : Nom, Description
  - [ ] Étape 2 : Blocs (ajout/suppression dynamique)
  - [ ] Étape 3 : Résumé
- [ ] Ajout/suppression blocs fonctionne
- [ ] Formulaire dynamique (FormArray) opérationnel

### Situation
- [ ] Route `/mobile/create/situation` fonctionne
- [ ] Stepper 4 étapes :
  - [ ] Étape 1 : Nom, Description
  - [ ] Étape 2 : Image (optionnel)
  - [ ] Étape 3 : Tags (optionnel)
  - [ ] Étape 4 : Résumé
- [ ] Création réussie

---

## ✅ VALIDATION ÉDITION MOBILE

### Navigation vers édition
- [ ] Depuis MobileDetailComponent : bouton "Éditer" → `/mobile/edit/:type/:id`
- [ ] Depuis MobileHomeComponent : action "Éditer" → `/mobile/edit/:type/:id`
- [ ] **Aucune** redirection vers desktop

### Fonctionnement édition
- [ ] Route `/mobile/edit/exercice/:id` fonctionne
- [ ] Route `/mobile/edit/entrainement/:id` fonctionne
- [ ] Route `/mobile/edit/echauffement/:id` fonctionne
- [ ] Route `/mobile/edit/situation/:id` fonctionne
- [ ] Formulaire pré-rempli avec données existantes
- [ ] Modification et sauvegarde fonctionnelles
- [ ] Redirection après sauvegarde

---

## ✅ VALIDATION BIBLIOTHÈQUE

### Fonctionnalités
- [ ] Onglets par type (Exercices, Entraînements, Échauffements, Situations)
- [ ] Liste contenus affichée
- [ ] Clic sur item → navigation vers détail
- [ ] Bouton "Ajouter" → **redirection `/mobile/create/:type`** (PAS desktop)

### Vérifications critiques
- [ ] ❌ Aucune redirection vers `/exercices/new` (desktop)
- [ ] ❌ Aucune redirection vers `/entrainements/new` (desktop)
- [ ] ✅ Redirection vers `/mobile/create/exercice` (mobile)
- [ ] ✅ Redirection vers `/mobile/create/entrainement` (mobile)

---

## ✅ VALIDATION DÉTAIL

### Actions disponibles
- [ ] Bouton "Éditer" → `/mobile/edit/:type/:id`
- [ ] Bouton "Dupliquer" fonctionne
- [ ] Bouton "Supprimer" fonctionne (avec confirmation)
- [ ] Bouton "Favoris" fonctionne
- [ ] **Aucune** redirection vers desktop

### Affichage
- [ ] Toutes les métadonnées affichées
- [ ] Images affichées
- [ ] Tags affichés
- [ ] Description complète
- [ ] Sections collapsibles fonctionnelles

---

## ✅ VALIDATION MODE TERRAIN

### Chronomètre
- [ ] Bouton Démarrer fonctionne
- [ ] Bouton Pause fonctionne
- [ ] Bouton Arrêter fonctionne
- [ ] Affichage temps formaté (MM:SS)
- [ ] **Arrêt automatique au changement de page**

### Bloc Notes
- [ ] Textarea notes présent
- [ ] Saisie texte fonctionne
- [ ] **Sauvegarde automatique** (debounce 1s)
- [ ] Indication visuelle "Notes sauvegardées"
- [ ] Persistance notes (localStorage)
- [ ] Rechargement notes au retour

### Autres
- [ ] Affichage entraînement du jour (si sélectionné)
- [ ] Section favoris rapides

---

## ✅ VALIDATION ALIGNEMENT TERMINOLOGIQUE

### Vérifier cohérence termes desktop/mobile
- [ ] "Exercice" (pas "Exo" ou autre)
- [ ] "Entraînement" (pas "Training" ou autre)
- [ ] "Échauffement" (pas "Warm-up" ou autre)
- [ ] "Situation de match" (pas "Situation" seul)
- [ ] Tous les labels identiques au desktop

---

## ✅ VALIDATION COMPOSANTS RÉUTILISABLES

### MobileStepperComponent
- [ ] Affichage étapes horizontal
- [ ] Navigation avant/arrière
- [ ] Bouton Annuler
- [ ] Bouton Terminer (dernière étape)
- [ ] Validation étapes
- [ ] Indicateur étape complétée

### MobileTagSelectorComponent
- [ ] Recherche tags fonctionne
- [ ] Affichage par catégorie
- [ ] Sélection simple (Objectif, Temps, Format)
- [ ] Sélection multiple (Travail spécifique, Niveau)
- [ ] Tags sélectionnés affichés
- [ ] Suppression tag sélectionné

### MobileImagePickerComponent
- [ ] Sélection fichier (galerie/caméra)
- [ ] Prévisualisation image
- [ ] Validation taille (max 2 MB)
- [ ] Validation format (JPG, PNG, GIF)
- [ ] Suppression image
- [ ] Indicateur upload en cours

### MobileRelationSelectorComponent
- [ ] Recherche items fonctionne
- [ ] Liste disponibles affichée
- [ ] Sélection multiple
- [ ] Liste sélectionnés affichée
- [ ] **Drag & drop pour ordre**
- [ ] Suppression item sélectionné
- [ ] Affichage durée (si applicable)

---

## ✅ VALIDATION ROUTES

### Routes création
- [ ] `/mobile/create` → Sélection type
- [ ] `/mobile/create/exercice` → Création exercice
- [ ] `/mobile/create/entrainement` → Création entraînement
- [ ] `/mobile/create/echauffement` → Création échauffement
- [ ] `/mobile/create/situation` → Création situation

### Routes édition
- [ ] `/mobile/edit/:type/:id` → Routeur édition
- [ ] `/mobile/edit/exercice/:id` → Édition exercice
- [ ] `/mobile/edit/entrainement/:id` → Édition entraînement
- [ ] `/mobile/edit/echauffement/:id` → Édition échauffement
- [ ] `/mobile/edit/situation/:id` → Édition situation

### Routes existantes
- [ ] `/mobile/home` → Accueil
- [ ] `/mobile/library` → Bibliothèque
- [ ] `/mobile/terrain` → Mode terrain
- [ ] `/mobile/profile` → Profil
- [ ] `/mobile/detail/:type/:id` → Détail

---

## ✅ VALIDATION NETTOYAGE

### Suppressions effectuées
- [ ] MobileComingSoonComponent supprimé
- [ ] Aucune redirection desktop dans MobileDetailComponent
- [ ] Aucune redirection desktop dans MobileHomeComponent
- [ ] Aucune redirection desktop dans MobileLibraryComponent
- [ ] Message "non disponible en mobile" supprimé

### Code propre
- [ ] Aucun code mort
- [ ] Aucun import inutilisé
- [ ] Aucune duplication logique
- [ ] Aucun TODO/FIXME critique

---

## ✅ VALIDATION PERFORMANCES

### Chargement
- [ ] Lazy loading routes fonctionne
- [ ] Pas de ralentissement perceptible
- [ ] Images optimisées/compressées

### Réactivité
- [ ] Navigation fluide
- [ ] Formulaires réactifs
- [ ] Pas de freeze UI
- [ ] Drag & drop fluide

---

## ✅ VALIDATION ERGONOMIE MOBILE

### Affichage
- [ ] Responsive sur petits écrans
- [ ] Boutons taille tactile (min 48px)
- [ ] Espacement adapté mobile
- [ ] Scroll fluide

### Interactions
- [ ] Tap/click fonctionnels
- [ ] Swipe si applicable
- [ ] Feedback visuel actions
- [ ] Messages erreur clairs

---

## 🎯 VALIDATION FINALE DOCUMENT CONTRACTUEL

### Checklist officielle (Section 1-9 du document)
- [ ] ✅ Positionnement produit respecté (continuité multi-device)
- [ ] ✅ Routes conservées (home, library, terrain, profile, detail)
- [ ] ✅ Services conservés (MobileNavigationService, MobileDataService, etc.)
- [ ] ✅ Suppressions officielles effectuées (offline, SW, IndexedDB)
- [ ] ✅ Architecture finale mobile respectée (5 onglets)
- [ ] ✅ Écrans structurés selon spécifications
- [ ] ✅ Nouveaux composants créés (liste complète)
- [ ] ✅ Modifications effectuées (liste complète)
- [ ] ✅ Contraintes techniques strictes respectées
- [ ] ✅ Plan d'implémentation suivi

---

## 📋 TESTS MANUELS À EFFECTUER

### Parcours 1 : Création Exercice
1. Naviguer vers onglet "Créer"
2. Sélectionner "Exercice"
3. Remplir étape 1 (nom, description)
4. Remplir étape 2 (durée, joueurs, matériel)
5. Ajouter image étape 3
6. Sélectionner tags étape 4
7. Vérifier résumé étape 5
8. Valider création
9. Vérifier redirection vers détail
10. Vérifier données sauvegardées

### Parcours 2 : Édition Entraînement
1. Naviguer vers Library
2. Sélectionner un entraînement
3. Cliquer "Éditer"
4. Vérifier pré-remplissage formulaire
5. Modifier titre
6. Modifier ordre exercices (drag & drop)
7. Sauvegarder
8. Vérifier modifications appliquées

### Parcours 3 : Mode Terrain
1. Naviguer vers onglet "Terrain"
2. Démarrer chronomètre
3. Vérifier comptage
4. Ajouter notes dans textarea
5. Attendre 1s (debounce)
6. Vérifier indication "sauvegardé"
7. Changer d'onglet
8. Vérifier chrono arrêté
9. Revenir sur Terrain
10. Vérifier notes persistées

### Parcours 4 : Bibliothèque
1. Naviguer vers Library
2. Changer d'onglet (Exercices → Entraînements)
3. Cliquer bouton "Ajouter"
4. Vérifier redirection `/mobile/create/entrainement`
5. Annuler création
6. Vérifier retour Library

---

## ✅ RÉSULTAT VALIDATION

**Date validation :** _À compléter_  
**Validé par :** _À compléter_  
**Statut :** _À compléter_

### Blocages identifiés
_À compléter lors des tests_

### Corrections nécessaires
_À compléter lors des tests_

### Validation finale
- [ ] Toutes les cases cochées
- [ ] Aucun blocage critique
- [ ] Conformité document 100%
- [ ] Prêt pour déploiement

---

**FIN DE LA CHECKLIST**
