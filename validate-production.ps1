# Script de validation rapide pour la production Vercel
# Usage: .\validate-production.ps1 https://votre-projet.vercel.app

param(
    [Parameter(Mandatory=$false)]
    [string]$VercelUrl = ""
)

$ErrorActionPreference = "Continue"

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Validation Production - Ultimate Frisbee Manager    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Demander l'URL si non fournie
if ([string]::IsNullOrWhiteSpace($VercelUrl)) {
    Write-Host "📍 Entrez l'URL de votre déploiement Vercel:" -ForegroundColor Yellow
    Write-Host "   Exemple: https://ultimate-frisbee-manager.vercel.app" -ForegroundColor Gray
    $VercelUrl = Read-Host "URL"
}

# Normaliser l'URL
$url = if ($VercelUrl.StartsWith("http")) { $VercelUrl } else { "https://$VercelUrl" }
$url = $url.TrimEnd('/')

Write-Host "`n🔍 Test de l'application: $url" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$allTestsPassed = $true

# Test 1: Frontend accessible
Write-Host "1️⃣  Test: Frontend accessible..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend accessible (200 OK)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Frontend retourne: $($response.StatusCode)" -ForegroundColor Yellow
        $allTestsPassed = $false
    }
}
catch {
    Write-Host "   ❌ Frontend inaccessible: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 2: API Health Check
Write-Host "`n2️⃣  Test: API Health Check..." -ForegroundColor Blue
$healthUrl = "$url/api/health"
try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10 -ErrorAction Stop
    
    if ($response.status -eq "ok") {
        Write-Host "   ✅ API Health: OK" -ForegroundColor Green
        
        if ($response.db -eq $true) {
            Write-Host "   ✅ Database: Connectée" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Database: Déconnectée" -ForegroundColor Red
            Write-Host "   → Vérifier DATABASE_URL (doit utiliser port 6543)" -ForegroundColor Yellow
            $allTestsPassed = $false
        }
        
        Write-Host "   ℹ️  Environnement: $($response.env)" -ForegroundColor Cyan
        Write-Host "   ℹ️  Uptime: $([math]::Round($response.uptime, 2))s" -ForegroundColor Cyan
        
        if ($response.coldStart) {
            Write-Host "   ⚡ Cold start détecté (normal pour le premier appel)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Health check échoué: status = $($response.status)" -ForegroundColor Red
        $allTestsPassed = $false
    }
}
catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   → Status HTTP: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 503) {
            Write-Host "   → 503 = Service Unavailable (DB probablement inaccessible)" -ForegroundColor Yellow
        }
    }
    $allTestsPassed = $false
}

# Test 3: API Root
Write-Host "`n3️⃣  Test: API Root..." -ForegroundColor Blue
$apiUrl = "$url/api"
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get -TimeoutSec 10 -ErrorAction Stop
    
    if ($response.message) {
        Write-Host "   ✅ API Root accessible" -ForegroundColor Green
        Write-Host "   ℹ️  Version: $($response.version)" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Réponse inattendue" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 4: Test de connexion au pooler Supabase
Write-Host "`n4️⃣  Test: Connexion Supabase Pooler..." -ForegroundColor Blue
try {
    $result = Test-NetConnection -ComputerName "aws-1-eu-west-3.pooler.supabase.com" -Port 6543 -WarningAction SilentlyContinue -InformationLevel Quiet
    
    if ($result.TcpTestSucceeded) {
        Write-Host "   ✅ Pooler Supabase accessible (port 6543)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Pooler Supabase inaccessible (port 6543)" -ForegroundColor Red
        Write-Host "   → Vérifier votre connexion internet" -ForegroundColor Yellow
        $allTestsPassed = $false
    }
}
catch {
    Write-Host "   ⚠️  Test de connexion échoué: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Résumé
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($allTestsPassed) {
    Write-Host "`n🎉 SUCCÈS! Votre application est prête pour la production!" -ForegroundColor Green
    Write-Host "`n✅ Tous les tests sont passés:" -ForegroundColor Green
    Write-Host "   • Frontend accessible" -ForegroundColor Green
    Write-Host "   • API fonctionnelle" -ForegroundColor Green
    Write-Host "   • Base de données connectée" -ForegroundColor Green
    Write-Host "`n🚀 Votre application est disponible sur:" -ForegroundColor Cyan
    Write-Host "   $url" -ForegroundColor White
} else {
    Write-Host "`n⚠️  ATTENTION: Des problèmes ont été détectés" -ForegroundColor Yellow
    Write-Host "`n📋 Actions recommandées:" -ForegroundColor Yellow
    Write-Host "   1. Vérifier DATABASE_URL sur Vercel (port 6543)" -ForegroundColor White
    Write-Host "   2. Vérifier JWT_SECRET et JWT_REFRESH_SECRET" -ForegroundColor White
    Write-Host "   3. Vérifier CLOUDINARY_URL" -ForegroundColor White
    Write-Host "   4. Vérifier CORS_ORIGINS" -ForegroundColor White
    Write-Host "   5. Redéployer après corrections" -ForegroundColor White
    Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
    Write-Host "   • ACTIONS_IMMEDIATES_PRODUCTION.md" -ForegroundColor White
    Write-Host "   • VERCEL_PRODUCTION_CHECKLIST.md" -ForegroundColor White
}

Write-Host "`n═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Code de sortie
if ($allTestsPassed) {
    exit 0
} else {
    exit 1
}
