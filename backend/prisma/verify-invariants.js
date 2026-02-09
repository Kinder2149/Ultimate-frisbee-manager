/**
 * Script de vérification des invariants métier
 * À exécuter après chaque migration pour garantir l'intégrité des données critiques
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Invariant ADM-1 : Au moins 1 admin actif
 */
async function verifyAdminExists() {
  const admins = await prisma.user.findMany({
    where: { 
      role: 'ADMIN', 
      isActive: true 
    }
  });
  
  const adminCount = admins.length;
  
  if (adminCount === 0) {
    throw new Error('❌ INVARIANT ADM-1 VIOLATED: Aucun admin actif trouvé');
  }
  
  console.log(`✅ ADM-1: ${adminCount} admin(s) actif(s) trouvé(s)`);
  return true;
}

/**
 * Invariant WS-1 : Workspace BASE existe
 */
async function verifyBaseWorkspaceExists() {
  const baseWorkspace = await prisma.workspace.findFirst({
    where: { isBase: true }
  });
  
  if (!baseWorkspace) {
    throw new Error('❌ INVARIANT WS-1 VIOLATED: Workspace BASE introuvable');
  }
  
  console.log(`✅ WS-1: Workspace BASE trouvé (id: ${baseWorkspace.id}, name: ${baseWorkspace.name})`);
  return baseWorkspace;
}

/**
 * Invariant TAG-1 : Tags de base présents (minimum 20)
 */
async function verifyBaseTags(baseWorkspace) {
  const tagCount = await prisma.tag.count({
    where: { workspaceId: baseWorkspace.id }
  });
  
  const MIN_TAGS = 20;
  if (tagCount < MIN_TAGS) {
    throw new Error(`❌ INVARIANT TAG-1 VIOLATED: ${tagCount} tags trouvés, minimum ${MIN_TAGS} requis`);
  }
  
  console.log(`✅ TAG-1: ${tagCount} tags trouvés dans workspace BASE`);
  return true;
}

/**
 * Invariant AUTH-1 : Admin a accès au workspace BASE avec rôle MANAGER
 */
async function verifyAdminHasAccessToBase(baseWorkspace) {
  const adminWorkspace = await prisma.workspaceUser.findFirst({
    where: {
      workspaceId: baseWorkspace.id,
      user: { 
        role: 'ADMIN',
        isActive: true
      },
      role: 'MANAGER'
    },
    include: {
      user: true
    }
  });
  
  if (!adminWorkspace) {
    throw new Error('❌ INVARIANT AUTH-1 VIOLATED: Aucun admin avec rôle MANAGER dans workspace BASE');
  }
  
  console.log(`✅ AUTH-1: Admin ${adminWorkspace.user.email} a accès BASE avec rôle MANAGER`);
  return true;
}

/**
 * Vérification complète de tous les invariants
 */
async function verifyAllInvariants() {
  console.log('🔍 Vérification des invariants métier...\n');
  
  try {
    // ADM-1
    await verifyAdminExists();
    
    // WS-1
    const baseWorkspace = await verifyBaseWorkspaceExists();
    
    // TAG-1
    await verifyBaseTags(baseWorkspace);
    
    // AUTH-1
    await verifyAdminHasAccessToBase(baseWorkspace);
    
    console.log('\n✅ Tous les invariants sont respectés !');
    return true;
  } catch (error) {
    console.error('\n❌ Échec de vérification des invariants:');
    console.error(error.message);
    return false;
  }
}

/**
 * Afficher un rapport détaillé de l'état des données
 */
async function generateReport() {
  console.log('\n📊 Rapport détaillé:\n');
  
  // Utilisateurs
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
  console.log('👥 Utilisateurs:');
  users.forEach(u => {
    console.log(`  - ${u.email}: ${u.role} (${u.isActive ? 'actif' : 'inactif'}) - ${u._count.workspaces} workspace(s)`);
  });
  
  // Workspaces
  const workspaces = await prisma.workspace.findMany({
    select: {
      name: true,
      isBase: true,
      _count: {
        select: { 
          members: true,
          tags: true,
          exercices: true
        }
      }
    }
  });
  console.log('\n🗂️  Workspaces:');
  workspaces.forEach(w => {
    console.log(`  - ${w.name} ${w.isBase ? '(BASE)' : ''}: ${w._count.members} membre(s), ${w._count.tags} tag(s), ${w._count.exercices} exercice(s)`);
  });
  
  // Tags par catégorie
  const baseWorkspace = await prisma.workspace.findFirst({ where: { isBase: true } });
  if (baseWorkspace) {
    const tagsByCategory = await prisma.tag.groupBy({
      by: ['category'],
      where: { workspaceId: baseWorkspace.id },
      _count: true
    });
    console.log('\n🏷️  Tags par catégorie (BASE):');
    tagsByCategory.forEach(t => {
      console.log(`  - ${t.category}: ${t._count} tag(s)`);
    });
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  verifyAllInvariants()
    .then(async (success) => {
      if (success) {
        await generateReport();
      }
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
  verifyAllInvariants,
  verifyAdminExists,
  verifyBaseWorkspaceExists,
  verifyBaseTags,
  verifyAdminHasAccessToBase,
  generateReport
};
