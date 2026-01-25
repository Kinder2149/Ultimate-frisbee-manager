/**
 * Script pour normaliser les rôles utilisateurs en UPPERCASE
 * Convertit 'admin' -> 'ADMIN' et 'user' -> 'USER'
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function normalizeRoles() {
  console.log('🔄 Normalisation des rôles utilisateurs...');
  
  try {
    // Récupérer tous les utilisateurs
    const users = await prisma.$queryRaw`SELECT id, email, role FROM "User"`;
    
    console.log(`📊 ${users.length} utilisateurs trouvés`);
    
    // Mettre à jour chaque utilisateur avec le rôle en UPPERCASE
    for (const user of users) {
      const oldRole = user.role;
      const newRole = oldRole.toUpperCase();
      
      if (oldRole !== newRole) {
        console.log(`  ✏️  ${user.email}: ${oldRole} → ${newRole}`);
        
        await prisma.$executeRaw`
          UPDATE "User" 
          SET role = ${newRole}
          WHERE id = ${user.id}
        `;
      } else {
        console.log(`  ✅ ${user.email}: ${oldRole} (déjà normalisé)`);
      }
    }
    
    console.log('✅ Normalisation terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la normalisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

normalizeRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
