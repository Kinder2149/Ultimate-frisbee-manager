/**
 * Script de vérification et seed pour l'authentification
 * Vérifie l'existence du compte admin et du workspace BASE
 * Crée les entités manquantes si nécessaire
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification de la base de données...\n');

  // 1. Vérifier les migrations
  console.log('📊 État de la base de données:');
  try {
    const userCount = await prisma.user.count();
    const workspaceCount = await prisma.workspace.count();
    console.log(`  ✅ Connexion réussie`);
    console.log(`  📝 ${userCount} utilisateur(s) en base`);
    console.log(`  📁 ${workspaceCount} workspace(s) en base\n`);
  } catch (error) {
    console.error('  ❌ Erreur de connexion à la base:', error.message);
    process.exit(1);
  }

  // 2. Vérifier le workspace BASE
  console.log('📁 Vérification du workspace BASE...');
  let baseWorkspace = await prisma.workspace.findFirst({
    where: { name: 'BASE' }
  });

  if (!baseWorkspace) {
    console.log('  ⚠️  Workspace BASE non trouvé, création...');
    baseWorkspace = await prisma.workspace.create({
      data: {
        name: 'BASE'
      }
    });
    console.log(`  ✅ Workspace BASE créé (ID: ${baseWorkspace.id})`);
  } else {
    console.log(`  ✅ Workspace BASE existe (ID: ${baseWorkspace.id})`);
  }

  // 3. Vérifier le compte admin
  console.log('\n👤 Vérification du compte admin...');
  const adminEmail = 'admin@ultimate.com';
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: {
      workspaces: {
        include: {
          workspace: true
        }
      }
    }
  });

  if (!adminUser) {
    console.log('  ⚠️  Compte admin non trouvé, création...');
    
    // Générer un mot de passe aléatoire (l'admin utilisera Supabase)
    const randomPassword = `admin-${Math.random().toString(36).slice(2)}`;
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    // Créer l'utilisateur admin
    adminUser = await prisma.user.create({
      data: {
        id: 'admin-local-' + Date.now(), // ID temporaire, sera remplacé par Supabase ID
        email: adminEmail,
        nom: 'Admin',
        prenom: 'Ultimate',
        passwordHash,
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log(`  ✅ Compte admin créé (ID: ${adminUser.id})`);

    // Ajouter au workspace BASE
    await prisma.workspaceUser.create({
      data: {
        workspaceId: baseWorkspace.id,
        userId: adminUser.id,
        role: 'OWNER'
      }
    });
    console.log(`  ✅ Admin ajouté au workspace BASE avec rôle OWNER`);
  } else {
    console.log(`  ✅ Compte admin existe (ID: ${adminUser.id})`);
    console.log(`     Email: ${adminUser.email}`);
    console.log(`     Rôle: ${adminUser.role}`);
    console.log(`     Actif: ${adminUser.isActive}`);

    // Vérifier si l'admin est dans le workspace BASE
    const isInBase = adminUser.workspaces.some(
      wu => wu.workspace.name === 'BASE'
    );

    if (!isInBase) {
      console.log('  ⚠️  Admin non lié au workspace BASE, ajout...');
      await prisma.workspaceUser.create({
        data: {
          workspaceId: baseWorkspace.id,
          userId: adminUser.id,
          role: 'OWNER'
        }
      });
      console.log('  ✅ Admin ajouté au workspace BASE');
    } else {
      console.log('  ✅ Admin déjà dans le workspace BASE');
    }
  }

  // 4. Statistiques finales
  console.log('\n📊 Statistiques finales:');
  const stats = {
    users: await prisma.user.count(),
    workspaces: await prisma.workspace.count(),
    workspaceUsers: await prisma.workspaceUser.count(),
    exercices: await prisma.exercice.count(),
    entrainements: await prisma.entrainement.count(),
    echauffements: await prisma.echauffement.count(),
    situationsMatch: await prisma.situationMatch.count(),
    tags: await prisma.tag.count()
  };

  console.log(`  👥 Utilisateurs: ${stats.users}`);
  console.log(`  📁 Workspaces: ${stats.workspaces}`);
  console.log(`  🔗 Relations workspace-user: ${stats.workspaceUsers}`);
  console.log(`  🏃 Exercices: ${stats.exercices}`);
  console.log(`  📋 Entraînements: ${stats.entrainements}`);
  console.log(`  🔥 Échauffements: ${stats.echauffements}`);
  console.log(`  ⚽ Situations de match: ${stats.situationsMatch}`);
  console.log(`  🏷️  Tags: ${stats.tags}`);

  console.log('\n✅ Vérification terminée avec succès!\n');
}

main()
  .catch((error) => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
