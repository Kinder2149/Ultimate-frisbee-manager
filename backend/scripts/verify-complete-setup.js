/**
 * Script de vérification complète de l'état du projet
 * 
 * Vérifie :
 * - Utilisateurs et authentification
 * - Workspaces et membres
 * - Tags et leur association
 * - Configuration générale
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 VÉRIFICATION COMPLÈTE DU PROJET\n');
  console.log('='.repeat(60));

  const issues = [];
  const warnings = [];

  try {
    // 1. UTILISATEURS
    console.log('\n👥 1. UTILISATEURS');
    console.log('-'.repeat(60));
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        workspaces: {
          select: {
            workspace: {
              select: { name: true }
            },
            role: true
          }
        }
      }
    });

    console.log(`Total: ${users.length} utilisateurs\n`);
    
    users.forEach(user => {
      const status = user.isActive ? '✅' : '❌';
      console.log(`${status} ${user.email} (${user.role})`);
      if (user.workspaces.length === 0) {
        console.log(`   ⚠️  Aucun workspace associé`);
        warnings.push(`${user.email} n'a aucun workspace`);
      } else {
        user.workspaces.forEach(ws => {
          console.log(`   → ${ws.workspace.name} (${ws.role})`);
        });
      }
    });

    // 2. WORKSPACES
    console.log('\n\n🏢 2. WORKSPACES');
    console.log('-'.repeat(60));
    
    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            tags: true,
            members: true,
            exercices: true,
            entrainements: true,
            echauffements: true,
            situationsMatch: true
          }
        }
      }
    });

    console.log(`Total: ${workspaces.length} workspaces\n`);
    
    workspaces.forEach(ws => {
      console.log(`📁 ${ws.name} (ID: ${ws.id.substring(0, 8)}...)`);
      console.log(`   Membres: ${ws._count.members}`);
      console.log(`   Tags: ${ws._count.tags}`);
      console.log(`   Exercices: ${ws._count.exercices}`);
      console.log(`   Entraînements: ${ws._count.entrainements}`);
      console.log(`   Échauffements: ${ws._count.echauffements}`);
      console.log(`   Situations: ${ws._count.situationsMatch}\n`);

      if (ws._count.tags === 0) {
        warnings.push(`Workspace ${ws.name} n'a aucun tag`);
      }
      if (ws._count.members === 0) {
        warnings.push(`Workspace ${ws.name} n'a aucun membre`);
      }
    });

    // Vérifier les doublons de workspace
    const workspaceNames = workspaces.map(ws => ws.name);
    const duplicates = workspaceNames.filter((name, index) => workspaceNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      issues.push(`Workspaces en doublon détectés: ${[...new Set(duplicates)].join(', ')}`);
    }

    // 3. TAGS
    console.log('\n📝 3. TAGS');
    console.log('-'.repeat(60));
    
    const tags = await prisma.tag.findMany({
      select: {
        category: true,
        workspaceId: true
      }
    });

    console.log(`Total: ${tags.length} tags\n`);

    // Grouper par catégorie
    const tagsByCategory = tags.reduce((acc, tag) => {
      if (!acc[tag.category]) acc[tag.category] = 0;
      acc[tag.category]++;
      return acc;
    }, {});

    console.log('Par catégorie:');
    Object.entries(tagsByCategory).sort().forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} tags`);
    });

    // Vérifier les tags orphelins
    const orphanTags = tags.filter(tag => !tag.workspaceId);
    if (orphanTags.length > 0) {
      issues.push(`${orphanTags.length} tags sans workspace`);
    }

    // Catégories attendues
    const expectedCategories = [
      'objectif',
      'travail_specifique',
      'niveau',
      'temps',
      'format',
      'theme_entrainement'
    ];

    console.log('\n\nCatégories attendues:');
    expectedCategories.forEach(cat => {
      const count = tagsByCategory[cat] || 0;
      const status = count > 0 ? '✅' : '❌';
      console.log(`   ${status} ${cat}: ${count} tags`);
      if (count === 0) {
        warnings.push(`Aucun tag dans la catégorie ${cat}`);
      }
    });

    // 4. CONFIGURATION
    console.log('\n\n⚙️  4. CONFIGURATION');
    console.log('-'.repeat(60));

    const requiredEnvVars = [
      'DATABASE_URL',
      'SUPABASE_PROJECT_REF',
      'SUPABASE_URL',
      'SUPABASE_JWT_SECRET',
      'SUPABASE_SERVICE_ROLE_KEY',
      'CLOUDINARY_URL',
      'CORS_ORIGINS'
    ];

    console.log('Variables d\'environnement:\n');
    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        const displayValue = varName.includes('SECRET') || varName.includes('KEY') || varName.includes('URL')
          ? `${value.substring(0, 20)}...`
          : value;
        console.log(`   ✅ ${varName}: ${displayValue}`);
      } else {
        console.log(`   ❌ ${varName}: NON DÉFINIE`);
        issues.push(`Variable d'environnement ${varName} manquante`);
      }
    });

    // 5. RÉSUMÉ
    console.log('\n\n📊 5. RÉSUMÉ');
    console.log('='.repeat(60));

    console.log(`\n✅ Utilisateurs: ${users.length}`);
    console.log(`✅ Workspaces: ${workspaces.length}`);
    console.log(`✅ Tags: ${tags.length}`);
    console.log(`✅ Catégories de tags: ${Object.keys(tagsByCategory).length}/${expectedCategories.length}`);

    // Afficher les problèmes
    if (issues.length > 0) {
      console.log('\n\n❌ PROBLÈMES CRITIQUES:');
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    if (warnings.length > 0) {
      console.log('\n\n⚠️  AVERTISSEMENTS:');
      warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    if (issues.length === 0 && warnings.length === 0) {
      console.log('\n\n🎉 TOUT EST CLEAN ! Aucun problème détecté.');
    }

    console.log('\n' + '='.repeat(60));

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
