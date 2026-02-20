/**
 * Script pour synchroniser les utilisateurs Supabase Auth avec PostgreSQL
 * 
 * Ce script :
 * 1. Récupère tous les utilisateurs de Supabase Auth via l'API Admin
 * 2. Vérifie quels utilisateurs existent dans PostgreSQL
 * 3. Crée les utilisateurs manquants dans PostgreSQL
 * 4. Les ajoute au workspace BASE avec le rôle VIEWER
 */

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const prisma = new PrismaClient();

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co`;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env');
  console.log('Récupérez-le depuis: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('🔄 Synchronisation des utilisateurs Supabase → PostgreSQL\n');

  try {
    // 1. Récupérer tous les utilisateurs de Supabase Auth
    console.log('📥 Récupération des utilisateurs Supabase Auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Erreur Supabase Auth: ${authError.message}`);
    }

    console.log(`✅ ${authUsers.users.length} utilisateurs trouvés dans Supabase Auth\n`);

    // 2. Récupérer tous les utilisateurs de PostgreSQL
    console.log('📥 Récupération des utilisateurs PostgreSQL...');
    const dbUsers = await prisma.user.findMany({
      select: { id: true, email: true }
    });
    
    console.log(`✅ ${dbUsers.length} utilisateurs trouvés dans PostgreSQL\n`);

    // 3. Identifier les utilisateurs manquants
    const dbUserIds = new Set(dbUsers.map(u => u.id));
    const missingUsers = authUsers.users.filter(u => !dbUserIds.has(u.id));

    if (missingUsers.length === 0) {
      console.log('✅ Tous les utilisateurs Supabase existent déjà dans PostgreSQL');
      return;
    }

    console.log(`⚠️  ${missingUsers.length} utilisateur(s) manquant(s) dans PostgreSQL:\n`);
    missingUsers.forEach(u => {
      console.log(`   - ${u.email} (ID: ${u.id})`);
    });
    console.log('');

    // 4. Récupérer le workspace BASE
    console.log('🔍 Recherche du workspace BASE...');
    const baseWorkspace = await prisma.workspace.findFirst({
      where: { name: 'BASE' }
    });

    if (!baseWorkspace) {
      console.warn('⚠️  Workspace BASE non trouvé, les utilisateurs seront créés sans workspace');
    } else {
      console.log(`✅ Workspace BASE trouvé (ID: ${baseWorkspace.id})\n`);
    }

    // 5. Créer les utilisateurs manquants
    console.log('➕ Création des utilisateurs manquants...\n');
    
    for (const authUser of missingUsers) {
      try {
        // Créer l'utilisateur dans PostgreSQL
        const newUser = await prisma.user.create({
          data: {
            id: authUser.id,
            email: authUser.email,
            nom: authUser.user_metadata?.nom || authUser.email.split('@')[0],
            prenom: authUser.user_metadata?.prenom || '',
            role: 'USER',
            isActive: true
          }
        });

        console.log(`   ✅ Utilisateur créé: ${newUser.email} (${newUser.id})`);

        // Ajouter au workspace BASE si disponible
        if (baseWorkspace) {
          await prisma.workspaceUser.create({
            data: {
              workspaceId: baseWorkspace.id,
              userId: newUser.id,
              role: 'VIEWER'
            }
          });
          console.log(`      → Ajouté au workspace BASE avec le rôle VIEWER`);
        }

      } catch (error) {
        console.error(`   ❌ Erreur création ${authUser.email}:`, error.message);
      }
    }

    console.log('\n✅ Synchronisation terminée !');

    // 6. Afficher le résumé final
    const finalDbUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true }
    });

    console.log('\n📊 Résumé final:');
    console.log(`   - Supabase Auth: ${authUsers.users.length} utilisateurs`);
    console.log(`   - PostgreSQL: ${finalDbUsers.length} utilisateurs`);
    console.log(`   - Créés: ${missingUsers.length} utilisateurs\n`);

    console.log('👥 Liste des utilisateurs PostgreSQL:');
    finalDbUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.role})`);
    });

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur fatale:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
