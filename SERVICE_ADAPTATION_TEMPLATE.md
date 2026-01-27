# 📝 TEMPLATE D'ADAPTATION DES SERVICES

Ce template montre le pattern à appliquer pour adapter les services de données restants.

## Pattern à Suivre

### 1. Imports à Ajouter
```typescript
import { DataCacheService } from './data-cache.service';
import { SyncService } from './sync.service';
import { CacheOptions } from '../models/cache.model';
```

### 2. Constructor à Modifier
```typescript
constructor(
  private http: HttpClient,
  private cache: DataCacheService,
  private sync: SyncService
) {}
```

### 3. Méthodes GET (Liste)
```typescript
getItems(options: CacheOptions = {}): Observable<Item[]> {
  return this.cache.get<Item[]>(
    'items-list',           // Clé cache
    'items',                // Store IndexedDB
    () => this.http.get<Item[]>(this.apiUrl).pipe(
      map(list => list.map(item => this.normalizeItem(item)))
    ),
    options
  );
}
```

### 4. Méthodes GET (Détail)
```typescript
getItemById(id: string, options: CacheOptions = {}): Observable<Item> {
  return this.cache.get<Item>(
    `item-${id}`,
    'items',
    () => this.http.get<Item>(`${this.apiUrl}/${id}`).pipe(
      map(item => this.normalizeItem(item))
    ),
    options
  );
}
```

### 5. Méthodes CREATE
```typescript
createItem(data: Partial<Item>): Observable<Item> {
  return this.http.post<Item>(this.apiUrl, data).pipe(
    tap((item) => {
      // Invalider cache
      this.cache.invalidate('items-list', 'items');
      
      // Notifier autres onglets
      this.sync.notifyChange({
        type: 'item',
        action: 'create',
        id: item.id,
        workspaceId: this.cache.getCurrentWorkspaceId() || '',
        timestamp: Date.now()
      });
      
      this.itemsUpdated.next();
    })
  );
}
```

### 6. Méthodes UPDATE
```typescript
updateItem(id: string, data: Partial<Item>): Observable<Item> {
  return this.http.put<Item>(`${this.apiUrl}/${id}`, data).pipe(
    tap(() => {
      // Invalider cache
      this.cache.invalidate('items-list', 'items');
      this.cache.invalidate(`item-${id}`, 'items');
      
      // Notifier autres onglets
      this.sync.notifyChange({
        type: 'item',
        action: 'update',
        id,
        workspaceId: this.cache.getCurrentWorkspaceId() || '',
        timestamp: Date.now()
      });
      
      this.itemsUpdated.next();
    })
  );
}
```

### 7. Méthodes DELETE
```typescript
deleteItem(id: string): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
    tap(() => {
      // Invalider cache
      this.cache.invalidate('items-list', 'items');
      this.cache.invalidate(`item-${id}`, 'items');
      
      // Notifier autres onglets
      this.sync.notifyChange({
        type: 'item',
        action: 'delete',
        id,
        workspaceId: this.cache.getCurrentWorkspaceId() || '',
        timestamp: Date.now()
      });
      
      this.itemsUpdated.next();
    })
  );
}
```

## Services à Adapter

### ✅ ExerciceService - FAIT
- Store: `exercices`
- Type sync: `exercice`
- Clés: `exercices-list`, `exercice-{id}`

### ⏳ EntrainementService
- Store: `entrainements`
- Type sync: `entrainement`
- Clés: `entrainements-list`, `entrainement-{id}`

### ⏳ TagService
- Store: `tags`
- Type sync: `tag`
- Clés: `tags-list`, `tag-{id}`
- Note: TTL plus long (1h) car changent rarement

### ⏳ EchauffementService
- Store: `echauffements`
- Type sync: `echauffement`
- Clés: `echauffements-list`, `echauffement-{id}`

### ⏳ SituationMatchService
- Store: `situations`
- Type sync: `situation`
- Clés: `situations-list`, `situation-{id}`

## Notes Importantes

1. **Toujours invalider le cache liste + détail** lors des modifications
2. **Toujours notifier via SyncService** pour cohérence multi-onglets
3. **Conserver les Subject existants** (itemsUpdated$) pour compatibilité
4. **Ajouter CacheOptions** en paramètre optionnel des GET
5. **Ne pas modifier** la logique métier existante
