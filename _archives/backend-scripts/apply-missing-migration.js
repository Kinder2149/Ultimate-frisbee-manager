const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Application manuelle de la migration isTester...\n');

  try {
    // Appliquer la migration SQL directement
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isTester" BOOLEAN NOT NULL DEFAULT false;
    `);
    
    console.log('✅ Colonne isTester ajoutée avec succès à la table User');
    
    // Vérifier que la colonne existe
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'isTester';
    `;
    
    console.log('\n📊 Vérification de la colonne:');
    console.log(result);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
