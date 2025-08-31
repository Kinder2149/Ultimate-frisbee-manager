/**
 * Script de réinitialisation/création de l'utilisateur Admin
 * Email: admin@ultimate.com | Password: Ultim@t+
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    const email = 'admin@ultimate.com';
    const passwordPlain = 'Ultim@t+';
    const password = await bcrypt.hash(passwordPlain, 12);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password,
        isActive: true,
        role: 'ADMIN'
      },
      create: {
        email,
        password,
        nom: 'Admin',
        prenom: 'Ultimate',
        role: 'ADMIN',
        isActive: true,
        iconUrl: null
      }
    });

    console.log('✅ Admin prêt:', { email: admin.email, role: admin.role, isActive: admin.isActive });
  } catch (e) {
    console.error('❌ Erreur reset-admin:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
