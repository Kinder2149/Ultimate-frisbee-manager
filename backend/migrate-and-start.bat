@echo off
echo ========================================
echo MIGRATION PRISMA ET DEMARRAGE BACKEND
echo ========================================
echo.

echo [1/3] Migration Prisma...
call npx prisma migrate dev --name add_updated_at_fields
if %errorlevel% neq 0 (
    echo ERREUR: Migration echouee
    pause
    exit /b 1
)

echo.
echo [2/3] Generation client Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERREUR: Generation echouee
    pause
    exit /b 1
)

echo.
echo [3/3] Demarrage serveur...
call npm run dev
