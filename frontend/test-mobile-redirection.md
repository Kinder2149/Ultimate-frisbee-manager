# Test de la redirection mobile

## Étapes de test

### 1. Test sur desktop (largeur > 768px)
1. Ouvrir http://localhost:4200
2. Se connecter avec admin@ultimate.com / Ultim@t+
3. Sélectionner un workspace si nécessaire
4. **Attendu** : rester sur la page desktop (dashboard ou autre)

### 2. Test sur mobile (largeur < 768px)
1. Ouvrir les DevTools -> Responsive -> 390x844 (iPhone 12)
2. Aller sur http://localhost:4200
3. Se connecter
4. **Attendu** : redirection automatique vers /mobile

### 3. Test bouton "Version desktop"
1. Sur la page /mobile, cliquer sur l'avatar -> menu utilisateur
2. Cliquer sur "Version desktop"
3. **Attendu** : retour vers la page d'origine (ou /)

### 4. Test resize dynamique
1. Sur la page /mobile, agrandir la fenêtre > 768px
2. **Attendu** : snackbar proposant "Passer en desktop"

### 5. Test retour desktop -> mobile
1. Forcer desktop via le bouton
2. Réduire la fenêtre < 768px
3. Rafraîchir la page ou naviguer
4. **Attendu** : pas de nouvelle redirection (desktop forcé)

## Fichiers modifiés
- `frontend/src/app/core/services/mobile-detector.service.ts` (nouveau)
- `frontend/src/app/core/guards/mobile.guard.ts` (nouveau)
- `frontend/src/app/app.module.ts` (routing avec MobileGuard)
- `frontend/src/app/features/mobile/components/mobile-header/mobile-header.component.html` (bouton desktop)
- `frontend/src/app/features/mobile/components/mobile-header/mobile-header.component.ts` (méthode onDesktopViewClick)
- `frontend/src/app/features/mobile/pages/mobile-page/mobile-page.component.ts` (returnUrl + resize listener)

## Comportement attendu
- **< 768px** : redirection vers /mobile (sauf si desktop forcé)
- **> 768px** : accès normal aux pages desktop
- **Bouton "Version desktop"** : force desktop et redirige vers l'URL d'origine
- **Resize > 768px** : suggestion de passer en desktop via snackbar
