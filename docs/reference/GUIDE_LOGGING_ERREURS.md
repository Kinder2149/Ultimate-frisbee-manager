# Guide de Gestion des Logs et Erreurs

Ce guide explique comment utiliser le système centralisé de gestion des logs et erreurs dans l'application Ultimate Frisbee Manager.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Backend - Logging](#backend---logging)
- [Frontend - Logging](#frontend---logging)
- [Frontend - Notifications](#frontend---notifications)
- [Gestion des erreurs de formulaires](#gestion-des-erreurs-de-formulaires)
- [Traçabilité des requêtes](#traçabilité-des-requêtes)
- [Bonnes pratiques](#bonnes-pratiques)

---

## Vue d'ensemble

Le système de logging et gestion d'erreurs offre :

- **Traçabilité complète** : Chaque requête HTTP a un `requestId` unique qui permet de suivre son parcours du frontend au backend
- **Logs structurés** : Format JSON avec contexte (user, workspace, action, timestamp)
- **Messages clairs** : Messages d'erreur compréhensibles pour les utilisateurs avec détails techniques pour le support
- **Centralisation** : Services uniques pour éviter la duplication de code

---

## Backend - Logging

### Service de logging

Le service `logger.service.js` centralise tous les logs backend.

#### Import

```javascript
const { logInfo, logError, logAction, logWarning, logDebug } = require('../services/logger.service');
```

#### Utilisation

```javascript
// Log d'information générale
logInfo('Utilisateur connecté', { userId: user.id, email: user.email });

// Log d'erreur avec contexte
logError(error, {
  requestId: req.requestId,
  userId: req.userId,
  workspaceId: req.workspaceId,
  action: 'CREATE_EXERCICE'
});

// Log d'action métier
logAction('EXERCICE_CREATED', {
  userId: req.userId,
  workspaceId: req.workspaceId,
  exerciceId: newExercice.id
}, 'Nouvel exercice créé avec succès');

// Log d'avertissement
logWarning('Tentative d\'accès à un workspace non autorisé', {
  userId: req.userId,
  workspaceId: req.workspaceId
});

// Log de debug (uniquement en développement)
logDebug('Données reçues', { data: req.body });
```

#### Niveaux de log

- **DEBUG** : Informations détaillées pour le débogage (désactivé en production)
- **INFO** : Informations générales sur le flux de l'application
- **WARN** : Avertissements (situations anormales mais non bloquantes)
- **ERROR** : Erreurs (situations bloquantes)

### Middleware de corrélation

Le middleware `request-correlation.middleware.js` génère automatiquement un `requestId` unique pour chaque requête.

**Déjà intégré dans `app.js`** - Aucune action requise.

Le `requestId` est :
- Ajouté à `req.requestId`
- Retourné dans le header `X-Request-ID` de la réponse
- Inclus automatiquement dans tous les logs

### Gestionnaire d'erreurs

Le gestionnaire d'erreurs enrichi retourne des réponses standardisées :

```json
{
  "error": "Message utilisateur clair",
  "code": "VALIDATION_ERROR",
  "requestId": "uuid-1234-5678",
  "timestamp": "2026-03-23T18:00:00Z",
  "details": [
    {
      "field": "nom",
      "message": "Le champ nom est obligatoire"
    }
  ]
}
```

#### Créer une erreur personnalisée

```javascript
const error = new Error('Message utilisateur');
error.statusCode = 400;
error.code = 'VALIDATION_ERROR';
error.details = [
  { field: 'nom', message: 'Le champ nom est obligatoire' }
];
throw error;
```

---

## Frontend - Logging

### Service de logging

Le service `LoggerService` remplace les `console.log` dispersés.

#### Import

```typescript
import { LoggerService } from '@core/services/logger.service';
```

#### Injection

```typescript
constructor(private logger: LoggerService) {}
```

#### Utilisation

```typescript
// Log d'information
this.logger.info('Composant initialisé', { component: 'ExerciceForm' });

// Log d'erreur
this.logger.error('Échec de chargement', error, {
  component: 'ExerciceForm',
  exerciceId: this.exerciceId
});

// Log d'action utilisateur
this.logger.logAction('EXERCICE_SUBMITTED', {
  exerciceId: this.exerciceId,
  mode: this.mode
});

// Log de navigation
this.logger.logNavigation('/exercices/create');

// Log de requête HTTP (géré automatiquement par l'intercepteur)
this.logger.logHttpRequest('POST', '/api/exercices');

// Grouper des logs
this.logger.group('Chargement des données');
this.logger.info('Chargement des tags...');
this.logger.info('Chargement de l\'exercice...');
this.logger.groupEnd();
```

#### Configuration des niveaux

```typescript
// Changer le niveau de log dynamiquement (utile pour le debug)
this.logger.setLevel(LogLevel.DEBUG);

// Ou via localStorage dans la console du navigateur
localStorage.setItem('logLevel', 'DEBUG');
```

---

## Frontend - Notifications

### Service de notification

Le service `NotificationManagerService` unifie l'affichage des notifications.

#### Import

```typescript
import { NotificationManagerService } from '@core/services/notification-manager.service';
```

#### Injection

```typescript
constructor(private notificationManager: NotificationManagerService) {}
```

#### Utilisation

```typescript
// Notification de succès
this.notificationManager.success('Exercice créé avec succès');

// Notification d'erreur simple
this.notificationManager.error('Une erreur est survenue');

// Notification d'erreur avec détails et requestId
this.notificationManager.error('Erreur de validation', {
  requestId: 'uuid-1234',
  details: [
    { field: 'Nom', message: 'Le champ nom est obligatoire' },
    { field: 'Description', message: 'La description est trop courte' }
  ]
});

// Notification d'information
this.notificationManager.info('Chargement en cours...');

// Notification d'avertissement
this.notificationManager.warning('Certaines données sont manquantes');

// Afficher une erreur HTTP automatiquement
this.notificationManager.showHttpError(error, 'Échec de la sauvegarde');
```

### Composant d'affichage d'erreur

Le composant `ErrorDisplayComponent` affiche des erreurs détaillées dans l'UI.

#### Import

```typescript
import { ErrorDisplayComponent } from '@shared/components/error-display/error-display.component';
```

#### Utilisation dans le template

```html
<app-error-display
  [message]="errorMessage"
  [severity]="'error'"
  [details]="errorDetails"
  [requestId]="requestId"
  [showCopyButton]="true"
  [actionLabel]="'Réessayer'"
  [actionCallback]="retry.bind(this)">
</app-error-display>
```

#### Propriétés

- `message` : Message principal de l'erreur
- `severity` : `'error' | 'warning' | 'info'`
- `details` : Liste des détails d'erreur (champs invalides, etc.)
- `requestId` : ID de traçabilité pour le support technique
- `showCopyButton` : Afficher le bouton "Copier les détails"
- `actionLabel` : Label du bouton d'action (optionnel)
- `actionCallback` : Fonction à exécuter au clic sur le bouton d'action

---

## Gestion des erreurs de formulaires

### Helper de validation

Le helper `form-validation.helper.ts` extrait et formate les erreurs de formulaires Angular.

#### Import

```typescript
import {
  getFormErrors,
  getFormErrorSummary,
  validateForm,
  markFormGroupTouched,
  formErrorsToErrorDetails
} from '@shared/utils/form-validation.helper';
```

#### Utilisation

```typescript
onSubmit(): void {
  // Valider le formulaire et marquer tous les champs comme touchés
  if (!validateForm(this.myForm)) {
    // Obtenir toutes les erreurs
    const errors = getFormErrors(this.myForm);
    
    // Convertir en ErrorDetail pour le NotificationManager
    const errorDetails = formErrorsToErrorDetails(errors);
    
    // Afficher l'erreur avec détails
    this.notificationManager.error(
      'Veuillez corriger les erreurs dans le formulaire',
      { details: errorDetails }
    );
    
    return;
  }
  
  // Soumettre le formulaire...
}
```

#### Fonctions disponibles

```typescript
// Obtenir toutes les erreurs d'un formulaire
const errors = getFormErrors(form);
// Retourne: [{ field: 'nom', fieldLabel: 'Nom', message: 'Ce champ est obligatoire', errorType: 'required' }]

// Obtenir un résumé des erreurs
const summary = getFormErrorSummary(form);
// Retourne: "Champs invalides: Nom, Description"

// Valider et marquer tous les champs comme touchés
const isValid = validateForm(form);

// Marquer tous les champs comme touchés (sans validation)
markFormGroupTouched(form);

// Convertir en ErrorDetail
const details = formErrorsToErrorDetails(errors);

// Obtenir l'erreur d'un champ spécifique
const error = getFieldError(form, 'nom');

// Vérifier si un champ a une erreur
const hasError = hasFieldError(form, 'nom');
```

---

## Traçabilité des requêtes

### Flux complet

1. **Frontend** : L'utilisateur soumet un formulaire
2. **Intercepteur HTTP** : Génère un `requestId` (ou réutilise celui du retry)
3. **Backend** : Le middleware de corrélation ajoute le `requestId` à la requête
4. **Logs backend** : Tous les logs incluent le `requestId`
5. **Réponse** : Le `requestId` est retourné dans le header `X-Request-ID`
6. **Frontend** : L'intercepteur extrait le `requestId` et l'affiche dans les erreurs

### Exemple de traçabilité

**Frontend - Erreur affichée à l'utilisateur :**
```
Erreur de validation
• Nom: Ce champ est obligatoire
• Description: Minimum 10 caractères requis
[ID: 550e8400-e29b-41d4-a716-446655440000]
```

**Backend - Logs correspondants :**
```json
{
  "level": "error",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "workspaceId": "workspace-456",
  "method": "POST",
  "url": "/api/exercices",
  "errorMessage": "Validation failed",
  "timestamp": "2026-03-23T18:00:00Z"
}
```

L'utilisateur peut copier l'ID et le fournir au support technique qui pourra retrouver tous les logs associés.

---

## Bonnes pratiques

### Backend

✅ **À FAIRE**
```javascript
// Utiliser le logger centralisé
logInfo('Action réussie', { userId, workspaceId });

// Enrichir les erreurs avec des détails
const error = new Error('Validation échouée');
error.statusCode = 400;
error.code = 'VALIDATION_ERROR';
error.details = [{ field: 'nom', message: 'Champ obligatoire' }];
throw error;

// Logger les actions métier importantes
logAction('EXERCICE_CREATED', { userId, exerciceId }, 'Exercice créé');
```

❌ **À ÉVITER**
```javascript
// Ne pas utiliser console.log directement
console.log('Action réussie');

// Ne pas créer des erreurs sans contexte
throw new Error('Erreur');

// Ne pas oublier le requestId dans les logs
logError(error); // Manque le contexte
```

### Frontend

✅ **À FAIRE**
```typescript
// Utiliser le logger centralisé
this.logger.info('Composant initialisé', { component: 'MyComponent' });

// Utiliser le NotificationManager pour les erreurs
this.notificationManager.showHttpError(error, 'Échec de la sauvegarde');

// Valider les formulaires avec le helper
if (!validateForm(this.myForm)) {
  const errors = getFormErrors(this.myForm);
  this.notificationManager.error('Formulaire invalide', {
    details: formErrorsToErrorDetails(errors)
  });
  return;
}
```

❌ **À ÉVITER**
```typescript
// Ne pas utiliser console.log directement
console.log('Composant initialisé');

// Ne pas utiliser MatSnackBar directement
this.snackBar.open('Erreur', 'Fermer');

// Ne pas afficher des messages génériques
this.snackBar.open('Une erreur est survenue', 'Fermer');
```

### Sécurité

⚠️ **IMPORTANT**

- Ne jamais logger de données sensibles (mots de passe, tokens, etc.)
- En production, les logs DEBUG sont désactivés automatiquement
- Les stacks d'erreur ne sont exposées qu'en développement
- Anonymiser les données personnelles si nécessaire (RGPD)

### Performance

- Le logging est asynchrone et n'impacte pas les performances
- Les logs sont automatiquement redactés (headers sensibles masqués)
- En production, seuls les niveaux WARN et ERROR sont loggés par défaut

---

## Migration progressive

Pour migrer l'existant vers le nouveau système :

1. **Identifier les zones critiques** : Formulaires, authentification, gestion des workspaces
2. **Remplacer les console.log** : Utiliser `LoggerService`
3. **Remplacer les MatSnackBar** : Utiliser `NotificationManagerService`
4. **Améliorer les messages d'erreur** : Ajouter des détails et le requestId
5. **Tester** : Vérifier que les erreurs sont bien tracées et affichées

---

## Support et debugging

### Activer les logs DEBUG en production

Dans la console du navigateur :
```javascript
localStorage.setItem('logLevel', 'DEBUG');
// Recharger la page
```

### Retrouver les logs d'une requête

1. L'utilisateur copie le `requestId` depuis l'erreur affichée
2. Rechercher dans les logs backend : `grep "requestId":"550e8400-e29b-41d4-a716-446655440000" logs/*.log`
3. Analyser le contexte complet de la requête

### Outils recommandés

- **Développement** : Console du navigateur + logs backend en console
- **Production** : Service de logging externe (Sentry, LogRocket, CloudWatch, etc.)

---

## Exemples complets

### Exemple 1 : Création d'exercice avec gestion d'erreur

**Frontend**
```typescript
onSubmit(): void {
  if (!validateForm(this.exerciceForm)) {
    const errors = getFormErrors(this.exerciceForm);
    this.notificationManager.error('Formulaire invalide', {
      details: formErrorsToErrorDetails(errors)
    });
    return;
  }

  this.logger.logAction('EXERCICE_SUBMIT', { mode: this.mode });

  this.exerciceService.createExercice(formData).subscribe({
    next: (exercice) => {
      this.logger.info('Exercice créé', { exerciceId: exercice.id });
      this.notificationManager.success('Exercice créé avec succès');
      this.router.navigate(['/exercices']);
    },
    error: (error) => {
      this.logger.error('Échec création exercice', error);
      this.notificationManager.showHttpError(error, 'Échec de la création');
    }
  });
}
```

**Backend**
```javascript
exports.createExercice = async (req, res, next) => {
  try {
    const workspaceId = req.workspaceId;
    const data = req.body;
    
    logAction('CREATE_EXERCICE_ATTEMPT', {
      requestId: req.requestId,
      userId: req.userId,
      workspaceId
    });

    const newExercice = await exerciceService.createExercice(data, workspaceId, req.file);

    logAction('EXERCICE_CREATED', {
      requestId: req.requestId,
      userId: req.userId,
      workspaceId,
      exerciceId: newExercice.id
    }, 'Exercice créé avec succès');

    res.status(201).json(newExercice);
  } catch (error) {
    logError(error, {
      requestId: req.requestId,
      userId: req.userId,
      workspaceId: req.workspaceId,
      action: 'CREATE_EXERCICE'
    });
    next(error);
  }
};
```

---

## Conclusion

Ce système de logging et gestion d'erreurs offre :

- ✅ **Traçabilité complète** avec requestId
- ✅ **Messages clairs** pour les utilisateurs
- ✅ **Contexte riche** pour le debugging
- ✅ **Centralisation** du code
- ✅ **Facilité de maintenance**

Pour toute question ou amélioration, consultez l'équipe technique.
