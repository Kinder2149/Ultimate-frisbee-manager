const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Démarrage du script de migration de variablesText...');

  const exercices = await prisma.exercice.findMany({
    where: {
      variablesText: {
        not: null
      }
    }
  });

  if (exercices.length === 0) {
    console.log('Aucun exercice avec des données dans variablesText à migrer. Terminé.');
    return;
  }

  console.log(`${exercices.length} exercices à traiter.`);

  let updatedCount = 0;

  for (const exercice of exercices) {
    try {
      const oldVars = JSON.parse(exercice.variablesText);
      const updateData = {};
      let notesToMerge = [];

      // Fusionner les anciens champs textuels dans le champ 'notes'
      if (oldVars.consignes) notesToMerge.push(`Consignes: ${oldVars.consignes}`);
      if (oldVars.pointsAttention) notesToMerge.push(`Points d'attention: ${oldVars.pointsAttention}`);
      if (oldVars.objectifsPedagogiques) notesToMerge.push(`Objectifs pédagogiques: ${oldVars.objectifsPedagogiques}`);

      if (notesToMerge.length > 0) {
        const mergedNotes = notesToMerge.join('\n\n');
        // Préserve les notes existantes si elles existent
        updateData.notes = exercice.notes ? `${exercice.notes}\n\n--- (Données migrées) ---\n${mergedNotes}` : mergedNotes;
      }

      // Migrer le matériel si le champ actuel est vide
      if (oldVars.materiel && !exercice.materiel) {
        updateData.materiel = oldVars.materiel;
      }

      // Si des changements sont nécessaires, mettre à jour l'exercice
      if (Object.keys(updateData).length > 0) {
        await prisma.exercice.update({
          where: { id: exercice.id },
          data: updateData
        });
        console.log(`Exercice '${exercice.nom}' (ID: ${exercice.id}) mis à jour.`);
        updatedCount++;
      }

    } catch (error) {
      console.error(`Erreur lors du traitement de l'exercice ID ${exercice.id}:`, error.message);
      console.log(`Contenu de variablesText pour cet exercice:`, exercice.variablesText);
    }
  }

  console.log(`Migration terminée. ${updatedCount} exercices ont été mis à jour.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
