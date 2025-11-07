# ARCHITECTURE

Ce document détaille l’architecture technique.

## Vue d’ensemble
- Frontend: Angular 17 (Material), lazy loading, Cypress E2E.
- Backend: Node.js + Express, Prisma ORM, Cloudinary uploads.
- Base de données: SQLite (dev) / PostgreSQL (prod sur Render/Supabase DB).

## Rôles
- Frontend (Vercel): UI/UX, appels API vers backend.
- Backend (Render): API REST, auth JWT, accès BD, CORS strict.
- DB (Managed): PostgreSQL managé (Render DB / Supabase DB), migrations Prisma.

## Principes
- Découplage fort front/back.
- Aucune connexion directe du front à la BD.
- Secrets uniquement via variables d’environnement.

## Modules clés (backend)
- Middleware d’auth (`authenticateToken`) + provisioning user.
- Upload Cloudinary (middleware `upload.middleware`).
- CORS whitelist via `CORS_ORIGINS`.
- Logging HTTP (pino-http) avec redaction.

## Données (Prisma)
- Modèles: Exercice, Tag, Entrainement, Echauffement, BlocEchauffement, SituationMatch, User, EntrainementExercice.
- Indexes ajoutés sur FKs et `createdAt` (voir schéma).

## Sécurité
- Pas de secrets committés.
- Démarrage prod interdit si secrets JWT manquants.
- CORS strict.

## Références
- DEPLOYMENT-DETAILS.md pour CI/CD et envs.
- documentation/00_ANALYSE_INITIALE pour les audits par phase.
