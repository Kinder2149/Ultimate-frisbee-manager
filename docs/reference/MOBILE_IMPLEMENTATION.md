# IMPLÉMENTATION MOBILE - ULTIMATE FRISBEE MANAGER

**Statut** : REFERENCE  
**Version** : 1.0  
**Date** : 2026-02-20  
**Complète** : MOBILE_SPECIFICATION.md v3.0  
**Auteur** : Équipe technique Ultimate Frisbee Manager

---

## 📋 DOCUMENT DE RÉFÉRENCE

Ce document complète **MOBILE_SPECIFICATION.md v3.0** avec :
- État d'implémentation actuel
- Configuration réseau et tests locaux
- Guide de tests manuels
- Travaux restants
- Checklist de validation

**Pour les spécifications fonctionnelles** : voir `MOBILE_SPECIFICATION.md`

---

## 1. ÉTAT D'IMPLÉMENTATION

### Progression globale : 93% (13/14 fonctionnalités)

| Fonctionnalité | Implémenté | Testé | Statut |
|----------------|------------|-------|--------|
| Navigation 5 onglets | ✅ | ⏳ | Prêt pour tests |
| Création 4 types | ✅ | ⏳ | Prêt pour tests |
| Édition 4 types | ✅ | ⏳ | Prêt pour tests |
| Recherche Library | ✅ | ⏳ | Prêt pour tests |
| Filtres basiques Library | ✅ | ⏳ | Prêt pour tests |
| **Filtres avancés Library** | ❌ | ❌ | **NON IMPLÉMENTÉ** |
| Duplication Detail | ✅ | ⏳ | Prêt pour tests |
| Suppression Detail | ✅ | ⏳ | Prêt pour tests |
| Édition Detail | ✅ | ⏳ | Prêt pour tests |
| Favoris Detail | ✅ | ⏳ | Prêt pour tests |
| Visualiseur images | ✅ | ⏳ | Prêt pour tests |
| Chronomètre Terrain | ✅ | ⏳ | Prêt pour tests |
| Notes Terrain | ✅ | ⏳ | Prêt pour tests |
| Home feed unifié | ✅ | ⏳ | Prêt pour tests |

### Composants créés : 28
### Routes créées : 16
### Services créés : 3
### Lignes de code : ~4200

---

## 2. CONFIGURATION RÉSEAU ET TESTS LOCAUX

### 2.1 Configuration validée

#### Backend
- **Port** : 3000
- **Host** : 0.0.0.0 (écoute sur toutes interfaces)
- **Fichier** : `backend/config/index.js`
  ```javascript
  port: process.env.PORT || 3000
  ```

#### Frontend
- **Port** : 4200
- **Host** : 0.0.0.0
- **Proxy** : `/api/*` → `http://localhost:3000`
- **Fichiers critiques** :
  1. `frontend/angular.json`
     ```json
     "serve": {
       "options": {
         "proxyConfig": "proxy.conf.json",
         "host": "0.0.0.0",
         "port": 4200
       }
     }
     ```
  2. `frontend/src/environments/environment.ts`
     ```typescript
     apiUrl: '/api'  // Utilise le proxy
     ```
  3. `frontend/proxy.conf.json`
     ```json
     {
       "/api/*": {
         "target": "http://localhost:3000",
         "secure": false,
         "changeOrigin": true
       }
     }
     ```

---

### 2.2 Procédure de démarrage

#### Terminal 1 - Backend
```bash
cd d:\Coding\AppWindows\Ultimate-frisbee-manager\backend
npm start
```

**Vérification** :
```
[Startup] Server listening on http://0.0.0.0:3000 (local: http://localhost:3000)
✅ Connexion à la base de données établie.
```

#### Terminal 2 - Frontend
```bash
cd d:\Coding\AppWindows\Ultimate-frisbee-manager\frontend
npm start
```

**Vérification** :
```
✔ Compiled successfully.
** Angular Live Development Server is listening on 0.0.0.0:4200 **
```

---

### 2.3 URLs de test

#### PC (localhost)
- Application : `http://localhost:4200`
- Login : `http://localhost:4200/login`
- Dashboard : `http://localhost:4200/dashboard`
- **Mobile Home** : `http://localhost:4200/mobile/home`
- **Mobile Library** : `http://localhost:4200/mobile/library`
- **Mobile Create** : `http://localhost:4200/mobile/create`
- **Mobile Terrain** : `http://localhost:4200/mobile/terrain`
- **Mobile Profile** : `http://localhost:4200/mobile/profile`

#### PC (IP locale)
Vérifier IP avec `ipconfig` (ex: 192.168.1.121)
- Application : `http://192.168.1.XXX:4200`
- Mobile Home : `http://192.168.1.XXX:4200/mobile/home`

#### Mobile (même réseau WiFi)
- Application : `http://192.168.1.XXX:4200`
- Mobile Home : `http://192.168.1.XXX:4200/mobile/home`

---

### 2.4 Diagnostic réseau

#### Vérifier serveurs actifs
```powershell
netstat -ano | findstr :3000  # Backend
netstat -ano | findstr :4200  # Frontend
```

#### Vérifier IP actuelle
```powershell
ipconfig
```
Chercher "Adresse IPv4" dans la carte réseau active.

#### Firewall Windows (si accès mobile bloqué)
```powershell
# Exécuter en tant qu'administrateur
netsh advfirewall firewall add rule name="Angular Dev Server" dir=in action=allow protocol=TCP localport=4200
```

---

### 2.5 Erreurs courantes

#### ERR_CONNECTION_REFUSED
- **Cause** : Serveurs non démarrés
- **Solution** : Démarrer backend ET frontend

#### Requêtes API échouent (404)
- **Cause** : Proxy mal configuré ou apiUrl hardcodée
- **Solution** : Vérifier `environment.ts` (apiUrl = '/api') et `proxy.conf.json`

#### Accès mobile impossible
- **Cause 1** : Angular écoute sur localhost au lieu de 0.0.0.0
  - **Solution** : Vérifier `angular.json` → options.host = "0.0.0.0"
- **Cause 2** : Firewall bloque le port 4200
  - **Solution** : Ajouter règle firewall (voir ci-dessus)
- **Cause 3** : Mobile pas sur le même réseau WiFi
  - **Solution** : Connecter mobile au même réseau que le PC

---

## 3. GUIDE DE TESTS MANUELS

### 3.1 Prérequis

- Backend démarré (`npm start` dans `/backend`)
- Frontend démarré (`npm start` dans `/frontend`)
- Application accessible sur `http://localhost:4200`
- Version mobile accessible sur `http://localhost:4200/mobile/home`
- DevTools Chrome ouvert (F12)
- Mode responsive activé (Ctrl+Shift+M)
- Appareil sélectionné (iPhone 12 Pro ou Pixel 5)

---

### 3.2 Parcours de tests

#### PARCOURS 1 : Navigation (15 min)

**URL** : `http://localhost:4200/mobile/home`

**Tests** :
- [ ] 5 onglets visibles (Accueil, Bibliothèque, Créer, Terrain, Profil)
- [ ] Icônes correctes pour chaque onglet
- [ ] Labels visibles
- [ ] Navigation entre onglets fonctionne
- [ ] Onglet actif surligné (couleur primaire)
- [ ] Transition fluide entre onglets

---

#### PARCOURS 2 : Accueil (30 min)

**URL** : `http://localhost:4200/mobile/home`

**Tests** :
- [ ] Feed de contenus affiché
- [ ] Cartes avec titre, type, durée, tags
- [ ] Images affichées (si présentes)
- [ ] Clic sur carte → Navigation vers détail
- [ ] Filtres par catégorie (chips horizontaux)
- [ ] Recherche globale (debounce 300ms)
- [ ] Bouton clear visible si texte saisi
- [ ] Tri (récent/ancien, A-Z)
- [ ] Scroll fluide

---

#### PARCOURS 3 : Bibliothèque (45 min)

**URL** : `http://localhost:4200/mobile/library`

**Tests** :
- [ ] 4 tabs visibles (Exercices, Entraînements, Échauffements, Situations)
- [ ] Clic tab → Changement contenu
- [ ] Tab actif surligné
- [ ] Compteur éléments par tab
- [ ] Barre recherche visible dans chaque tab
- [ ] Saisie texte → Filtrage avec debounce 300ms
- [ ] Recherche sur nom ET description
- [ ] Message "Aucun résultat" si vide
- [ ] Bouton clear fonctionne
- [ ] Clic élément → Navigation vers détail

---

#### PARCOURS 4 : Détail (1h)

**URL** : Cliquer sur un élément depuis Library

**Tests** :
- [ ] Header avec titre et bouton retour
- [ ] Métadonnées (durée, joueurs, matériel, tags)
- [ ] Description complète
- [ ] Images affichées
- [ ] Sections collapsibles fonctionnent
- [ ] Bouton "Favoris" visible et fonctionne
- [ ] **Bouton "Dupliquer" visible**
- [ ] **Clic Dupliquer → Confirmation → Redirection vers nouveau détail**
- [ ] **Bouton "Supprimer" visible**
- [ ] **Clic Supprimer → Dialog confirmation**
- [ ] **Confirmation suppression → Redirection vers Library**
- [ ] **Annulation suppression → Reste sur détail**
- [ ] Bouton "Éditer" visible et fonctionne
- [ ] Clic image → Ouvre visualiseur plein écran
- [ ] Swipe gauche/droite → Navigation entre images
- [ ] Pinch zoom fonctionne
- [ ] Bouton fermer visualiseur fonctionne

---

#### PARCOURS 5 : Création (2h)

**URL** : `http://localhost:4200/mobile/create`

**Tests Exercice** :
- [ ] 4 cartes de sélection visibles
- [ ] Clic Exercice → Navigation vers formulaire
- [ ] Étape 1 : Champs nom, description visibles
- [ ] Validation : nom requis
- [ ] Bouton "Suivant" désactivé si invalide
- [ ] Étape 2 : Champs durée, joueurs, matériel visibles
- [ ] Bouton "Précédent" fonctionne
- [ ] Étape 3 : Upload image fonctionne
- [ ] Prévisualisation image affichée
- [ ] Étape 4 : Sélection tags fonctionne
- [ ] Étape 5 : Résumé complet affiché
- [ ] Bouton "Créer" fonctionne
- [ ] Feedback "Exercice créé"
- [ ] Redirection vers détail du nouvel exercice

**Tests Entraînement** :
- [ ] Étape 1 : Champs titre, date visibles
- [ ] Étape 2 : Sélection échauffement fonctionne
- [ ] Étape 3 : Sélection multiple exercices fonctionne
- [ ] **Drag & drop pour ordre fonctionne**
- [ ] Durée totale calculée automatiquement
- [ ] Étape 4 : Sélection situation fonctionne
- [ ] Étape 5 : Sélection tags fonctionne
- [ ] Étape 6 : Résumé complet (ordre exercices correct)
- [ ] Bouton "Créer" fonctionne
- [ ] Redirection vers détail

**Tests Échauffement** :
- [ ] Champs nom, description visibles
- [ ] Bouton "Ajouter bloc" fonctionne
- [ ] Suppression bloc fonctionne
- [ ] Validation : au moins 1 bloc requis
- [ ] Bouton "Créer" fonctionne

**Tests Situation** :
- [ ] Champs nom, description, joueurs visibles
- [ ] Upload image fonctionne
- [ ] Sélection tags fonctionne
- [ ] Bouton "Créer" fonctionne

---

#### PARCOURS 6 : Édition (1h30)

**URL** : Depuis détail, clic "Éditer"

**Tests** :
- [ ] Navigation vers `/mobile/edit/:type/:id`
- [ ] Formulaire pré-rempli avec données existantes
- [ ] Modification nom fonctionne
- [ ] Modification durée fonctionne
- [ ] Modification tags fonctionne
- [ ] Modification liste exercices fonctionne (entraînement)
- [ ] Drag & drop ordre fonctionne (entraînement)
- [ ] Bouton "Sauvegarder" fonctionne
- [ ] Feedback "Modifié avec succès"
- [ ] Redirection vers détail
- [ ] Modifications visibles dans détail

---

#### PARCOURS 7 : Terrain (30 min)

**URL** : `http://localhost:4200/mobile/terrain`

**Tests Chronomètre** :
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
- [ ] Changement d'onglet → Chronomètre s'arrête

**Tests Bloc notes** :
- [ ] Textarea notes visible
- [ ] Saisie texte fonctionne
- [ ] Sauvegarde automatique après 1s (debounce)
- [ ] Indication "Notes sauvegardées" affichée
- [ ] Changement d'onglet → Notes persistées
- [ ] Retour sur Terrain → Notes affichées

---

#### PARCOURS 8 : Profil (15 min)

**URL** : `http://localhost:4200/mobile/profile`

**Tests** :
- [ ] Informations utilisateur affichées
- [ ] Avatar affiché
- [ ] Bouton "Déconnexion" fonctionne
- [ ] Paramètres accessibles

---

### 3.3 Tests navigateurs (30 min)

#### Chrome Mobile (Android)
- [ ] Navigation fonctionne
- [ ] Création fonctionne
- [ ] Édition fonctionne
- [ ] Chronomètre fonctionne
- [ ] Responsive correct

#### Safari Mobile (iOS)
- [ ] Navigation fonctionne
- [ ] Création fonctionne
- [ ] Édition fonctionne
- [ ] Chronomètre fonctionne
- [ ] Responsive correct

---

### 3.4 Durée totale estimée : 6h45

---

## 4. TRAVAUX RESTANTS

### 4.1 Critiques (bloquants)

1. **Filtres avancés Library** (2-4h)
   - Bottom sheet `MobileFiltersBottomSheetComponent`
   - Filtres par tags (multi-sélection)
   - Filtres par durée (range slider)
   - Filtres par joueurs (range slider)
   - Badge compteur filtres actifs

### 4.2 Tests (6-10h)

2. **Tests manuels complets** (6-8h)
   - Exécuter tous les parcours de tests
   - Noter tous les bugs
   - Prioriser bugs (critique, important, mineur)

3. **Corrections bugs** (2-4h)
   - Corriger bugs critiques
   - Corriger bugs importants

### 4.3 Optionnels (non bloquants)

4. **Progression entraînement** (Terrain)
5. **Favoris rapides** (Terrain)
6. **Tests automatisés** (correction suite Cypress)
7. **Optimisations performance**

---

## 5. CHECKLIST DE VALIDATION CONTRACTUELLE

### Navigation
- [ ] 5 onglets présents (Accueil, Bibliothèque, Créer, Terrain, Profil)
- [ ] Navigation fluide
- [ ] Tracking route correct

### Création
- [ ] Création 4 types fonctionnelle (Stepper multi-étapes)
- [ ] Upload image fonctionne
- [ ] Sélection tags fonctionne
- [ ] Drag & drop ordre exercices fonctionne
- [ ] Sauvegarde en base réussie
- [ ] Redirection après création

### Édition
- [ ] Édition 4 types fonctionnelle
- [ ] Formulaire pré-rempli
- [ ] Sauvegarde modifications
- [ ] Aucune redirection desktop

### Bibliothèque
- [ ] Recherche par tab fonctionne
- [ ] Filtres basiques fonctionnent
- [ ] Bouton "+" redirige vers `/mobile/create/:type`

### Détail
- [ ] Actions complètes (éditer, dupliquer, supprimer, favoris)
- [ ] Visualiseur images fonctionnel
- [ ] Sections collapsibles
- [ ] Aucune redirection desktop

### Terrain
- [ ] Chronomètre fonctionne
- [ ] Arrêt auto au changement page
- [ ] Bloc notes avec sauvegarde auto
- [ ] Indication "sauvegardé"

### Contraintes techniques
- [ ] Aucun Service Worker avancé
- [ ] Aucun IndexedDB
- [ ] Aucune modification backend
- [ ] Réutilisation services CRUD existants
- [ ] Aucune duplication logique métier

---

## 6. MÉTRIQUES CIBLES

### Performance
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

### Compatibilité
- ✅ Chrome Mobile (Android)
- ✅ Safari Mobile (iOS)
- ✅ Firefox Mobile
- ⚠️ Tablettes (à tester)

### Accessibilité
- ✅ Tailles tactiles conformes (48px min)
- ⚠️ Support clavier (à implémenter)
- ⚠️ Lecteur d'écran (à implémenter)

---

## ANNEXE : HISTORIQUE VERSIONS

**v1.0 (2026-02-20)** : Document de référence implémentation
- État d'implémentation actuel (93%)
- Configuration réseau validée
- Guide de tests manuels complet
- Travaux restants identifiés
- Checklist de validation contractuelle

---

**FIN DU DOCUMENT DE RÉFÉRENCE**
