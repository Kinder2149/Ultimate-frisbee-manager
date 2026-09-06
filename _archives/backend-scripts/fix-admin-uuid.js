/**
 * Script de correction de l'UUID admin
 * Supprime l'ancien utilisateur et crée le nouveau avec le bon UUID Supabase
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CORRECT_SUPABASE_UUID = '75a3e2e0-bec1-4ef6-bdf1-6234448525b4';
const ADMIN_EMAIL = 'admin@ultimate.com';
const ADMIN_PASSWORD = 'Ultim@t+';
const WORKSPACE_BASE_ID = 'bb0acaee-5698-4160-bee5-d85bff72dbda';

async function main() {
  console.log('🔧 Correction de l\'UUID admin\n');

  // 1. Vérifier l'utilisateur actuel
  console.log('1️⃣ Recherche de l\'utilisateur admin actuel...');
  const currentAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL }
  });

  if (currentAdmin) {
    console.log('Utilisateur trouvé:', {
      id: currentAdmin.id,
      email: currentAdmin.email,
      role: currentAdmin.role
    });

    if (currentAdmin.id === CORRECT_SUPABASE_UUID) {
      console.log('✅ L\'UUID est déjà correct, aucune action nécessaire');
      return;
    }

    console.log('⚠️  UUID incorrect, correction nécessaire');
    console.log(`   Actuel: ${currentAdmin.id}`);
    console.log(`   Attendu: ${CORRECT_SUPABASE_UUID}`);

    // 2. Supprimer l'ancien utilisateur
    console.log('\n2️⃣ Suppression de l\'ancien utilisateur...');
    await prisma.user.delete({
      where: { id: currentAdmin.id }
    });
    console.log('✅ Ancien utilisateur supprimé');
  } else {
    console.log('ℹ️  Aucun utilisateur admin trouvé');
  }

  // 3. Créer le nouvel utilisateur avec le bon UUID
  console.log('\n3️⃣ Création du nouvel utilisateur avec le bon UUID...');
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  
  const newAdmin = await prisma.user.create({
    data: {
      id: CORRECT_SUPABASE_UUID,
      email: ADMIN_EMAIL,
      passwordHash: hashedPassword,
      nom: 'Admin',
      prenom: 'Ultimate',
      role: 'ADMIN',
      isActive: true,
    }
  });
  console.log('✅ Nouvel utilisateur créé:', {
    id: newAdmin.id,
    email: newAdmin.email,
    role: newAdmin.role
  });

  // 4. Vérifier/créer le workspace BASE
  console.log('\n4️⃣ Vérification du workspace BASE...');
  let baseWorkspace = await prisma.workspace.findUnique({
    where: { id: WORKSPACE_BASE_ID }
  });

  if (!baseWorkspace) {
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
    console.log('✅ Workspace BASE existe déjà');
  }

  // 5. Créer la liaison utilisateur <-> workspace
  console.log('\n5️⃣ Création de la liaison utilisateur <-> workspace...');
  const workspaceLink = await prisma.workspaceUser.create({
    data: {
      workspaceId: WORKSPACE_BASE_ID,
      userId: CORRECT_SUPABASE_UUID,
      role: 'MANAGER'
    }
  });
  console.log('✅ Liaison créée avec rôle MANAGER');

  // 6. Résumé final
  console.log('\n📊 Configuration finale:');
  console.log('─────────────────────────────────────────');
  console.log(`Email: ${newAdmin.email}`);
  console.log(`UUID Supabase: ${newAdmin.id}`);
  console.log(`Rôle: ${newAdmin.role}`);
  console.log(`Actif: ${newAdmin.isActive ? 'Oui' : 'Non'}`);
  console.log(`Workspace: ${baseWorkspace.name}`);
  console.log(`Rôle workspace: ${workspaceLink.role}`);
  console.log('─────────────────────────────────────────');

  console.log('\n✨ Correction terminée avec succès !');
  console.log('\n🧪 Vous pouvez maintenant tester la connexion sur:');
  console.log('   https://ultimate-frisbee-manager.vercel.app');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la correction:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
