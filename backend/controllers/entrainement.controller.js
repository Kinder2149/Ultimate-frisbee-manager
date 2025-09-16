const { prisma } = require('../services/prisma');

const calculerDureeTotal = (exercices) => {
  if (!exercices || exercices.length === 0) return 0;
  return exercices.reduce((total, ex) => total + (ex.duree || 0), 0);
};

exports.getAllEntrainements = async (req, res) => {
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
    console.error('Erreur lors de la récupération des entraînements:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

exports.getEntrainementById = async (req, res) => {
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
      return res.status(404).json({ error: 'Entraînement non trouvé' });
    }

    const resultat = { ...entrainement, dureeTotal: calculerDureeTotal(entrainement.exercices.map(ex => ex.exercice)) };
    res.json(resultat);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entraînement:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

exports.createEntrainement = async (req, res) => {
  try {
    const { titre, date, exercices, echauffementId, situationMatchId, tagIds } = req.body;

    if (!titre) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    const nouvelEntrainement = await prisma.entrainement.create({
      data: {
        titre,
        date: date ? new Date(date) : null,
        imageUrl: req.file ? req.file.cloudinaryUrl : (req.body.imageUrl || null),
        echauffementId: echauffementId || null,
        situationMatchId: situationMatchId || null,
        tags: tagIds && tagIds.length > 0 ? { connect: tagIds.map(tagId => ({ id: tagId })) } : undefined,
        exercices: exercices && exercices.length > 0 ? {
          create: exercices.map((ex, i) => ({ exerciceId: ex.exerciceId, ordre: ex.ordre || i + 1, duree: ex.duree || null, notes: ex.notes || null }))
        } : undefined
      },
      include: {
        exercices: { include: { exercice: true } },
        tags: true,
        echauffement: true,
        situationMatch: true
      }
    });

    res.status(201).json(nouvelEntrainement);
  } catch (error) {
    console.error('Erreur lors de la création de l\'entraînement:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

exports.updateEntrainement = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, date, exercices, echauffementId, situationMatchId, tagIds } = req.body;

    if (!titre) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    await prisma.$transaction([
      prisma.entrainementExercice.deleteMany({ where: { entrainementId: id } }),
      prisma.entrainement.update({
        where: { id },
        data: {
          titre,
          date: date ? new Date(date) : null,
          imageUrl: req.file ? req.file.cloudinaryUrl : (typeof req.body.imageUrl !== 'undefined' ? (req.body.imageUrl || null) : undefined),
          echauffementId: echauffementId || null,
          situationMatchId: situationMatchId || null,
          tags: { set: tagIds ? tagIds.map(tagId => ({ id: tagId })) : [] },
          exercices: exercices && exercices.length > 0 ? {
            create: exercices.map((ex, i) => ({ exerciceId: ex.exerciceId, ordre: ex.ordre || i + 1, duree: ex.duree || null, notes: ex.notes || null }))
          } : undefined
        }
      })
    ]);

    const entrainementMisAJour = await prisma.entrainement.findUnique({
        where: { id },
        include: {
            exercices: { include: { exercice: true } },
            tags: true,
            echauffement: true,
            situationMatch: true
        }
    });

    res.json(entrainementMisAJour);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'entraînement:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

exports.deleteEntrainement = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.entrainement.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entraînement:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

exports.duplicateEntrainement = async (req, res) => {
  try {
    const { id } = req.params;
    const original = await prisma.entrainement.findUnique({
      where: { id },
      include: { exercices: true, tags: true }
    });

    if (!original) {
      return res.status(404).json({ error: 'Entraînement non trouvé' });
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
          create: original.exercices.map(ex => ({ exerciceId: ex.exerciceId, ordre: ex.ordre, duree: ex.duree, notes: ex.notes }))
        }
      },
      include: {
        exercices: { include: { exercice: true } },
        tags: true,
        echauffement: true,
        situationMatch: true
      }
    });

    res.status(201).json(entrainementDuplique);
  } catch (error) {
    console.error('Erreur lors de la duplication de l\'entraînement:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};