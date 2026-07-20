# GUIDE COMPLET TESTS MANUELS MOBILE - 20 FÉVRIER 2026

**Date** : 2026-02-20  
**Statut** : WORK - GUIDE DE TEST  
**Durée estimée** : 6-8 heures  
**Prérequis** : Serveur Angular démarré

---

## 🚀 COMMANDES DE DÉMARRAGE

### 1. Démarrer le backend (si nécessaire)

```bash
# Terminal 1 - Backend
cd d:\Coding\AppWindows\Ultimate-frisbee-manager\backend
npm start
```

**Vérification** : Backend accessible sur `http://localhost:3000`

---

### 2. Démarrer le frontend Angular

```bash
# Terminal 2 - Frontend
cd d:\Coding\AppWindows\Ultimate-frisbee-manager\frontend
npm start
```

**Vérification** : 
- Compilation réussie
- Application accessible sur `http://localhost:4200`

---

### 3. Accéder à la version mobile

**URL à utiliser** : `http://localhost:4200/mobile/home`

**Alternatives** :
- `http://localhost:4200/mobile/library`
- `http://localhost:4200/mobile/create`
- `http://localhost:4200/mobile/terrain`
- `http://localhost:4200/mobile/profile`

---

## 📱 CONFIGURATION NAVIGATEUR

### Mode développeur Chrome

1. Ouvrir Chrome DevTools : `F12`
2. Cliquer sur l'icône "Toggle device toolbar" : `Ctrl+Shift+M`
3. Sélectionner un appareil :
   - **iPhone 12 Pro** (390x844)
   - **Pixel 5** (393x851)
   - **iPad Air** (820x1180)

### Mode responsive

**Dimensions recommandées** :
- Mobile portrait : 375x667 (iPhone SE)
- Mobile large : 414x896 (iPhone 11 Pro Max)
- Tablette : 768x1024 (iPad)

---

## ✅ CHECKLIST TESTS MANUELS COMPLETS

### 📍 PARCOURS 1 : NAVIGATION (15 min)

#### 1.1 Bottom Navigation

**URL** : `http://localhost:4200/mobile/home`

**Tests** :
- [ ] 5 onglets visibles (Accueil, Bibliothèque, Créer, Terrain, Profil)
- [ ] Icônes correctes pour chaque onglet
- [ ] Labels visibles
- [ ] Clic sur "Accueil" → Navigation vers `/mobile/home`
- [ ] Clic sur "Bibliothèque" → Navigation vers `/mobile/library`
- [ ] Clic sur "Créer" → Navigation vers `/mobile/create`
- [ ] Clic sur "Terrain" → Navigation vers `/mobile/terrain`
- [ ] Clic sur "Profil" → Navigation vers `/mobile/profile`
- [ ] Onglet actif surligné (couleur primaire)
- [ ] Transition fluide entre onglets

**Bugs potentiels** :
- Navigation ne fonctionne pas → Vérifier routes
- Onglet actif non surligné → Vérifier `MobileNavigationService`

---

### 📍 PARCOURS 2 : ACCUEIL (30 min)

#### 2.1 Feed unifié

**URL** : `http://localhost:4200/mobile/home`

**Tests** :
- [ ] Feed de contenus affiché
- [ ] Cartes avec titre, type, durée, tags
- [ ] Images affichées (si présentes)
- [ ] Clic sur carte → Navigation vers détail
- [ ] Scroll fluide

#### 2.2 Filtres par catégorie

**Tests** :
- [ ] Chips de filtres visibles (Tout, Exercices, Entraînements, Échauffements, Situations)
- [ ] Clic sur "Exercices" → Affiche uniquement exercices
- [ ] Clic sur "Entraînements" → Affiche uniquement entraînements
- [ ] Clic sur "Tout" → Affiche tous les contenus
- [ ] Compteur éléments correct

#### 2.3 Recherche globale

**Tests** :
- [ ] Barre de recherche visible
- [ ] Saisie texte → Filtrage en temps réel
- [ ] Recherche vide → Message "Aucun résultat"
- [ ] Bouton clear visible si texte saisi
- [ ] Clic clear → Réinitialise recherche

#### 2.4 Tri

**Tests** :
- [ ] Bouton tri visible
- [ ] Clic → Menu déroulant (Récent, Ancien, A-Z, Z-A)
- [ ] Sélection tri → Ordre modifié

**Bugs potentiels** :
- Feed vide → Vérifier données en base
- Filtres ne fonctionnent pas → Vérifier observables

---

### 📍 PARCOURS 3 : BIBLIOTHÈQUE (45 min)

#### 3.1 Tabs

**URL** : `http://localhost:4200/mobile/library`

**Tests** :
- [ ] 4 tabs visibles (Exercices, Entraînements, Échauffements, Situations)
- [ ] Clic tab → Changement contenu
- [ ] Tab actif surligné
- [ ] Compteur éléments par tab

#### 3.2 Recherche par tab ✅ NOUVEAU

**Tests** :
- [ ] Barre recherche visible dans chaque tab
- [ ] Saisie texte → Filtrage avec debounce 300ms
- [ ] Recherche sur nom ET description
- [ ] Message "Aucun résultat" si vide
- [ ] Bouton clear fonctionne
- [ ] Recherche indépendante par tab

#### 3.3 Affichage éléments

**Tests** :
- [ ] Liste exercices avec nom, durée, tags
- [ ] Liste entraînements avec titre, date, durée totale
- [ ] Liste échauffements avec nom, nombre de blocs
- [ ] Liste situations avec nom, joueurs
- [ ] Clic élément → Navigation vers détail

#### 3.4 Bouton créer

**Tests** :
- [ ] Bouton FAB "+" visible (si implémenté)
- [ ] Clic depuis tab Exercices → `/mobile/create/exercice`
- [ ] Clic depuis tab Entraînements → `/mobile/create/entrainement`

**Bugs potentiels** :
- Recherche ne filtre pas → Vérifier `filterItems()`
- Debounce ne fonctionne pas → Vérifier `searchSubject$`

---

### 📍 PARCOURS 4 : DÉTAIL (1h)

#### 4.1 Affichage détail

**URL** : Cliquer sur un élément depuis Library

**Tests** :
- [ ] Header avec titre et bouton retour
- [ ] Métadonnées (durée, joueurs, matériel, tags)
- [ ] Description complète
- [ ] Images affichées

#### 4.2 Sections collapsibles

**Tests** :
- [ ] Section "Description" collapsible
- [ ] Section "Matériel" collapsible (si présent)
- [ ] Section "Consignes" collapsible (si présent)
- [ ] Clic → Ouverture/fermeture fluide
- [ ] Icône chevron change de sens

#### 4.3 Actions détail ✅ NOUVEAU

**Tests** :
- [ ] Bouton "Favoris" visible
- [ ] Clic Favoris → Icône change (star_border ↔ star)
- [ ] Feedback "Ajouté aux favoris" / "Retiré des favoris"
- [ ] **Bouton "Dupliquer" visible**
- [ ] **Clic Dupliquer → Confirmation**
- [ ] **Duplication réussie → Redirection vers nouveau détail**
- [ ] **Bouton "Supprimer" visible**
- [ ] **Clic Supprimer → Dialog confirmation**
- [ ] **Confirmation suppression → Redirection vers Library**
- [ ] **Annulation suppression → Reste sur détail**
- [ ] Bouton "Éditer" visible
- [ ] Clic Éditer → Navigation vers édition

#### 4.4 Visualiseur images

**Tests** :
- [ ] Clic image → Ouvre visualiseur plein écran
- [ ] Swipe gauche/droite → Navigation entre images
- [ ] Pinch zoom fonctionne
- [ ] Bouton fermer visible
- [ ] Clic fermer → Retour détail

#### 4.5 Navigation retour

**Tests** :
- [ ] Bouton retour header fonctionne
- [ ] Retour vers Library
- [ ] Historique navigateur fonctionne

**Bugs potentiels** :
- Duplication échoue → Vérifier service CRUD
- Dialog confirmation ne s'ouvre pas → Vérifier MatDialog
- Permissions insuffisantes → Vérifier PermissionsService

---

### 📍 PARCOURS 5 : CRÉATION (2h)

#### 5.1 Sélection type

**URL** : `http://localhost:4200/mobile/create`

**Tests** :
- [ ] 4 cartes de sélection (Exercice, Entraînement, Échauffement, Situation)
- [ ] Icônes correctes
- [ ] Descriptions visibles
- [ ] Clic Exercice → `/mobile/create/exercice`
- [ ] Clic Entraînement → `/mobile/create/entrainement`
- [ ] Clic Échauffement → `/mobile/create/echauffement`
- [ ] Clic Situation → `/mobile/create/situation`

#### 5.2 Création Exercice (Stepper 5 étapes)

**Étape 1 : Informations de base**
- [ ] Champs nom, description visibles
- [ ] Validation : nom requis
- [ ] Bouton "Suivant" désactivé si invalide
- [ ] Bouton "Suivant" activé si valide
- [ ] Clic Suivant → Étape 2

**Étape 2 : Détails**
- [ ] Champs durée, joueurs, matériel visibles
- [ ] Validation : durée nombre positif
- [ ] Bouton "Précédent" fonctionne
- [ ] Bouton "Suivant" fonctionne

**Étape 3 : Images**
- [ ] Bouton upload image visible
- [ ] Sélection image → Aperçu affiché
- [ ] Suppression image fonctionne
- [ ] Bouton "Suivant" fonctionne

**Étape 4 : Tags**
- [ ] Liste tags disponibles
- [ ] Sélection tags fonctionne
- [ ] Tags sélectionnés affichés
- [ ] Bouton "Suivant" fonctionne

**Étape 5 : Résumé**
- [ ] Toutes les données affichées
- [ ] Bouton "Créer" visible
- [ ] Clic Créer → Sauvegarde en base
- [ ] Feedback "Exercice créé"
- [ ] Redirection vers détail du nouvel exercice

**Bouton Annuler**
- [ ] Bouton "Annuler" visible à chaque étape
- [ ] Clic Annuler → Retour vers `/mobile/create`

#### 5.3 Création Entraînement (Stepper 6 étapes)

**Étape 1 : Informations**
- [ ] Champs titre, date visibles
- [ ] Validation : titre requis
- [ ] Bouton "Suivant" fonctionne

**Étape 2 : Échauffement**
- [ ] Liste échauffements disponibles
- [ ] Sélection échauffement fonctionne
- [ ] Bouton "Suivant" fonctionne

**Étape 3 : Exercices**
- [ ] Liste exercices disponibles
- [ ] Sélection multiple fonctionne
- [ ] Drag & drop pour ordre fonctionne
- [ ] Durée totale calculée automatiquement
- [ ] Bouton "Suivant" fonctionne

**Étape 4 : Situation**
- [ ] Liste situations disponibles
- [ ] Sélection situation fonctionne
- [ ] Bouton "Suivant" fonctionne

**Étape 5 : Tags**
- [ ] Sélection tags fonctionne
- [ ] Bouton "Suivant" fonctionne

**Étape 6 : Résumé**
- [ ] Échauffement affiché
- [ ] Liste exercices affichée (ordre correct)
- [ ] Situation affichée
- [ ] Durée totale affichée
- [ ] Tags affichés
- [ ] Bouton "Créer" fonctionne
- [ ] Redirection vers détail

#### 5.4 Création Échauffement

**Tests** :
- [ ] Champs nom, description visibles
- [ ] Bouton "Ajouter bloc" fonctionne
- [ ] 3 blocs ajoutés
- [ ] Suppression bloc fonctionne
- [ ] Validation : au moins 1 bloc requis
- [ ] Bouton "Créer" fonctionne
- [ ] Redirection vers détail

#### 5.5 Création Situation

**Tests** :
- [ ] Champs nom, description, joueurs visibles
- [ ] Upload image fonctionne
- [ ] Sélection tags fonctionne
- [ ] Bouton "Créer" fonctionne
- [ ] Redirection vers détail

**Bugs potentiels** :
- Stepper bloqué → Vérifier validation formulaires
- Upload image échoue → Vérifier UploadService
- Drag & drop ne fonctionne pas → Vérifier CdkDragDrop
- Durée totale incorrecte → Vérifier calcul

---

### 📍 PARCOURS 6 : ÉDITION (1h30)

#### 6.1 Édition Exercice

**URL** : Depuis détail, clic "Éditer"

**Tests** :
- [ ] Navigation vers `/mobile/edit/exercice/:id`
- [ ] Formulaire pré-rempli avec données existantes
- [ ] Modification nom fonctionne
- [ ] Modification durée fonctionne
- [ ] Modification tags fonctionne
- [ ] Bouton "Sauvegarder" fonctionne
- [ ] Feedback "Exercice modifié"
- [ ] Redirection vers détail
- [ ] Modifications visibles dans détail

#### 6.2 Édition Entraînement

**Tests** :
- [ ] Formulaire pré-rempli
- [ ] Modification titre fonctionne
- [ ] Modification échauffement fonctionne
- [ ] Modification liste exercices fonctionne
- [ ] Drag & drop ordre fonctionne
- [ ] Modification situation fonctionne
- [ ] Bouton "Sauvegarder" fonctionne
- [ ] Redirection vers détail

#### 6.3 Édition Échauffement

**Tests** :
- [ ] Formulaire pré-rempli
- [ ] Modification blocs fonctionne
- [ ] Ajout/suppression blocs fonctionne
- [ ] Bouton "Sauvegarder" fonctionne

#### 6.4 Édition Situation

**Tests** :
- [ ] Formulaire pré-rempli
- [ ] Modification données fonctionne
- [ ] Bouton "Sauvegarder" fonctionne

**Bugs potentiels** :
- Formulaire vide → Vérifier chargement données
- Sauvegarde échoue → Vérifier service CRUD

---

### 📍 PARCOURS 7 : TERRAIN (30 min)

#### 7.1 Chronomètre

**URL** : `http://localhost:4200/mobile/terrain`

**Tests** :
- [ ] Chronomètre affiché (00:00)
- [ ] Bouton "Démarrer" visible
- [ ] Clic Démarrer → Comptage commence
- [ ] Bouton change en "Pause"
- [ ] Clic Pause → Comptage s'arrête
- [ ] Bouton change en "Reprendre"
- [ ] Clic Reprendre → Comptage reprend
- [ ] Bouton "Arrêter" visible
- [ ] Clic Arrêter → Chrono réinitialisé à 00:00
- [ ] Format temps correct (MM:SS)

#### 7.2 Bloc notes

**Tests** :
- [ ] Textarea notes visible
- [ ] Saisie texte fonctionne
- [ ] Sauvegarde automatique après 1s (debounce)
- [ ] Indication "Notes sauvegardées" affichée
- [ ] Changement d'onglet → Notes persistées
- [ ] Retour sur Terrain → Notes affichées

#### 7.3 Arrêt automatique chronomètre

**Tests** :
- [ ] Démarrer chronomètre
- [ ] Changer d'onglet (ex: Library)
- [ ] Revenir sur Terrain
- [ ] Vérifier chronomètre arrêté

#### 7.4 Entraînement du jour (si implémenté)

**Tests** :
- [ ] Entraînement actif affiché
- [ ] Détails visibles
- [ ] Clic → Navigation vers détail

**Bugs potentiels** :
- Chronomètre ne démarre pas → Vérifier service
- Notes non sauvegardées → Vérifier debounce
- Chrono continue en arrière-plan → Vérifier ngOnDestroy

---

### 📍 PARCOURS 8 : PROFIL (15 min)

**URL** : `http://localhost:4200/mobile/profile`

**Tests** :
- [ ] Informations utilisateur affichées
- [ ] Avatar affiché
- [ ] Bouton "Déconnexion" fonctionne
- [ ] Paramètres accessibles

---

## 🌐 TESTS NAVIGATEURS (30 min)

### Chrome Mobile (Android)

**Tests** :
- [ ] Navigation fonctionne
- [ ] Création fonctionne
- [ ] Édition fonctionne
- [ ] Chronomètre fonctionne
- [ ] Responsive correct

### Safari Mobile (iOS)

**Tests** :
- [ ] Navigation fonctionne
- [ ] Création fonctionne
- [ ] Édition fonctionne
- [ ] Chronomètre fonctionne
- [ ] Responsive correct

### Firefox Mobile

**Tests** :
- [ ] Navigation fonctionne
- [ ] Création fonctionne
- [ ] Édition fonctionne

### Tablette (iPad ou Android)

**Tests** :
- [ ] Layout adapté (plus large)
- [ ] Navigation fonctionne
- [ ] Toutes fonctionnalités OK

---

## 📝 RAPPORT DE BUGS

### Template bug

```markdown
**Bug #X** : [Titre court]

**Sévérité** : Critique / Important / Mineur

**Parcours** : [Nom du parcours]

**Étapes de reproduction** :
1. ...
2. ...
3. ...

**Résultat attendu** : ...

**Résultat obtenu** : ...

**Navigateur** : Chrome / Safari / Firefox

**Screenshot** : [Si possible]

**Logs console** : [Si erreur]
```

---

## 🎯 CRITÈRES DE VALIDATION

### Fonctionnels ✅

- [ ] 14/14 fonctionnalités testées et fonctionnelles
- [ ] Tous les parcours critiques validés
- [ ] Aucun bug critique
- [ ] Bugs importants < 3
- [ ] Bugs mineurs documentés

### Techniques ✅

- [ ] Compatible Chrome Mobile
- [ ] Compatible Safari Mobile
- [ ] Compatible Firefox Mobile
- [ ] Responsive 375px - 1024px
- [ ] Performance acceptable (chargement < 3s)

### UX ✅

- [ ] Navigation intuitive
- [ ] Feedback utilisateur clair
- [ ] Pas de blocage utilisateur
- [ ] Animations fluides
- [ ] Tailles tactiles conformes (48px min)

---

## 📊 RÉSUMÉ TEMPS ESTIMÉ

| Parcours | Temps estimé |
|----------|--------------|
| 1. Navigation | 15 min |
| 2. Accueil | 30 min |
| 3. Bibliothèque | 45 min |
| 4. Détail | 1h |
| 5. Création | 2h |
| 6. Édition | 1h30 |
| 7. Terrain | 30 min |
| 8. Profil | 15 min |
| 9. Tests navigateurs | 30 min |
| **TOTAL** | **6h45** |

---

## ✅ CHECKLIST FINALE

### Avant de commencer

- [ ] Backend démarré (`npm start` dans `/backend`)
- [ ] Frontend démarré (`npm start` dans `/frontend`)
- [ ] Application accessible sur `http://localhost:4200`
- [ ] Version mobile accessible sur `http://localhost:4200/mobile/home`
- [ ] DevTools Chrome ouvert (F12)
- [ ] Mode responsive activé (Ctrl+Shift+M)
- [ ] Appareil sélectionné (iPhone 12 Pro ou Pixel 5)

### Pendant les tests

- [ ] Noter tous les bugs dans un fichier
- [ ] Prendre screenshots si nécessaire
- [ ] Vérifier console pour erreurs
- [ ] Tester sur plusieurs navigateurs
- [ ] Tester sur plusieurs tailles d'écran

### Après les tests

- [ ] Compiler liste bugs
- [ ] Prioriser bugs (critique, important, mineur)
- [ ] Créer rapport final
- [ ] Décider corrections à effectuer

---

**Document créé le** : 2026-02-20  
**Auteur** : Cascade AI  
**Durée totale estimée** : 6h45  
**Prêt pour** : Tests manuels complets
