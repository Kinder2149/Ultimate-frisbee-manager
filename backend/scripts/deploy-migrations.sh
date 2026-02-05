#!/bin/bash

# Script de déploiement sécurisé des migrations Prisma
# Usage: ./scripts/deploy-migrations.sh

set -e  # Arrêter en cas d'erreur

echo "🔄 Déploiement sécurisé des migrations Prisma"
echo "=============================================="
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Erreur: Exécutez ce script depuis le dossier backend/"
    exit 1
fi

# Vérifier que DATABASE_URL est définie
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL n'est pas définie"
    echo "   Définissez-la avec: export DATABASE_URL='votre_url'"
    exit 1
fi

echo "✅ DATABASE_URL détectée"
echo ""

# Afficher les migrations en attente
echo "📋 Migrations en attente:"
npx prisma migrate status
echo ""

# Demander confirmation
read -p "⚠️  Voulez-vous appliquer ces migrations sur la base de production? (oui/non): " confirmation

if [ "$confirmation" != "oui" ]; then
    echo "❌ Opération annulée"
    exit 0
fi

echo ""
echo "🚀 Application des migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Migrations appliquées avec succès!"
echo ""

# Vérifier l'état final
echo "📊 État final des migrations:"
npx prisma migrate status
echo ""

echo "✅ Déploiement terminé avec succès!"
