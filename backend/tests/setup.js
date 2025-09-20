const { execSync } = require('child_process');

module.exports = async () => {
  console.log('\nJest Global Setup: Réinitialisation de la base de données de test...');
  try {
    // La commande `reset` est la plus sûre: elle supprime, recrée et migre la DB.
    // Le flag --force évite la demande de confirmation interactive.
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    console.log('Base de données de test réinitialisée et prête.');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation de la base de données de test:', error);
    process.exit(1);
  }
};

