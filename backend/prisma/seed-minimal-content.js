const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const IDS = {
  exercice: '00000000-0000-0000-0000-0000000000e1',
  echauffement: '00000000-0000-0000-0000-0000000000a1',
  situation: '00000000-0000-0000-0000-0000000000b1',
  entrainement: '00000000-0000-0000-0000-0000000000c1',
};

async function main() {
  const tags = await prisma.tag.findMany({
    orderBy: { createdAt: 'asc' },
    take: 5,
  });

  const tagConnect = tags.map((t) => ({ id: t.id }));

  const exercice = await prisma.exercice.upsert({
    where: { id: IDS.exercice },
    update: {},
    create: {
      id: IDS.exercice,
      nom: 'Passes courtes en triangle',
      description: "Exercice de passes rapides en triangle pour travailler précision et déplacements.",
      tags: tagConnect.length ? { connect: tagConnect } : undefined,
    },
  });

  const echauffement = await prisma.echauffement.upsert({
    where: { id: IDS.echauffement },
    update: {},
    create: {
      id: IDS.echauffement,
      nom: 'Échauffement express',
      description: 'Mise en route rapide avant la séance.',
    },
  });

  await prisma.blocEchauffement.upsert({
    where: { echauffementId_ordre: { echauffementId: echauffement.id, ordre: 1 } },
    update: {
      titre: 'Activation générale',
      repetitions: '2 séries',
      temps: '5 min',
    },
    create: {
      echauffementId: echauffement.id,
      ordre: 1,
      titre: 'Activation générale',
      repetitions: '2 séries',
      temps: '5 min',
      informations: 'Mobilité + footing léger',
    },
  });

  const situation = await prisma.situationMatch.upsert({
    where: { id: IDS.situation },
    update: {},
    create: {
      id: IDS.situation,
      nom: 'Sortie de disque',
      type: 'offensif',
      description: "Travail de la sortie de disque sous pression.",
      tags: tagConnect.length ? { connect: tagConnect } : undefined,
    },
  });

  const entrainement = await prisma.entrainement.upsert({
    where: { id: IDS.entrainement },
    update: {
      echauffementId: echauffement.id,
      situationMatchId: situation.id,
    },
    create: {
      id: IDS.entrainement,
      titre: 'Séance démo export',
      echauffementId: echauffement.id,
      situationMatchId: situation.id,
      date: new Date(),
    },
  });

  await prisma.entrainementExercice.upsert({
    where: { entrainementId_exerciceId: { entrainementId: entrainement.id, exerciceId: exercice.id } },
    update: { ordre: 1, duree: 10 },
    create: { entrainementId: entrainement.id, exerciceId: exercice.id, ordre: 1, duree: 10 },
  });

  console.log('Seed minimal Terra Nova terminé. IDs:');
  console.log({
    exerciceId: exercice.id,
    echauffementId: echauffement.id,
    situationMatchId: situation.id,
    entrainementId: entrainement.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
