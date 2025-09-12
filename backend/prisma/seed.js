const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { TAG_CATEGORIES } = require('../../shared/constants/tag-categories');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');
  const destructive = String(process.env.SEED_DESTRUCTIVE || '').toLowerCase() === 'true';

  if (destructive) {
    console.log('🗑️ Suppression des anciennes données...');
    await prisma.entrainementExercice.deleteMany().catch(e => console.warn(`⚠️ Erreur suppression EntrainementExercice: ${e.message}`));
    await prisma.exercice.deleteMany().catch(e => console.warn(`⚠️ Erreur suppression Exercice: ${e.message}`));
    await prisma.tag.deleteMany().catch(e => console.warn(`⚠️ Erreur suppression Tag: ${e.message}`));
    await prisma.entrainement.deleteMany().catch(e => console.warn(`⚠️ Erreur suppression Entrainement: ${e.message}`));
    // Ne pas supprimer les utilisateurs en mode destructif pour ne pas perdre les comptes
  } else {
     console.log('🔒 Mode seed non destructif (par défaut). Pour réinitialiser les données (sauf utilisateurs), définissez SEED_DESTRUCTIVE=true');
  }

  // --- Création/Mise à jour de l'utilisateur admin ---
  console.log('👤 Création/MàJ de l\'utilisateur admin par défaut...');
  try {
    const adminEmail = 'admin@ultimate.com';
    const adminPlainPassword = 'Ultim@t+';
    const passwordHash = await bcrypt.hash(adminPlainPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { password: passwordHash, nom: 'Admin', role: 'ADMIN', isActive: true },
      create: { id: uuidv4(), email: adminEmail, password: passwordHash, nom: 'Admin', prenom: 'Ultimate', role: 'ADMIN', isActive: true },
    });
    console.log('✅ Compte admin opérationnel: admin@ultimate.com / Ultim@t+');
  } catch (e) {
    console.error(`❌ Erreur lors de la création/mise à jour du compte admin: ${e.message}`);
  }

  // --- Création/Mise à jour des Tags ---
  console.log('📝 Création/MàJ des tags...');
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

  const createdTags = {};
  for (const tagData of tagsToCreate) {
    try {
      const tag = await prisma.tag.upsert({
        where: { label_category: { label: tagData.label, category: tagData.category } },
        update: { color: tagData.color, level: tagData.level },
        create: { ...tagData, id: uuidv4() },
      });
      createdTags[tagData.label] = tag;
    } catch (e) {
      console.error(`❌ Erreur upsert tag '${tagData.label}': ${e.message}`);
    }
  }
  console.log(`✅ ${Object.keys(createdTags).length} tags créés/mis à jour.`);

  // --- Création/Mise à jour des Exercices ---
  if (destructive) { // Ne créer les exercices que en mode destructif pour éviter les doublons
    console.log('🏃 Création des exercices...');
    const exercicesToCreate = [
      {
        nom: 'Passes courtes en triangle',
        description: 'Exercice de passes courtes en triangle pour travailler la précision et la fluidité.',
        tags: ['Technique', 'Passes', 'Débutant', '5-10 min', 'Équipe'],
      },
      {
        nom: 'Défense homme à homme',
        description: 'Exercice pour apprendre les bases de la défense individuelle.',
        tags: ['Tactique', 'Défense', 'Intermédiaire', '10-15 min', 'Équipe'],
      },
      {
        nom: 'Échauffement dynamique',
        description: 'Échauffement complet avec course, étirements dynamiques et passes.',
        tags: ['Échauffement', 'Physique', 'Débutant', '10-15 min', 'Équipe'],
      },
    ];

    let count = 0;
    for (const exoData of exercicesToCreate) {
      try {
        await prisma.exercice.upsert({
          where: { nom: exoData.nom },
          update: {
            description: exoData.description,
            tags: {
              connect: exoData.tags.map(label => ({ id: createdTags[label].id }))
            }
          },
          create: {
            id: uuidv4(),
            nom: exoData.nom,
            description: exoData.description,
            tags: {
              connect: exoData.tags.map(label => ({ id: createdTags[label].id }))
            },
          },
        });
        count++;
      } catch(e) {
         console.error(`❌ Erreur upsert exercice '${exoData.nom}': ${e.message}`);
      }
    }
    console.log(`✅ ${count} exercices créés/mis à jour.`);
  }

  console.log('✅ Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
