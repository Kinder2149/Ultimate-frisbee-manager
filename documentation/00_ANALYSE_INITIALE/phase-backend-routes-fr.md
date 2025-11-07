Entrées backend: server.js lance l’app Express (0.0.0.0:PORT) et app.js configure helmet, CORS (sans restriction) et express.json, puis charge toutes les routes. Les routes publiques: /api/health (check DB) et /api/auth/refresh (dépréciée). Toutes les autres routes métiers (/exercices, /tags, /entrainements, /echauffements, /situations-matchs, /dashboard, /import) sont protégées par authenticateToken, et /api/admin requiert en plus requireAdmin. Les uploads (exercices, entrainements, échauffements) utilisent multer en mémoire + upload vers Cloudinary, avec filtre d’extensions et limite 5MB.

Vulnérabilités/risques immédiats:
- SEC-CORS-OPEN: CORS sans origines restreintes (config.corsOrigins non utilisé). À corriger via cors({ origin: whitelist, credentials: true }).
- SEC-RATELIMIT-MISSING: pas de rate-limit global ni sur /api/auth; ajouter une politique (p.ex. 5 req/min) sur /auth et /admin/import.
- SEC-JWT-DEFAULT-SECRET: secrets JWT par défaut en clair dans config; refuser le démarrage si non définis en prod.
- OBS-NO-HTTP-LOGGING: pas de logging HTTP centralisé; ajouter morgan/pino-http.
- OBS-REFRESH-DEPRECATED: route /api/auth/refresh à déprécier/supprimer.

Commandes de test:
- curl -i http://localhost:3002/api/health
- curl -i -X GET http://localhost:3002/api/auth/profile (doit renvoyer 401 sans token)
- curl -i -X POST http://localhost:3002/api/auth/refresh
- curl -i -X GET http://localhost:3002/api/dashboard/stats
