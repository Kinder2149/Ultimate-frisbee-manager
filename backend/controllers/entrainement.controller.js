/**
 * Contrôleur unifié pour les entraînements simplifiés
 * Gère uniquement : titre, date optionnelle, thème global
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calcule la durée totale d'un entraînement
 * @param {Array} exercices - Liste des exercices de l'entraînement
 * @returns {number} Durée totale en minutes
 */
const calculerDureeTotal = (exercices) => {
  if (!exercices || exercices.length === 0) return 0;
  
  return exercices.reduce((total, exercice) => {
    return total + (exercice.duree || 0);
  }, 0);
};

/**
 * Récupère tous les entraînements avec leurs exercices
 * @route GET /api/entrainements
 */
exports.getAllEntrainements = async (req, res) => {
  try {
    const entrainements = await prisma.entrainement.findMany({
      include: {
        exercices: {
          orderBy: { ordre: 'asc' },
          include: {
            exercice: {
              include: {
                tags: true
              }
            }
          }
        },
        tags: true, // Inclure les tags de l'entraînement
        echauffement: {
          include: {
            blocs: {
              orderBy: { ordre: 'asc' }
            }
          }
        },
        situationMatch: {
          include: {
            tags: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Ajouter la durée totale calculée pour chaque entraînement
    const entraitementsAvecDuree = entrainements.map(entrainement => ({
      ...entrainement,
      dureeTotal: calculerDureeTotal(entrainement.exercices)
    }));
    
    res.json(entraitementsAvecDuree);
  } catch (error) {
    console.error('Erreur lors de la récupération des entraînements:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des entraînements',
      details: error.message 
    });
  }
};

/**
 * Récupère un entraînement par son ID
 * @route GET /api/entrainements/:id
 */
exports.getEntrainementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const entrainement = await prisma.entrainement.findUnique({
      where: { id },
      include: {
        exercices: {
          orderBy: { ordre: 'asc' },
          include: {
            exercice: {
              include: {
                tags: true
              }
            }
          }
        },
        tags: true, // Inclure les tags de l'entraînement
        echauffement: {
          include: {
            blocs: {
              orderBy: { ordre: 'asc' }
            }
          }
        },
        situationMatch: {
          include: {
            tags: true
          }
        }
      }
    });
    
    if (!entrainement) {
      return res.status(404).json({ error: 'Entraînement non trouvé' });
    }
    
    // Ajouter la durée totale calculée
    const entrainementAvecDuree = {
      ...entrainement,
      dureeTotal: calculerDureeTotal(entrainement.exercices)
    };
    
    res.json(entrainementAvecDuree);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entraînement:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de l\'entraînement',
      details: error.message 
    });
  }
};

/**
 * Crée un nouvel entraînement
 * @route POST /api/entrainements
 */
exports.createEntrainement = async (req, res) => {
  try {
    const { titre, date, exercices, echauffementId, situationMatchId, tagIds } = req.body;
    
    console.log('Création entraînement - Données reçues:', { titre, date, exercices, echauffementId, situationMatchId, tagIds });
    
    if (!titre) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }
    
    // Créer l'entraînement avec ses exercices, échauffement, situation et tags
    const nouvelEntrainement = await prisma.entrainement.create({
      data: {
        titre,
        date: date ? new Date(date) : null,
        echauffementId: echauffementId || null,
        situationMatchId: situationMatchId || null,
        tags: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map(tagId => ({ id: tagId }))
        } : undefined,
        exercices: exercices && exercices.length > 0 ? {
          create: exercices.map((exercice, index) => ({
            exerciceId: exercice.exerciceId,
            ordre: exercice.ordre || index + 1,
            duree: exercice.duree || null,
            notes: exercice.notes || null
          }))
        } : undefined
      },
      include: {
        exercices: {
          orderBy: { ordre: 'asc' },
          include: {
            exercice: {
              include: {
                tags: true
              }
            }
          }
        },
        echauffement: {
          include: {
            blocs: {
              orderBy: { ordre: 'asc' }
            }
          }
        },
        situationMatch: {
          include: {
            tags: true
          }
        }
      }
    });
    
    console.log('Entraînement créé avec succès:', {
      id: nouvelEntrainement.id,
      titre: nouvelEntrainement.titre,
      tagsCount: nouvelEntrainement.tags.length,
      exercicesCount: nouvelEntrainement.exercices.length,
      echauffementId: nouvelEntrainement.echauffementId,
      situationMatchId: nouvelEntrainement.situationMatchId
    });
    
    res.status(201).json(nouvelEntrainement);
  } catch (error) {
    console.error('Erreur lors de la création de l\'entraînement:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de l\'entraînement',
      details: error.message 
    });
  }
};

/**
 * Met à jour un entraînement existant
 * @route PUT /api/entrainements/:id
 */
exports.updateEntrainement = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, date, theme, exercices, echauffementId, situationMatchId } = req.body;
    
    if (!titre) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }
    
    // Supprimer les exercices existants et recréer avec les nouveaux
    await prisma.entrainementExercice.deleteMany({
      where: { entrainementId: id }
    });
    
    // Déconnecter tous les tags existants et reconnecter les nouveaux
    await prisma.entrainement.update({
      where: { id },
      data: {
        tags: {
          set: [] // Déconnecter tous les tags
        }
      }
    });
    
    const entrainementMisAJour = await prisma.entrainement.update({
      where: { id },
      data: {
        titre,
        date: date ? new Date(date) : null,
        echauffementId: echauffementId || null,
        situationMatchId: situationMatchId || null,
        tags: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map(tagId => ({ id: tagId }))
        } : undefined,
        exercices: exercices && exercices.length > 0 ? {
          create: exercices.map((exercice, index) => ({
            exerciceId: exercice.exerciceId,
            ordre: exercice.ordre || index + 1,
            duree: exercice.duree || null,
            notes: exercice.notes || null
          }))
        } : undefined
      },
      include: {
        exercices: {
          orderBy: { ordre: 'asc' },
          include: {
            exercice: {
              include: {
                tags: true
              }
            }
          }
        },
        echauffement: {
          include: {
            blocs: {
              orderBy: { ordre: 'asc' }
            }
          }
        },
        situationMatch: {
          include: {
            tags: true
          }
        }
      }
    });
    
    console.log('Entraînement mis à jour avec succès:', {
      id: entrainementMisAJour.id,
      titre: entrainementMisAJour.titre,
      tagsCount: entrainementMisAJour.tags.length,
      exercicesCount: entrainementMisAJour.exercices.length,
      echauffementId: entrainementMisAJour.echauffementId,
      situationMatchId: entrainementMisAJour.situationMatchId
    });
    
    res.json(entrainementMisAJour);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'entraînement:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour de l\'entraînement',
      details: error.message 
    });
  }
};

/**
 * Supprime un entraînement
 * @route DELETE /api/entrainements/:id
 */
exports.deleteEntrainement = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Tentative de suppression de l'entraînement: ${id}`);
    
    // Vérifier si l'entraînement existe
    const entrainement = await prisma.entrainement.findUnique({ 
      where: { id },
      include: { exercices: true }
    });
    
    if (!entrainement) {
      console.log(`Entraînement ${id} non trouvé`);
      return res.status(404).json({ error: 'Entraînement non trouvé' });
    }
    
    console.log(`Entraînement trouvé: ${entrainement.titre}, avec ${entrainement.exercices.length} exercices`);
    
    // Supprimer d'abord les exercices liés (au cas où le cascade ne fonctionne pas)
    if (entrainement.exercices.length > 0) {
      console.log('Suppression des exercices liés...');
      await prisma.entrainementExercice.deleteMany({
        where: { entrainementId: id }
      });
      console.log('Exercices liés supprimés');
    }
    
    // Supprimer l'entraînement
    console.log('Suppression de l\'entraînement...');
    await prisma.entrainement.delete({ where: { id } });
    console.log(`Entraînement ${id} supprimé avec succès`);
    
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entraînement:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression de l\'entraînement',
      details: error.message 
    });
  }
};

/**
 * Duplique un entraînement existant avec ses exercices
 * @route POST /api/entrainements/:id/duplicate
 */
exports.duplicateEntrainement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'entraînement original avec ses exercices et tags
    const originalEntrainement = await prisma.entrainement.findUnique({
      where: { id },
      include: {
        exercices: {
          orderBy: { ordre: 'asc' },
          include: {
            exercice: true
          }
        },
        tags: true
      }
    });
    
    if (!originalEntrainement) {
      return res.status(404).json({ error: 'Entraînement non trouvé' });
    }
    
    // Créer une copie avec un titre modifié, ses exercices et tags
    const entrainementDuplique = await prisma.entrainement.create({
      data: {
        titre: `${originalEntrainement.titre} (Copie)`,
        date: originalEntrainement.date,
        echauffementId: originalEntrainement.echauffementId,
        situationMatchId: originalEntrainement.situationMatchId,
        tags: originalEntrainement.tags.length > 0 ? {
          connect: originalEntrainement.tags.map(tag => ({ id: tag.id }))
        } : undefined,
        exercices: {
          create: originalEntrainement.exercices.map(exercice => ({
            exerciceId: exercice.exerciceId,
            ordre: exercice.ordre,
            duree: exercice.duree,
            notes: exercice.notes
          }))
        }
      },
      include: {
        exercices: {
          orderBy: { ordre: 'asc' },
          include: {
            exercice: {
              include: {
                tags: true
              }
            }
          }
        },
        tags: true
      }
    });
    
    console.log('Entraînement dupliqué avec succès:', {
      original: originalEntrainement.titre,
      duplicate: entrainementDuplique.titre,
      exercicesCount: entrainementDuplique.exercices.length
    });
    
    res.status(201).json(entrainementDuplique);
  } catch (error) {
    console.error('Erreur lors de la duplication de l\'entraînement:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la duplication de l\'entraînement',
      details: error.message
    });
  }
};
