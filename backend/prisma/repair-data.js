/**
 * Script de réparation des données critiques
 * À exécuter si les invariants sont violés après une migration
 */
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { verifyAllInvariants } = require('./verify-invariants');

const prisma = new PrismaClient();

// Catégories normalisées alignées avec @ufm/shared/constants/tag-categories
const TAG_CATEGORIES = {
  OBJECTIF: 'objectif',
  TRAVAIL_SPECIFIQUE: 'travail_specifique',
  NIVEAU: 'niveau',
  TEMPS: 'temps',
  FORMAT: 'format',
  THEME_ENTRAINEMENT: 'theme_entrainement',
};

/**
 * Réparer l'utilisateur admin
 */
async function repairAdmin() {
  console.log('🔧 Réparation utilisateur admin...');
  
  const adminEmail = 'admin@ultimate.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { 
      role: 'ADMIN', 
      isActive: true,
      nom: 'Admin',
      prenom: 'Ultimate'
    },
    create: { 
      id: uuidv4(), 
      email: adminEmail, 
      nom: 'Admin', 
      prenom: 'Ultimate', 
      role: 'ADMIN', 
      isActive: true 
    },
  });
  
  console.log(`✅ Admin réparé: ${admin.email} (role: ${admin.role})`);
  return admin;
}

/**
 * Réparer le workspace BASE
 */
async function repairBaseWorkspace() {
  console.log('🔧 Réparation workspace BASE...');
  
  let baseWorkspace = await prisma.workspace.findFirst({ 
    where: { isBase: true } 
  });
  
  if (!baseWorkspace) {
    baseWorkspace = await prisma.workspace.create({
      data: {
        id: uuidv4(),
        name: 'BASE',
        isBase: true,
      },
    });
    console.log(`✅ Workspace BASE créé: ${baseWorkspace.name}`);
  } else {
    console.log(`✅ Workspace BASE existant: ${baseWorkspace.name}`);
  }
  
  return baseWorkspace;
}

/**
 * Réparer l'association admin ↔ workspace BASE
 */
async function repairAdminWorkspaceAccess(admin, baseWorkspace) {
  console.log('🔧 Réparation accès admin au workspace BASE...');
  
  const workspaceUser = await prisma.workspaceUser.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: baseWorkspace.id,
        userId: admin.id,
      },
    },
    update: { role: 'MANAGER' },
    create: {
      id: uuidv4(),
      workspaceId: baseWorkspace.id,
      userId: admin.id,
      role: 'MANAGER',
    },
  });
  
  console.log(`✅ Admin associé au workspace BASE avec rôle ${workspaceUser.role}`);
  return workspaceUser;
}

/**
 * Réparer les tags de base
 */
async function repairBaseTags(baseWorkspace) {
  console.log('🔧 Réparation tags de base...');
  
  const tagsToCreate = [
    // Objectif
    { label: 'Échauffement', category: TAG_CATEGORIES.OBJECTIF, color: '#4285F4' },
    { label: 'Technique', category: TAG_CATEGORIES.OBJECTIF, color: '#34A853' },
    { label: 'Tactique', category: TAG_CATEGORIES.OBJECTIF, color: '#FBBC05' },
    { label: 'Physique', category: TAG_CATEGORIES.OBJECTIF, color: '#EA4335' },
    // Travail Spécifique
    { label: 'Passes', category: TAG_CATEGORIES.TRAVAIL_SPECIFIQUE, color: '#9C27B0' },
    { label: 'Réceptions', category: TAG_CATEGORIES.TRAVAIL_SPECIFIQUE, color: '#FF9800' },
    { label: 'Défense', category: TAG_CATEGORIES.TRAVAIL_SPECIFIQUE, color: '#F44336' },
    // Niveau
    { label: 'Débutant', category: TAG_CATEGORIES.NIVEAU, color: '#4CAF50', level: 1 },
    { label: 'Intermédiaire', category: TAG_CATEGORIES.NIVEAU, color: '#FF9800', level: 2 },
    { label: 'Avancé', category: TAG_CATEGORIES.NIVEAU, color: '#F44336', level: 3 },
    // Temps
    { label: '5-10 min', category: TAG_CATEGORIES.TEMPS, color: '#00BCD4' },
    { label: '10-15 min', category: TAG_CATEGORIES.TEMPS, color: '#009688' },
    { label: '15-30 min', category: TAG_CATEGORIES.TEMPS, color: '#795548' },
    // Format
    { label: 'Individuel', category: TAG_CATEGORIES.FORMAT, color: '#607D8B' },
    { label: 'Binôme', category: TAG_CATEGORIES.FORMAT, color: '#3F51B5' },
    { label: 'Équipe', category: TAG_CATEGORIES.FORMAT, color: '#E91E63' },
    // Thème Entraînement
    { label: 'Endurance', category: TAG_CATEGORIES.THEME_ENTRAINEMENT, color: '#FF5722' },
    { label: 'Vitesse', category: TAG_CATEGORIES.THEME_ENTRAINEMENT, color: '#E91E63' },
    { label: 'Coordination', category: TAG_CATEGORIES.THEME_ENTRAINEMENT, color: '#9C27B0' },
    { label: 'Stratégie', category: TAG_CATEGORIES.THEME_ENTRAINEMENT, color: '#673AB7' },
    { label: 'Mental', category: TAG_CATEGORIES.THEME_ENTRAINEMENT, color: '#3F51B5' },
  ];
  
  let createdCount = 0;
  let updatedCount = 0;
  
  for (const tagData of tagsToCreate) {
    try {
      const existing = await prisma.tag.findUnique({
        where: { 
          workspaceId_label_category: { 
            workspaceId: baseWorkspace.id, 
            label: tagData.label, 
            category: tagData.category 
          } 
        }
      });
      
      if (existing) {
        await prisma.tag.update({
          where: { id: existing.id },
          data: { color: tagData.color, level: tagData.level }
        });
        updatedCount++;
      } else {
        await prisma.tag.create({
          data: { 
            ...tagData, 
            id: uuidv4(), 
            workspaceId: baseWorkspace.id 
          }
        });
        createdCount++;
      }
    } catch (e) {
      console.error(`❌ Erreur tag '${tagData.label}': ${e.message}`);
    }
  }
  
  console.log(`✅ Tags réparés: ${createdCount} créé(s), ${updatedCount} mis à jour`);
}

/**
 * Réparation complète
 */
async function repairAll() {
  console.log('🔧 Démarrage de la réparation des données critiques...\n');
  
  try {
    // 1. Réparer admin
    const admin = await repairAdmin();
    
    // 2. Réparer workspace BASE
    const baseWorkspace = await repairBaseWorkspace();
    
    // 3. Réparer accès admin
    await repairAdminWorkspaceAccess(admin, baseWorkspace);
    
    // 4. Réparer tags
    await repairBaseTags(baseWorkspace);
    
    console.log('\n✅ Réparation terminée avec succès !');
    console.log('\n🔍 Vérification des invariants...\n');
    
    // 5. Vérifier que tout est OK
    const success = await verifyAllInvariants();
    
    if (success) {
      console.log('\n🎉 Toutes les données critiques sont restaurées !');
    } else {
      console.error('\n⚠️ Certains invariants ne sont toujours pas respectés');
    }
    
    return success;
  } catch (error) {
    console.error('\n❌ Erreur lors de la réparation:', error);
    return false;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  repairAll()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((e) => {
      console.error('❌ Erreur fatale:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { 
  repairAll,
  repairAdmin,
  repairBaseWorkspace,
  repairAdminWorkspaceAccess,
  repairBaseTags
};
