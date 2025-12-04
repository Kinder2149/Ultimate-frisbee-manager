const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function isUuidV4(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

async function main() {
  console.log('--- Audit SituationMatch / Entrainement IDs ---');

  const situations = await prisma.situationMatch.findMany();
  const invalidSituations = situations.filter((s) => !isUuidV4(s.id));

  console.log(`Total SituationMatch: ${situations.length}`);
  console.log(`SituationMatch avec id non-UUID v4: ${invalidSituations.length}`);

  if (invalidSituations.length === 0) {
    console.log('Aucune correction nécessaire.');
    return;
  }

  console.log('Liste des SituationMatch non conformes:');
  invalidSituations.forEach((s) => {
    console.log(` - id="${s.id}", nom="${s.nom}", type="${s.type}"`);
  });

  console.log('\n--- Préparation de la migration (simulation) ---');

  for (const situation of invalidSituations) {
    const usages = await prisma.entrainement.findMany({
      where: { situationMatchId: situation.id },
      select: { id: true, titre: true },
    });

    console.log(`\nSituationMatch id="${situation.id}" est utilisé par ${usages.length} entrainement(s):`);
    usages.forEach((e) => {
      console.log(`   - Entrainement id="${e.id}", titre="${e.titre}"`);
    });

    console.log('  -> Étapes de correction proposées (à adapter si vous exécutez réellement) :');
    console.log('     1. Générer un nouvel UUID v4 pour cette situation.');
    console.log('     2. Mettre à jour tous les Entrainement.situationMatchId qui pointent vers l\'ancien id.');
    console.log('     3. Mettre à jour la SituationMatch elle-même avec le nouvel id.');
  }

  console.log('\nCe script est uniquement un audit/guide. Pour une migration automatique, il faudra ajouter le code de mise à jour transactionnelle.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
