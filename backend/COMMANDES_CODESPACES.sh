#!/bin/bash
# Script de setup propre pour Codespaces

echo "🧹 Nettoyage complet..."
cd /workspaces/Ultimate-frisbee-manager/backend
rm -rf node_modules package-lock.json
rm -rf ../node_modules ../package-lock.json

echo "📋 Configuration .env..."
cp .env.codespaces .env

echo "📦 Installation des dépendances (Prisma 5.22.0)..."
npm install

echo "🔍 Vérification version Prisma..."
npx prisma --version

echo "🗄️ Exécution migration Prisma..."
npx prisma migrate dev --name add_updated_at_fields || echo "⚠️ Migration déjà appliquée (normal)"

echo "✅ Génération client Prisma..."
npx prisma generate

echo "🚀 Démarrage serveur..."
npm run dev
