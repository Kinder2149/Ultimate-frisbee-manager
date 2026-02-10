# CHANGELOG — Documentation

## 2026-02-10
- **Vue mobile** : Finalisation production (Phase 1 + Phase 2)
  - Routing children implémenté (`/mobile` layout + `''` home + `detail/:type/:id`)
  - Services mobile créés : `MobileDataService`, `MobileStateService`, `MobileFiltersService`
  - Composants mobile dédiés : `MobileFeedCardComponent`, `MobileConfirmDialogComponent`, `MobileTerrainToggleComponent`
  - Recherche inline fonctionnelle avec debounce
  - Variables CSS centralisées (`mobile-variables.scss`)
  - Tests unitaires minimaux des services critiques (14 tests)
  - Documentation architecture mobile (`docs/reference/ARCHITECTURE_MOBILE.md`)
  - Correction titre header : "UFM" → "Ultimate Frisbee Manager"
  - Suppression code mort : `MobileAppBarComponent`

## 2026-02-09
- Création de l’arborescence documentaire: `reference/`, `work/`, `history/`, `_meta/`
- Déplacement des documents contractuels depuis `BASE/` vers `reference/`
- Archivage des documents obsolètes depuis la racine `docs/` vers `history/2026/02-fevrier/`
- Déplacement de l’ancienne archive `docs/archive/` vers `history/2026/01-janvier/`
- Ajout de `docs/_meta/INDEX.md` et des règles de contribution
