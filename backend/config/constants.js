// Constantes globales Export/Import pour le backend
// Langue: français

const EXPORT_DIR = 'exports/ufm/';
const FILE_EXT_UFM = '.ufm.json';
const DEFAULT_SCHEMA_VERSION = '1.0';
const ARCHIVE_DIR = 'archive/old_trainings_module/';
const IMPORT_LOG_DIR = 'logs/imports/';

const UFM_ALLOWED_TYPES = Object.freeze([
  'entrainement',
  'exercice',
  'echauffement',
  'situation',
  'match',
]);

module.exports = {
  EXPORT_DIR,
  FILE_EXT_UFM,
  DEFAULT_SCHEMA_VERSION,
  ARCHIVE_DIR,
  IMPORT_LOG_DIR,
  UFM_ALLOWED_TYPES,
};
