# Script PowerShell pour tester la configuration Vercel
# Usage: .\test-vercel-config.ps1 [URL_VERCEL]

param(
    [string]$VercelUrl = ""
)

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Test de Configuration Vercel - Production           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Fonction pour vérifier une variable
function Test-EnvVariable {
    param(
        [string]$Name,
        [string]$Value,
        [scriptblock]$Validator = $null
    )
    
    if ([string]::IsNullOrWhiteSpace($Value)) {
        Write-Host "❌ $Name`: MANQUANT" -ForegroundColor Red
        return $false
    }
    
    if ($null -ne $Validator) {
        $result = & $Validator $Value
        if (-not $result.Valid) {
            Write-Host "❌ $Name`: $($result.Error)" -ForegroundColor Red
            return $false
        }
    }
    
    Write-Host "✅ $Name`: OK" -ForegroundColor Green
    return $true
}

# Validateur DATABASE_URL
$ValidateDatabaseUrl = {
    param($url)
    
    try {
        $uri = [System.Uri]$url
        
        if (-not $uri.Scheme.StartsWith("postgres")) {
            return @{ Valid = $false; Error = "Doit commencer par postgresql://" }
        }
        
        if (-not $uri.Host.Contains("pooler.supabase.com")) {
            return @{ Valid = $false; Error = "Host incorrect. Utilisez aws-*.pooler.supabase.com (actuellement: $($uri.Host))" }
        }
        
        if ($uri.Port -ne 6543) {
            Write-Host "⚠️  Port $($uri.Port) détecté. Recommandé: 6543 (Transaction mode) pour production" -ForegroundColor Yellow
        }
        
        return @{ Valid = $true }
    }
    catch {
        return @{ Valid = $false; Error = "Format invalide: $($_.Exception.Message)" }
    }
}

# Validateur JWT Secret
$ValidateJwtSecret = {
    param($secret)
    
    if ($secret.Length -lt 32) {
        return @{ Valid = $false; Error = "Trop court ($($secret.Length) caractères). Minimum: 32" }
    }
    
    return @{ Valid = $true }
}

# Validateur Cloudinary URL
$ValidateCloudinaryUrl = {
    param($url)
    
    if (-not $url.StartsWith("cloudinary://")) {
        return @{ Valid = $false; Error = "Doit commencer par cloudinary://" }
    }
    
    if ($url -notmatch "^cloudinary://\d+:[^@]+@.+$") {
        return @{ Valid = $false; Error = "Format invalide. Attendu: cloudinary://API_KEY:API_SECRET@CLOUD_NAME" }
    }
    
    return @{ Valid = $true }
}

# Validateur CORS Origins
$ValidateCorsOrigins = {
    param($origins)
    
    $urls = $origins -split "," | ForEach-Object { $_.Trim() }
    
    foreach ($url in $urls) {
        if (-not ($url.StartsWith("http://") -or $url.StartsWith("https://"))) {
            return @{ Valid = $false; Error = "URL invalide: $url" }
        }
    }
    
    return @{ Valid = $true }
}

Write-Host "📋 Vérification des variables d'environnement...`n" -ForegroundColor Blue

# Charger les variables depuis .env si disponible
$envFile = Join-Path $PSScriptRoot "backend\.env"
if (Test-Path $envFile) {
    Write-Host "📄 Chargement de backend\.env..." -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host ""
}

# Variables critiques
Write-Host "🔴 Variables CRITIQUES:" -ForegroundColor Red
$criticalChecks = @()
$criticalChecks += Test-EnvVariable "DATABASE_URL" $env:DATABASE_URL $ValidateDatabaseUrl
$criticalChecks += Test-EnvVariable "JWT_SECRET" $env:JWT_SECRET $ValidateJwtSecret
$criticalChecks += Test-EnvVariable "JWT_REFRESH_SECRET" $env:JWT_REFRESH_SECRET $ValidateJwtSecret
$criticalChecks += Test-EnvVariable "CLOUDINARY_URL" $env:CLOUDINARY_URL $ValidateCloudinaryUrl
$criticalChecks += Test-EnvVariable "CORS_ORIGINS" $env:CORS_ORIGINS $ValidateCorsOrigins

# Variables optionnelles
Write-Host "`n🟡 Variables OPTIONNELLES:" -ForegroundColor Yellow
$optionalChecks = @()
$optionalChecks += Test-EnvVariable "NODE_ENV" $env:NODE_ENV
$optionalChecks += Test-EnvVariable "SUPABASE_PROJECT_REF" $env:SUPABASE_PROJECT_REF
$optionalChecks += Test-EnvVariable "RATE_LIMIT_ENABLED" $env:RATE_LIMIT_ENABLED

# Résumé
$criticalOk = $criticalChecks -notcontains $false
$optionalOk = $optionalChecks -notcontains $false

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ" -ForegroundColor Blue
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($criticalOk) {
    Write-Host "`nVariables critiques: ✅ OK" -ForegroundColor Green
} else {
    Write-Host "`nVariables critiques: ❌ ERREURS" -ForegroundColor Red
}

if ($optionalOk) {
    Write-Host "Variables optionnelles: ✅ OK" -ForegroundColor Green
} else {
    Write-Host "Variables optionnelles: ⚠️  MANQUANTES" -ForegroundColor Yellow
}

# Test de connexion DB
if ($criticalOk -and $env:DATABASE_URL) {
    Write-Host "`n🔍 Test de connexion à la base de données..." -ForegroundColor Cyan
    
    try {
        $uri = [System.Uri]$env:DATABASE_URL
        $host = $uri.Host
        $port = $uri.Port
        
        $result = Test-NetConnection -ComputerName $host -Port $port -WarningAction SilentlyContinue
        
        if ($result.TcpTestSucceeded) {
            Write-Host "✅ Host accessible: $host`:$port" -ForegroundColor Green
        } else {
            Write-Host "❌ Impossible de joindre $host`:$port" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test du endpoint health
if ($VercelUrl) {
    Write-Host "`n🔍 Test du endpoint /api/health..." -ForegroundColor Cyan
    
    $url = if ($VercelUrl.StartsWith("http")) { $VercelUrl } else { "https://$VercelUrl" }
    $healthUrl = "$url/api/health"
    
    try {
        $response = Invoke-RestMethod -Uri $healthUrl -Method Get -ErrorAction Stop
        
        if ($response.status -eq "ok") {
            Write-Host "✅ Health check OK" -ForegroundColor Green
            Write-Host "   Status: $($response.status)" -ForegroundColor Green
            
            if ($response.db) {
                Write-Host "   DB: ✅ Connectée" -ForegroundColor Green
            } else {
                Write-Host "   DB: ❌ Déconnectée" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Health check échoué" -ForegroundColor Red
            Write-Host "   Réponse: $($response | ConvertTo-Json)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n💡 Pour tester le endpoint /api/health, passez l'URL en argument:" -ForegroundColor Cyan
    Write-Host "   .\test-vercel-config.ps1 https://votre-projet.vercel.app" -ForegroundColor Cyan
}

# Recommandations
if (-not $criticalOk) {
    Write-Host "`n⚠️  ACTIONS REQUISES:" -ForegroundColor Yellow
    Write-Host "1. Corriger les variables manquantes ou invalides" -ForegroundColor Yellow
    Write-Host "2. Vérifier la documentation: VERCEL_PRODUCTION_CHECKLIST.md" -ForegroundColor Yellow
    Write-Host "3. Redéployer après corrections" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n✅ Configuration valide!" -ForegroundColor Green
    Write-Host "   Vous pouvez déployer en production." -ForegroundColor Green
    exit 0
}
