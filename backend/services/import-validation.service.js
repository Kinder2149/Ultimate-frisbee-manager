/**
 * Utilitaires de l'import de donnees.
 *
 * Les anciennes fonctions `ensureTag`, `prepareExerciceData`,
 * `validateExerciceFields` et `validateTagInput` ont ete retirees le
 * 2026-09-10 : aucune n'etait appelee, et `ensureTag` cherchait les tags
 * par une cle d'unicite (label, category) qui n'existe plus depuis que les
 * tags sont propres a chaque espace. La resolution des tags vit desormais
 * dans `controllers/import.controller.js`.
 */

/** Interprete un parametre de requete booleen (?dryRun=true, 1, yes...). */
function boolFromQuery(value, defaultValue = false) {
  if (value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase();
  return ['1', 'true', 'yes', 'y'].includes(s);
}

module.exports = { boolFromQuery };
