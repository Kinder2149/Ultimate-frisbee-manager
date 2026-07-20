# Guide de tests manuels pour Ultimate Frisbee Manager

## 1. Module d'entraînements - Tests fonctionnels

### Navigation et structure globale
- [ ] Vérifier que le lien "Entraînements" dans la barre de navigation redirige vers la liste des entraînements
- [ ] Vérifier que le formulaire d'ajout d'un nouvel entraînement est accessible
- [ ] Vérifier que le détail d'un entraînement est accessible depuis la liste
- [ ] Vérifier que la modification d'un entraînement est accessible depuis le détail

### Gestion des tags d'entraînement
- [ ] Accéder à la page "Gérer les tags" et vérifier que l'onglet "Tags d'entraînement" est présent
- [ ] Créer un nouveau tag d'entraînement dans chacune des catégories suivantes :
  - [ ] Thèmes
  - [ ] Niveaux (avec niveau = 3)
  - [ ] Types d'entraînement
  - [ ] Périodes de saison
- [ ] Modifier un tag existant et vérifier que les modifications sont enregistrées
- [ ] Supprimer un tag et vérifier qu'il n'apparaît plus dans la liste
- [ ] Filtrer les tags par catégorie et vérifier que seuls les tags correspondants s'affichent

### Gestion des entraînements
- [ ] Créer un nouvel entraînement avec les informations de base (titre, date, thème)
- [ ] Ajouter une phase d'échauffement avec une durée de 15 minutes
- [ ] Ajouter une phase d'exercice avec une durée de 20 minutes
- [ ] Ajouter une phase de situation avec une durée de 25 minutes
- [ ] Vérifier que la durée totale calculée est correcte (60 minutes)
- [ ] Associer des tags au nouvel entraînement
- [ ] Enregistrer l'entraînement et vérifier qu'il apparaît dans la liste

### Gestion des phases et exercices
- [ ] Dans un entraînement existant, ajouter un nouvel exercice à une phase
- [ ] Modifier la durée d'un exercice et vérifier que la durée totale de la phase est mise à jour
- [ ] Modifier la durée d'une phase et vérifier que la durée totale de l'entraînement est mise à jour
- [ ] Réorganiser les phases par glisser-déposer et vérifier que l'ordre est conservé
- [ ] Réorganiser les exercices dans une phase et vérifier que l'ordre est conservé

### Tests de robustesse
- [ ] Essayer de créer un entraînement sans titre et vérifier que la validation fonctionne
- [ ] Essayer de créer un tag d'entraînement sans label et vérifier que la validation fonctionne
- [ ] Modifier une phase sans durée et vérifier que le calcul de la durée totale gère correctement cette situation
- [ ] Supprimer une phase contenant des exercices et vérifier que la durée totale est mise à jour

## 2. Vérification de l'interface utilisateur

### Cohérence visuelle
- [ ] Vérifier que les styles des composants d'entraînement sont cohérents avec le reste de l'application
- [ ] Vérifier que les formulaires ont une apparence et un comportement similaires
- [ ] Vérifier que les boutons d'action ont des couleurs et des positions cohérentes
- [ ] Vérifier que les messages d'erreur et de succès s'affichent correctement

### Responsive design
- [ ] Tester l'interface sur un écran de bureau (>1200px)
- [ ] Tester l'interface sur une tablette (768px-1024px)
- [ ] Tester l'interface sur un téléphone mobile (<768px)
- [ ] Vérifier que les formulaires s'adaptent correctement aux différentes tailles d'écran
- [ ] Vérifier que les listes d'entraînements et de tags s'affichent correctement sur tous les appareils

## 3. Intégration globale

### Interaction entre modules
- [ ] Créer un exercice, puis l'utiliser dans une phase d'entraînement
- [ ] Créer un tag d'entraînement, puis l'associer à un entraînement
- [ ] Vérifier que les modifications apportées aux tags sont répercutées dans les entraînements associés
- [ ] Vérifier que les exercices apparaissent correctement dans les sélecteurs d'exercices des phases

### Performance
- [ ] Charger une liste de nombreux entraînements et vérifier la performance
- [ ] Ouvrir un entraînement avec de nombreuses phases et exercices et vérifier la performance
- [ ] Effectuer plusieurs opérations d'ajout/modification/suppression rapides et vérifier la stabilité

## Notes sur les tests

Pour chaque test, notez les éventuels problèmes rencontrés, en indiquant :
- La description précise du problème
- Les étapes pour le reproduire
- Le comportement attendu vs le comportement observé
- Captures d'écran si nécessaire

En cas de problème critique, créer une issue dans le système de suivi de bugs avec tous les détails nécessaires.
