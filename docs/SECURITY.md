# 🔒 DOCUMENTATION SÉCURITÉ - Ultimate Frisbee Manager

**Date de création** : 30 janvier 2026  
**Version** : 1.0  
**Statut** : Validé

---

## 📋 TABLE DES MATIÈRES

1. [Architecture d'authentification](#architecture-dauthentification)
2. [Pourquoi pas de protection CSRF](#pourquoi-pas-de-protection-csrf)
3. [Protections en place](#protections-en-place)
4. [Content Security Policy (CSP)](#content-security-policy-csp)
5. [Configuration CORS](#configuration-cors)
6. [Rate Limiting](#rate-limiting)
7. [Bonnes pratiques](#bonnes-pratiques)
8. [Menaces et mitigations](#menaces-et-mitigations)

---

## 🔐 ARCHITECTURE D'AUTHENTIFICATION

### Mode d'authentification

**Type** : JWT (JSON Web Tokens) stateless via Supabase

**Flux d'authentification** :
```
1. Utilisateur se connecte → Supabase génère JWT
2. Frontend stocke JWT dans localStorage
3. Frontend envoie JWT dans header Authorization: Bearer TOKEN
4. Backend vérifie JWT avec Supabase (RS256 via JWKS ou HS256)
5. Backend extrait userId et charge profil utilisateur
```

### Caractéristiques clés

- ✅ **Stateless** : Pas de session serveur, pas de cookies de session
- ✅ **JWT dans headers** : Token envoyé via `Authorization: Bearer TOKEN`
- ✅ **Vérification Supabase** : Tokens signés et vérifiés par Supabase
- ✅ **Expiration** : Tokens avec durée de vie limitée
- ✅ **Refresh automatique** : Frontend gère le refresh des tokens expirés

### Fichiers concernés

- **Backend** : `backend/middleware/auth.middleware.js`
- **Frontend** : `frontend/src/app/core/services/auth.service.ts`
- **Interceptor** : `frontend/src/app/core/interceptors/auth.interceptor.ts`

---

## ❌ POURQUOI PAS DE PROTECTION CSRF

### Définition CSRF (Cross-Site Request Forgery)

CSRF est une attaque où un site malveillant force le navigateur de la victime à exécuter une action non désirée sur un site où elle est authentifiée, en exploitant l'envoi **automatique** des cookies par le navigateur.

### Pourquoi CSRF ne s'applique PAS à notre architecture

#### 1. **Pas de cookies de session**

```javascript
// ❌ Architecture vulnérable à CSRF (cookies)
// Le navigateur envoie automatiquement les cookies
Cookie: session_id=abc123

// ✅ Notre architecture (JWT dans headers)
// Le header doit être ajouté EXPLICITEMENT par JavaScript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. **Same-Origin Policy protège les headers**

Un site malveillant `evil.com` **NE PEUT PAS** :
- Lire le token JWT stocké dans `localStorage` de `ultimate-frisbee.com`
- Ajouter un header `Authorization` dans une requête cross-origin vers notre API
- Forcer le navigateur à envoyer automatiquement le token

#### 3. **CORS bloque les requêtes non autorisées**

Notre configuration CORS (voir section dédiée) bloque toutes les requêtes provenant d'origines non autorisées.

### Exemple d'attaque CSRF (ne fonctionne PAS avec JWT)

```html
<!-- Site malveillant evil.com -->
<form action="https://api.ultimate-frisbee.com/api/exercices" method="POST">
  <input name="nom" value="Exercice malveillant">
</form>
<script>
  // Cette attaque NE FONCTIONNE PAS car :
  // 1. Pas de cookie envoyé automatiquement
  // 2. Pas de header Authorization (bloqué par Same-Origin Policy)
  // 3. CORS bloque la requête cross-origin
  document.forms[0].submit();
</script>
```

### Conclusion

**Protection CSRF non nécessaire** car :
- ✅ Architecture JWT stateless (pas de cookies)
- ✅ Tokens dans headers (pas d'envoi automatique)
- ✅ Same-Origin Policy protège les tokens
- ✅ CORS bloque les requêtes cross-origin

---

## 🛡️ PROTECTIONS EN PLACE

### 1. **Helmet.js - Sécurité HTTP headers**

**Fichier** : `backend/app.js`

```javascript
app.use(helmet({
  contentSecurityPolicy: { /* CSP personnalisée */ },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

**Headers ajoutés** :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=15552000`
- `Content-Security-Policy: ...` (voir section CSP)

### 2. **CORS (Cross-Origin Resource Sharing)**

**Configuration stricte** : Seules les origines autorisées peuvent accéder à l'API

**Origines autorisées** :
- `localhost` (développement)
- Domaines Vercel production
- Domaines Vercel preview
- Origines définies dans `CORS_ORIGINS` (env)

### 3. **Rate Limiting**

**Fichier** : `backend/middleware/rateLimit.middleware.js`

**Limites actuelles** :
- **Méthodes d'écriture** (POST, PUT, PATCH, DELETE) : 100 requêtes / 15 minutes
- **Méthodes de lecture** (GET) : À implémenter (Mission 6.4)

### 4. **Validation des données**

**Middleware Zod** : Validation stricte des données entrantes

**Fichiers** : `backend/middleware/validation/*.js`

### 5. **Isolation Workspace**

**Sécurité multi-tenant** : Chaque requête est scopée au workspace de l'utilisateur

**Middleware** : `backend/middleware/workspace.middleware.js`

---

## 🔒 CONTENT SECURITY POLICY (CSP)

### Configuration actuelle

**Fichier** : `backend/app.js`

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"], // Angular Material
    imgSrc: ["'self'", "data:", "https:", "blob:"], // Cloudinary
    connectSrc: ["'self'", "https://supabase.co", "https://*.supabase.co"],
    fontSrc: ["'self'", "data:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
}
```

### Explication des directives

| Directive | Valeur | Justification |
|-----------|--------|---------------|
| `defaultSrc` | `'self'` | Par défaut, seules les ressources du même domaine |
| `scriptSrc` | `'self'` | Scripts uniquement depuis notre domaine |
| `styleSrc` | `'self'`, `'unsafe-inline'` | Styles inline nécessaires pour Angular Material |
| `imgSrc` | `'self'`, `data:`, `https:`, `blob:` | Images Cloudinary + data URLs + blobs |
| `connectSrc` | `'self'`, Supabase | Connexions API vers notre backend et Supabase |
| `fontSrc` | `'self'`, `data:` | Fonts locales + data URLs |
| `objectSrc` | `'none'` | Pas de plugins (Flash, etc.) |
| `frameSrc` | `'none'` | Pas d'iframes |
| `upgradeInsecureRequests` | `[]` | Force HTTPS en production |

### Protection contre XSS

CSP protège contre les attaques XSS (Cross-Site Scripting) en :
- Bloquant l'exécution de scripts inline non autorisés
- Bloquant le chargement de scripts depuis des domaines non autorisés
- Empêchant l'injection de code malveillant

---

## 🌐 CONFIGURATION CORS

### Origines autorisées

**Fichier** : `backend/app.js`

**Logique de validation** :
```javascript
function isAllowedOrigin(origin) {
  if (!origin) return true; // Server-to-server
  if (allowedExactOrigins.includes(origin)) return true; // ENV
  if (isLocalhost(origin)) return true; // Dev local
  if (isVercelProd(origin)) return true; // Prod Vercel
  if (isVercelPreview(origin)) return true; // Preview Vercel
  return false; // Rejeté
}
```

### Domaines autorisés

1. **Développement local** :
   - `http://localhost:4200`
   - `http://127.0.0.1:4200`

2. **Production Vercel** :
   - `https://ultimate-frisbee-manager-kinder.vercel.app`
   - `https://ultimate-frisbee-manager.vercel.app`

3. **Preview Vercel** :
   - `https://*-kinder2149s-projects.vercel.app`

4. **Personnalisés** :
   - Définis dans `CORS_ORIGINS` (variable d'environnement)

### Configuration

```javascript
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.warn('[CORS] Origin rejetée:', origin);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true // Permet envoi de credentials
}));
```

---

## ⏱️ RATE LIMITING

### Limites actuelles

**Fichier** : `backend/middleware/rateLimit.middleware.js`

#### Méthodes d'écriture (POST, PUT, PATCH, DELETE)

```javascript
writeMethodsRateLimit: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
  message: 'Trop de requêtes d\'écriture, réessayez plus tard'
}
```

#### Méthodes de lecture (GET)

**Statut** : ✅ Implémenté (30 janvier 2026)

```javascript
readMethodsRateLimit: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes max
  message: 'Trop de requêtes de lecture, réessayez dans quelques minutes',
  skip: (req) => {
    // Exclure les health checks
    return req.path === '/api/health' || req.path === '/api/health/db';
  }
}
```

**Exclusions** :
- `/api/health` - Health check principal
- `/api/health/db` - Health check base de données

**Justification de la limite** :
- 1000 req/15min = 66.6 req/minute = 4000 req/heure
- Usage normal intensif : ~200 req/heure
- Marge de sécurité : 20x l'usage normal
- Protège contre scraping et abus sans impacter utilisateurs légitimes

### Protection contre

- ✅ Attaques par force brute
- ✅ Déni de service (DoS)
- ✅ Abus de l'API

---

## ✅ BONNES PRATIQUES

### Stockage des tokens

**Frontend** :
```typescript
// ✅ BON : localStorage pour JWT (stateless)
localStorage.setItem('supabase.auth.token', token);

// ❌ MAUVAIS : Cookies pour JWT (vulnérable CSRF si httpOnly=false)
document.cookie = `token=${token}`;
```

### Envoi des tokens

**Frontend** :
```typescript
// ✅ BON : Header Authorization
headers: {
  'Authorization': `Bearer ${token}`
}

// ❌ MAUVAIS : Query parameter (visible dans logs)
url: `/api/exercices?token=${token}`
```

### Validation côté backend

**Backend** :
```javascript
// ✅ BON : Vérifier le token à chaque requête
const token = req.headers['authorization']?.split(' ')[1];
const decoded = await verifyToken(token);

// ✅ BON : Vérifier le workspace
if (resource.workspaceId !== req.workspaceId) {
  throw new Error('Accès refusé');
}
```

### Gestion des erreurs

```javascript
// ✅ BON : Messages d'erreur génériques
res.status(401).json({ error: 'Non autorisé' });

// ❌ MAUVAIS : Messages détaillés (information disclosure)
res.status(401).json({ error: 'Token JWT expiré depuis 2 heures' });
```

---

## 🎯 MENACES ET MITIGATIONS

### Tableau récapitulatif

| Menace | Risque | Protection actuelle | Statut |
|--------|--------|---------------------|--------|
| **CSRF** | ❌ Faible | JWT dans headers (pas de cookies) | ✅ Protégé |
| **XSS** | ⚠️ Moyen | CSP, sanitization | ✅ Protégé |
| **Token theft** | ⚠️ Moyen | HTTPS, expiration tokens | ✅ Partiellement |
| **Replay attacks** | ❌ Faible | Expiration tokens | ✅ Protégé |
| **CORS attacks** | ❌ Faible | CORS strict | ✅ Protégé |
| **Brute force** | ⚠️ Moyen | Rate limiting | ✅ Protégé |
| **SQL Injection** | ❌ Faible | Prisma ORM (parameterized queries) | ✅ Protégé |
| **DoS** | ⚠️ Moyen | Rate limiting | ✅ Partiellement |
| **Man-in-the-Middle** | ❌ Faible | HTTPS obligatoire | ✅ Protégé |

### Détails des mitigations

#### 1. **XSS (Cross-Site Scripting)**

**Protection** :
- ✅ CSP bloque scripts non autorisés
- ✅ Angular sanitize automatiquement les templates
- ✅ Validation Zod côté backend

**Recommandations** :
- Toujours utiliser `[innerHTML]` avec `DomSanitizer` si nécessaire
- Ne jamais injecter de HTML non sanitisé

#### 2. **Token theft**

**Protection** :
- ✅ HTTPS obligatoire (pas de transmission en clair)
- ✅ Tokens avec expiration courte
- ✅ Refresh automatique des tokens

**Recommandations** :
- Utiliser des tokens courte durée (< 1h)
- Implémenter rotation des refresh tokens
- Détecter connexions suspectes (IP, user-agent)

#### 3. **DoS (Denial of Service)**

**Protection** :
- ✅ Rate limiting sur écritures (100 req/15min)
- ⏳ Rate limiting sur lectures (à implémenter)

**Recommandations** :
- Implémenter rate limiting GET (Mission 6.4)
- Monitorer les pics de trafic
- Utiliser un CDN (Cloudflare, Vercel)

---

## 🔄 MISES À JOUR

### Historique

| Date | Version | Changements |
|------|---------|-------------|
| 30/01/2026 | 1.0 | Création initiale - Documentation architecture sécurité |
| 30/01/2026 | 1.1 | Ajout rate limiting GET (1000 req/15min) |

### Prochaines améliorations

**Mission 6.5** : Documentation API (Swagger)
- Documenter tous les endpoints
- Exemples de requêtes/réponses
- Codes d'erreur

---

## 📞 CONTACT SÉCURITÉ

Pour signaler une vulnérabilité de sécurité :
- **Email** : security@ultimate-frisbee-manager.com
- **Délai de réponse** : 48h maximum

**Politique de divulgation responsable** :
1. Signaler la vulnérabilité en privé
2. Attendre notre réponse (48h max)
3. Ne pas divulguer publiquement avant correction
4. Reconnaissance publique après correction (si souhaité)

---

## 📚 RESSOURCES

### Documentation externe

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

### Documentation interne

- `docs/AUDIT_GLOBAL_COMPLET.md` - Audit complet du projet
- `backend/middleware/auth.middleware.js` - Middleware d'authentification
- `backend/app.js` - Configuration sécurité (helmet, CORS)

---

**Dernière mise à jour** : 30 janvier 2026  
**Auteur** : Équipe de développement Ultimate Frisbee Manager
