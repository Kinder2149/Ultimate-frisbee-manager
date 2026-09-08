const { z } = require('zod');

const LEXIQUE_CATEGORIES = ['Attaque', 'Défense', 'Transverse', 'Play', 'Cue moteur'];

const createLexiqueSchema = z.object({
  terme: z.string({
    required_error: 'Le terme est requis.',
  }).min(1, 'Le terme ne peut pas être vide.'),

  definition: z.string({
    required_error: 'La définition est requise.',
  }).min(1, 'La définition ne peut pas être vide.'),

  categorie: z.enum(LEXIQUE_CATEGORIES, {
    required_error: 'La catégorie est requise.',
    errorMap: () => ({ message: `La catégorie doit être l'une des suivantes : ${LEXIQUE_CATEGORIES.join(', ')}` }),
  }),

  motImage: z.boolean().optional(),
});

const updateLexiqueSchema = z.object({
  terme: z.string().min(1, 'Le terme ne peut pas être vide.').optional(),
  definition: z.string().min(1, 'La définition ne peut pas être vide.').optional(),
  categorie: z.enum(LEXIQUE_CATEGORIES, {
    errorMap: () => ({ message: `La catégorie doit être l'une des suivantes : ${LEXIQUE_CATEGORIES.join(', ')}` }),
  }).optional(),
  motImage: z.boolean().optional(),
});

module.exports = {
  LEXIQUE_CATEGORIES,
  createLexiqueSchema,
  updateLexiqueSchema,
};
