# Script de test de connexion Supabase
# Usage: .\test-db-connection.ps1

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Test de Connexion Supabase - Diagnostic             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Demander le mot de passe
Write-Host "📍 Entrez votre mot de passe Supabase:" -ForegroundColor Yellow
Write-Host "   (Le mot de passe ne sera pas affiché)" -ForegroundColor Gray
$securePassword = Read-Host "Mot de passe" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""

# Encoder le mot de passe pour l'URL
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($password)

Write-Host "🔍 Informations de connexion:" -ForegroundColor Cyan
Write-Host "   Mot de passe brut: $password" -ForegroundColor White
Write-Host "   Mot de passe encodé: $encodedPassword" -ForegroundColor White
Write-Host ""

# Construire les URLs
$sessionUrl = "postgresql://postgres.rnreaaeiccqkwgwxwxeg:$encodedPassword@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"
$transactionUrl = "postgresql://postgres.rnreaaeiccqkwgwxwxeg:$encodedPassword@aws-1-eu-west-3.pooler.supabase.com:6543/postgres"

Write-Host "📋 URLs générées:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Session mode (port 5432 - dev local):" -ForegroundColor Yellow
Write-Host $sessionUrl -ForegroundColor White
Write-Host ""
Write-Host "Transaction mode (port 6543 - production Vercel):" -ForegroundColor Yellow
Write-Host $transactionUrl -ForegroundColor White
Write-Host ""

# Test de connexion réseau
Write-Host "🔍 Test de connexion réseau au pooler Supabase..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Test port 5432 (Session mode):" -ForegroundColor Yellow
try {
    $result5432 = Test-NetConnection -ComputerName "aws-1-eu-west-3.pooler.supabase.com" -Port 5432 -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($result5432.TcpTestSucceeded) {
        Write-Host "   ✅ Port 5432 accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Port 5432 inaccessible" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test port 6543 (Transaction mode):" -ForegroundColor Yellow
try {
    $result6543 = Test-NetConnection -ComputerName "aws-1-eu-west-3.pooler.supabase.com" -Port 6543 -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($result6543.TcpTestSucceeded) {
        Write-Host "   ✅ Port 6543 accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Port 6543 inaccessible" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📝 PROCHAINES ÉTAPES" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Copier l'URL Transaction mode (port 6543) ci-dessus" -ForegroundColor White
Write-Host "2. Aller sur Vercel: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "3. Settings → Environment Variables → DATABASE_URL" -ForegroundColor White
Write-Host "4. Coller l'URL Transaction mode" -ForegroundColor White
Write-Host "5. Sauvegarder et Redéployer" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Utilisez l'URL avec le port 6543 pour Vercel!" -ForegroundColor Yellow
Write-Host ""

# Nettoyer le mot de passe de la mémoire
$password = $null
$encodedPassword = $null
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
