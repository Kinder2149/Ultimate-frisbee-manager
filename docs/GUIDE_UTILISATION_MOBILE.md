# 📱 GUIDE D'UTILISATION - PAGE MOBILE

**Date**: 31 janvier 2026  
**Version**: 1.0.0

---

## 🚀 DÉMARRAGE RAPIDE

### Accès à la page mobile

1. **Démarrer l'application**
   ```bash
   cd frontend
   npm start
   ```

2. **Se connecter**
   - URL: `http://localhost:4200/login`
   - Identifiants par défaut: `admin@ultimate.com` / `Ultim@t+`

3. **Accéder à la page mobile**
   - URL directe: `http://localhost:4200/mobile`
   - Ou naviguer manuellement après connexion

---

## 🎯 FONCTIONNALITÉS

### 1. Header (en haut)

**Logo "UFM"** - Ultimate Frisbee Manager

**Bouton recherche** 🔍
- Actuellement: placeholder
- À venir: recherche globale

**Menu utilisateur** (avatar avec initiales)
- **Profil** - Accès aux paramètres du profil
- **Tags** - Gestion des tags
- **Admin** - Administration (si rôle admin)
- **Déconnexion** - Se déconnecter

---

### 2. Barre de filtres (sous le header)

**5 bulles de catégories**:
- 🔲 **Tout** (gris) - Affiche tous les éléments
- 🏋️ **Exercices** (rouge) - Exercices uniquement
- 🎯 **Entraînements** (bleu) - Entraînements uniquement
- 🏃 **Échauffements** (orange) - Échauffements uniquement
- ⚽ **Situations** (violet) - Situations/matchs uniquement

**Compteurs dynamiques**
- Chaque bulle affiche le nombre d'éléments dans cette catégorie
- Exemple: "Exercices 15"

**Bouton tri** (à droite)
- ⬇️ **Récent** - Du plus récent au plus ancien (par défaut)
- ⬆️ **Ancien** - Du plus ancien au plus récent

---

### 3. Carte Hero (mise en avant)

**Affichage contextuel**
- Si "Tout" → "Dernière activité"
- Si "Exercices" → "Dernier exercice"
- Si "Entraînements" → "Dernier entraînement"
- Etc.

**Informations affichées**:
- Badge type (icône + label)
- Titre
- Description (tronquée à 120 caractères)
- Métadonnées (durée, blocs, date de création)
- Tags (3 premiers + compteur)
- Flèche pour voir plus →

**Action**:
- Clic sur la carte → Ouvre la visualisation complète

---

### 4. Liste de contenu (scrollable)

**Affichage unifié**
- Toutes les catégories mélangées (si "Tout")
- Ou filtrées par catégorie active
- Triées par date (récent ou ancien)

**Cartes par type**:

**Exercices** (réutilise ExerciceCardComponent)
- Titre, description, tags
- Image/schéma si disponible
- Actions: Voir, Éditer, Dupliquer, Supprimer

**Entraînements**
- Titre
- Durée totale (calculée)
- Tags
- Date de création
- Actions: Voir, Éditer, Dupliquer, Supprimer

**Échauffements**
- Titre
- Nombre de blocs
- Description
- Date de création
- Actions: Voir, Éditer, Dupliquer, Supprimer

**Situations/Matchs**
- Titre
- Description
- Tags
- Date de création
- Actions: Voir, Éditer, Dupliquer, Supprimer

---

## 🎬 ACTIONS DISPONIBLES

### Sur chaque carte

**👁️ Voir**
- Ouvre le dialog/page de visualisation complète
- Exercices → Dialog modal
- Autres → Navigation vers page dédiée

**✏️ Éditer**
- Navigation vers la page d'édition
- `/exercices/modifier/:id`
- `/entrainements/modifier/:id`
- Etc.

**📋 Dupliquer**
- Crée une copie de l'élément
- Notification de succès
- Rechargement automatique de la liste

**🗑️ Supprimer**
- Demande de confirmation
- Suppression définitive
- Rechargement automatique de la liste

---

## 💡 ASTUCES D'UTILISATION

### Navigation rapide

1. **Filtrer par catégorie** - Clic sur une bulle
2. **Changer le tri** - Clic sur le bouton tri
3. **Voir un élément** - Clic sur la carte hero ou dans la liste
4. **Retour au menu** - Clic sur avatar → choix de destination

### Optimisations

- **Scroll fluide** - La liste est optimisée pour le scroll
- **Chargement unique** - Les données sont chargées une seule fois
- **Cache intelligent** - Les transformations sont mises en cache
- **Pas de rechargement** - Le filtrage est instantané

---

## 🐛 DÉPANNAGE

### La page ne charge pas

**Vérifier**:
1. Êtes-vous connecté ? → `/login`
2. Avez-vous sélectionné un workspace ?
3. Le backend est-il démarré ?
4. Console navigateur pour erreurs

### Les données ne s'affichent pas

**Vérifier**:
1. Console navigateur → `[MobilePage] Données chargées`
2. Réseau → Requêtes API réussies ?
3. Workspace contient-il des données ?

### Les actions ne fonctionnent pas

**Vérifier**:
1. Console navigateur pour erreurs
2. Permissions utilisateur
3. Backend accessible

---

## 📊 DONNÉES AFFICHÉES

### Compteurs

Les compteurs affichent le **nombre total** d'éléments par catégorie, **avant filtrage**.

Exemple:
- Tout: 50
- Exercices: 20
- Entraînements: 15
- Échauffements: 10
- Situations: 5

### Tri

**Récent** (par défaut):
- Ordre: Plus récent → Plus ancien
- Basé sur `createdAt`

**Ancien**:
- Ordre: Plus ancien → Plus récent
- Basé sur `createdAt`

---

## 🎨 PERSONNALISATION

### Couleurs par catégorie

Les couleurs sont **réutilisées** de l'existant:
- Tout: `#34495e` (gris foncé)
- Exercices: `#e74c3c` (rouge)
- Entraînements: `#3498db` (bleu)
- Échauffements: `#f39c12` (orange)
- Situations: `#9b59b6` (violet)

### Responsive

La page est optimisée pour:
- **Mobile**: < 768px
- **Tablette**: 768px - 1024px
- **Desktop**: > 1024px

---

## 🔮 FONCTIONNALITÉS À VENIR

### Court terme

- [ ] Recherche globale (overlay)
- [ ] Redirection automatique mobile
- [ ] Lazy loading images

### Moyen terme

- [ ] Scroll infini
- [ ] Animations de transition
- [ ] Mode hors ligne (PWA)

### Long terme

- [ ] Filtres avancés par tags
- [ ] Tri personnalisé
- [ ] Favoris/épinglés

---

## 📞 SUPPORT

### Logs utiles

Ouvrir la console navigateur (F12) et chercher:
```
[MobilePage] Données chargées: { exercices: 20, ... }
[MobilePage] Recherche cliquée - À implémenter
```

### Erreurs courantes

**401 Unauthorized**
- Solution: Se reconnecter

**404 Not Found**
- Solution: Vérifier que le backend est démarré

**Workspace non sélectionné**
- Solution: Aller sur `/select-workspace`

---

## ✅ CHECKLIST PREMIÈRE UTILISATION

- [ ] Backend démarré
- [ ] Frontend démarré
- [ ] Connecté avec un compte valide
- [ ] Workspace sélectionné
- [ ] Naviguer vers `/mobile`
- [ ] Voir les données chargées
- [ ] Tester filtrage par catégorie
- [ ] Tester tri récent/ancien
- [ ] Tester visualisation d'un élément
- [ ] Tester menu utilisateur

---

## 🎉 PROFITEZ DE LA PAGE MOBILE !

La page mobile est maintenant **opérationnelle** et prête à être utilisée. N'hésitez pas à explorer toutes les fonctionnalités et à remonter tout problème rencontré.

**Bon usage !** 🚀
