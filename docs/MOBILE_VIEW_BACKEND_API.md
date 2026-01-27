# API Backend - Vue Mobile "Exploration & Accès Rapide"

## 📋 Vue d'ensemble

Ce document définit les **contrats API backend** requis pour la nouvelle vue mobile Netflix-like.

**Aucune supposition** sur l'implémentation backend. Seuls les endpoints, paramètres et formats de réponse sont spécifiés.

---

## 🔗 Endpoints requis

### 1. Configuration de la vue mobile

**Endpoint** : `GET /api/mobile/content-config`

**Description** : Retourne la configuration globale de la vue mobile pour l'utilisateur connecté.

**Authentification** : Requise

**Réponse** :
```typescript
{
  availableContentTypes: [
    {
      id: "exercices" | "entrainements" | "echauffements" | "situations",
      label: string,
      icon: string,
      categories: [
        {
          id: string,
          label: string,
          contentType: string,
          order: number
        }
      ]
    }
  ],
  currentWorkspace: {
    id: string,
    name: string
  },
  userPermissions: {
    exercices: {
      canRead: boolean,
      canCreate: boolean,
      canEdit: boolean
    },
    entrainements: { ... },
    echauffements: { ... },
    situations: { ... }
  }
}
```

**Exemple de réponse** :
```json
{
  "availableContentTypes": [
    {
      "id": "exercices",
      "label": "Exercices",
      "icon": "fitness_center",
      "categories": [
        {
          "id": "technique",
          "label": "Technique",
          "contentType": "exercices",
          "order": 1
        },
        {
          "id": "physique",
          "label": "Physique",
          "contentType": "exercices",
          "order": 2
        },
        {
          "id": "tactique",
          "label": "Tactique",
          "contentType": "exercices",
          "order": 3
        }
      ]
    },
    {
      "id": "entrainements",
      "label": "Entraînements",
      "icon": "sports",
      "categories": [
        {
          "id": "seance_complete",
          "label": "Séance complète",
          "contentType": "entrainements",
          "order": 1
        },
        {
          "id": "atelier",
          "label": "Atelier",
          "contentType": "entrainements",
          "order": 2
        }
      ]
    }
  ],
  "currentWorkspace": {
    "id": "ws_123",
    "name": "Mon Club"
  },
  "userPermissions": {
    "exercices": {
      "canRead": true,
      "canCreate": true,
      "canEdit": true
    },
    "entrainements": {
      "canRead": true,
      "canCreate": true,
      "canEdit": false
    }
  }
}
```

---

### 2. Filtres disponibles

**Endpoint** : `GET /api/mobile/filters`

**Description** : Retourne les filtres disponibles pour un type de contenu et une catégorie.

**Authentification** : Requise

**Paramètres query** :
- `contentType` (required) : `exercices | entrainements | echauffements | situations`
- `category` (optional) : ID de la catégorie

**Réponse** :
```typescript
{
  filters: [
    {
      id: string,
      label: string,
      type: "single" | "multiple" | "range",
      values: [
        {
          id: string,
          label: string,
          count?: number
        }
      ],
      compatibleCategories?: string[]
    }
  ]
}
```

**Exemple de réponse** :
```json
{
  "filters": [
    {
      "id": "niveau",
      "label": "Niveau",
      "type": "single",
      "values": [
        {
          "id": "debutant",
          "label": "Débutant",
          "count": 45
        },
        {
          "id": "intermediaire",
          "label": "Intermédiaire",
          "count": 78
        },
        {
          "id": "avance",
          "label": "Avancé",
          "count": 32
        }
      ]
    },
    {
      "id": "duree",
      "label": "Durée",
      "type": "multiple",
      "values": [
        {
          "id": "court",
          "label": "< 15 min",
          "count": 23
        },
        {
          "id": "moyen",
          "label": "15-30 min",
          "count": 56
        },
        {
          "id": "long",
          "label": "> 30 min",
          "count": 34
        }
      ]
    }
  ]
}
```

---

### 3. Sections de contenu dynamiques

**Endpoint** : `GET /api/mobile/content-sections`

**Description** : Retourne les sections de contenu organisées (Netflix-like).

**Authentification** : Requise

**Paramètres query** :
- `contentType` (required) : `exercices | entrainements | echauffements | situations`
- `category` (optional) : ID de la catégorie
- `filters` (optional) : JSON stringifié des filtres actifs
- `search` (optional) : Terme de recherche

**Réponse** :
```typescript
{
  sections: [
    {
      id: string,
      label: string,
      type: "carousel" | "grid" | "list",
      items: [
        {
          id: string,
          type: string,
          title: string,
          metadata: {
            duration?: string,
            imageUrl?: string,
            tags?: Tag[],
            isFavorite?: boolean,
            isRecent?: boolean,
            lastUsed?: string,
            createdAt?: string,
            description?: string
          },
          permissions: {
            canView: boolean,
            canEdit: boolean,
            canDelete: boolean
          }
        }
      ],
      order: number,
      totalCount: number
    }
  ]
}
```

**Exemple de réponse** :
```json
{
  "sections": [
    {
      "id": "recents",
      "label": "Récents",
      "type": "carousel",
      "items": [
        {
          "id": "ex_123",
          "type": "exercices",
          "title": "Passe en mouvement",
          "metadata": {
            "duration": "15 min",
            "imageUrl": "https://...",
            "tags": [
              {
                "id": "tag_1",
                "label": "Technique",
                "category": "objectif"
              }
            ],
            "isFavorite": true,
            "isRecent": true,
            "lastUsed": "2026-01-25T10:30:00Z",
            "description": "Exercice de passes dynamiques"
          },
          "permissions": {
            "canView": true,
            "canEdit": true,
            "canDelete": true
          }
        }
      ],
      "order": 1,
      "totalCount": 12
    },
    {
      "id": "plus_utilises",
      "label": "Les plus utilisés",
      "type": "carousel",
      "items": [...],
      "order": 2,
      "totalCount": 25
    },
    {
      "id": "technique",
      "label": "Technique",
      "type": "grid",
      "items": [...],
      "order": 3,
      "totalCount": 45
    }
  ]
}
```

---

### 4. Recherche contextuelle

**Endpoint** : `GET /api/mobile/search`

**Description** : Recherche dans un type de contenu spécifique.

**Authentification** : Requise

**Paramètres query** :
- `contentType` (required) : Type de contenu
- `q` (required) : Terme de recherche (min 2 caractères)

**Réponse** :
```typescript
{
  items: ContentItem[]
}
```

---

### 5. Toggle favori

**Endpoint** : `POST /api/mobile/favorites/toggle`

**Description** : Ajoute ou retire un item des favoris.

**Authentification** : Requise

**Body** :
```json
{
  "itemId": "ex_123",
  "contentType": "exercices"
}
```

**Réponse** :
```json
{
  "isFavorite": true
}
```

---

## 📊 Logique métier attendue (côté backend)

### Sections dynamiques

Le backend doit générer les sections selon cette logique :

1. **Section "Récents"** :
   - Items consultés dans les 7 derniers jours
   - Triés par `lastUsed` DESC
   - Type : `carousel`
   - Limité à 10 items

2. **Section "Les plus utilisés"** :
   - Items avec le plus de consultations (tous temps)
   - Type : `carousel`
   - Limité à 10 items

3. **Section "Favoris"** (si l'utilisateur a des favoris) :
   - Items marqués favoris par l'utilisateur
   - Type : `carousel`
   - Limité à 10 items

4. **Sections par catégorie** :
   - Une section par catégorie métier
   - Type : `grid` ou `list`
   - Limité à 6 items par section (avec "Voir tout")

### Filtres

- Les filtres doivent être **contextuels** (dépendent du `contentType` et de la `category`)
- Le `count` dans les valeurs de filtre doit refléter le nombre d'items correspondants **après application des autres filtres actifs**
- Les filtres incompatibles avec une catégorie ne doivent pas être retournés

### Permissions

- Les permissions doivent être calculées **par item** (pas globalement)
- Un utilisateur peut avoir le droit de lire mais pas d'éditer un item spécifique
- Les items sans permission `canView` ne doivent **jamais** être retournés

---

## 🔒 Sécurité

- Toutes les routes nécessitent une authentification JWT
- Les items doivent être filtrés selon le workspace actif de l'utilisateur
- Les permissions doivent être vérifiées à chaque requête
- Les catégories retournées doivent respecter la configuration du workspace

---

## 🎯 Données requises (modèles backend)

Pour implémenter ces endpoints, le backend doit stocker/calculer :

### Sur les items de contenu
- `lastUsed` : Date de dernière consultation
- `viewCount` : Nombre de consultations
- `isFavorite` : Booléen par utilisateur
- `createdAt` : Date de création
- `category` : Catégorie métier (technique, physique, etc.)

### Sur les utilisateurs
- Liste des favoris par type de contenu
- Historique de consultation (pour "Récents")

### Configuration workspace
- Catégories disponibles par type de contenu
- Permissions par rôle utilisateur

---

## ✅ Checklist d'implémentation backend

- [ ] Créer les 5 endpoints listés
- [ ] Implémenter la logique de sections dynamiques
- [ ] Calculer les compteurs de filtres
- [ ] Gérer les permissions granulaires par item
- [ ] Ajouter les champs `lastUsed`, `viewCount` aux modèles
- [ ] Créer la table/collection des favoris utilisateur
- [ ] Tester avec différents workspaces et rôles
- [ ] Valider les performances (pagination des sections)

---

**Date de création** : 27 janvier 2026  
**Version** : 1.0  
**Statut** : Spécification complète - Prêt pour implémentation backend
