/**
 * Script de synchronisation Supabase Auth → Base de données applicative
 * 
 * Objectif : Créer les profils manquants pour les utilisateurs qui existent dans Supabase
 * mais pas dans la base de données applicative.
 * 
 * Usage : node prisma/sync-supabase-users.js
 */
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Configuration Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Récupérer tous les utilisateurs de Supabase Auth
 */
async function fetchSupabaseUsers() {
  console.log('📡 Récupération des utilisateurs Supabase...');
  
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    throw new Error(`Erreur Supabase: ${error.message}`);
  }
  
  console.log(`✅ ${data.users.length} utilisateur(s) trouvé(s) dans Supabase`);
  return data.users;
}

/**
 * Vérifier quels utilisateurs n'ont pas de profil en base
 */
async function findMissingProfiles(supabaseUsers) {
  console.log('\n🔍 Vérification des profils manquants...');
  
  const missing = [];
  
  for (const supaUser of supabaseUsers) {
    const existing = await prisma.user.findUnique({
      where: { id: supaUser.id }
    });
    
    if (!existing) {
      missing.push(supaUser);
      console.log(`  ❌ Profil manquant: ${supaUser.email} (${supaUser.id})`);
    } else {
      console.log(`  ✅ Profil existant: ${supaUser.email}`);
    }
  }
  
  console.log(`\n📊 Résumé: ${missing.length} profil(s) à créer sur ${supabaseUsers.length} utilisateur(s)`);
  return missing;
}

/**
 * Créer les profils manquants
 */
async function createMissingProfiles(missingUsers) {
  if (missingUsers.length === 0) {
    console.log('\n✅ Aucun profil à créer, tous les utilisateurs sont synchronisés !');
    return [];
  }
  
  console.log('\n🔧 Création des profils manquants...');
  
  const created = [];
  
  // Récupérer le workspace BASE
  const baseWorkspace = await prisma.workspace.findFirst({
    where: { isBase: true }
  });
  
  if (!baseWorkspace) {
    console.error('❌ Workspace BASE introuvable. Exécutez d\'abord: node prisma/seed.js');
    process.exit(1);
  }
  
  for (const supaUser of missingUsers) {
    try {
      // Extraire nom/prénom de l'email si pas fourni par Supabase
      const email = supaUser.email;
      const emailParts = email.split('@')[0];
      const defaultPrenom = supaUser.user_metadata?.name || emailParts;
      
      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          id: supaUser.id,
          email: email,
          nom: supaUser.user_metadata?.last_name || '',
          prenom: supaUser.user_metadata?.first_name || defaultPrenom,
          role: 'USER', // Par défaut USER, peut être changé manuellement après
          isActive: true,
          iconUrl: supaUser.user_metadata?.avatar_url || null
        }
      });
      
      // Associer au workspace BASE avec rôle VIEWER
      await prisma.workspaceUser.create({
        data: {
          id: uuidv4(),
          workspaceId: baseWorkspace.id,
          userId: user.id,
          role: 'VIEWER'
        }
      });
      
      created.push(user);
      console.log(`  ✅ Créé: ${user.email} (role: ${user.role}, workspace: BASE/VIEWER)`);
    } catch (error) {
      console.error(`  ❌ Erreur création ${supaUser.email}:`, error.message);
    }
  }
  
  console.log(`\n✅ ${created.length} profil(s) créé(s) avec succès`);
  return created;
}

/**
 * Afficher un rapport final
 */
async function generateReport() {
  console.log('\n📊 RAPPORT FINAL\n');
  
  // Compter utilisateurs par rôle
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      isActive: true,
      _count: {
        select: { workspaces: true }
      }
    }
  });
  
  const byRole = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
  
  console.log('👥 Utilisateurs par rôle:');
  Object.entries(byRole).forEach(([role, count]) => {
    console.log(`  - ${role}: ${count}`);
  });
  
  console.log(`\n📧 Total: ${users.length} utilisateur(s) en base`);
  
  // Vérifier workspace BASE
  const baseWorkspace = await prisma.workspace.findFirst({
    where: { isBase: true },
    include: {
      _count: {
        select: { members: true }
      }
    }
  });
  
  if (baseWorkspace) {
    console.log(`\n🗂️  Workspace BASE: ${baseWorkspace._count.members} membre(s)`);
  }
}

/**
 * Exécution principale
 */
async function main() {
  console.log('🔄 SYNCHRONISATION SUPABASE AUTH → BASE DE DONNÉES\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Récupérer utilisateurs Supabase
    const supabaseUsers = await fetchSupabaseUsers();
    
    // 2. Identifier profils manquants
    const missingUsers = await findMissingProfiles(supabaseUsers);
    
    // 3. Créer profils manquants
    const createdUsers = await createMissingProfiles(missingUsers);
    
    // 4. Rapport final
    await generateReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SYNCHRONISATION TERMINÉE AVEC SUCCÈS');
    console.log('='.repeat(60));
    
    if (createdUsers.length > 0) {
      console.log('\n💡 Note: Les nouveaux utilisateurs ont le rôle USER par défaut.');
      console.log('   Si certains doivent être ADMIN, modifiez-les manuellement ou via l\'interface admin.');
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Erreur fatale:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { 
  fetchSupabaseUsers,
  findMissingProfiles,
  createMissingProfiles
};
