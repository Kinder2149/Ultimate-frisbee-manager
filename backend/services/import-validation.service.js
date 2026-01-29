const { isValidCategory, isValidLevel } = require('@ufm/shared/constants/tag-categories');
const { prisma } = require('./prisma');

/**
 * Service de validation pour l'import de données
 */

function boolFromQuery(value, defaultValue = false) {
  if (value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase();
  return ['1', 'true', 'yes', 'y'].includes(s);
}

async function ensureTag(tagInput, tx = prisma) {
  const label = (tagInput.label || '').trim();
  const category = tagInput.category;
  const level = tagInput.level ?? null;

  if (!label || !isValidCategory(category) || !isValidLevel(level, category)) {
    throw new Error(`Tag invalide: ${JSON.stringify(tagInput)}`);
  }

  const tag = await tx.tag.upsert({
    where: { label_category: { label, category } },
    update: { level },
    create: { label, category, level }
  });
  return tag;
}

async function prepareExerciceData(exo) {
  const nom = (exo.nom || '').trim();
  const description = (exo.description || '').trim();
  if (!nom || !description) {
    throw new Error('nom et description sont requis');
  }

  const tagIds = [];
  for (const t of exo.tags || []) {
    const tag = await ensureTag(t);
    tagIds.push(tag.id);
  }

  const { computeEffectiveImageUrl } = require('./markdown-parser.service');
  const effectiveImageUrl = computeEffectiveImageUrl(exo);

  return {
    data: {
      nom,
      description,
      imageUrl: effectiveImageUrl,
      variablesText: exo.variablesText || '',
      variablesPlus: exo.variablesPlus || '',
      variablesMinus: exo.variablesMinus || ''
    },
    tagIds
  };
}

function validateExerciceFields(exo) {
  const missing = [];
  const nom = (exo.nom || '').trim();
  const description = (exo.description || '').trim();
  
  if (!nom) missing.push('nom');
  if (!description) missing.push('description');
  
  return { valid: missing.length === 0, missing };
}

function validateTagInput(tagInput) {
  if (!tagInput.label || !isValidCategory(tagInput.category)) {
    return { valid: false, error: `Tag invalide: ${JSON.stringify(tagInput)}` };
  }
  if (!isValidLevel(tagInput.level, tagInput.category)) {
    return { valid: false, error: `Niveau invalide pour tag: ${JSON.stringify(tagInput)}` };
  }
  return { valid: true };
}

module.exports = {
  boolFromQuery,
  ensureTag,
  prepareExerciceData,
  validateExerciceFields,
  validateTagInput
};
