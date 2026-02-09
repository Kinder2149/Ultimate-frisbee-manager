# 🔍 DIAGNOSTIC : Problème de Cache et Chargement

**Date** : 29 Janvier 2026  
**Problème rapporté** : Les données ne sont pas chargées en avance, chaque navigation recharge tout

---

## 🐛 PROBLÈME IDENTIFIÉ

### Symptômes
1. ✅ Connexion → Tableau de bord : Chargement long
2. ✅ Tableau de bord → Exercices : Rechargement complet
3. ✅ Exercices → Tableau de bord : Rechargement complet
4. ❌ Le cache n'est pas utilisé efficacement

### Cause Racine

**Le préchargement n'est déclenché QUE lors du changement de workspace**, pas après la connexion initiale !

#### Flux Actuel (Problématique)
```
1. Connexion → Auth OK
2. Redirection vers /dashboard
3. WorkspaceSelectedGuard vérifie le workspace
4. ❌ AUCUN préchargement déclenché
5. Dashboard charge ses données → API call
6. Navigation vers /exercices
7. ❌ AUCUN cache disponible → API call
8. Navigation vers /dashboard
9. ❌ Cache expiré ou non utilisé → API call
```

#### Flux Attendu (Solution)
```
1. Connexion → Auth OK
2. WorkspaceSelectedGuard vérifie le workspace
3. ✅ PRÉCHARGEMENT AUTOMATIQUE de TOUTES les données
4. Redirection vers /dashboard
5. ✅ Données en cache → Affichage instantané
6. Navigation vers /exercices
7. ✅ Données en cache → Affichage instantané
8. Navigation vers /dashboard
9. ✅ Données en cache → Affichage instantané
```

---

## 📊 ANALYSE DU CODE ACTUEL

### 1. SelectWorkspaceComponent ✅
**Fichier** : `select-workspace.component.ts`

**Bon** : Le préchargement fonctionne lors de la sélection manuelle
```typescript
async selectWorkspace(ws: WorkspaceSummary): Promise<void> {
  const completeness = await this.preloader.getCacheCompleteness(ws.id);
  
  if (completeness > 80) {
    // Navigation immédiate + refresh en arrière-plan
    await this.workspaceService.setCurrentWorkspace(ws);
    this.router.navigateByUrl(target);
    this.preloader.smartPreload(ws.id).subscribe(); // ✅
  } else {
    // Dialog de préchargement
    const dialogRef = this.dialog.open(PreloadDialogComponent, ...); // ✅
  }
}
```

### 2. WorkspaceSelectedGuard ❌
**Fichier** : `workspace-selected.guard.ts`

**Problème** : Vérifie uniquement la validité du workspace, ne déclenche PAS de préchargement
```typescript
// ❌ Manque le préchargement automatique
return this.cache.get<WorkspaceSummary[]>(
  'workspaces-list',
  'workspaces',
  () => this.http.get<WorkspaceSummary[]>(`${environment.apiUrl}/workspaces/me`),
  { ttl: 60 * 60 * 1000 }
).pipe(
  map(workspaces => {
    const isValid = workspaces.some(w => w.id === workspaceId);
    if (!isValid) {
      this.workspaceService.clear();
      this.router.navigate(['/select-workspace'], ...);
      return false;
    }
    // ❌ Pas de préchargement ici !
    return true;
  })
);
```

### 3. AppComponent ❌
**Fichier** : `app.component.ts`

**Problème** : N'injecte pas `WorkspacePreloaderService`, ne déclenche rien
```typescript
constructor(
  private authService: AuthService,
  private workspaceService: WorkspaceService,
  // ❌ Manque WorkspacePreloaderService
) {}

ngOnInit(): void {
  // ❌ Aucun préchargement déclenché après connexion
}
```

### 4. DashboardComponent ❌
**Fichier** : `dashboard.component.ts`

**Problème** : Charge les stats à chaque fois, n'utilise pas le préchargement
```typescript
// ❌ Chaque composant charge ses propres données
// Pas de vérification du cache global
```

---

## 🎯 SOLUTION À IMPLÉMENTER

### Stratégie : Préchargement Global Automatique

#### 1. Créer un Service de Préchargement Global
**Nouveau fichier** : `global-preloader.service.ts`

**Responsabilités** :
- Détecter quand l'utilisateur est connecté ET a un workspace valide
- Déclencher automatiquement le préchargement complet
- Gérer un flag "preloadCompleted" pour éviter les doublons
- Émettre un événement quand le préchargement est terminé

#### 2. Intégrer dans AppComponent
**Modification** : `app.component.ts`

**Actions** :
- Injecter `GlobalPreloaderService`
- S'abonner à `authService.isAuthenticated$` + `workspaceService.currentWorkspace$`
- Déclencher le préchargement automatiquement
- Afficher un indicateur de progression (optionnel)

#### 3. Améliorer WorkspaceSelectedGuard
**Modification** : `workspace-selected.guard.ts`

**Actions** :
- Injecter `WorkspacePreloaderService`
- Après validation du workspace, vérifier le cache
- Si cache < 80%, déclencher préchargement silencieux
- Laisser passer la navigation (ne pas bloquer)

#### 4. Optimiser les Composants
**Modifications** : `dashboard.component.ts`, `exercice-list.component.ts`, etc.

**Actions** :
- Vérifier le cache AVANT de charger
- Utiliser `skipCache: false` par défaut
- Afficher un loader uniquement si pas de cache

---

## 📋 PLAN D'IMPLÉMENTATION

### Phase 1 : Service Global de Préchargement ✅
1. Créer `GlobalPreloaderService`
2. Implémenter la logique de détection (auth + workspace)
3. Implémenter le préchargement automatique
4. Gérer les flags et événements

### Phase 2 : Intégration AppComponent ✅
1. Injecter le service dans `AppComponent`
2. S'abonner aux observables nécessaires
3. Déclencher le préchargement au bon moment
4. Gérer les erreurs gracieusement

### Phase 3 : Amélioration Guard ✅
1. Modifier `WorkspaceSelectedGuard`
2. Ajouter la vérification de cache
3. Déclencher préchargement si nécessaire
4. Ne pas bloquer la navigation

### Phase 4 : Tests et Validation ✅
1. Tester le flux complet : Connexion → Dashboard → Exercices → Dashboard
2. Vérifier les logs de cache (hits/misses)
3. Mesurer les performances (temps de chargement)
4. Valider l'expérience utilisateur

---

## 🎯 RÉSULTAT ATTENDU

### Avant (Actuel)
```
Connexion → Dashboard (3-5s) → Exercices (2-3s) → Dashboard (2-3s)
Total : 7-11 secondes de chargement
```

### Après (Cible)
```
Connexion → Préchargement (5-8s en arrière-plan)
Dashboard (< 500ms) → Exercices (< 500ms) → Dashboard (< 500ms)
Total : 1-2 secondes perçues par l'utilisateur
```

### Expérience Utilisateur
1. ✅ Connexion → Préchargement automatique avec indicateur
2. ✅ Navigation fluide entre toutes les pages
3. ✅ Pas de rechargement visible
4. ✅ Données toujours fraîches (SWR en arrière-plan)
5. ✅ Fonctionne hors ligne (mode dégradé)

---

## 🔧 DÉTAILS TECHNIQUES

### Données à Précharger
1. ✅ **Tags** (toutes catégories)
2. ✅ **Exercices** (liste complète)
3. ✅ **Entraînements** (liste complète)
4. ✅ **Échauffements** (liste complète)
5. ✅ **Situations/Matchs** (liste complète)
6. ✅ **Dashboard Stats** (statistiques)

### Ordre de Préchargement
1. **Tags** (priorité haute - utilisés partout)
2. **Exercices** (priorité haute - page principale)
3. **Entraînements** (priorité moyenne)
4. **Échauffements** (priorité moyenne)
5. **Situations** (priorité moyenne)
6. **Stats** (priorité basse - peut être calculé)

### Cache Strategy
- **TTL** : 5 minutes pour données métier, 30 minutes pour tags
- **SWR** : Activé par défaut (affichage instantané + refresh silencieux)
- **Multi-workspace** : Cache conservé entre workspaces
- **Invalidation** : Automatique après CUD operations

---

## 📝 NOTES IMPORTANTES

### Points d'Attention
1. ⚠️ Ne pas bloquer la navigation pendant le préchargement
2. ⚠️ Gérer les erreurs réseau gracieusement
3. ⚠️ Éviter les doublons de préchargement
4. ⚠️ Respecter la bande passante (pas de préchargement excessif)

### Compatibilité
- ✅ Fonctionne avec IndexedDB (navigateurs modernes)
- ✅ Fallback vers API si IndexedDB indisponible
- ✅ Compatible avec le mode hors ligne
- ✅ Compatible avec la synchronisation multi-onglets

---

**Prochaine étape** : Implémenter le `GlobalPreloaderService`
