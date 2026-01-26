# 🎬 AUDIT PARCOURS UTILISATEURS CRITIQUES

**Date** : 26 janvier 2026  
**Statut** : ⏳ En cours d'analyse

---

## 🎯 OBJECTIF

Tester les **scénarios d'utilisation réels** de bout en bout pour s'assurer que :
- Chaque parcours est complet et fonctionnel
- Les actions s'enchaînent logiquement
- Les données sont cohérentes tout au long du parcours
- Les cas d'erreur sont gérés gracieusement

---

## 👤 PARCOURS 1 : PREMIÈRE CONNEXION

### Scénario
Un coach se connecte pour la première fois à l'application.

### Étapes

| # | Action | Résultat Attendu | Statut | Notes |
|---|--------|------------------|--------|-------|
| 1 | Accéder à l'URL de l'app | Page de connexion affichée | ⏳ | |
| 2 | Entrer email + password | Champs acceptent la saisie | ⏳ | |
| 3 | Cliquer "Se connecter" | Validation + redirection | ⏳ | |
| 4 | Arrivée sur le dashboard | Dashboard affiché | ⏳ | |
| 5 | Voir le menu de navigation | Menu accessible | ⏳ | |
| 6 | Voir son profil | Nom/email affichés | ⏳ | |

### Points de Vérification
- [ ] Token JWT stocké dans localStorage
- [ ] Redirection automatique si déjà connecté
- [ ] Message d'erreur si identifiants incorrects
- [ ] Rate limiting fonctionnel (5 tentatives max)
- [ ] Dashboard vide si aucune donnée (message explicatif)

### Cas d'Erreur
- [ ] Email invalide → Message d'erreur
- [ ] Mot de passe incorrect → Message d'erreur
- [ ] API inaccessible → Message d'erreur réseau
- [ ] Token expiré → Refresh automatique

---

## 🏃 PARCOURS 2 : CRÉER UN EXERCICE COMPLET

### Scénario
Un coach crée un nouvel exercice avec tous les détails.

### Étapes

| # | Action | Résultat Attendu | Statut | Notes |
|---|--------|------------------|--------|-------|
| 1 | Cliquer sur "Exercices" | Liste des exercices | ⏳ | |
| 2 | Cliquer "Créer un exercice" | Formulaire vide | ⏳ | |
| 3 | Remplir le titre | Champ accepte le texte | ⏳ | |
| 4 | Remplir la description (éditeur riche) | Formatage fonctionne | ⏳ | |
| 5 | Remplir l'objectif | Champ accepte le texte | ⏳ | |
| 6 | Remplir les consignes | Champ accepte le texte | ⏳ | |
| 7 | Ajouter des variantes | Champ accepte le texte | ⏳ | |
| 8 | Indiquer le matériel | Champ accepte le texte | ⏳ | |
| 9 | Définir la durée estimée | Input number fonctionne | ⏳ | |
| 10 | Indiquer le nombre de joueurs | Champ accepte le texte | ⏳ | |
| 11 | Choisir le niveau de difficulté | Dropdown fonctionne | ⏳ | |
| 12 | Uploader une image | Upload + preview | ⏳ | |
| 13 | Ajouter des tags | Chips + autocomplete | ⏳ | |
| 14 | Cliquer "Sauvegarder" | Exercice créé | ⏳ | |
| 15 | Voir le message de succès | Toast affiché | ⏳ | |
| 16 | Redirection vers détail ou liste | Page affichée | ⏳ | |
| 17 | Vérifier l'exercice dans la liste | Exercice présent | ⏳ | |

### Points de Vérification
- [ ] Tous les champs sont sauvegardés
- [ ] Image uploadée sur Cloudinary
- [ ] Tags créés ou liés correctement
- [ ] Durée en minutes (pas en secondes)
- [ ] Formatage de la description préservé
- [ ] ID unique généré (UUID)
- [ ] Dates createdAt/updatedAt correctes

### Cas d'Erreur
- [ ] Titre vide → Erreur de validation
- [ ] Image trop grande → Message d'erreur
- [ ] Upload échoué → Possibilité de réessayer
- [ ] Perte de connexion → Données non perdues (brouillon ?)

---

## 🔥 PARCOURS 3 : CRÉER UN ÉCHAUFFEMENT AVEC BLOCS

### Scénario
Un coach crée un échauffement structuré en plusieurs blocs.

### Étapes

| # | Action | Résultat Attendu | Statut | Notes |
|---|--------|------------------|--------|-------|
| 1 | Aller sur "Échauffements" | Liste affichée | ⏳ | |
| 2 | Cliquer "Créer un échauffement" | Formulaire affiché | ⏳ | |
| 3 | Remplir titre et description | Champs acceptent le texte | ⏳ | |
| 4 | Cliquer "Ajouter un bloc" | Formulaire de bloc apparaît | ⏳ | |
| 5 | Remplir le bloc 1 (titre, description, durée) | Bloc créé avec ordre=1 | ⏳ | |
| 6 | Ajouter un bloc 2 | Bloc créé avec ordre=2 | ⏳ | |
| 7 | Ajouter un bloc 3 | Bloc créé avec ordre=3 | ⏳ | |
| 8 | Vérifier l'ordre d'affichage | Blocs dans le bon ordre | ⏳ | |
| 9 | Modifier le bloc 2 | Modifications sauvegardées | ⏳ | |
| 10 | Supprimer le bloc 3 | Bloc supprimé | ⏳ | |
| 11 | Réordonner les blocs (si possible) | Ordre mis à jour | ⏳ | |
| 12 | Ajouter des tags à l'échauffement | Tags liés | ⏳ | |
| 13 | Sauvegarder l'échauffement | Échauffement créé | ⏳ | |
| 14 | Vérifier la durée totale | Somme des durées des blocs | ⏳ | |
| 15 | Voir l'échauffement dans la liste | Présent avec bon ordre | ⏳ | |

### Points de Vérification
- [ ] Blocs liés à l'échauffement (relation DB)
- [ ] Ordre des blocs respecté
- [ ] Suppression d'un bloc ne casse pas l'ordre
- [ ] Durée totale calculée correctement
- [ ] Suppression de l'échauffement supprime les blocs (cascade)

### Cas d'Erreur
- [ ] Bloc sans titre → Erreur de validation
- [ ] Durée négative → Rejet ou conversion
- [ ] Ordre en doublon → Réorganisation auto

---

## 📅 PARCOURS 4 : CRÉER UN ENTRAÎNEMENT COMPLET

### Scénario
Un coach prépare un entraînement complet avec échauffement, exercices et situation de match.

### Étapes

| # | Action | Résultat Attendu | Statut | Notes |
|---|--------|------------------|--------|-------|
| 1 | Aller sur "Entraînements" | Liste affichée | ⏳ | |
| 2 | Cliquer "Créer un entraînement" | Formulaire affiché | ⏳ | |
| 3 | Remplir les infos de base | Titre, date, lieu, objectifs | ⏳ | |
| 4 | Cliquer "Ajouter un échauffement" | Modal ou dropdown | ⏳ | |
| 5 | Sélectionner un échauffement existant | Échauffement ajouté (ordre=1) | ⏳ | |
| 6 | Définir la durée de l'échauffement | Durée personnalisable | ⏳ | |
| 7 | Cliquer "Ajouter un exercice" | Modal ou dropdown | ⏳ | |
| 8 | Sélectionner exercice 1 | Exercice ajouté (ordre=2) | ⏳ | |
| 9 | Définir la durée de l'exercice 1 | Durée personnalisable | ⏳ | |
| 10 | Ajouter exercice 2 | Exercice ajouté (ordre=3) | ⏳ | |
| 11 | Ajouter une situation de match | Situation ajoutée (ordre=4) | ⏳ | |
| 12 | Vérifier l'ordre d'affichage | Ordre correct | ⏳ | |
| 13 | Réordonner les éléments | Drag & drop ou boutons | ⏳ | |
| 14 | Vérifier la durée totale | Somme des durées | ⏳ | |
| 15 | Ajouter des notes | Champ notes fonctionnel | ⏳ | |
| 16 | Ajouter des tags | Tags liés | ⏳ | |
| 17 | Sauvegarder l'entraînement | Entraînement créé | ⏳ | |
| 18 | Voir le détail de l'entraînement | Tous les éléments présents | ⏳ | |
| 19 | Vérifier dans la liste | Entraînement présent | ⏳ | |

### Points de Vérification
- [ ] Relations EntrainementExercice créées
- [ ] Ordre respecté à l'affichage
- [ ] Durées personnalisées sauvegardées
- [ ] Durée totale calculée
- [ ] Notes sauvegardées
- [ ] Suppression d'un élément ne casse pas l'ordre
- [ ] Suppression de l'entraînement supprime les relations (cascade)

### Cas d'Erreur
- [ ] Entraînement sans éléments → Avertissement ou autorisation ?
- [ ] Ordre en doublon → Réorganisation auto
- [ ] Élément supprimé de la base → Gestion de l'erreur

---

## ✏️ PARCOURS 5 : MODIFIER UN EXERCICE EXISTANT

### Scénario
Un coach modifie un exercice déjà créé.

### Étapes

| # | Action | Résultat Attendu | Statut | Notes |
|---|--------|------------------|--------|-------|
| 1 | Aller sur la liste des exercices | Liste affichée | ⏳ | |
| 2 | Cliquer sur un exercice | Détail affiché | ⏳ | |
| 3 | Cliquer "Modifier" | Formulaire pré-rempli | ⏳ | |
| 4 | Vérifier que tous les champs sont remplis | Données existantes présentes | ⏳ | |
| 5 | Modifier le titre | Modification acceptée | ⏳ | |
| 6 | Modifier la description | Modification acceptée | ⏳ | |
| 7 | Changer l'image | Upload + remplacement | ⏳ | |
| 8 | Ajouter un nouveau tag | Tag ajouté | ⏳ | |
| 9 | Supprimer un tag existant | Tag retiré | ⏳ | |
| 10 | Cliquer "Sauvegarder" | Modifications enregistrées | ⏳ | |
| 11 | Voir le message de succès | Toast affiché | ⏳ | |
| 12 | Vérifier le détail | Modifications visibles | ⏳ | |
| 13 | Vérifier dans la liste | Modifications visibles | ⏳ | |
| 14 | Vérifier updatedAt | Date mise à jour | ⏳ | |

### Points de Vérification
- [ ] Toutes les données existantes chargées
- [ ] Modifications bien enregistrées
- [ ] Ancienne image supprimée de Cloudinary (ou conservée ?)
- [ ] Relations tags mises à jour
- [ ] updatedAt mis à jour, createdAt inchangé

### Cas d'Erreur
- [ ] Exercice supprimé entre temps → Message d'erreur
- [ ] Perte de connexion → Modifications non perdues
- [ ] Validation échoue → Messages d'erreur

---

## 🗑️ PARCOURS 6 : SUPPRIMER UN ÉLÉMENT

### Scénario
Un coach supprime un exercice utilisé dans un entraînement.

### Étapes

| # | Action | Résultat Attendu | Statut | Notes |
|---|--------|------------------|--------|-------|
| 1 | Aller sur le détail d'un exercice | Détail affiché | ⏳ | |
| 2 | Cliquer "Supprimer" | Modal de confirmation | ⏳ | |
| 3 | Lire le message de confirmation | Avertissement si utilisé | ⏳ | |
| 4 | Confirmer la suppression | Exercice supprimé | ⏳ | |
| 5 | Voir le message de succès | Toast affiché | ⏳ | |
| 6 | Redirection vers la liste | Liste affichée | ⏳ | |
| 7 | Vérifier que l'exercice n'est plus présent | Absent de la liste | ⏳ | |
| 8 | Aller sur l'entraînement qui l'utilisait | Entraînement affiché | ⏳ | |
| 9 | Vérifier l'état de l'exercice supprimé | Marqué comme supprimé ou retiré | ⏳ | |

### Points de Vérification
- [ ] Confirmation demandée avant suppression
- [ ] Message clair sur les conséquences
- [ ] Suppression effective en DB
- [ ] Image supprimée de Cloudinary (ou conservée ?)
- [ ] Relations mises à jour (NULL ou CASCADE)
- [ ] Entraînements impactés gérés correctement

### Cas d'Erreur
- [ ] Élément déjà supprimé → Message d'erreur
- [ ] Erreur réseau → Suppression non effectuée
- [ ] Cascade échoue → Rollback

---

## 📤 PARCOURS 7 : EXPORTER UN ENTRAÎNEMENT

### Scénario
Un coach exporte un entraînement pour le partager ou l'imprimer.

### Étapes

| # | Action | Résultat Attendu | Statut | Notes |
|---|--------|------------------|--------|-------|
| 1 | Aller sur le détail d'un entraînement | Détail affiché | ⏳ | |
| 2 | Cliquer "Exporter" | Options d'export (JSON, MD) | ⏳ | |
| 3 | Choisir format JSON | Téléchargement du fichier | ⏳ | |
| 4 | Ouvrir le fichier JSON | Format UFM valide | ⏳ | |
| 5 | Vérifier le contenu | Toutes les données présentes | ⏳ | |
| 6 | Retour sur le détail | Page toujours accessible | ⏳ | |
| 7 | Cliquer "Exporter" → Markdown | Téléchargement du fichier | ⏳ | |
| 8 | Ouvrir le fichier Markdown | Format lisible | ⏳ | |
| 9 | Vérifier le contenu | Structure claire | ⏳ | |

### Points de Vérification
- [ ] Format JSON conforme à `shared/formats/ufm_export_format.json`
- [ ] Toutes les données exportées (exercices, échauffements, situations)
- [ ] Relations préservées
- [ ] Markdown bien formaté (titres, listes, durées)
- [ ] Nom de fichier explicite (titre + date)

### Cas d'Erreur
- [ ] Entraînement vide → Export quand même ou message ?
- [ ] Erreur de génération → Message d'erreur

---

## 🔍 PARCOURS 8 : RECHERCHER ET FILTRER

### Scénario
Un coach cherche des exercices spécifiques par tags et recherche textuelle.

### Étapes

| # | Action | Résultat Attendu | Statut | Notes |
|---|--------|------------------|--------|-------|
| 1 | Aller sur "Exercices" | Liste complète affichée | ⏳ | |
| 2 | Cliquer sur le filtre "Passes" | Liste filtrée | ⏳ | |
| 3 | Vérifier que seuls les exercices avec tag "Passes" sont affichés | Filtrage correct | ⏳ | |
| 4 | Ajouter un filtre "Débutant" | Filtrage combiné | ⏳ | |
| 5 | Vérifier le nombre de résultats | Indication visible | ⏳ | |
| 6 | Taper "triangle" dans la recherche | Résultats filtrés | ⏳ | |
| 7 | Vérifier que seuls les exercices contenant "triangle" sont affichés | Recherche fonctionne | ⏳ | |
| 8 | Effacer la recherche | Retour aux filtres tags | ⏳ | |
| 9 | Effacer tous les filtres | Liste complète affichée | ⏳ | |

### Points de Vérification
- [ ] Filtres par tags fonctionnent
- [ ] Combinaison de filtres (ET ou OU ?)
- [ ] Recherche textuelle fonctionne
- [ ] Recherche + filtres combinés
- [ ] Indication du nombre de résultats
- [ ] Bouton "Effacer les filtres" visible
- [ ] URL reflète les filtres (deep linking)

### Cas d'Erreur
- [ ] Aucun résultat → Message explicatif
- [ ] Recherche vide → Tous les résultats

---

## 🔐 PARCOURS 9 : GESTION DE SESSION

### Scénario
Vérifier la gestion de l'authentification et du refresh token.

### Étapes

| # | Action | Résultat Attendu | Statut | Notes |
|---|--------|------------------|--------|-------|
| 1 | Se connecter | Token stocké | ⏳ | |
| 2 | Naviguer dans l'app | Token envoyé à chaque requête | ⏳ | |
| 3 | Attendre expiration du token (7j) | Refresh automatique | ⏳ | |
| 4 | Continuer à utiliser l'app | Pas de déconnexion | ⏳ | |
| 5 | Se déconnecter | Token supprimé | ⏳ | |
| 6 | Essayer d'accéder à une page protégée | Redirection vers login | ⏳ | |
| 7 | Se reconnecter | Nouveau token | ⏳ | |
| 8 | Ouvrir un nouvel onglet | Session partagée | ⏳ | |
| 9 | Se déconnecter dans un onglet | Déconnexion dans tous les onglets | ⏳ | |

### Points de Vérification
- [ ] Token JWT valide
- [ ] Refresh token fonctionnel
- [ ] Expiration gérée correctement
- [ ] Déconnexion nettoie le localStorage
- [ ] AuthGuard protège les routes
- [ ] AuthInterceptor ajoute le token
- [ ] Synchronisation multi-onglets

### Cas d'Erreur
- [ ] Token invalide → Déconnexion + redirection
- [ ] Refresh échoue → Déconnexion + redirection
- [ ] API inaccessible → Message d'erreur

---

## 📱 PARCOURS 10 : UTILISATION MOBILE

### Scénario
Un coach utilise l'application sur son smartphone.

### Étapes

| # | Action | Résultat Attendu | Statut | Notes |
|---|--------|------------------|--------|-------|
| 1 | Ouvrir l'app sur mobile | Page responsive | ⏳ | |
| 2 | Se connecter | Formulaire adapté | ⏳ | |
| 3 | Voir la navigation | Bulles de raccourcis | ⏳ | |
| 4 | Cliquer sur "Exercices" | Liste adaptée | ⏳ | |
| 5 | Scroller la liste | Scroll fluide | ⏳ | |
| 6 | Cliquer sur un exercice | Détail lisible | ⏳ | |
| 7 | Cliquer "Modifier" | Formulaire adapté | ⏳ | |
| 8 | Remplir un champ texte | Clavier approprié | ⏳ | |
| 9 | Uploader une image | Accès à la galerie/caméra | ⏳ | |
| 10 | Sauvegarder | Retour visuel | ⏳ | |
| 11 | Utiliser les filtres | Dropdowns adaptés | ⏳ | |
| 12 | Créer un entraînement | Workflow complet | ⏳ | |

### Points de Vérification
- [ ] Navigation mobile fonctionnelle
- [ ] Cartes adaptées (pas trop denses)
- [ ] Formulaires utilisables (champs assez grands)
- [ ] Boutons tactiles (min 44x44px)
- [ ] Pas de débordement horizontal
- [ ] Images optimisées
- [ ] Performance acceptable

### Cas d'Erreur
- [ ] Connexion lente → Indicateurs de chargement
- [ ] Upload échoue → Message d'erreur

---

## 🎯 MATRICE DE PARCOURS

| Parcours | Criticité | Statut | Bloquants | Notes |
|----------|-----------|--------|-----------|-------|
| **Première connexion** | 🔴 Critique | ⏳ | - | |
| **Créer exercice** | 🔴 Critique | ⏳ | - | |
| **Créer échauffement** | 🟠 Important | ⏳ | - | |
| **Créer entraînement** | 🔴 Critique | ⏳ | - | |
| **Modifier exercice** | 🟠 Important | ⏳ | - | |
| **Supprimer élément** | 🟠 Important | ⏳ | - | |
| **Exporter entraînement** | 🟡 Secondaire | ⏳ | - | |
| **Rechercher/Filtrer** | 🟠 Important | ⏳ | - | |
| **Gestion session** | 🔴 Critique | ⏳ | - | |
| **Utilisation mobile** | 🟠 Important | ⏳ | - | |

---

## 🎯 ACTIONS PRIORITAIRES

### 🔴 BLOQUANT

1. **Tester les 3 parcours critiques**
   - Première connexion
   - Créer un exercice complet
   - Créer un entraînement complet

2. **Vérifier la gestion de session**
   - Authentification
   - Refresh token
   - Déconnexion

### 🟠 MAJEUR

3. **Tester les modifications et suppressions**
   - Modifier un exercice
   - Supprimer un élément
   - Vérifier les cascades

4. **Valider la recherche et les filtres**
   - Filtres par tags
   - Recherche textuelle
   - Combinaisons

### 🟡 MINEUR

5. **Tester l'export**
   - Format JSON
   - Format Markdown
   - Validité des données

6. **Valider le mobile**
   - Navigation
   - Formulaires
   - Performance

---

## 📝 TEMPLATE DE TEST MANUEL

Pour chaque parcours, documenter :

```markdown
### Test du [NOM DU PARCOURS]
**Date** : [DATE]
**Testeur** : [NOM]
**Environnement** : [Production / Staging]
**Device** : [Desktop / Mobile / Tablet]

#### Résultat Global
- [ ] ✅ Succès complet
- [ ] ⚠️ Succès avec réserves
- [ ] ❌ Échec

#### Détails par Étape
| Étape | Statut | Commentaire |
|-------|--------|-------------|
| 1 | ✅ | OK |
| 2 | ⚠️ | Lenteur observée |
| 3 | ❌ | Erreur 500 |

#### Bugs Identifiés
1. [Description du bug]
   - Criticité : 🔴/🟠/🟡
   - Reproduction : [Étapes]
   - Comportement attendu : [Description]
   - Comportement observé : [Description]

#### Recommandations
- [Suggestion d'amélioration]
```

---

**Statut** : ⏳ Analyse en cours  
**Prochaine étape** : Auditer la configuration production et la sécurité
