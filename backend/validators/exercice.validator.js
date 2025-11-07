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
  }).optional(), // On retire .min(10) qui est trop strict

  imageUrl: z.string().url({ message: "L'URL de l'image est invalide." }).optional().nullable(),
  schemaUrl: z.string().url({ message: "L'URL du schéma est invalide." }).optional().nullable(),
  materiel: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  critereReussite: z.string().optional().nullable(),

  // Les variables sont attendues comme des tableaux de chaînes
  variablesPlus: z.array(z.string()).optional().default([]),
  variablesMinus: z.array(z.string()).optional().default([]),

  // Les tags sont attendus comme un tableau d'IDs (UUIDs)
  tagIds: z.array(z.string().uuid({ message: "L'ID d'un tag est invalide." })).optional().default([]),
});

// Schéma pour la mise à jour (tous les champs sont optionnels)
// On n'utilise pas .partial() car il ne conserve pas les transformations comme .default([])
const updateExerciceSchema = z.object({
  nom: z.string().min(3).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  schemaUrl: z.string().url().optional().nullable(),
  materiel: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  critereReussite: z.string().optional().nullable(),
  variablesPlus: z.array(z.string()).optional().default([]),
  variablesMinus: z.array(z.string()).optional().default([]),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

module.exports = {
  createExerciceSchema,
  updateExerciceSchema,
};
