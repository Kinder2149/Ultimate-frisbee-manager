/**
 * Route de debug pour vérifier la configuration
 * À supprimer en production !
 */

const express = require('express');
const router = express.Router();

router.get('/env', (req, res) => {
  // Affiche les variables d'environnement critiques (sans les valeurs sensibles)
  const envCheck = {
    SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF ? '✅ Défini' : '❌ Manquant',
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Défini' : '❌ Manquant',
    NODE_ENV: process.env.NODE_ENV || '❌ Manquant',
    CORS_ORIGINS: process.env.CORS_ORIGINS || '❌ Manquant',
    CLOUDINARY_URL: process.env.CLOUDINARY_URL ? '✅ Défini' : '❌ Manquant',
  };

  // Vérifie si jose est disponible
  let jose;
  try {
    jose = require('jose');
    envCheck.JOSE = '✅ Disponible';
  } catch (_) {
    envCheck.JOSE = '❌ Manquant';
  }

  res.json({
    message: 'Debug - Variables d\'environnement',
    timestamp: new Date().toISOString(),
    environment: envCheck,
    headers: req.headers
  });
});

router.get('/auth-test', async (req, res) => {
  try {
    // Test de vérification de token avec un token Supabase de test
    const jose = require('jose');
    const projectRef = process.env.SUPABASE_PROJECT_REF;
    
    if (!projectRef) {
      return res.json({
        error: 'SUPABASE_PROJECT_REF manquant',
        status: '❌'
      });
    }

    const jwksUrl = `https://${projectRef}.supabase.co/auth/v1/keys`;
    
    // Test de connexion à JWKS
    const response = await fetch(jwksUrl);
    const jwks = await response.json();
    
    res.json({
      message: 'Test de configuration Supabase',
      status: '✅',
      projectRef,
      jwksUrl,
      jwksKeys: jwks.keys.length,
      joseAvailable: true
    });
    
  } catch (error) {
    res.json({
      error: error.message,
      status: '❌',
      details: error.toString()
    });
  }
});

module.exports = router;
