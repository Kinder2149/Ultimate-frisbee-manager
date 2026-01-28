/**
 * Script pour décoder un token JWT et voir son algorithme
 * Usage: node backend/scripts/decode-token.js <TOKEN>
 */

const token = process.argv[2];

if (!token) {
  console.error('Usage: node decode-token.js <TOKEN>');
  process.exit(1);
}

try {
  // Décoder le header (première partie du JWT)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('❌ Token invalide (doit avoir 3 parties séparées par des points)');
    process.exit(1);
  }

  const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

  console.log('🔍 Analyse du Token JWT\n');
  
  console.log('📋 Header:');
  console.log(JSON.stringify(header, null, 2));
  
  console.log('\n📋 Payload:');
  console.log(JSON.stringify(payload, null, 2));
  
  console.log('\n✅ Informations clés:');
  console.log(`   Algorithme: ${header.alg}`);
  console.log(`   Type: ${header.typ}`);
  console.log(`   Issuer: ${payload.iss || 'N/A'}`);
  console.log(`   Subject: ${payload.sub || 'N/A'}`);
  console.log(`   Role: ${payload.role || 'N/A'}`);
  console.log(`   Expiration: ${payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A'}`);
  
  if (header.alg === 'HS256') {
    console.log('\n⚠️  PROBLÈME DÉTECTÉ:');
    console.log('   Ce token utilise HS256 (clé symétrique)');
    console.log('   Le backend attend RS256 (clé publique/privée)');
    console.log('   Ce token est probablement la clé anon de Supabase, pas un token utilisateur');
  } else if (header.alg === 'RS256') {
    console.log('\n✅ Token correct:');
    console.log('   Ce token utilise RS256 comme attendu');
  }
  
} catch (error) {
  console.error('❌ Erreur décodage:', error.message);
  process.exit(1);
}
