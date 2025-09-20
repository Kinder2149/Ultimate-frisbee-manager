const { z } = require('zod');

// Schéma pour un bloc d'échauffement
const blocEchauffementSchema = z.object({
  titre: z.string({
    required_error: 'Le titre du bloc est requis.',
  }).min(3, 'Le titre du bloc doit contenir au moins 3 caractères.'),
  ordre: z.number().int().positive().optional(),
  repetitions: z.string().optional().nullable(),
  temps: z.string().optional().nullable(),
  informations: z.string().optional().nullable(),
  fonctionnement: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Schéma pour la création d'un échauffement
const createEchauffementSchema = z.object({
  nom: z.string({
    required_error: 'Le nom de l\'échauffement est requis.',
  }).min(3, 'Le nom doit contenir au moins 3 caractères.'),

  description: z.string().optional().nullable(),
  imageUrl: z.string().url({ message: "L'URL de l'image est invalide." }).optional().nullable(),

  blocs: z.array(blocEchauffementSchema).optional().default([]),
});

// Schéma pour la mise à jour (tous les champs sont optionnels, mais si `blocs` est fourni, il doit être valide)
const updateEchauffementSchema = createEchauffementSchema.partial();

module.exports = {
  createEchauffementSchema,
  updateEchauffementSchema,
};
