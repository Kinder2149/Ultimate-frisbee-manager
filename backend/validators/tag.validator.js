const { z } = require('zod');
const { TAG_CATEGORIES } = require('../../shared/constants/tag-categories');

// Schéma de base pour un tag
const tagSchema = z.object({
  label: z.string({
    required_error: 'Le libellé est requis.',
  }).min(1, 'Le libellé ne peut pas être vide.'),
  
  category: z.enum(TAG_CATEGORIES, {
    required_error: 'La catégorie est requise.',
    errorMap: () => ({ message: `La catégorie doit être l'une des suivantes : ${TAG_CATEGORIES.join(', ')}` }),
  }),

  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'La couleur doit être un code HEX valide (ex: #RRGGBB).'
  }).optional().nullable(),

  level: z.number().int().min(1).max(5, {
    message: 'Le niveau doit être un entier entre 1 et 5.'
  }).optional().nullable(),
});

// Schéma pour la création d'un tag, avec une logique de validation conditionnelle
const createTagSchema = tagSchema.refine(data => {
  // `level` ne doit être présent QUE si `category` est 'niveau'
  if (data.category !== 'niveau' && data.level !== null && data.level !== undefined) {
    return false;
  }
  return true;
}, {
  message: 'Le champ "level" ne peut être défini que pour la catégorie "niveau".',
  path: ['level'], // L'erreur sera associée au champ 'level'
});

// Schéma pour la mise à jour (la catégorie ne peut pas être modifiée)
// On rend tous les champs optionnels sauf le label.
const updateTagSchema = z.object({
  label: z.string().min(1, 'Le libellé ne peut pas être vide.').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'La couleur doit être un code HEX valide (ex: #RRGGBB).'
  }).optional().nullable(),
  level: z.number().int().min(1).max(5, {
    message: 'Le niveau doit être un entier entre 1 et 5.'
  }).optional().nullable(),
});

module.exports = {
  createTagSchema,
  updateTagSchema,
};
