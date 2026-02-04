# 📋 Plan de Refonte Complète - Page Profil Utilisateur

**Date de création :** 4 février 2026  
**Objectif :** Créer une page de profil moderne, cohérente avec le design du projet, avec édition inline des informations et persistance réelle des données.

---

## 🔍 1. Analyse de l'État Actuel

### 1.1 Frontend Actuel (`profile-page.component`)

**Problèmes identifiés :**
- ❌ Design non unifié avec le reste du projet (style Material basique)
- ❌ Mise en page confuse (bouton d'enregistrement au milieu)
- ❌ Formulaire de question de sécurité présent mais non pertinent
- ❌ Pas d'édition inline : tout est dans des formulaires séparés
- ❌ Upload d'avatar séparé du reste du profil
- ❌ 3 formulaires distincts (infos perso, sécurité, mot de passe)
- ❌ Boutons d'action mal positionnés

**Points positifs :**
- ✅ Connexion au backend fonctionnelle
- ✅ Upload d'avatar via Cloudinary opérationnel
- ✅ Validation des formulaires en place
- ✅ Gestion des erreurs présente

### 1.2 Backend Actuel

**Routes disponibles :**
- `GET /api/auth/profile` - Récupération du profil ✅
- `PUT /api/auth/profile` - Mise à jour (multipart/form-data) ✅
- `POST /api/auth/change-password` - Changement de mot de passe ❌ (route non trouvée)
- `POST /api/auth/security-question` - Question de sécurité ❌ (route non trouvée)

**Modèle User (Prisma) :**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  nom       String
  prenom    String?
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)
  iconUrl   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  workspaces WorkspaceUser[]
}
```

**Champs disponibles pour édition :**
- ✅ `email` (unique, requis)
- ✅ `nom` (requis)
- ✅ `prenom` (optionnel)
- ✅ `iconUrl` (optionnel, via upload Cloudinary)
- ❌ `password` (géré par Supabase, pas en base locale)
- ❌ `securityQuestion` / `securityAnswer` (n'existent pas dans le schéma)

### 1.3 Design System du Projet

**Fichiers de style globaux :**
- `global-theme.scss` - Variables CSS, classes utilitaires
- `_entity-card.scss` - Style des cartes d'entités
- `mobile-optimizations.scss` - Responsive mobile

**Variables CSS principales :**
```scss
--primary-color: #3498db
--text-primary: #2c3e50
--bg-primary: #ffffff
--border-radius-md: 8px
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1)
--spacing-lg: 1.5rem
```

**Pattern de cartes utilisé :**
- Border radius 12px
- Shadow avec hover effect
- Header avec titre + actions
- Content padding 20px
- Transition smooth sur hover

---

## 🎯 2. Objectifs de la Refonte

### 2.1 Design & UX

1. **Unification du style** avec le reste du projet
   - Utiliser les variables CSS du `global-theme.scss`
   - Appliquer le pattern des cartes `_entity-card.scss`
   - Cohérence avec les pages exercices/entraînements

2. **Édition inline moderne**
   - Affichage des valeurs actuelles en mode lecture
   - Bouton "Modifier" (icône crayon) à côté de chaque champ
   - Passage en mode édition pour le champ spécifique
   - Bouton "Enregistrer" (icône check) pour valider
   - Bouton "Annuler" (icône close) pour abandonner

3. **Layout optimisé**
   - Section principale : Informations du profil
   - Avatar en haut avec preview circulaire
   - Champs éditables en liste verticale claire
   - Section sécurité séparée (mot de passe uniquement)

### 2.2 Fonctionnalités

**Champs éditables :**
- ✅ Prénom (inline edit)
- ✅ Nom (inline edit)
- ✅ Email (inline edit avec validation)
- ✅ Avatar (upload avec preview immédiat)
- ✅ Mot de passe (modal ou section dédiée)

**Fonctionnalités à supprimer :**
- ❌ Question de sécurité (n'existe pas en base)

**Fonctionnalités à ajouter :**
- ✅ Feedback visuel immédiat après modification
- ✅ Validation en temps réel
- ✅ Indicateur de chargement par champ
- ✅ Affichage de la date de création du compte
- ✅ Affichage du rôle (lecture seule)

### 2.3 Backend

**Routes à créer/vérifier :**
- ✅ `PUT /api/auth/profile` - Mise à jour partielle (déjà existe)
- ✅ `POST /api/auth/update-password` - Changement de mot de passe via Supabase
- ❌ Supprimer les routes de question de sécurité

**Modifications backend nécessaires :**
1. Vérifier que `PUT /api/auth/profile` accepte les mises à jour partielles
2. Créer endpoint pour changement de mot de passe via Supabase Auth
3. Ajouter validation stricte des emails (format + unicité)
4. Gérer les erreurs de conflit (email déjà utilisé)

---

## 📐 3. Maquette de la Nouvelle Page

### 3.1 Structure Visuelle

```
┌─────────────────────────────────────────────────────────┐
│  Mon Profil                                    [Icône]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          INFORMATIONS PERSONNELLES                │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                   │  │
│  │     ╭─────────╮                                  │  │
│  │     │ Avatar  │  [Modifier l'avatar]             │  │
│  │     ╰─────────╯                                  │  │
│  │                                                   │  │
│  │  Prénom:    Jean                    [✏️] [💾]    │  │
│  │  Nom:       Dupont                  [✏️] [💾]    │  │
│  │  Email:     jean@exemple.com        [✏️] [💾]    │  │
│  │                                                   │  │
│  │  Rôle:      Utilisateur             (lecture)    │  │
│  │  Membre depuis: 15 janvier 2026     (lecture)    │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          SÉCURITÉ                                 │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                   │  │
│  │  Mot de passe: ••••••••            [Modifier]    │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3.2 États des Champs

**Mode Lecture (par défaut) :**
```html
<div class="profile-field">
  <span class="field-label">Prénom</span>
  <span class="field-value">Jean</span>
  <button class="btn-edit" (click)="editField('prenom')">
    <mat-icon>edit</mat-icon>
  </button>
</div>
```

**Mode Édition :**
```html
<div class="profile-field editing">
  <span class="field-label">Prénom</span>
  <mat-form-field>
    <input matInput [(ngModel)]="editingValue" />
  </mat-form-field>
  <button class="btn-save" (click)="saveField('prenom')">
    <mat-icon>check</mat-icon>
  </button>
  <button class="btn-cancel" (click)="cancelEdit()">
    <mat-icon>close</mat-icon>
  </button>
</div>
```

**Mode Chargement :**
```html
<div class="profile-field loading">
  <span class="field-label">Prénom</span>
  <span class="field-value">Jean</span>
  <mat-spinner diameter="20"></mat-spinner>
</div>
```

---

## 🛠️ 4. Plan d'Implémentation Détaillé

### Phase 1 : Préparation Backend (30 min)

**Étape 1.1 : Vérifier/Créer les endpoints**
- [ ] Tester `PUT /api/auth/profile` avec données partielles
- [ ] Créer `POST /api/auth/update-password` utilisant Supabase Auth
- [ ] Ajouter validation email stricte
- [ ] Gérer les erreurs de conflit

**Étape 1.2 : Mettre à jour le contrôleur**
```javascript
// backend/controllers/auth.controller.js
async updateProfile(req, res) {
  // Accepter mise à jour partielle
  // Valider email si fourni
  // Gérer upload avatar
  // Retourner user mis à jour
}

async updatePassword(req, res) {
  // Utiliser Supabase Auth updateUser
  // Valider nouveau mot de passe
  // Gérer erreurs Supabase
}
```

**Étape 1.3 : Ajouter les routes**
```javascript
// backend/routes/auth.routes.js
router.put('/profile', authenticateToken, createUploader('icon', 'avatars'), updateProfile);
router.post('/update-password', authenticateToken, updatePassword);
```

### Phase 2 : Refonte Frontend (2h)

**Étape 2.1 : Créer le nouveau composant TypeScript**
```typescript
// profile-page.component.ts
interface EditableField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  isEditing: boolean;
  isLoading: boolean;
  validators?: ValidatorFn[];
}

class ProfilePageComponent {
  user$: Observable<User | null>;
  fields: EditableField[] = [];
  
  editField(fieldName: string): void
  saveField(fieldName: string): void
  cancelEdit(fieldName: string): void
  updateAvatar(file: File): void
  openPasswordModal(): void
}
```

**Étape 2.2 : Créer le template HTML moderne**
- [ ] Section header avec titre
- [ ] Card "Informations personnelles"
  - Avatar avec bouton upload
  - Liste des champs éditables
  - Champs en lecture seule (rôle, date)
- [ ] Card "Sécurité"
  - Bouton "Modifier le mot de passe"
  - Modal pour changement de mot de passe

**Étape 2.3 : Créer les styles SCSS unifiés**
```scss
// profile-page.component.scss
@import '../../shared/styles/global-theme.scss';

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.profile-card {
  @extend .card;
  margin-bottom: var(--spacing-lg);
}

.profile-field {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  
  &:hover {
    background: var(--bg-secondary);
  }
  
  &.editing {
    background: var(--bg-light);
  }
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl);
  
  .avatar-preview {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: var(--shadow-md);
  }
}
```

**Étape 2.4 : Implémenter l'édition inline**
- [ ] Système de state management par champ
- [ ] Validation en temps réel
- [ ] Appels API individuels par champ
- [ ] Feedback visuel (spinner, success, error)
- [ ] Rollback en cas d'erreur

**Étape 2.5 : Créer le modal de mot de passe**
```typescript
// password-change-modal.component.ts
class PasswordChangeModalComponent {
  passwordForm: FormGroup;
  
  changePassword(): void {
    // Appel à authService.updatePassword()
    // Utilise Supabase Auth
  }
}
```

### Phase 3 : Service & Intégration (30 min)

**Étape 3.1 : Mettre à jour AuthService**
```typescript
// auth.service.ts
updateUserField(field: string, value: any): Observable<User> {
  const formData = new FormData();
  formData.append(field, value);
  return this.http.put<{user: User}>(`${this.apiUrl}/profile`, formData)
    .pipe(
      tap(res => this.currentUserSubject.next(res.user)),
      map(res => res.user)
    );
}

updatePassword(newPassword: string): Observable<void> {
  return from(
    this.supabaseService.supabase.auth.updateUser({ password: newPassword })
  ).pipe(
    map(({ error }) => {
      if (error) throw error;
      return;
    })
  );
}
```

**Étape 3.2 : Tests d'intégration**
- [ ] Test édition prénom
- [ ] Test édition nom
- [ ] Test édition email (avec validation)
- [ ] Test upload avatar
- [ ] Test changement mot de passe
- [ ] Test gestion erreurs (email déjà utilisé, etc.)

### Phase 4 : Responsive & Finitions (30 min)

**Étape 4.1 : Responsive mobile**
```scss
@media (max-width: 768px) {
  .profile-field {
    flex-direction: column;
    align-items: flex-start;
    
    .field-actions {
      margin-top: var(--spacing-sm);
      width: 100%;
    }
  }
  
  .avatar-section {
    .avatar-preview {
      width: 100px;
      height: 100px;
    }
  }
}
```

**Étape 4.2 : Accessibilité**
- [ ] Labels ARIA sur tous les boutons
- [ ] Focus management en mode édition
- [ ] Annonces screen reader pour les changements
- [ ] Navigation clavier complète

**Étape 4.3 : Animations & Transitions**
```scss
.profile-field {
  transition: background var(--transition-fast);
  
  &.editing {
    animation: slideIn 0.3s ease;
  }
  
  &.success {
    animation: flashSuccess 0.5s ease;
  }
}

@keyframes flashSuccess {
  0%, 100% { background: transparent; }
  50% { background: rgba(76, 175, 80, 0.1); }
}
```

---

## 🧪 5. Tests & Validation

### 5.1 Tests Fonctionnels

**Scénarios à tester :**
1. ✅ Affichage initial du profil avec données utilisateur
2. ✅ Édition prénom → sauvegarde → vérification persistance
3. ✅ Édition nom → sauvegarde → vérification persistance
4. ✅ Édition email → validation format → sauvegarde
5. ✅ Édition email avec email existant → erreur affichée
6. ✅ Upload avatar → preview immédiat → sauvegarde
7. ✅ Changement mot de passe → validation → confirmation
8. ✅ Annulation d'édition → retour valeur originale
9. ✅ Édition multiple champs en séquence
10. ✅ Gestion erreurs réseau

### 5.2 Tests de Régression

**Vérifier que :**
- [ ] L'authentification fonctionne toujours
- [ ] Le profil se charge au démarrage
- [ ] L'avatar s'affiche dans le header
- [ ] La déconnexion fonctionne
- [ ] Les workspaces sont toujours accessibles

### 5.3 Tests de Performance

**Métriques à vérifier :**
- [ ] Temps de chargement initial < 500ms
- [ ] Temps de sauvegarde d'un champ < 1s
- [ ] Upload avatar < 3s (selon taille)
- [ ] Pas de memory leaks sur éditions multiples

---

## 📦 6. Livrables

### 6.1 Fichiers Frontend Modifiés

```
frontend/src/app/features/settings/pages/profile/
├── profile-page.component.ts        (refonte complète)
├── profile-page.component.html      (nouveau template)
├── profile-page.component.scss      (styles unifiés)
└── password-change-modal/
    ├── password-change-modal.component.ts
    ├── password-change-modal.component.html
    └── password-change-modal.component.scss
```

### 6.2 Fichiers Backend Modifiés

```
backend/
├── routes/auth.routes.js            (ajout route update-password)
├── controllers/auth.controller.js   (méthode updatePassword)
└── __tests__/auth-profile.test.js   (nouveaux tests)
```

### 6.3 Documentation

```
docs/
├── REFONTE_PAGE_PROFIL.md          (ce document)
└── API_AUTH_PROFILE.md             (documentation API mise à jour)
```

---

## ⚠️ 7. Points d'Attention & Pièges à Éviter

### 7.1 Sécurité

- ⚠️ **Email unique** : Vérifier l'unicité avant mise à jour
- ⚠️ **Validation stricte** : Ne jamais faire confiance aux données client
- ⚠️ **Mot de passe** : Utiliser uniquement Supabase Auth, jamais stocker en clair
- ⚠️ **Upload avatar** : Valider type/taille fichier côté backend

### 7.2 UX

- ⚠️ **Feedback immédiat** : Toujours indiquer l'état (loading, success, error)
- ⚠️ **Rollback** : En cas d'erreur, restaurer la valeur précédente
- ⚠️ **Validation** : Afficher les erreurs de manière claire et utile
- ⚠️ **Confirmation** : Demander confirmation pour actions critiques (email, password)

### 7.3 Technique

- ⚠️ **Race conditions** : Gérer les éditions simultanées de plusieurs champs
- ⚠️ **Cache** : Invalider le cache utilisateur après mise à jour
- ⚠️ **Observables** : Bien unsubscribe pour éviter memory leaks
- ⚠️ **FormData** : Utiliser pour upload fichier, JSON pour le reste

### 7.4 Erreurs Fréquentes à Éviter

1. ❌ Ne pas mettre à jour le `currentUser$` après modification
2. ❌ Oublier de gérer les erreurs de conflit (email déjà utilisé)
3. ❌ Ne pas valider côté backend (toujours valider les deux côtés)
4. ❌ Laisser des formulaires en état "editing" après erreur
5. ❌ Ne pas afficher de feedback visuel pendant le chargement

---

## 📊 8. Estimation Temporelle

| Phase | Tâche | Durée estimée |
|-------|-------|---------------|
| 1 | Backend - Endpoints & validation | 30 min |
| 2 | Frontend - Composant TypeScript | 45 min |
| 3 | Frontend - Template HTML | 30 min |
| 4 | Frontend - Styles SCSS | 30 min |
| 5 | Frontend - Modal mot de passe | 30 min |
| 6 | Service - Intégration AuthService | 20 min |
| 7 | Tests - Fonctionnels | 30 min |
| 8 | Responsive & Finitions | 30 min |
| **TOTAL** | | **~4h** |

---

## ✅ 9. Checklist de Validation Finale

### Backend
- [ ] Endpoint `PUT /api/auth/profile` accepte mises à jour partielles
- [ ] Endpoint `POST /api/auth/update-password` fonctionne avec Supabase
- [ ] Validation email stricte (format + unicité)
- [ ] Gestion erreurs de conflit (409)
- [ ] Upload avatar via Cloudinary opérationnel
- [ ] Cache utilisateur invalidé après modification

### Frontend
- [ ] Design unifié avec le reste du projet
- [ ] Édition inline fonctionnelle pour tous les champs
- [ ] Feedback visuel pour chaque action (loading, success, error)
- [ ] Validation en temps réel
- [ ] Modal changement mot de passe
- [ ] Upload avatar avec preview immédiat
- [ ] Responsive mobile optimisé
- [ ] Accessibilité complète (ARIA, keyboard)

### Tests
- [ ] Tous les scénarios fonctionnels testés
- [ ] Pas de régression sur l'authentification
- [ ] Performance acceptable (< 1s par action)
- [ ] Gestion erreurs réseau

### Documentation
- [ ] Ce document de plan complété
- [ ] Documentation API mise à jour
- [ ] Commentaires code ajoutés

---

## 🚀 10. Prochaines Étapes

1. **Validation du plan** avec l'utilisateur
2. **Implémentation Phase 1** : Backend
3. **Implémentation Phase 2** : Frontend
4. **Tests & Validation**
5. **Déploiement**

---

**Document créé le :** 4 février 2026  
**Dernière mise à jour :** 4 février 2026  
**Statut :** ✅ Plan complet prêt pour implémentation
