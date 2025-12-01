const { z } = require('zod');

// Schéma pour la création d'un exercice
const createExerciceSchema = z.object({
  nom: z.string({
    required_error: 'Le nom est requis.',
    invalid_type_error: 'Le nom doit être une chaîne de caractères.',
  }).min(3, { message: 'Le nom doit contenir au moins 3 caractères.' }),

  description: z.string({
    required_error: 'La description est requise.',
    invalid_type_error: 'La description doit être une chaîne de caractères.',
  }),

  // Autoriser explicitement la chaîne vide pour signifier l'absence/suppression d'image
  imageUrl: z.union([z.string().url({ message: "L'URL de l'image est invalide." }), z.string().length(0)]).optional().nullable(),
  materiel: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  critereReussite: z.string().optional().nullable(),
  // Points: tableau de chaînes, stocké en JSON
  points: z.array(z.string()).optional().default([]),

  // Les variables sont attendues comme des tableaux de chaînes
  variablesPlus: z.array(z.string()).optional().default([]),
  variablesMinus: z.array(z.string()).optional().default([]),

  // Les tags sont attendus comme un tableau d'IDs (UUIDs)
  // La contrainte métier (1 tag objectif max, >=1 travail_specifique)
  // est vérifiée au niveau du contrôleur avec accès à la base.
  tagIds: z.array(z.string().uuid({ message: "L'ID d'un tag est invalide." }))
    .min(1, { message: 'Au moins un tag est requis.' }),
});

// Schéma pour la mise à jour (tous les champs sont optionnels)
// On n'utilise pas .partial() car il ne conserve pas les transformations comme .default([])
const updateExerciceSchema = z.object({
  nom: z.string().min(3).optional(),
  description: z.string().optional(),
  // Même règle en mise à jour: accepter '' pour déclencher la suppression
  imageUrl: z.union([z.string().url(), z.string().length(0)]).optional().nullable(),
  materiel: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  critereReussite: z.string().optional().nullable(),
  points: z.array(z.string()).optional().default([]),

  variablesPlus: z.array(z.string()).optional().default([]),
  variablesMinus: z.array(z.string()).optional().default([]),
  // IMPORTANT: ne pas fournir de default([]) ici, pour que l'absence de tagIds
  // n'efface pas les tags existants et ne déclenche pas la validation métier côté contrôleur.
  tagIds: z.array(z.string().uuid()).optional(),
});

module.exports = {
  createExerciceSchema,
  updateExerciceSchema,
};
