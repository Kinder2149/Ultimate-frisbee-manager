## Pièges liés à RxJS et aux cycles de vie Angular

- **Piège :** S'abonner à un `Observable` de mise à jour (ex: `dataUpdated) dans `ngOnInit` et appeler dans la souscription une fonction qui peut, même indirectement, déclencher une nouvelle émission de cet `Observable`.
- **Symptôme :** La page freeze, le navigateur consomme 100% du CPU, la mémoire augmente.
- **Solution :** S'assurer que les chargements de données ne sont pas déclenchés par des `Observables` qu'ils peuvent eux-mêmes influencer. Privilégier un chargement unique dans `ngOnInit` si les données sont statiques pour la durée de vie du composant.
# Pièges et Erreurs Fréquentes

Ce registre documente les erreurs récurrentes, les anti-patterns et les pièges rencontrés dans le projet pour éviter de les reproduire.

## 🎯 Objectif
- **Éviter les répétitions** : Ne pas retomber dans les mêmes erreurs
- **Alertes préventives** : Vérifier ce registre avant toute correction
- **Capitalisation** : Transformer les erreurs en apprentissage

## 📝 Format recommandé
Pour chaque piège :
- **Piège** : Description du problème récurrent
- **Symptôme** : Comment le détecter
- **Cause** : Pourquoi ça arrive
- **Solution/Prévention** : Comment l'éviter

---

### Upload de fichiers : JSON vs FormData

- **Piège :** Envoyer un fichier dans un objet JSON au lieu d'utiliser FormData pour les uploads multipart/form-data.
- **Symptôme :** La requête réussit (200 OK) mais le fichier n'est pas sauvegardé. Le backend ne reçoit pas le fichier car il est sérialisé en JSON (ex: `[object File]`).
- **Cause :** Confusion entre les types de requêtes. Les fichiers doivent être envoyés via FormData, pas dans un objet JSON classique.
- **Solution/Prévention :**
  - Toujours utiliser `FormData` pour envoyer des fichiers
  - Exemple correct : `formData.append('icon', file, file.name)`
  - Vérifier que le backend utilise un middleware d'upload (multer, etc.)
  - Ne pas oublier de rafraîchir les données après upload pour afficher le nouveau fichier

### Désynchronisation des routes API entre frontend et backend

- **Piège :** Le frontend peut appeler des routes avec un préfixe incorrect si les routes backend sont réorganisées ou si le développement est fait de manière asynchrone entre les deux parties.
- **Symptôme :** Erreur HTTP 404 "Cannot [METHOD] /api/[route]" alors que la fonctionnalité semble implémentée.
- **Cause :** Changement d'organisation des routes backend (ex: déplacement de `/api/users/*` vers `/api/auth/*`) sans mise à jour correspondante du frontend.
- **Solution/Prévention :** 
  - Toujours vérifier le fichier `routes/index.js` du backend pour connaître le montage exact des routes
  - Utiliser un service centralisé (comme `ApiUrlService`) pour construire les URLs
  - Documenter clairement l'architecture des routes API
  - Faire une recherche globale dans le frontend lors d'un changement de routes backend

### Scripts de Seeding vs. Schéma Prisma

- **Piège :** Les scripts de seeding (ex: `seed-auth.js`) peuvent devenir désynchronisés du `schema.prisma`. Si vous renommez un champ dans le schéma (ex: `password` -> `passwordHash`), vous **devez** mettre à jour tous les scripts qui utilisent ce champ.
- **Symptôme :** Erreur `Argument ... is missing` lors de l'exécution d'un script de seed.
- **Prévention :** Toujours vérifier les scripts de seed après une modification du `schema.prisma`.

### Erreurs de Validation en Cascade et Logique Prisma

- **Piège :** Une erreur se manifestant dans un middleware de validation (ex: `TypeError: Cannot read properties of undefined (reading 'map')`) n'est pas toujours causée par le schéma de validation lui-même. Elle peut être le symptôme d'une erreur inattendue (non-Zod) levée en amont, qui est ensuite mal interprétée par le bloc `catch`.
- **Symptôme :** L'erreur de validation persiste malgré des corrections répétées du schéma Zod et des données d'entrée.
- **Cause :** Une erreur interne (ex: une erreur de base de données Prisma due à une syntaxe de requête incorrecte) est levée. Le middleware de validation la capture, mais comme ce n'est pas une `ZodError`, il tente d'accéder à des propriétés qui n'existent pas (`error.errors`), provoquant un second crash qui masque le problème original.
- **Solution/Prévention :**
  - Si une erreur de validation semble illogique, **ne pas se focaliser uniquement sur le schéma de validation**.
  - Analyser la **totalité de la chaîne de traitement**, en particulier la logique du contrôleur et les interactions avec la base de données qui suivent la validation.
  - S'assurer que la syntaxe des opérations complexes (mises à jour de relations, transactions) est correcte pour l'ORM utilisé (Prisma, etc.).

### Middleware de transformation et `multipart/form-data`

- **Piège :** Lors de l'envoi de données complexes (tableaux d'objets comme `blocs` ou `exercices`) via un formulaire `multipart/form-data`, ces données sont stringifiées en JSON. Si le middleware backend (`transform.middleware.js`) n'est pas mis à jour pour parser ces champs spécifiques, ils resteront des chaînes de caractères, provoquant des crashs plus loin dans la chaîne de traitement (validation, contrôleur).
- **Symptôme :** Erreur 500 du serveur, souvent une `TypeError` (ex: `Cannot read properties of undefined (reading 'map')`) car une chaîne est traitée comme un tableau.
- **Cause :** Oubli de mettre à jour le `transform.middleware.js` pour qu'il gère les nouveaux champs complexes.
- **Solution/Prévention :**
  - Pour tout nouveau champ de type tableau/objet ajouté à un formulaire `multipart`, ajouter son nom à la liste `jsonFields` dans `transform.middleware.js`.
  - S'assurer que le middleware inclut une gestion d'erreur `try...catch` pour le `JSON.parse()` afin d'éviter les crashs en cas de donnée malformée.

### Contexte médias désaligné (dossiers upload)

- **Piège :** Le backend uploade dans un sous-dossier (ex: `situations-matchs`) mais le frontend construit des URLs avec un autre contexte (ex: `situations`).
- **Symptôme :** Images non visibles alors que `imageUrl` est présent et valide.
- **Cause :** Divergence entre la configuration `createUploader(..., subfolder)` côté backend et le paramètre `context` de `ApiUrlService.getMediaUrl()` côté frontend.
- **Solution/Prévention :**
  - Centraliser la liste des contextes médias (constante/enum partagée côté front).
  - Vérifier les routes backend (ex: `routes/*.routes.js`) pour connaître le `subfolder` effectif.
  - Ajouter un test de rendu qui vérifie l’affichage d’une image quand `imageUrl` est défini.
