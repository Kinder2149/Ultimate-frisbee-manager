# GUIDE DE TESTS MOBILE - PHASE 3 COMPLÉTÉE

**Date :** 2026-02-18  
**Phase :** Phase 3 - Détails et consultation  
**Statut :** Prêt pour tests

---

## 🎯 OBJECTIF

Tester la nouvelle architecture mobile avec les fonctionnalités de la Phase 3 :
- Sections collapsibles
- Visualiseur d'images avec swipe et pinch-to-zoom
- Page de détails refondée

---

## 🚀 DÉMARRAGE DU SERVEUR

Le serveur Angular est en cours de démarrage sur :
- **URL locale :** http://localhost:4200
- **URL réseau :** http://[VOTRE_IP_LOCAL]:4200

### Pour accéder depuis votre mobile :

1. **Trouvez votre IP locale :**
   ```powershell
   ipconfig
   ```
   Cherchez l'adresse IPv4 (ex: 192.168.1.X)

2. **Connectez votre mobile au même réseau WiFi** que votre PC

3. **Ouvrez le navigateur mobile** et accédez à :
   ```
   http://[VOTRE_IP]:4200
   ```

---

## 📱 PARCOURS DE TEST RECOMMANDÉ

### 1. Navigation de base (Phase 1 & 2)

#### Test de la Bottom Navigation
- ✅ Ouvrir l'application sur mobile
- ✅ Vérifier que la bottom nav s'affiche avec 4 items
- ✅ Tester la navigation entre les 4 écrans :
  - **Accueil** (icône maison)
  - **Bibliothèque** (icône livre)
  - **Terrain** (icône sport)
  - **Profil** (icône personne)
- ✅ Vérifier que l'item actif est bien surligné

#### Test de l'écran Accueil
- ✅ Vérifier l'affichage du feed de contenu
- ✅ Tester les filtres par type
- ✅ Tester la recherche

#### Test de l'écran Bibliothèque
- ✅ Vérifier les 4 tabs (Exercices, Entraînements, Échauffements, Situations)
- ✅ Swiper entre les tabs
- ✅ Tester la recherche dans chaque tab
- ✅ Cliquer sur un élément pour accéder au détail

#### Test de l'écran Terrain
- ✅ Vérifier l'affichage du chronomètre
- ✅ Tester Démarrer/Pause/Arrêter
- ✅ Vérifier l'affichage de l'entraînement du jour

#### Test de l'écran Profil
- ✅ Vérifier l'affichage des informations utilisateur
- ✅ Vérifier l'affichage du workspace actuel
- ✅ Tester les items du menu paramètres

---

### 2. Page de détails (Phase 3) ⭐ NOUVEAU

#### Accès au détail
- ✅ Depuis la Bibliothèque, cliquer sur un exercice
- ✅ Vérifier que la page de détail s'ouvre

#### Test du Header
- ✅ Vérifier le bouton retour (flèche gauche)
- ✅ Vérifier le titre de l'élément
- ✅ Cliquer sur le menu actions (3 points verticaux)
- ✅ Vérifier les actions disponibles (Éditer, Partager)

#### Test des sections collapsibles ⭐ NOUVEAU
- ✅ Vérifier que la section "Description" est ouverte par défaut
- ✅ Cliquer sur l'en-tête de la section pour la fermer
- ✅ Vérifier l'animation de fermeture (smooth)
- ✅ Cliquer à nouveau pour rouvrir
- ✅ Vérifier l'animation d'ouverture
- ✅ Tester avec la section "Tags" (fermée par défaut)

#### Test du visualiseur d'images ⭐ NOUVEAU
- ✅ Cliquer sur une image dans le détail
- ✅ Vérifier que le visualiseur plein écran s'ouvre
- ✅ **Swipe horizontal** pour naviguer entre les images
- ✅ **Pinch-to-zoom** pour zoomer (2 doigts)
- ✅ **Double-tap** pour zoomer/dézoomer
- ✅ Vérifier les indicateurs de position (dots en bas)
- ✅ Vérifier le compteur d'images (ex: 1 / 3)
- ✅ Tester les boutons précédent/suivant
- ✅ Cliquer sur le bouton fermer (X)

#### Test des favoris
- ✅ Cliquer sur "Ajouter aux favoris"
- ✅ Vérifier le snackbar de confirmation
- ✅ Vérifier que le bouton change (étoile pleine)
- ✅ Cliquer sur "Retirer des favoris"
- ✅ Vérifier le snackbar de confirmation

---

## 🎨 POINTS D'ATTENTION VISUELS

### Tailles tactiles
- ✅ Tous les boutons doivent faire **minimum 44x44px**
- ✅ Les items de la bottom nav doivent être facilement cliquables
- ✅ Les en-têtes des sections collapsibles doivent être tactiles

### Animations
- ✅ Les sections collapsibles doivent s'ouvrir/fermer en **~300ms**
- ✅ Les transitions doivent être fluides (cubic-bezier)
- ✅ Le zoom d'image doit être réactif

### Thème sombre
- ✅ Activer le mode sombre du système
- ✅ Vérifier que tous les composants s'adaptent
- ✅ Vérifier les contrastes

---

## 🐛 TESTS DE ROBUSTESSE

### Gestes tactiles
- ✅ Tester le swipe rapide vs lent
- ✅ Tester le pinch-to-zoom avec différentes vitesses
- ✅ Tester le double-tap rapide
- ✅ Tester les gestes accidentels (toucher pendant le swipe)

### Navigation
- ✅ Tester le bouton retour du navigateur
- ✅ Tester le bouton retour de l'application
- ✅ Tester la navigation profonde (Accueil → Bibliothèque → Détail → Retour)

### Performance
- ✅ Vérifier la fluidité du scroll
- ✅ Vérifier le temps de chargement des images
- ✅ Vérifier la réactivité des animations

---

## 📊 COMPOSANTS CRÉÉS (PHASE 3)

### CollapsibleSectionComponent
- **Fichiers :**
  - `frontend/src/app/shared/components/collapsible-section/collapsible-section.component.ts`
  - `frontend/src/app/shared/components/collapsible-section/collapsible-section.component.html`
  - `frontend/src/app/shared/components/collapsible-section/collapsible-section.component.scss`
- **Fonctionnalités :**
  - Animation expand/collapse
  - Icône de rotation
  - État ouvert/fermé par défaut
  - Support du thème sombre

### MobileImageViewerComponent
- **Fichiers :**
  - `frontend/src/app/shared/components/mobile-image-viewer/mobile-image-viewer.component.ts`
  - `frontend/src/app/shared/components/mobile-image-viewer/mobile-image-viewer.component.html`
  - `frontend/src/app/shared/components/mobile-image-viewer/mobile-image-viewer.component.scss`
- **Fonctionnalités :**
  - Swipe horizontal pour naviguer
  - Pinch-to-zoom (1x à 3x)
  - Double-tap pour zoomer/dézoomer
  - Indicateurs de position (dots)
  - Compteur d'images
  - Boutons de navigation
  - Plein écran avec fond noir

### MobileDetailComponent (simplifié)
- **Fichier :**
  - `frontend/src/app/features/mobile/pages/mobile-detail/mobile-detail-simple.component.ts`
- **Fonctionnalités :**
  - Affichage détaillé par type (exercice, entraînement, etc.)
  - Intégration des sections collapsibles
  - Intégration du visualiseur d'images
  - Bouton favoris
  - Menu d'actions contextuelles
  - Support du thème sombre

---

## 🔧 DÉPANNAGE

### Le serveur ne démarre pas
```powershell
cd d:\Coding\AppWindows\Ultimate-frisbee-manager\frontend
npm install
ng serve --host 0.0.0.0 --port 4200
```

### Impossible d'accéder depuis le mobile
1. Vérifier que le PC et le mobile sont sur le même réseau WiFi
2. Vérifier le pare-feu Windows (autoriser le port 4200)
3. Essayer avec `--disable-host-check` :
   ```powershell
   ng serve --host 0.0.0.0 --port 4200 --disable-host-check
   ```

### Erreurs de compilation
- Vérifier que tous les imports sont corrects
- Vérifier que FormsModule est importé dans MobileLibraryComponent
- Redémarrer le serveur si nécessaire

---

## 📝 RAPPORT DE BUGS

Si vous trouvez des bugs, notez :
1. **Appareil** : Modèle et OS (ex: iPhone 12, iOS 15)
2. **Navigateur** : Chrome, Safari, etc.
3. **Étapes** : Comment reproduire le bug
4. **Résultat attendu** vs **Résultat obtenu**
5. **Capture d'écran** si possible

---

## ✅ CHECKLIST COMPLÈTE

### Phase 1 - Fondations
- [x] MobileStateService
- [x] MobileBottomNavComponent
- [x] MobileHeaderComponent
- [x] MobileLayoutComponent
- [x] Routing mobile

### Phase 2 - Écrans principaux
- [x] MobileHomeComponent
- [x] MobileLibraryComponent
- [x] MobileTerrainComponent
- [x] MobileProfileComponent

### Phase 3 - Détails et consultation
- [x] CollapsibleSectionComponent
- [x] MobileImageViewerComponent
- [x] MobileDetailComponent refondé

---

**Bon test ! 🚀**

Pour toute question ou problème, référez-vous à :
- `docs/work/20260218_PROPOSITION_VUE_MOBILE.md` (spécifications)
- `docs/work/20260218_IMPLEMENTATION_MOBILE_PROGRESS.md` (suivi d'implémentation)
