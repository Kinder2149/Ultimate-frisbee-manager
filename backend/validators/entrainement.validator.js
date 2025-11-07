const { z } = require('zod');

// Schéma pour un exercice au sein d'un entraînement
const exerciceInEntrainementSchema = z.object({
  // Au create, accepter une chaîne libre (l'UI peut envoyer un id temporaire)
  exerciceId: z.string({ required_error: "L'ID de l'exercice est requis." }).min(1, "L'ID de l'exercice est requis."),
  ordre: z.number().int().positive().optional(),
  duree: z.number().int().positive('La durée doit être un nombre positif.').optional().nullable(),
  notes: z.string().optional().nullable(),
}).passthrough(); // Ajout de .passthrough() pour ignorer les champs inconnus comme 'id'

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
// Schéma pour la mise à jour (tous les champs sont optionnels)
// car la logique de suppression/recréation gère les détails.
const updateEntrainementSchema = createEntrainementSchema.partial().extend({
  exercices: z.array(
    z.object({
      // On accepte n'importe quelle chaîne pour l'exerciceId, car pour un nouvel exercice,
      // il peut être vide ou temporaire. La logique du contrôleur gère la création.
      exerciceId: z.string(),
      ordre: z.number().optional(),
      duree: z.number().optional().nullable(),
      notes: z.string().optional().nullable(),
    }).passthrough() // Important pour ignorer les champs supplémentaires comme 'id'
  ).optional(),
});

module.exports = {
  createEntrainementSchema,
  updateEntrainementSchema,
};
