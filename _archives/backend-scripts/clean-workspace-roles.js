/**
 * Script de nettoyage des rôles workspace legacy
 * Normalise OWNER → MANAGER et USER → MEMBER avant migration enum
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanWorkspaceRoles() {
  console.log('🧹 Nettoyage des rôles workspace legacy...\n');

  try {
    console.log('1️⃣ Normalisation OWNER → MANAGER');
    const ownerCount = await prisma.$executeRaw`
      UPDATE "WorkspaceUser" 
      SET role = 'MANAGER' 
      WHERE UPPER(role) = 'OWNER';
    `;
    console.log(`   ✅ ${ownerCount} rôles OWNER normalisés en MANAGER\n`);

    console.log('2️⃣ Normalisation USER → MEMBER');
    const userCount = await prisma.$executeRaw`
      UPDATE "WorkspaceUser" 
      SET role = 'MEMBER' 
      WHERE UPPER(role) = 'USER';
    `;
    console.log(`   ✅ ${userCount} rôles USER normalisés en MEMBER\n`);

    console.log('3️⃣ Nettoyage des valeurs invalides');
    const invalidCount = await prisma.$executeRaw`
      UPDATE "WorkspaceUser" 
      SET role = 'MEMBER' 
      WHERE role NOT IN ('MANAGER', 'MEMBER', 'VIEWER');
    `;
    console.log(`   ✅ ${invalidCount} rôles invalides normalisés en MEMBER\n`);

    console.log('4️⃣ Vérification finale');
    const roles = await prisma.$queryRaw`
      SELECT role, COUNT(*) as count 
      FROM "WorkspaceUser" 
      GROUP BY role 
      ORDER BY role;
    `;
    console.log('   Distribution des rôles:');
    roles.forEach(r => {
      console.log(`   - ${r.role}: ${r.count}`);
    });

    console.log('\n✅ Nettoyage terminé avec succès!');
    console.log('   Vous pouvez maintenant exécuter la migration Prisma pour ajouter l\'enum.');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanWorkspaceRoles()
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
