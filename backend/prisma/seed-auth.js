/**
 * Script de seed pour créer l'utilisateur Admin par défaut
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUser() {
  try {
    // Vérifier si l'utilisateur Admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@ultimate.com' }
    });

    if (existingAdmin) {
      console.log('✅ Utilisateur Admin existe déjà');
      return;
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('Ultim@t+', 12);

    // Créer l'utilisateur Admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@ultimate.com',
        password: hashedPassword,
        nom: 'Admin',
        prenom: 'Ultimate',
        role: 'ADMIN',
        isActive: true,
        iconUrl: null
      }
    });

    console.log('✅ Utilisateur Admin créé avec succès:', {
      id: admin.id,
      email: admin.email,
      nom: admin.nom
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur Admin:', error);
    throw error;
  }
}

// Exécuter le seed si appelé directement
if (require.main === module) {
  seedUser()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedUser };
