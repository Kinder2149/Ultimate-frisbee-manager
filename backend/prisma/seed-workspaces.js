/**
 * Script de seed pour initialiser les workspaces BASE et TEST
 * 
 * - BASE : accessible à tous les utilisateurs (modèle pour créer d'autres workspaces)
 * - TEST : réservé aux administrateurs
 * 
 * Tags créés dans BASE :
 * - Catégorie "type_action" : Attaque, Défense
 * - Catégorie "temps" : Court (5-10min), Moyen (10-20min), Long (20-30min)
 * 
 * Usage : node prisma/seed-workspaces.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// IDs fixes pour l'idempotence
const WORKSPACE_BASE_ID = 'bb0acaee-5698-4160-bee5-d85bff72dbda';
const WORKSPACE_TEST_ID = '37dbb7b9-6021-4c6d-a3db-08e694d5261e';

// Tags à créer dans le workspace BASE
const BASE_TAGS = [
  // Type d'action
  { label: 'Attaque', category: 'type_action', color: '#4CAF50' },
  { label: 'Défense', category: 'type_action', color: '#F44336' },
  // Durée
  { label: 'Court (5-10min)', category: 'temps', color: '#03A9F4' },
  { label: 'Moyen (10-20min)', category: 'temps', color: '#FF9800' },
  { label: 'Long (20-30min)', category: 'temps', color: '#9C27B0' },
];

async function main() {
  console.log('🚀 Initialisation des workspaces BASE et TEST...\n');

  // 1. Vérifier/créer workspace BASE
  let baseWs = await prisma.workspace.findUnique({ where: { id: WORKSPACE_BASE_ID } });
  if (!baseWs) {
    const existingByName = await prisma.workspace.findMany({
      where: { name: 'BASE' },
      orderBy: { createdAt: 'asc' },
    });
    baseWs = existingByName[0] || null;
  }

  if (!baseWs) {
    baseWs = await prisma.workspace.upsert({
      where: { id: WORKSPACE_BASE_ID },
      update: { isBase: true },
      create: { id: WORKSPACE_BASE_ID, name: 'BASE', isBase: true },
    });
    console.log('✅ Workspace BASE créé');
  } else {
    if (baseWs.isBase !== true) {
      baseWs = await prisma.workspace.update({
        where: { id: baseWs.id },
        data: { isBase: true },
      });
    }
    console.log('✅ Workspace BASE existe déjà');
  }

  // 2. Vérifier/créer workspace TEST
  let testWs = await prisma.workspace.findUnique({ where: { id: WORKSPACE_TEST_ID } });
  if (!testWs) {
    testWs = await prisma.workspace.upsert({
      where: { id: WORKSPACE_TEST_ID },
      update: {},
      create: { id: WORKSPACE_TEST_ID, name: 'TEST' },
    });
    console.log('✅ Workspace TEST créé');
  } else {
    console.log('✅ Workspace TEST existe déjà');
  }

  // 3. Créer les tags dans BASE (idempotent via upsert sur label+category)
  console.log('\n📝 Création des tags dans BASE...');
  for (const tagData of BASE_TAGS) {
    const existing = await prisma.tag.findFirst({
      where: {
        label: tagData.label,
        category: tagData.category,
        workspaceId: baseWs.id,
      },
    });

    if (!existing) {
      await prisma.tag.create({
        data: {
          ...tagData,
          workspaceId: baseWs.id,
        },
      });
      console.log(`  ✅ Tag créé: ${tagData.label} (${tagData.category})`);
    } else {
      console.log(`  ⏭️  Tag existe: ${tagData.label} (${tagData.category})`);
    }
  }

  // 4. Lier tous les utilisateurs existants à BASE (s'ils ne sont pas déjà liés)
  console.log('\n👥 Liaison des utilisateurs aux workspaces...');
  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    // Lier à BASE (tous les users)
    const baseLink = await prisma.workspaceUser.findUnique({
      where: { workspaceId_userId: { workspaceId: baseWs.id, userId: user.id } },
    });
    if (!baseLink) {
      await prisma.workspaceUser.create({
        data: {
          workspaceId: baseWs.id,
          userId: user.id,
          role: 'MEMBER', // Rôle MEMBER par défaut dans BASE
        },
      });
      console.log(`  ✅ ${user.email} lié à BASE`);
    } else {
      console.log(`  ⏭️  ${user.email} déjà lié à BASE`);
    }

    // Lier à TEST uniquement si ADMIN
    const isAdmin = String(user.role).toUpperCase() === 'ADMIN';
    if (isAdmin) {
      const testLink = await prisma.workspaceUser.findUnique({
        where: { workspaceId_userId: { workspaceId: WORKSPACE_TEST_ID, userId: user.id } },
      });
      if (!testLink) {
        await prisma.workspaceUser.create({
          data: {
            workspaceId: WORKSPACE_TEST_ID,
            userId: user.id,
            role: 'MANAGER',
          },
        });
        console.log(`  ✅ ${user.email} (ADMIN) lié à TEST`);
      } else {
        console.log(`  ⏭️  ${user.email} (ADMIN) déjà lié à TEST`);
      }
    }
  }

  // 5. Afficher le résumé
  console.log('\n📊 Résumé:');
  const baseMembers = await prisma.workspaceUser.count({ where: { workspaceId: baseWs.id } });
  const testMembers = await prisma.workspaceUser.count({ where: { workspaceId: WORKSPACE_TEST_ID } });
  const baseTags = await prisma.tag.count({ where: { workspaceId: baseWs.id } });

  console.log(`  - Workspace BASE: ${baseMembers} membres, ${baseTags} tags`);
  console.log(`  - Workspace TEST: ${testMembers} membres (admins uniquement)`);
  console.log('\n✨ Initialisation terminée !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
