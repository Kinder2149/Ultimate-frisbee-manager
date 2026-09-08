const { execSync } = require('child_process');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

/**
 * Preparation de la base de tests.
 *
 * ⚠️ Ce script executait `prisma migrate reset --force`, qui SUPPRIME et
 * recree la base. Il etait cense viser `.env.test`, mais ce fichier
 * n'existait pas et `load-env.js` (declare dans `setupFiles`) s'execute
 * APRES ce script, dans un autre processus. Prisma retombait donc sur
 * `backend/.env`, c'est-a-dire la base de PRODUCTION.
 *
 * Les verifications ci-dessous refusent de continuer tant que la cible
 * n'est pas identifiee comme une base de test. Elles appliquent la regle
 * figee du projet : « Ne jamais lancer prisma migrate reset — donnees
 * production reelles ».
 */

const ARRET = (message) => {
  console.error('\n\x1b[31m✖ Tests interrompus par securite\x1b[0m');
  console.error(message + '\n');
  process.exit(1);
};

module.exports = async () => {
  const cheminEnvTest = path.resolve(process.cwd(), '.env.test');

  if (!fs.existsSync(cheminEnvTest)) {
    ARRET(
      "  backend/.env.test est introuvable.\n\n" +
      "  Sans lui, la reinitialisation viserait la base definie dans\n" +
      "  backend/.env — la base de PRODUCTION. Les donnees seraient perdues.\n\n" +
      "  Cree backend/.env.test avec DATABASE_URL et DIRECT_URL pointant\n" +
      "  vers une base dediee aux tests, puis relance."
    );
  }

  // Charger .env.test AVANT toute commande Prisma, en ecrasant l'existant.
  const { parsed } = dotenv.config({ path: cheminEnvTest, override: true });
  const url = (parsed && parsed.DATABASE_URL) || process.env.DATABASE_URL || '';

  if (!url) {
    ARRET("  backend/.env.test ne definit pas DATABASE_URL.");
  }

  // Garde-fou : refuser toute base qui ne s'annonce pas comme une base de test.
  const estUneBaseDeTest = /test/i.test(url) || /localhost|127\.0\.0\.1/.test(url);
  if (!estUneBaseDeTest) {
    ARRET(
      "  DATABASE_URL de .env.test ne ressemble pas a une base de test.\n\n" +
      "  Hote vise : " + (url.split('@')[1] || '(illisible)') + "\n\n" +
      "  Attendu : une base locale, ou dont le nom contient « test ».\n" +
      "  Refus de lancer `prisma migrate reset` sur cette cible."
    );
  }

  console.log('\nPreparation de la base de tests : ' + (url.split('@')[1] || ''));
  try {
    execSync('npx prisma migrate reset --force', { stdio: 'inherit', env: process.env });
    console.log('Base de tests prete.');
  } catch (error) {
    ARRET('  Echec de la reinitialisation : ' + error.message);
  }
};
