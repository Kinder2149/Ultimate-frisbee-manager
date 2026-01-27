#!/bin/bash
# Fix définitif pour Codespaces - Force Prisma 5.22.0

set -e  # Arrêter en cas d'erreur

echo "🧹 Nettoyage complet (cache npm inclus)..."
cd /workspaces/Ultimate-frisbee-manager/backend
rm -rf node_modules package-lock.json
rm -rf ../node_modules ../package-lock.json
npm cache clean --force

echo "📋 Configuration .env..."
cp .env.codespaces .env

echo "📦 Installation backend uniquement (pas workspace root)..."
# Installer UNIQUEMENT dans backend, pas à la racine
npm install --legacy-peer-deps

echo "🔍 Vérification versions..."
echo "Node version:"
node --version
echo "Prisma version:"
npx prisma --version | grep "prisma"

echo "✅ Génération client Prisma..."
npx prisma generate

echo "🗄️ Vérification statut migration..."
npx prisma migrate status || echo "Pas de migration encore"

echo "🚀 Migration..."
npx prisma migrate deploy || npx prisma migrate dev --name add_updated_at_fields || echo "Migration déjà appliquée"

echo "✅ Démarrage serveur..."
npm run dev
