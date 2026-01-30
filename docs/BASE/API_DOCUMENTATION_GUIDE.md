# 📚 GUIDE DE DOCUMENTATION API - Ultimate Frisbee Manager

**Date de création** : 30 janvier 2026  
**Version** : 1.0  
**Statut** : Documentation progressive (10 endpoints documentés / 73 total)

---

## 📋 TABLE DES MATIÈRES

1. [État actuel de la documentation](#état-actuel-de-la-documentation)
2. [Accès à la documentation](#accès-à-la-documentation)
3. [Routes documentées](#routes-documentées)
4. [Routes à documenter](#routes-à-documenter)
5. [Comment documenter une route](#comment-documenter-une-route)
6. [Exemples de documentation](#exemples-de-documentation)
7. [Bonnes pratiques](#bonnes-pratiques)

---

## 📊 ÉTAT ACTUEL DE LA DOCUMENTATION

### Progression

**Total** : 10 endpoints documentés / 73 total (13.7%)

**Routes documentées** :
- ✅ **Auth** : 4/4 endpoints (100%)
- ✅ **Exercises** : 6/6 endpoints (100%)
- ⏳ **Trainings** : 0/6 endpoints (0%)
- ⏳ **Workspaces** : 0/12 endpoints (0%)
- ⏳ **Tags** : 0/6 endpoints (0%)
- ⏳ **Warmups** : 0/6 endpoints (0%)
- ⏳ **Matches** : 0/6 endpoints (0%)
- ⏳ **Dashboard** : 0/1 endpoint (0%)
- ⏳ **Import** : 0/7 endpoints (0%)
- ⏳ **Admin** : 0/13 endpoints (0%)
- ⏳ **Sync** : 0/2 endpoints (0%)
- ⏳ **Health** : 0/2 endpoints (0%)

### Prochaines priorités

**Phase 2** (recommandé) :
1. **Trainings** (6 endpoints) - Fonctionnalité principale
2. **Workspaces** (5 endpoints principaux) - Multi-tenant
3. **Tags** (6 endpoints) - Transversal

**Phase 3** (optionnel) :
4. **Warmups** (6 endpoints)
5. **Matches** (6 endpoints)
6. **Dashboard** (1 endpoint)

**Phase 4** (avancé) :
7. **Import/Export** (7 endpoints)
8. **Admin** (13 endpoints)
9. **Sync** (2 endpoints)
10. **Health** (2 endpoints)

---

## 🌐 ACCÈS À LA DOCUMENTATION

### Swagger UI

**URL locale** : http://localhost:3000/api/docs  
**URL production** : https://ultimate-frisbee-manager-api.onrender.com/api/docs

### Fonctionnalités Swagger UI

- ✅ Interface interactive pour tester les endpoints
- ✅ Authentification JWT intégrée (bouton "Authorize")
- ✅ Exemples de requêtes/réponses
- ✅ Schémas de données réutilisables
- ✅ Codes d'erreur documentés

### Utilisation

1. Ouvrir `/api/docs` dans le navigateur
2. Cliquer sur "Authorize" en haut à droite
3. Entrer le token JWT : `Bearer <votre_token>`
4. Tester les endpoints directement depuis l'interface

---

## ✅ ROUTES DOCUMENTÉES

### Auth (4 endpoints)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un profil utilisateur |
| GET | `/api/auth/profile` | Récupérer le profil |
| PUT | `/api/auth/profile` | Mettre à jour le profil |
| POST | `/api/auth/logout` | Déconnexion (symbolique) |

**Fichier** : `backend/routes/auth.routes.js`

### Exercises (6 endpoints)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/exercises` | Liste tous les exercices |
| GET | `/api/exercises/:id` | Récupérer un exercice |
| POST | `/api/exercises` | Créer un exercice |
| PUT | `/api/exercises/:id` | Mettre à jour un exercice |
| POST | `/api/exercises/:id/duplicate` | Dupliquer un exercice |
| DELETE | `/api/exercises/:id` | Supprimer un exercice |

**Fichier** : `backend/routes/exercice.routes.js`

---

## ⏳ ROUTES À DOCUMENTER

### Trainings (6 endpoints) - PRIORITÉ 1

| Méthode | Route | Description | Fichier |
|---------|-------|-------------|---------|
| GET | `/api/trainings` | Liste entraînements | `entrainement.routes.js` |
| GET | `/api/trainings/:id` | Détails entraînement | `entrainement.routes.js` |
| POST | `/api/trainings` | Créer entraînement | `entrainement.routes.js` |
| PUT | `/api/trainings/:id` | Mettre à jour | `entrainement.routes.js` |
| POST | `/api/trainings/:id/duplicate` | Dupliquer | `entrainement.routes.js` |
| DELETE | `/api/trainings/:id` | Supprimer | `entrainement.routes.js` |

### Workspaces (12 endpoints) - PRIORITÉ 2

| Méthode | Route | Description | Fichier |
|---------|-------|-------------|---------|
| GET | `/api/workspaces/me` | Mes workspaces | `workspace.routes.js` |
| GET | `/api/workspaces/:id` | Détails workspace | `workspace.routes.js` |
| POST | `/api/workspaces` | Créer workspace | `workspace.routes.js` |
| PUT | `/api/workspaces/:id` | Mettre à jour | `workspace.routes.js` |
| DELETE | `/api/workspaces/:id` | Supprimer | `workspace.routes.js` |
| ... | ... | 7 autres endpoints | `workspace.routes.js` |

### Tags (6 endpoints) - PRIORITÉ 3

| Méthode | Route | Description | Fichier |
|---------|-------|-------------|---------|
| GET | `/api/tags` | Liste tags | `tag.routes.js` |
| GET | `/api/tags/grouped` | Tags groupés | `tag.routes.js` |
| GET | `/api/tags/:id` | Détails tag | `tag.routes.js` |
| POST | `/api/tags` | Créer tag | `tag.routes.js` |
| PUT | `/api/tags/:id` | Mettre à jour | `tag.routes.js` |
| DELETE | `/api/tags/:id` | Supprimer | `tag.routes.js` |

### Autres routes (39 endpoints)

- **Warmups** : 6 endpoints (`echauffement.routes.js`)
- **Matches** : 6 endpoints (`situationmatch.routes.js`)
- **Dashboard** : 1 endpoint (`dashboard.routes.js`)
- **Import** : 7 endpoints (`import.routes.js`)
- **Admin** : 13 endpoints (`admin.routes.js`)
- **Sync** : 2 endpoints (`sync.routes.js`)
- **Health** : 2 endpoints (`health.routes.js`)
- **Debug** : 2 endpoints (`debug.js`) - **NE PAS DOCUMENTER**

---

## 📝 COMMENT DOCUMENTER UNE ROUTE

### Structure JSDoc Swagger

Ajouter un bloc JSDoc **avant** la définition de la route :

```javascript
/**
 * @swagger
 * /api/endpoint:
 *   method:
 *     summary: Description courte
 *     description: Description détaillée (optionnel)
 *     tags: [CategoryName]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field: { type: string }
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemaName'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.method('/endpoint', controller.action);
```

### Éléments obligatoires

1. **summary** : Description courte (1 ligne)
2. **tags** : Catégorie (Auth, Exercises, Trainings, etc.)
3. **security** : `bearerAuth` si route protégée
4. **parameters** : `workspaceId` si route workspace
5. **responses** : Au minimum 200 et 401

### Éléments optionnels

- **description** : Description longue
- **requestBody** : Pour POST/PUT/PATCH
- **parameters** : Query params, path params
- **examples** : Exemples de requêtes/réponses

---

## 💡 EXEMPLES DE DOCUMENTATION

### Exemple 1 : Route GET simple

```javascript
/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Récupérer tous les tags
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     responses:
 *       200:
 *         description: Liste des tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', tagController.getAllTags);
```

### Exemple 2 : Route POST avec body

```javascript
/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Créer un nouveau tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - categorie
 *             properties:
 *               nom:
 *                 type: string
 *                 example: Débutant
 *               categorie:
 *                 type: string
 *                 enum: [objectif, travail_specifique, niveau, materiel, type_exercice]
 *                 example: niveau
 *     responses:
 *       201:
 *         description: Tag créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', validate(createTagSchema), tagController.createTag);
```

### Exemple 3 : Route avec upload fichier

```javascript
/**
 * @swagger
 * /api/exercises:
 *   post:
 *     summary: Créer un exercice avec image
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/workspaceId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - duree
 *             properties:
 *               nom:
 *                 type: string
 *               duree:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image de l'exercice
 *     responses:
 *       201:
 *         description: Exercice créé
 */
router.post('/', createUploader('image', 'exercices'), controller.create);
```

---

## ✅ BONNES PRATIQUES

### 1. Cohérence

- ✅ Utiliser les mêmes noms de schémas (`Exercise`, `Tag`, etc.)
- ✅ Utiliser les réponses réutilisables (`$ref: '#/components/responses/...'`)
- ✅ Suivre la même structure pour toutes les routes

### 2. Clarté

- ✅ Summary court et descriptif
- ✅ Exemples concrets dans les schémas
- ✅ Codes d'erreur documentés

### 3. Complétude

- ✅ Tous les paramètres documentés
- ✅ Tous les codes de réponse possibles
- ✅ Schémas de requête/réponse

### 4. Maintenance

- ✅ Mettre à jour la documentation lors de modifications
- ✅ Tester les endpoints via Swagger UI
- ✅ Vérifier que les exemples fonctionnent

### 5. Sécurité

- ✅ Toujours documenter `security: bearerAuth` pour routes protégées
- ✅ Documenter le header `X-Workspace-Id` si nécessaire
- ✅ Ne PAS documenter les routes de debug

---

## 🔧 CONFIGURATION

### Fichiers de configuration

**Swagger config** : `backend/config/swagger.js`
- Définition OpenAPI 3.0
- Schémas réutilisables
- Réponses réutilisables
- Tags de catégorisation

**App config** : `backend/app.js`
- Route `/api/docs` pour Swagger UI
- Personnalisation UI

### Ajouter un nouveau fichier de routes

Modifier `backend/config/swagger.js` :

```javascript
apis: [
  './routes/auth.routes.js',
  './routes/exercice.routes.js',
  './routes/votre-nouveau-fichier.routes.js' // Ajouter ici
]
```

### Ajouter un nouveau schéma

Modifier `backend/config/swagger.js` dans `components.schemas` :

```javascript
schemas: {
  VotreSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      nom: { type: 'string' }
    }
  }
}
```

---

## 📚 RESSOURCES

### Documentation officielle

- [Swagger/OpenAPI 3.0](https://swagger.io/specification/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)

### Fichiers de référence

- `backend/routes/auth.routes.js` - Exemple complet auth
- `backend/routes/exercice.routes.js` - Exemple complet CRUD
- `backend/config/swagger.js` - Configuration centrale

---

## 🎯 PROCHAINES ÉTAPES

### Court terme (Phase 2)

1. Documenter routes **Trainings** (6 endpoints)
2. Documenter routes **Workspaces** (5 endpoints principaux)
3. Documenter routes **Tags** (6 endpoints)

**Objectif** : 27 endpoints documentés (37% de l'API)

### Moyen terme (Phase 3)

4. Documenter routes **Warmups** (6 endpoints)
5. Documenter routes **Matches** (6 endpoints)
6. Documenter route **Dashboard** (1 endpoint)

**Objectif** : 40 endpoints documentés (55% de l'API)

### Long terme (Phase 4)

7. Documenter routes **Import/Export** (7 endpoints)
8. Documenter routes **Admin** (13 endpoints)
9. Documenter routes **Sync** (2 endpoints)
10. Documenter routes **Health** (2 endpoints)

**Objectif** : 64 endpoints documentés (88% de l'API)

---

## 📞 CONTACT

Pour toute question sur la documentation API :
- **Email** : api@ultimate-frisbee-manager.com
- **Documentation** : `/api/docs`

---

**Dernière mise à jour** : 30 janvier 2026  
**Auteur** : Équipe de développement Ultimate Frisbee Manager
