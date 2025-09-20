const { prisma } = require('../services/prisma');

const calculerDureeTotal = (exercices) => {
  if (!exercices || exercices.length === 0) return 0;
  return exercices.reduce((total, ex) => total + (ex.duree || 0), 0);
};

exports.getAllEntrainements = async (req, res, next) => {
  try {
    const entrainements = await prisma.entrainement.findMany({
      include: {
        exercices: { orderBy: { ordre: 'asc' }, include: { exercice: { include: { tags: true } } } },
        tags: true,
        echauffement: { include: { blocs: { orderBy: { ordre: 'asc' } } } },
        situationMatch: { include: { tags: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const resultats = entrainements.map(e => ({ ...e, dureeTotal: calculerDureeTotal(e.exercices.map(ex => ex.exercice)) }));
    res.json(resultats);
  } catch (error) {
    next(error);
  }
};

exports.getEntrainementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entrainement = await prisma.entrainement.findUnique({
      where: { id },
      include: {
        exercices: { orderBy: { ordre: 'asc' }, include: { exercice: { include: { tags: true } } } },
        tags: true,
        echauffement: { include: { blocs: { orderBy: { ordre: 'asc' } } } },
        situationMatch: { include: { tags: true } }
      }
    });

    if (!entrainement) {
      const error = new Error('Entraînement non trouvé');
      error.statusCode = 404;
      return next(error);
    }

    const resultat = { ...entrainement, dureeTotal: calculerDureeTotal(entrainement.exercices.map(ex => ex.exercice)) };
    res.json(resultat);
  } catch (error) {
    next(error);
  }
};

exports.createEntrainement = async (req, res, next) => {
  try {
    const { titre, date, exercices, echauffementId, situationMatchId, tagIds } = req.body;

    const nouvelEntrainement = await prisma.entrainement.create({
      data: {
        titre,
        date: date ? new Date(date) : null,
        imageUrl: req.file ? req.file.cloudinaryUrl : (req.body.imageUrl || null),
        echauffementId: echauffementId || null,
        situationMatchId: situationMatchId || null,
        tags: { connect: (tagIds || []).map(id => ({ id })) },
        exercices: {
          create: (exercices || []).map((ex, i) => ({ 
            exerciceId: ex.exerciceId, 
            ordre: ex.ordre || i + 1, 
            duree: ex.duree || null, 
            notes: ex.notes || null 
          }))
        }
      },
      include: { exercices: { include: { exercice: true } }, tags: true, echauffement: true, situationMatch: true }
    });

    res.status(201).json(nouvelEntrainement);
  } catch (error) {
    next(error);
  }
};

exports.updateEntrainement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titre, date, exercices, echauffementId, situationMatchId, tagIds } = req.body;

    await prisma.$transaction(async (tx) => {
      await tx.entrainementExercice.deleteMany({ where: { entrainementId: id } });

      await tx.entrainement.update({
        where: { id },
        data: {
          titre,
          date: date ? new Date(date) : null,
          imageUrl: req.file ? req.file.cloudinaryUrl : (req.body.imageUrl !== undefined ? req.body.imageUrl : undefined),
          echauffementId: echauffementId,
          situationMatchId: situationMatchId,
          tags: { set: (tagIds || []).map(id => ({ id })) },
          exercices: {
            create: (exercices || []).map((ex, i) => ({
              exerciceId: ex.exerciceId,
              ordre: ex.ordre || i + 1,
              duree: ex.duree || null,
              notes: ex.notes || null
            }))
          }
        }
      });
    });

    const entrainementMisAJour = await prisma.entrainement.findUnique({
        where: { id },
        include: { exercices: { include: { exercice: true } }, tags: true, echauffement: true, situationMatch: true }
    });

    res.json(entrainementMisAJour);
  } catch (error) {
    next(error);
  }
};

exports.deleteEntrainement = async (req, res, next) => {
  try {
    const { id } = req.params;
    // La suppression en cascade est gérée par Prisma via le schéma
    await prisma.entrainement.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.duplicateEntrainement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const original = await prisma.entrainement.findUnique({
      where: { id },
      include: { exercices: true, tags: true }
    });

    if (!original) {
      const error = new Error('Entraînement non trouvé');
      error.statusCode = 404;
      return next(error);
    }

    const entrainementDuplique = await prisma.entrainement.create({
      data: {
        titre: `${original.titre} (Copie)`,
        date: original.date,
        imageUrl: original.imageUrl,
        echauffementId: original.echauffementId,
        situationMatchId: original.situationMatchId,
        tags: { connect: original.tags.map(t => ({ id: t.id })) },
        exercices: {
          create: original.exercices.map(ex => ({ 
            exerciceId: ex.exerciceId, 
            ordre: ex.ordre, 
            duree: ex.duree, 
            notes: ex.notes 
          }))
        }
      },
      include: { exercices: { include: { exercice: true } }, tags: true, echauffement: true, situationMatch: true }
    });

    res.status(201).json(entrainementDuplique);
  } catch (error) {
    next(error);
  }
};