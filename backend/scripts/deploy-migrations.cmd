@echo off
REM Script de déploiement sécurisé des migrations Prisma (Windows)
REM Usage: scripts\deploy-migrations.cmd

echo.
echo 🔄 Déploiement sécurisé des migrations Prisma
echo ==============================================
echo.

REM Vérifier qu'on est dans le bon répertoire
if not exist "prisma\schema.prisma" (
    echo ❌ Erreur: Exécutez ce script depuis le dossier backend\
    exit /b 1
)

REM Vérifier que DATABASE_URL est définie
if "%DATABASE_URL%"=="" (
    echo ❌ Erreur: DATABASE_URL n'est pas définie
    echo    Définissez-la avec: set DATABASE_URL=votre_url
    exit /b 1
)

echo ✅ DATABASE_URL détectée
echo.

REM Afficher les migrations en attente
echo 📋 Migrations en attente:
call npx prisma migrate status
echo.

REM Demander confirmation
set /p confirmation="⚠️  Voulez-vous appliquer ces migrations sur la base de production? (oui/non): "

if not "%confirmation%"=="oui" (
    echo ❌ Opération annulée
    exit /b 0
)

echo.
echo 🚀 Application des migrations...
call npx prisma migrate deploy

if errorlevel 1 (
    echo.
    echo ❌ Erreur lors de l'application des migrations
    exit /b 1
)

echo.
echo ✅ Migrations appliquées avec succès!
echo.

REM Vérifier l'état final
echo 📊 État final des migrations:
call npx prisma migrate status
echo.

echo ✅ Déploiement terminé avec succès!
