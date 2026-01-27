#!/usr/bin/env node

/**
 * Script de test de configuration Vercel
 * Vérifie que toutes les variables d'environnement critiques sont présentes
 * 
 * Usage:
 *   node test-vercel-config.js
 * 
 * Ou pour tester avec les variables Vercel:
 *   vercel env pull .env.vercel.local
 *   node -r dotenv/config test-vercel-config.js dotenv_config_path=.env.vercel.local
 */

const https = require('https');
const { URL } = require('url');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkVariable(name, value, validator = null) {
  if (!value) {
    log(`❌ ${name}: MANQUANT`, 'red');
    return false;
  }

  if (validator) {
    const result = validator(value);
    if (!result.valid) {
      log(`❌ ${name}: ${result.error}`, 'red');
      return false;
    }
  }

  log(`✅ ${name}: OK`, 'green');
  return true;
}

// Validateurs
const validators = {
  databaseUrl: (url) => {
    try {
      const parsed = new URL(url);
      
      // Vérifier le protocole
      if (!parsed.protocol.startsWith('postgres')) {
        return { valid: false, error: 'Doit commencer par postgresql://' };
      }

      // Vérifier le host (doit utiliser le pooler)
      if (!parsed.hostname.includes('pooler.supabase.com')) {
        return { 
          valid: false, 
          error: `Host incorrect. Utilisez aws-*.pooler.supabase.com (actuellement: ${parsed.hostname})` 
        };
      }

      // Vérifier le port (6543 pour production)
      if (parsed.port !== '6543') {
        log(`⚠️  Port ${parsed.port} détecté. Recommandé: 6543 (Transaction mode) pour production`, 'yellow');
      }

      return { valid: true };
    } catch (err) {
      return { valid: false, error: `Format invalide: ${err.message}` };
    }
  },

  jwtSecret: (secret) => {
    if (secret.length < 32) {
      return { valid: false, error: `Trop court (${secret.length} caractères). Minimum: 32` };
    }
    return { valid: true };
  },

  cloudinaryUrl: (url) => {
    if (!url.startsWith('cloudinary://')) {
      return { valid: false, error: 'Doit commencer par cloudinary://' };
    }
    
    const match = url.match(/^cloudinary:\/\/(\d+):([^@]+)@(.+)$/);
    if (!match) {
      return { valid: false, error: 'Format invalide. Attendu: cloudinary://API_KEY:API_SECRET@CLOUD_NAME' };
    }

    return { valid: true };
  },

  corsOrigins: (origins) => {
    const urls = origins.split(',').map(s => s.trim());
    
    for (const url of urls) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return { valid: false, error: `URL invalide: ${url}` };
      }
    }

    return { valid: true };
  }
};

async function testDatabaseConnection(databaseUrl) {
  log('\n🔍 Test de connexion à la base de données...', 'cyan');
  
  try {
    const parsed = new URL(databaseUrl);
    const host = parsed.hostname;
    const port = parsed.port || '5432';

    return new Promise((resolve) => {
      const req = https.request({
        host,
        port,
        method: 'HEAD',
        timeout: 5000
      }, (res) => {
        log(`✅ Host accessible: ${host}:${port}`, 'green');
        resolve(true);
      });

      req.on('error', (err) => {
        log(`❌ Impossible de joindre ${host}:${port}`, 'red');
        log(`   Erreur: ${err.message}`, 'red');
        resolve(false);
      });

      req.on('timeout', () => {
        log(`❌ Timeout lors de la connexion à ${host}:${port}`, 'red');
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  } catch (err) {
    log(`❌ Erreur lors du test: ${err.message}`, 'red');
    return false;
  }
}

async function testHealthEndpoint(url) {
  log('\n🔍 Test du endpoint /api/health...', 'cyan');
  
  try {
    const healthUrl = `${url}/api/health`;
    
    return new Promise((resolve) => {
      https.get(healthUrl, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            
            if (res.statusCode === 200 && json.status === 'ok') {
              log(`✅ Health check OK`, 'green');
              log(`   Status: ${json.status}`, 'green');
              log(`   DB: ${json.db ? '✅ Connectée' : '❌ Déconnectée'}`, json.db ? 'green' : 'red');
              resolve(json.db);
            } else {
              log(`❌ Health check échoué (status: ${res.statusCode})`, 'red');
              log(`   Réponse: ${data}`, 'red');
              resolve(false);
            }
          } catch (err) {
            log(`❌ Réponse invalide: ${err.message}`, 'red');
            resolve(false);
          }
        });
      }).on('error', (err) => {
        log(`❌ Erreur: ${err.message}`, 'red');
        resolve(false);
      });
    });
  } catch (err) {
    log(`❌ Erreur lors du test: ${err.message}`, 'red');
    return false;
  }
}

async function main() {
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║   Test de Configuration Vercel - Production           ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  log('\n📋 Vérification des variables d\'environnement...\n', 'blue');

  const checks = {
    critical: [],
    optional: []
  };

  // Variables critiques
  log('🔴 Variables CRITIQUES:', 'red');
  checks.critical.push(
    checkVariable('DATABASE_URL', process.env.DATABASE_URL, validators.databaseUrl)
  );
  checks.critical.push(
    checkVariable('JWT_SECRET', process.env.JWT_SECRET, validators.jwtSecret)
  );
  checks.critical.push(
    checkVariable('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET, validators.jwtSecret)
  );
  checks.critical.push(
    checkVariable('CLOUDINARY_URL', process.env.CLOUDINARY_URL, validators.cloudinaryUrl)
  );
  checks.critical.push(
    checkVariable('CORS_ORIGINS', process.env.CORS_ORIGINS, validators.corsOrigins)
  );

  // Variables optionnelles
  log('\n🟡 Variables OPTIONNELLES:', 'yellow');
  checks.optional.push(
    checkVariable('NODE_ENV', process.env.NODE_ENV)
  );
  checks.optional.push(
    checkVariable('SUPABASE_PROJECT_REF', process.env.SUPABASE_PROJECT_REF)
  );
  checks.optional.push(
    checkVariable('RATE_LIMIT_ENABLED', process.env.RATE_LIMIT_ENABLED)
  );

  // Résumé
  const criticalOk = checks.critical.every(c => c);
  const optionalOk = checks.optional.every(c => c);

  log('\n═══════════════════════════════════════════════════════', 'cyan');
  log('📊 RÉSUMÉ', 'blue');
  log('═══════════════════════════════════════════════════════', 'cyan');
  
  log(`\nVariables critiques: ${criticalOk ? '✅ OK' : '❌ ERREURS'}`, criticalOk ? 'green' : 'red');
  log(`Variables optionnelles: ${optionalOk ? '✅ OK' : '⚠️  MANQUANTES'}`, optionalOk ? 'green' : 'yellow');

  // Tests de connexion (si variables OK)
  if (criticalOk && process.env.DATABASE_URL) {
    await testDatabaseConnection(process.env.DATABASE_URL);
  }

  // Test du endpoint health (si URL fournie)
  const vercelUrl = process.env.VERCEL_URL || process.argv[2];
  if (vercelUrl) {
    const url = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
    await testHealthEndpoint(url);
  } else {
    log('\n💡 Pour tester le endpoint /api/health, passez l\'URL en argument:', 'cyan');
    log('   node test-vercel-config.js https://votre-projet.vercel.app', 'cyan');
  }

  // Recommandations
  if (!criticalOk) {
    log('\n⚠️  ACTIONS REQUISES:', 'yellow');
    log('1. Corriger les variables manquantes ou invalides', 'yellow');
    log('2. Vérifier la documentation: VERCEL_PRODUCTION_CHECKLIST.md', 'yellow');
    log('3. Redéployer après corrections', 'yellow');
    process.exit(1);
  } else {
    log('\n✅ Configuration valide!', 'green');
    log('   Vous pouvez déployer en production.', 'green');
    process.exit(0);
  }
}

// Exécution
main().catch(err => {
  log(`\n❌ Erreur fatale: ${err.message}`, 'red');
  console.error(err);
  process.exit(1);
});
