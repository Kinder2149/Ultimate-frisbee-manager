# 🔒 AUDIT PRODUCTION & SÉCURITÉ

**Date** : 26 janvier 2026  
**Statut** : ⏳ En cours d'analyse

---

## 🎯 OBJECTIF

Vérifier que l'application est **prête pour la production** :
- Configuration des environnements correcte
- Sécurité des données et des accès
- Variables sensibles protégées
- Monitoring et logs en place
- Performance optimisée

---

## 🌍 CONFIGURATION DES ENVIRONNEMENTS

### Backend (Vercel Serverless Functions)

#### Variables d'Environnement Requises

| Variable | Statut | Critique | Notes |
|----------|--------|----------|-------|
| `DATABASE_URL` | ✅ | 🔴 | Supabase PostgreSQL (port 6543 avec pooler) |
| `JWT_SECRET` | ✅ | 🔴 | Pour access tokens |
| `JWT_REFRESH_SECRET` | ⏳ | 🔴 | **À vérifier dans Vercel** |
| `CLOUDINARY_URL` | ⏳ | 🔴 | **À vérifier dans Vercel** |
| `CLOUDINARY_CLOUD_NAME` | ⏳ | 🟠 | Fallback si pas CLOUDINARY_URL |
| `CLOUDINARY_API_KEY` | ⏳ | 🟠 | Fallback si pas CLOUDINARY_URL |
| `CLOUDINARY_API_SECRET` | ⏳ | 🟠 | Fallback si pas CLOUDINARY_URL |
| `CORS_ORIGINS` | ⏳ | 🔴 | **À vérifier selon domaine Vercel** |
| `NODE_ENV` | ✅ | 🟠 | = "production" |
| `PORT` | ✅ | 🟡 | Défini par Vercel (3002 par défaut) |

#### Points de Vérification
- [ ] Toutes les variables définies dans le dashboard Vercel
- [ ] Secrets stockés de façon sécurisée (pas en clair)
- [ ] `JWT_REFRESH_SECRET` ajouté
- [ ] `CLOUDINARY_URL` ou trio CLOUDINARY_* configuré
- [ ] `CORS_ORIGINS` contient l'URL Vercel exacte
- [ ] Variables accessibles aux Serverless Functions

### Frontend (Vercel)

#### Variables d'Environnement Requises

| Variable | Statut | Critique | Notes |
|----------|--------|----------|-------|
| `API_URL` | ✅ | 🔴 | URL du backend Vercel Functions (hardcodé) |
| `SUPABASE_URL` | ✅ | 🔴 | Supabase project URL (hardcodé) |
| `SUPABASE_ANON_KEY` | ✅ | 🔴 | Supabase anon key (hardcodé, public) |

#### Configuration Actuelle
```typescript
// frontend/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://ultimate-frisbee-manager.vercel.app/api',
  supabaseUrl: 'https://rnreaaeiccqkwgwxwxeg.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Anon key (public)
};
```

**✅ CONFIGURATION CORRECTE** : Valeurs hardcodées appropriées (anon key Supabase est publique).

#### Points de Vérification
- [x] Variables hardcodées dans `environment.prod.ts` (approche valide)
- [x] URL du backend Vercel Functions correcte
- [x] Supabase Auth utilisé pour inscription/connexion
- [x] JWT custom backend pour protection API
- [x] Pas de secrets côté frontend (anon key Supabase est publique)

---

## 🔐 SÉCURITÉ

### Authentification JWT

#### Configuration

```javascript
// backend/config/index.js
JWT_SECRET: process.env.JWT_SECRET
JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
JWT_EXPIRES_IN: '7d'
JWT_REFRESH_EXPIRES_IN: '30d'
```

#### Points de Vérification
- [ ] Secrets suffisamment longs et aléatoires (min 32 caractères)
- [ ] Secrets différents pour access et refresh tokens
- [ ] Durée d'expiration appropriée (7j access, 30j refresh)
- [ ] Algorithme sécurisé (HS256 ou RS256)
- [ ] Tokens stockés côté client dans localStorage (ou httpOnly cookies ?)

#### Vulnérabilités Potentielles
- [ ] **XSS** : Tokens en localStorage vulnérables → Considérer httpOnly cookies
- [ ] **CSRF** : Si cookies utilisés, protection CSRF nécessaire
- [ ] **Token Replay** : Vérifier que les tokens expirés sont rejetés
- [ ] **Brute Force** : Rate limiting sur `/api/auth/login` (✅ implémenté)

### Mots de Passe

#### Hashing
```javascript
// bcryptjs utilisé
const hashedPassword = await bcrypt.hash(password, 10);
```

#### Points de Vérification
- [ ] Bcrypt avec salt rounds >= 10 (✅)
- [ ] Pas de mots de passe en clair en DB
- [ ] Validation de la force du mot de passe (longueur min, complexité)
- [ ] Pas de mot de passe dans les logs
- [ ] Changement de mot de passe fonctionnel

### CORS

#### Configuration
```javascript
// backend/server.js
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'],
  credentials: true
};
app.use(cors(corsOptions));
```

#### Points de Vérification
- [ ] `CORS_ORIGINS` contient uniquement les domaines autorisés
- [ ] Pas de wildcard `*` en production
- [ ] `credentials: true` nécessaire pour les cookies
- [ ] Préflight requests gérées (OPTIONS)

### Headers de Sécurité (Helmet)

```javascript
// backend/server.js
app.use(helmet());
```

#### Headers à Vérifier
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `Content-Security-Policy` (CSP)

### Rate Limiting

```javascript
// backend/middleware/rateLimiter.js
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 tentatives max
});
```

#### Points de Vérification
- [ ] Rate limiting sur `/api/auth/login` (✅)
- [ ] Rate limiting sur les autres endpoints sensibles ?
- [ ] Limite appropriée (pas trop stricte, pas trop laxiste)
- [ ] Message d'erreur clair pour l'utilisateur

### Validation des Données

#### Côté Backend
```javascript
// Zod utilisé pour la validation
const exerciceSchema = z.object({
  titre: z.string().min(1),
  description: z.string().optional(),
  // ...
});
```

#### Points de Vérification
- [ ] Validation de toutes les entrées utilisateur
- [ ] Sanitization des données (XSS, injection SQL)
- [ ] Validation des types (string, number, date, etc.)
- [ ] Validation des formats (email, URL, etc.)
- [ ] Limites de taille (fichiers, textes)

### Upload de Fichiers

#### Configuration Cloudinary
```javascript
// backend/services/cloudinary.js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

#### Points de Vérification
- [ ] Validation du type de fichier (images uniquement)
- [ ] Limite de taille (ex: 5 MB)
- [ ] Sanitization du nom de fichier
- [ ] Stockage sécurisé (Cloudinary, pas en local)
- [ ] URLs signées si contenu sensible
- [ ] Suppression des anciennes images lors du remplacement

---

## 🗄️ BASE DE DONNÉES

### PostgreSQL (Supabase)

#### Configuration
- **Provider** : Supabase PostgreSQL
- **Version** : PostgreSQL 15+
- **Connexion** : Via `DATABASE_URL` avec pooler (port 6543)
- **Project** : rnreaaeiccqkwgwxwxeg

#### Points de Vérification
- [x] Connexion SSL activée (par défaut Supabase)
- [x] Backups automatiques configurés (Supabase)
- [x] Accès restreint (RLS + credentials)
- [x] Credentials sécurisés (dans Vercel env)
- [ ] Connection pooling activé (port 6543 pour Vercel)

### Prisma

#### Migrations
```json
// backend/package.json
"scripts": {
  "db:deploy": "prisma migrate deploy"
}
```

#### Points de Vérification
- [ ] Migrations appliquées en production (`prisma migrate deploy`)
- [ ] Pas de `prisma migrate dev` en production
- [ ] Schéma Prisma à jour
- [ ] Seed exécuté si nécessaire
- [ ] Prisma Client généré (`prisma generate`)

#### Intégrité Référentielle
```prisma
// Relations avec onDelete
exercice Exercice? @relation(fields: [exerciceId], references: [id], onDelete: Cascade)
```

#### Points de Vérification
- [ ] `onDelete: Cascade` approprié pour les relations
- [ ] Contraintes d'unicité respectées (`@unique`)
- [ ] Index sur les champs fréquemment requêtés
- [ ] Pas de données orphelines

---

## 📊 MONITORING & LOGS

### Logs Backend

#### Configuration
```javascript
// pino-http utilisé
const logger = require('pino-http')();
app.use(logger);
```

#### Points de Vérification
- [ ] Logs structurés (JSON)
- [ ] Niveaux de log appropriés (info, warn, error)
- [ ] Pas de données sensibles dans les logs (mots de passe, tokens)
- [x] Logs accessibles (Vercel Dashboard → Logs)
- [x] Rotation automatique (géré par Vercel)

### Monitoring

#### Vercel
- [ ] Analytics activé
- [ ] Monitoring des Serverless Functions
- [ ] Logs de déploiement accessibles
- [ ] Métriques de performance (Core Web Vitals)
- [ ] Alertes configurées (erreurs, timeouts)
- [ ] Usage monitoring (invocations, bandwidth)

### Error Tracking

#### Points de Vérification
- [ ] Sentry ou équivalent configuré ?
- [ ] Erreurs frontend capturées
- [ ] Erreurs backend capturées
- [ ] Notifications en cas d'erreur critique
- [ ] Stack traces disponibles

---

## ⚡ PERFORMANCE

### Backend

#### Optimisations
- [ ] Compression des réponses (gzip)
- [ ] Cache des requêtes fréquentes
- [ ] Pagination des listes
- [ ] Index DB sur les champs recherchés
- [ ] Connection pooling Prisma

#### Points de Vérification
- [ ] Temps de réponse API < 500ms
- [ ] Pas de requêtes N+1 (Prisma includes)
- [ ] Limites de résultats (max 100 par page)
- [ ] Timeout approprié (30s max sur Vercel)

### Frontend

#### Optimisations
- [ ] Lazy loading des modules Angular
- [ ] Lazy loading des images
- [ ] Minification et uglification (build prod)
- [ ] Tree shaking (suppression du code inutilisé)
- [ ] Service Worker / PWA ?

#### Points de Vérification
- [ ] Bundle size < 500 KB (initial)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90

### Cloudinary

#### Optimisations
- [ ] Images redimensionnées automatiquement
- [ ] Format WebP si supporté
- [ ] Compression automatique
- [ ] CDN activé
- [ ] Lazy loading des images

---

## 🚀 DÉPLOIEMENT

### Process de Déploiement

#### Backend (Vercel Serverless Functions)
```json
// vercel.json
{
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 30,
        "memory": 1024
      }
    }
  ]
}
```

#### Points de Vérification
- [x] Build automatique sur push (CI/CD Vercel)
- [x] `prisma generate` exécuté au build (postinstall)
- [ ] `prisma migrate deploy` à exécuter manuellement si nécessaire
- [ ] Dépendance `@ufm/shared` résolue (build du package)
- [x] Zero-downtime deployment (Vercel)
- [x] Rollback instantané disponible

#### Frontend (Vercel)
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ]
}
```

#### Points de Vérification
- [ ] Build automatique sur push
- [ ] Build Angular en mode production
- [ ] Routing SPA configuré (fallback vers index.html)
- [ ] Variables d'environnement injectées au build
- [ ] Preview deployments pour les branches

### Rollback

#### Points de Vérification
- [x] Possibilité de rollback rapide (Vercel instant rollback)
- [ ] Migrations DB réversibles (Prisma)
- [x] Backups DB automatiques (Supabase)
- [ ] Plan de rollback documenté

---

## 🔍 CHECKLIST SÉCURITÉ COMPLÈTE

### Authentification & Autorisation
- [ ] JWT avec secrets forts
- [ ] Refresh tokens fonctionnels
- [ ] Rate limiting sur login
- [ ] Mots de passe hashés (bcrypt)
- [ ] Validation de la force des mots de passe
- [ ] Rôles utilisateurs (ADMIN, COACH)
- [ ] Permissions vérifiées côté backend

### Protection des Données
- [ ] HTTPS activé (Render + Vercel)
- [ ] CORS configuré correctement
- [ ] Headers de sécurité (Helmet)
- [ ] Validation des entrées (Zod)
- [ ] Sanitization des données
- [ ] Pas de données sensibles en logs

### Infrastructure
- [x] Variables d'environnement sécurisées (Vercel)
- [x] Secrets non versionnés (pas dans Git)
- [x] DB avec accès restreint (Supabase RLS)
- [x] Backups automatiques (Supabase)
- [x] SSL/TLS pour DB (Supabase par défaut)

### Fichiers & Upload
- [ ] Validation du type de fichier
- [ ] Limite de taille
- [ ] Stockage externe (Cloudinary)
- [ ] Pas d'exécution de fichiers uploadés

### Monitoring & Incident Response
- [ ] Logs structurés et accessibles
- [ ] Monitoring des erreurs
- [ ] Alertes configurées
- [ ] Plan de réponse aux incidents

---

## 🎯 ACTIONS PRIORITAIRES

### 🔴 BLOQUANT

1. **Vérifier les variables Vercel**
   - `JWT_REFRESH_SECRET` défini
   - `CLOUDINARY_URL` ou trio CLOUDINARY_* défini
   - `CORS_ORIGINS` = `https://ultimate-frisbee-manager.vercel.app`
   - `DATABASE_URL` avec port 6543 (pooler Supabase)

2. **Valider la configuration**
   - Frontend pointe vers `/api` (même domaine Vercel)
   - Supabase Auth fonctionnel
   - JWT custom backend opérationnel

3. **Vérifier le build production**
   - Package `@ufm/shared` compilé
   - Prisma generate exécuté
   - Migrations déployées

### 🟠 MAJEUR

4. **Renforcer la sécurité**
   - Valider la force des mots de passe
   - Vérifier les permissions par rôle
   - Tester le rate limiting

5. **Configurer le monitoring**
   - Logs accessibles et structurés
   - Alertes sur erreurs critiques
   - Métriques de performance

### 🟡 MINEUR

6. **Optimiser les performances**
   - Compression des réponses
   - Cache des requêtes
   - Lazy loading des images

7. **Améliorer le processus de déploiement**
   - CI/CD automatisé
   - Tests avant déploiement
   - Plan de rollback documenté

---

## 📋 TEMPLATE DE VÉRIFICATION PRODUCTION

```markdown
### Checklist Pré-Déploiement

**Date** : [DATE]
**Version** : [VERSION]
**Environnement** : Production

#### Configuration
- [ ] Variables d'environnement définies
- [ ] Secrets sécurisés
- [ ] CORS configuré
- [ ] SSL/TLS activé

#### Base de Données
- [ ] Migrations appliquées
- [ ] Seed exécuté (si nécessaire)
- [ ] Backups configurés
- [ ] Connexion SSL

#### Sécurité
- [ ] JWT secrets définis
- [ ] Rate limiting actif
- [ ] Headers de sécurité (Helmet)
- [ ] Validation des entrées

#### Performance
- [ ] Build optimisé
- [ ] Images compressées
- [ ] Lazy loading activé
- [ ] CDN configuré

#### Monitoring
- [ ] Logs accessibles
- [ ] Alertes configurées
- [ ] Error tracking actif

#### Tests
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Tests manuels effectués

#### Documentation
- [ ] README à jour
- [ ] Variables d'environnement documentées
- [ ] Plan de rollback défini

**Validé par** : [NOM]
**Prêt pour déploiement** : ✅ / ❌
```

---

**Statut** : ⏳ Analyse en cours  
**Prochaine étape** : Auditer le backend (API & base de données)
