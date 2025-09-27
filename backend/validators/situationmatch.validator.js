const { z } = require('zod');

// Schéma pour la création d'une situation/match
const createSituationMatchSchema = z.object({
  nom: z.string().min(3, 'Le nom doit contenir au moins 3 caractères.').optional().nullable(),
  type: z.enum(['Match', 'Situation'], {
    required_error: 'Le type est requis et doit être "Match" ou "Situation".',
  }),

  description: z.string().optional().nullable(),
  temps: z.string().optional().nullable(),
  imageUrl: z.string().url({ message: "L'URL de l'image est invalide." }).optional().nullable(),

  tagIds: z.array(z.string().uuid({ message: "L'un des IDs de tag est invalide." })).optional().default([]),
});

// Schéma pour la mise à jour (tous les champs sont optionnels)
const updateSituationMatchSchema = createSituationMatchSchema.partial();

module.exports = {
  createSituationMatchSchema,
  updateSituationMatchSchema,
};
