const { z } = require('zod');

// Schéma pour un exercice au sein d'un entraînement
const exerciceInEntrainementSchema = z.object({
  exerciceId: z.string().uuid({ message: "L'ID de l'exercice est invalide." }),
  ordre: z.number().int().positive().optional(),
  duree: z.number().int().positive('La durée doit être un nombre positif.').optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Schéma pour la création d'un entraînement
const createEntrainementSchema = z.object({
  titre: z.string({
    required_error: 'Le titre est requis.',
  }).min(3, 'Le titre doit contenir au moins 3 caractères.'),

  date: z.string().datetime({ message: "Le format de la date est invalide." }).optional().nullable(),
  imageUrl: z.string().url({ message: "L'URL de l'image est invalide." }).optional().nullable(),
  
  echauffementId: z.string().uuid({ message: "L'ID de l'échauffement est invalide." }).optional().nullable(),
  situationMatchId: z.string().uuid({ message: "L'ID de la situation de match est invalide." }).optional().nullable(),

  tagIds: z.array(z.string().uuid({ message: "L'un des IDs de tag est invalide." })).optional().default([]),
  exercices: z.array(exerciceInEntrainementSchema).optional().default([]),
});

// Schéma pour la mise à jour (tous les champs sont optionnels)
const updateEntrainementSchema = createEntrainementSchema.partial();

module.exports = {
  createEntrainementSchema,
  updateEntrainementSchema,
};
