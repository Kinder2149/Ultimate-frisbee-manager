/**
 * Migration complète et idempotent pour Ultimate Frisbee Manager
 * 
 * Ce script garantit que tous les éléments de base sont toujours présents :
 * - Compte admin
 * - Workspaces BASE et TEST
 * - Tags de base (corrigés si nécessaire)
 * 
 * Usage: node backend/scripts/migration-complete.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Configuration des éléments de base
const ADMIN_CONFIG = {
  email: 'admin@ultimate.com',
  password: 'Ultim@t+', // À changer en production
  nom: 'Admin',
  prenom: 'System',
  role: 'ADMIN'
};

const WORKSPACES_CONFIG = [
  { name: 'BASE', description: 'Workspace par défaut pour tous les utilisateurs' },
  { name: 'TEST', description: 'Workspace de test pour les développements' }
];

const TAGS_CONFIG = [
  // Objectifs
  { name: 'Technique', category: 'objectif' },
  { name: 'Tactique', category: 'objectif' },
  { name: 'Physique', category: 'objectif' },
  { name: 'Mental', category: 'objectif' },
  
  // Travail spécifique
  { name: 'Lancement', category: 'travail_specifique' },
  { name: 'Réception', category: 'travail_specifique' },
  { name: 'Pivot', category: 'travail_specifique' },
  
  // Niveaux
  { name: 'Débutant', category: 'niveau' },
  { name: 'Intermédiaire', category: 'niveau' },
  { name: 'Avancé', category: 'niveau' },
  
  // Temps
  { name: 'Court', category: 'temps' },
  { name: 'Moyen', category: 'temps' },
  { name: 'Long', category: 'temps' },
  
  // Formats
  { name: 'Solo', category: 'format' },
  { name: 'Paire', category: 'format' },
  { name: 'Groupe', category: 'format' },
  
  // Thèmes d'entraînement
  { name: 'Offensif', category: 'theme_entrainement' },
  { name: 'Défensif', category: 'theme_entrainement' },
  { name: 'Transition', category: 'theme_entrainement' },
  { name: 'Spécial', category: 'theme_entrainement' },
  { name: 'Conditionnement', category: 'theme_entrainement' }
];

async function createOrUpdateAdmin() {
  console.log('👤 Vérification du compte admin...');
  
  let admin = await prisma.user.findUnique({
    where: { email: ADMIN_CONFIG.email }
  });

  if (!admin) {
    console.log('  ➕ Création du compte admin...');
    const passwordHash = await bcrypt.hash(ADMIN_CONFIG.password, 10);
    
    admin = await prisma.user.create({
      data: {
        id: 'admin-system-uuid', // UUID fixe pour l'idempotence
        email: ADMIN_CONFIG.email,
        passwordHash,
        nom: ADMIN_CONFIG.nom,
        prenom: ADMIN_CONFIG.prenom,
        role: ADMIN_CONFIG.role,
        isActive: true
      }
    });
    console.log('  ✅ Admin créé:', admin.email);
  } else {
    console.log('  ✅ Admin existe déjà:', admin.email);
  }

  return admin;
}

async function createOrUpdateWorkspaces() {
  console.log('📁 Vérification des workspaces...');
  
  const workspaces = [];
  
  for (const wsConfig of WORKSPACES_CONFIG) {
    let workspace = await prisma.workspace.findFirst({
      where: { name: wsConfig.name }
    });

    if (!workspace) {
      console.log(`  ➕ Création du workspace ${wsConfig.name}...`);
      workspace = await prisma.workspace.create({
        data: {
          name: wsConfig.name,
          description: wsConfig.description
        }
      });
      console.log(`  ✅ Workspace ${wsConfig.name} créé (ID: ${workspace.id})`);
    } else {
      console.log(`  ✅ Workspace ${wsConfig.name} existe déjà (ID: ${workspace.id})`);
    }
    
    workspaces.push(workspace);
  }

  return workspaces;
}

async function createOrUpdateTags() {
  console.log('🏷️  Vérification des tags...');

  const tags = [];
  
  for (const tagConfig of TAGS_CONFIG) {
    let tag = await prisma.tag.findFirst({
      where: { 
        label: tagConfig.name,
        category: tagConfig.category
      }
    });

    if (!tag) {
      console.log(`  ➕ Création du tag ${tagConfig.name} (${tagConfig.category})...`);
      tag = await prisma.tag.create({
        data: {
          label: tagConfig.name,
          category: tagConfig.category
        }
      });
      console.log(`  ✅ Tag ${tagConfig.name} créé (ID: ${tag.id})`);
    } else {
      console.log(`  ✅ Tag ${tagConfig.name} existe déjà (ID: ${tag.id})`);
    }
    
    tags.push(tag);
  }

  return tags;
}

async function ensureAdminInWorkspaces(admin, workspaces) {
  console.log('🔗 Vérification des relations admin-workspaces...');
  
  for (const workspace of workspaces) {
    const existingRelation = await prisma.workspaceUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: admin.id
        }
      }
    });

    if (!existingRelation) {
      console.log(`  ➕ Ajout de l'admin au workspace ${workspace.name}...`);
      await prisma.workspaceUser.create({
        data: {
          workspaceId: workspace.id,
          userId: admin.id,
          role: 'ADMIN'
        }
      });
      console.log(`  ✅ Admin ajouté à ${workspace.name}`);
    } else {
      console.log(`  ✅ Admin déjà dans ${workspace.name}`);
    }
  }
}

async function generateReport() {
  console.log('\n📊 Rapport final de migration:');
  
  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.workspaceUser.count(),
    prisma.tag.count(),
    prisma.exercice.count(),
    prisma.entrainement.count(),
    prisma.echauffement.count(),
    prisma.situationMatch.count()
  ]);

  console.log(`  👥 Utilisateurs: ${stats[0]}`);
  console.log(`  📁 Workspaces: ${stats[1]}`);
  console.log(`  🔗 Relations workspace-user: ${stats[2]}`);
  console.log(`  🏷️  Tags: ${stats[3]}`);
  console.log(`  🏃 Exercices: ${stats[4]}`);
  console.log(`  📋 Entraînements: ${stats[5]}`);
  console.log(`  🔥 Échauffements: ${stats[6]}`);
  console.log(`  ⚽ Situations de match: ${stats[7]}`);
  
  // Vérification spécifique
  const admin = await prisma.user.findUnique({
    where: { email: ADMIN_CONFIG.email }
  });
  
  const baseWorkspace = await prisma.workspace.findFirst({
    where: { name: 'BASE' }
  });
  
  const testWorkspace = await prisma.workspace.findFirst({
    where: { name: 'TEST' }
  });
  
  console.log('\n🔍 Vérifications spécifiques:');
  console.log(`  👤 Admin: ${admin ? '✅' : '❌'} ${admin?.email || 'manquant'}`);
  console.log(`  📁 Workspace BASE: ${baseWorkspace ? '✅' : '❌'} ${baseWorkspace?.id || 'manquant'}`);
  console.log(`  📁 Workspace TEST: ${testWorkspace ? '✅' : '❌'} ${testWorkspace?.id || 'manquant'}`);
}

async function main() {
  console.log('🚀 Migration complète et idempotent - Ultimate Frisbee Manager');
  console.log('=' .repeat(60));
  
  try {
    // 1. Créer/Mettre à jour l'admin
    const admin = await createOrUpdateAdmin();
    
    // 2. Créer/Mettre à jour les workspaces
    const workspaces = await createOrUpdateWorkspaces();
    
    // 3. Créer/Mettre à jour les tags
    await createOrUpdateTags();
    
    // 4. Assurer l'admin est dans tous les workspaces
    await ensureAdminInWorkspaces(admin, workspaces);
    
    // 5. Générer le rapport
    await generateReport();
    
    console.log('\n✅ Migration terminée avec succès!');
    console.log('📝 Tous les éléments de base sont maintenant présents et configurés.');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
if (require.main === module) {
  main().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { main };
