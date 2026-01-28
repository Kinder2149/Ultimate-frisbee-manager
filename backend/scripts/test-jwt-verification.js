/**
 * Script de test de vérification JWT Supabase
 * Permet de diagnostiquer le problème "alg not allowed"
 */

const jose = require('jose');

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'rnreaaeiccqkwgwxwxeg';

async function testJWTVerification() {
  console.log('🔍 Test de vérification JWT Supabase\n');
  
  console.log('Configuration:');
  console.log(`  SUPABASE_PROJECT_REF: ${SUPABASE_PROJECT_REF}`);
  console.log(`  JWKS URL: https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/keys\n`);
  
  // Test 1: Vérifier que l'URL JWKS est accessible
  console.log('1️⃣ Test d\'accès à l\'URL JWKS...');
  try {
    const jwksUrl = `https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/keys`;
    const response = await fetch(jwksUrl);
    
    if (!response.ok) {
      console.error(`❌ Erreur HTTP ${response.status}: ${response.statusText}`);
      return;
    }
    
    const jwks = await response.json();
    console.log('✅ JWKS accessible');
    console.log('   Clés disponibles:', jwks.keys?.length || 0);
    
    if (jwks.keys && jwks.keys.length > 0) {
      console.log('   Algorithmes supportés:', jwks.keys.map(k => k.alg).join(', '));
      console.log('   Key IDs:', jwks.keys.map(k => k.kid).join(', '));
    }
  } catch (error) {
    console.error('❌ Erreur accès JWKS:', error.message);
    return;
  }
  
  // Test 2: Vérifier la configuration Jose
  console.log('\n2️⃣ Test de configuration Jose...');
  try {
    const jwksUrl = new URL(`https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/keys`);
    const JWKS = jose.createRemoteJWKSet(jwksUrl);
    console.log('✅ RemoteJWKSet créé avec succès');
    console.log('   Type:', typeof JWKS);
  } catch (error) {
    console.error('❌ Erreur création RemoteJWKSet:', error.message);
    return;
  }
  
  console.log('\n📊 Diagnostic:');
  console.log('   - JWKS URL accessible: ✅');
  console.log('   - Jose configuré: ✅');
  console.log('   - Algorithme attendu: RS256');
  console.log('\n⚠️  Le problème vient probablement du token lui-même.');
  console.log('   Vérifiez que le token Supabase est bien un JWT RS256.');
}

testJWTVerification()
  .catch(e => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  });
