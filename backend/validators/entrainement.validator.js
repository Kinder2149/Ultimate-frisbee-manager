const { z } = require('zod');

// Schéma pour un exercice au sein d'un entraînement (création)
const exerciceInEntrainementSchema = z.object({
  exerciceId: z.string({ required_error: "L'ID de l'exercice est requis." }).min(1, "L'ID de l'exercice est requis."),
  ordre: z.coerce.number().int().positive().optional(),
  // Autoriser 0 comme valeur valide (min(0)) et accepter les chaînes numériques via coerce
  duree: z.coerce.number().int().min(0, 'La durée doit être un entier supérieur ou égal à 0.').optional().nullable(),
  notes: z.string().optional().nullable(),
}).passthrough();

// Schéma pour la création d'un entraînement
const createEntrainementSchema = z.object({
  titre: z.string({
    required_error: 'Le titre est requis.',
  }).min(3, 'Le titre doit contenir au moins 3 caractères.'),

  // Tolérant: on accepte une simple chaîne; le contrôleur parsera en Date si valide
  date: z.string().optional().nullable(),
  imageUrl: z.union([z.string().url({ message: "L'URL de l'image est invalide." }), z.string().length(0)]).optional().nullable(),
  
  echauffementId: z.string().uuid({ message: "L'ID de l'échauffement est invalide." }).optional().nullable(),
  situationMatchId: z.string().uuid({ message: "L'ID de la situation de match est invalide." }).optional().nullable(),

  tagIds: z.array(z.string().uuid({ message: "L'un des IDs de tag est invalide." })).optional().default([]),
  exercices: z.array(exerciceInEntrainementSchema).optional().default([]),
});

// Schéma pour la mise à jour (tous les champs sont optionnels)
// car la logique de suppression/recréation gère les détails.
const updateEntrainementSchema = createEntrainementSchema.partial().extend({
  exercices: z.array(
    z.object({
      // Accepter une chaîne libre (le contrôleur filtrera ceux sans exerciceId valide)
      exerciceId: z.string(),
      ordre: z.coerce.number().int().positive().optional(),
      duree: z.coerce.number().int().min(0).optional().nullable(),
      notes: z.string().optional().nullable(),
    }).passthrough()
  ).optional(),
});

module.exports = {
  createEntrainementSchema,
  updateEntrainementSchema,
};
