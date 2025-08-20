const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { TAG_CATEGORIES } = require('../../shared/constants/tag-categories');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Supprimer les données existantes (avec gestion d'erreur)
  try {
    await prisma.entrainementExercice.deleteMany();
  } catch (e) {
    console.log('⚠️ Table EntrainementExercice non trouvée, ignorée');
  }
  
  try {
    await prisma.exercice.deleteMany();
  } catch (e) {
    console.log('⚠️ Table Exercice non trouvée, ignorée');
  }
  
  try {
    await prisma.tag.deleteMany();
  } catch (e) {
    console.log('⚠️ Table Tag non trouvée, ignorée');
  }
  
  try {
    await prisma.entrainement.deleteMany();
  } catch (e) {
    console.log('⚠️ Table Entrainement non trouvée, ignorée');
  }

  console.log('📝 Création des tags...');

  // Tags Objectif
  const objectifTags = await Promise.all([
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Échauffement',
        category: TAG_CATEGORIES.OBJECTIF,
        color: '#4285F4'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Technique',
        category: TAG_CATEGORIES.OBJECTIF,
        color: '#34A853'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Tactique',
        category: TAG_CATEGORIES.OBJECTIF,
        color: '#FBBC05'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Physique',
        category: TAG_CATEGORIES.OBJECTIF,
        color: '#EA4335'
      }
    })
  ]);

  // Tags Travail Spécifique
  const travailTags = await Promise.all([
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Passes',
        category: TAG_CATEGORIES.TRAVAIL_SPECIFIQUE,
        color: '#9C27B0'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Réceptions',
        category: TAG_CATEGORIES.TRAVAIL_SPECIFIQUE,
        color: '#FF9800'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Défense',
        category: TAG_CATEGORIES.TRAVAIL_SPECIFIQUE,
        color: '#F44336'
      }
    })
  ]);

  // Tags Niveau
  const niveauTags = await Promise.all([
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Débutant',
        category: TAG_CATEGORIES.NIVEAU,
        color: '#4CAF50',
        level: 1
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Intermédiaire',
        category: TAG_CATEGORIES.NIVEAU,
        color: '#FF9800',
        level: 2
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Avancé',
        category: TAG_CATEGORIES.NIVEAU,
        color: '#F44336',
        level: 3
      }
    })
  ]);

  // Tags Temps
  const tempsTags = await Promise.all([
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: '5-10 min',
        category: TAG_CATEGORIES.TEMPS,
        color: '#00BCD4'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: '10-15 min',
        category: TAG_CATEGORIES.TEMPS,
        color: '#009688'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: '15-30 min',
        category: TAG_CATEGORIES.TEMPS,
        color: '#795548'
      }
    })
  ]);

  // Tags Format
  const formatTags = await Promise.all([
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Individuel',
        category: TAG_CATEGORIES.FORMAT,
        color: '#607D8B'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Binôme',
        category: TAG_CATEGORIES.FORMAT,
        color: '#3F51B5'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Équipe',
        category: TAG_CATEGORIES.FORMAT,
        color: '#E91E63'
      }
    })
  ]);

  // Tags Thème Entraînement
  const themeEntrainementTags = await Promise.all([
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Endurance',
        category: TAG_CATEGORIES.THEME_ENTRAINEMENT,
        color: '#FF5722'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Vitesse',
        category: TAG_CATEGORIES.THEME_ENTRAINEMENT,
        color: '#E91E63'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Coordination',
        category: TAG_CATEGORIES.THEME_ENTRAINEMENT,
        color: '#9C27B0'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Stratégie',
        category: TAG_CATEGORIES.THEME_ENTRAINEMENT,
        color: '#673AB7'
      }
    }),
    prisma.tag.create({
      data: {
        id: uuidv4(),
        label: 'Mental',
        category: TAG_CATEGORIES.THEME_ENTRAINEMENT,
        color: '#3F51B5'
      }
    })
  ]);

  console.log('🏃 Création des exercices...');

  // Exercices d'exemple
  const exercice1 = await prisma.exercice.create({
    data: {
      id: uuidv4(),
      nom: 'Passes courtes en triangle',
      description: 'Exercice de passes courtes en triangle pour travailler la précision et la fluidité.',
      variablesPlus: 'Distance entre joueurs\nNombre de passes',
      variablesMinus: 'Temps de possession\nErreurs tolérées',
      schemaUrl: '',
      imageUrl: '',
      tags: {
        connect: [
          { id: objectifTags[1].id }, // Technique
          { id: travailTags[0].id },  // Passes
          { id: niveauTags[0].id },   // Débutant
          { id: tempsTags[0].id },    // 5-10 min
          { id: formatTags[2].id }    // Équipe
        ]
      }
    }
  });

  const exercice2 = await prisma.exercice.create({
    data: {
      id: uuidv4(),
      nom: 'Défense homme à homme',
      description: 'Exercice pour apprendre les bases de la défense individuelle.',
      variablesPlus: 'Intensité\nTaille du terrain',
      variablesMinus: 'Nombre d\'attaquants\nTemps d\'exercice',
      schemaUrl: '',
      imageUrl: '',
      tags: {
        connect: [
          { id: objectifTags[2].id }, // Tactique
          { id: travailTags[2].id },  // Défense
          { id: niveauTags[1].id },   // Intermédiaire
          { id: tempsTags[1].id },    // 10-15 min
          { id: formatTags[2].id }    // Équipe
        ]
      }
    }
  });

  const exercice3 = await prisma.exercice.create({
    data: {
      id: uuidv4(),
      nom: 'Échauffement dynamique',
      description: 'Échauffement complet avec course, étirements dynamiques et passes.',
      variablesPlus: 'Durée des exercices\nIntensité progressive',
      variablesMinus: 'Temps de récupération\nComplexité des mouvements',
      schemaUrl: '',
      imageUrl: '',
      tags: {
        connect: [
          { id: objectifTags[0].id }, // Échauffement
          { id: objectifTags[3].id }, // Physique
          { id: niveauTags[0].id },   // Débutant
          { id: tempsTags[1].id },    // 10-15 min
          { id: formatTags[2].id }    // Équipe
        ]
      }
    }
  });

  console.log('✅ Seeding terminé avec succès !');
  console.log(`📊 Créé : ${objectifTags.length + travailTags.length + niveauTags.length + tempsTags.length + formatTags.length + themeEntrainementTags.length} tags`);
  console.log('📊 Créé : 3 exercices');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
