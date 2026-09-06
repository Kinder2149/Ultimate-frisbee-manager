/**
 * Script de vérification et correction de l'authentification en production
 * 
 * Vérifie :
 * 1. Existence de l'utilisateur admin@ultimate.com
 * 2. Correspondance avec l'ID Supabase
 * 3. Existence du workspace BASE
 * 4. Liaison utilisateur <-> workspace BASE
 * 
 * Usage: node backend/scripts/verify-production-auth.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ID Supabase de l'utilisateur admin (à récupérer depuis Supabase Dashboard)
// Si vous ne l'avez pas, laissez null et le script vous guidera
const SUPABASE_ADMIN_ID = '75a3e2e0-bec1-4ef6-bdf1-6234448525b4';

const ADMIN_EMAIL = 'admin@ultimate.com';
const ADMIN_PASSWORD = 'Ultim@t+';
const WORKSPACE_BASE_ID = 'bb0acaee-5698-4160-bee5-d85bff72dbda';

async function main() {
  console.log('🔍 Vérification de la configuration d\'authentification en production\n');

  // 1. Vérifier l'utilisateur admin
  console.log('1️⃣ Vérification de l\'utilisateur admin...');
  let adminUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL }
  });

  if (!adminUser) {
    console.log('❌ Utilisateur admin non trouvé en base de données');
    
    if (!SUPABASE_ADMIN_ID) {
      console.log('\n⚠️  IMPORTANT : Vous devez d\'abord récupérer l\'ID Supabase de votre utilisateur admin');
      console.log('   1. Allez sur https://supabase.com/dashboard/project/rnreaaeiccqkwgwxwxeg/auth/users');
      console.log('   2. Trouvez l\'utilisateur admin@ultimate.com');
      console.log('   3. Copiez son UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
      console.log('   4. Modifiez ce script et remplacez SUPABASE_ADMIN_ID par cet UUID');
      console.log('   5. Relancez le script\n');
      process.exit(1);
    }

    console.log('🔧 Création de l\'utilisateur admin en base de données...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    
    adminUser = await prisma.user.create({
      data: {
        id: SUPABASE_ADMIN_ID,
        email: ADMIN_EMAIL,
        passwordHash: hashedPassword,
        nom: 'Admin',
        prenom: 'Ultimate',
        role: 'ADMIN',
        isActive: true,
      }
    });
    console.log('✅ Utilisateur admin créé avec succès');
  } else {
    console.log('✅ Utilisateur admin trouvé:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      isActive: adminUser.isActive
    });

    // Vérifier les propriétés critiques
    if (adminUser.role !== 'ADMIN') {
      console.log('⚠️  Le rôle n\'est pas ADMIN, correction...');
      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: { role: 'ADMIN' }
      });
      console.log('✅ Rôle corrigé en ADMIN');
    }

    if (!adminUser.isActive) {
      console.log('⚠️  L\'utilisateur n\'est pas actif, correction...');
      adminUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: { isActive: true }
      });
      console.log('✅ Utilisateur activé');
    }
  }

  // 2. Vérifier le workspace BASE
  console.log('\n2️⃣ Vérification du workspace BASE...');
  let baseWorkspace = await prisma.workspace.findUnique({
    where: { id: WORKSPACE_BASE_ID }
  });

  if (!baseWorkspace) {
    console.log('❌ Workspace BASE non trouvé, création...');
    baseWorkspace = await prisma.workspace.create({
      data: {
        id: WORKSPACE_BASE_ID,
        name: 'BASE',
        isBase: true,
      }
    });
    console.log('✅ Workspace BASE créé');
  } else {
    if (baseWorkspace.isBase !== true) {
      baseWorkspace = await prisma.workspace.update({
        where: { id: baseWorkspace.id },
        data: { isBase: true },
      });
    }
    console.log('✅ Workspace BASE trouvé:', {
      id: baseWorkspace.id,
      name: baseWorkspace.name
    });
  }

  // 3. Vérifier la liaison utilisateur <-> workspace
  console.log('\n3️⃣ Vérification de la liaison utilisateur <-> workspace...');
  let workspaceLink = await prisma.workspaceUser.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: WORKSPACE_BASE_ID,
        userId: adminUser.id
      }
    }
  });

  if (!workspaceLink) {
    console.log('❌ Liaison manquante, création...');
    workspaceLink = await prisma.workspaceUser.create({
      data: {
        workspaceId: WORKSPACE_BASE_ID,
        userId: adminUser.id,
        role: 'MANAGER'
      }
    });
    console.log('✅ Liaison créée avec rôle MANAGER');
  } else {
    console.log('✅ Liaison trouvée:', {
      workspaceId: workspaceLink.workspaceId,
      userId: workspaceLink.userId,
      role: workspaceLink.role
    });
  }

  // 4. Résumé final
  console.log('\n📊 Résumé de la configuration:');
  console.log('─────────────────────────────────────────');
  console.log(`Utilisateur: ${adminUser.email}`);
  console.log(`ID Supabase: ${adminUser.id}`);
  console.log(`Rôle: ${adminUser.role}`);
  console.log(`Actif: ${adminUser.isActive ? 'Oui' : 'Non'}`);
  console.log(`Workspace: ${baseWorkspace.name} (${baseWorkspace.id})`);
  console.log(`Rôle dans workspace: ${workspaceLink.role}`);
  console.log('─────────────────────────────────────────');

  // 5. Instructions pour tester
  console.log('\n🧪 Étapes de test:');
  console.log('1. Allez sur https://ultimate-frisbee-manager.vercel.app');
  console.log('2. Connectez-vous avec:');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('3. Vérifiez que vous êtes redirigé vers le dashboard');
  console.log('4. Vérifiez que le menu "Paramètres" affiche toutes les options\n');

  console.log('✨ Vérification terminée avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la vérification:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
