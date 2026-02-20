/**
 * Script pour vérifier l'état de la base de données
 * Vérifie migrations et données sans générer le client Prisma
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkDatabaseState() {
  console.log('🔍 Vérification état base de données...\n');

  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connexion base de données établie\n');

    // 1. Vérifier table migrations
    const migrationsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = '_prisma_migrations'
      ) as exists;
    `);

    const migrationsTableExists = migrationsTableCheck.rows[0].exists;
    console.log(`📋 Table _prisma_migrations : ${migrationsTableExists ? '✅ Existe' : '❌ N\'existe pas'}`);

    if (migrationsTableExists) {
      // 2. Compter migrations
      const migrationsCount = await client.query(`
        SELECT COUNT(*) as count FROM "_prisma_migrations";
      `);
      console.log(`📊 Nombre de migrations : ${migrationsCount.rows[0].count}`);

      // 3. Dernières migrations
      const lastMigrations = await client.query(`
        SELECT migration_name, finished_at 
        FROM "_prisma_migrations" 
        ORDER BY finished_at DESC 
        LIMIT 5;
      `);
      console.log('\n📜 Dernières migrations :');
      lastMigrations.rows.forEach(m => {
        console.log(`   - ${m.migration_name} (${new Date(m.finished_at).toLocaleString('fr-FR')})`);
      });
    }

    // 4. Compter données
    console.log('\n📦 Données présentes :');
    
    const userCount = await client.query('SELECT COUNT(*) as count FROM "User";');
    console.log(`   - Users : ${userCount.rows[0].count}`);

    const workspaceCount = await client.query('SELECT COUNT(*) as count FROM "Workspace";');
    console.log(`   - Workspaces : ${workspaceCount.rows[0].count}`);

    const exerciceCount = await client.query('SELECT COUNT(*) as count FROM "Exercice";');
    console.log(`   - Exercices : ${exerciceCount.rows[0].count}`);

    const entrainementCount = await client.query('SELECT COUNT(*) as count FROM "Entrainement";');
    console.log(`   - Entraînements : ${entrainementCount.rows[0].count}`);

    // 5. Lister workspaces
    const workspaces = await client.query(`
      SELECT id, name, "isBase", "createdAt" 
      FROM "Workspace" 
      ORDER BY "createdAt" DESC;
    `);
    console.log('\n🏢 Workspaces :');
    workspaces.rows.forEach(ws => {
      const badge = ws.isBase ? '[BASE]' : '';
      console.log(`   - ${ws.name} ${badge} (créé le ${new Date(ws.createdAt).toLocaleDateString('fr-FR')})`);
    });

    // 6. Vérifier nouvelle colonne duree_minutes
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Exercice' 
      AND column_name = 'duree_minutes';
    `);
    console.log(`\n🔧 Colonne duree_minutes : ${columnCheck.rows.length > 0 ? '✅ Existe' : '❌ N\'existe pas'}`);

    console.log('\n✅ Vérification terminée !');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

checkDatabaseState()
  .catch((e) => {
    console.error('❌ Erreur fatale:', e);
    process.exit(1);
  });
