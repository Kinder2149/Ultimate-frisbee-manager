// Constantes globales pour export/import UFM
// Langue: français

export const EXPORT_DIR = 'exports/ufm/';
export const FILE_EXT_UFM = '.ufm.json';
export const DEFAULT_SCHEMA_VERSION = '1.0';
export const ARCHIVE_DIR = 'archive/old_trainings_module/';
export const IMPORT_LOG_DIR = 'logs/imports/';

export const UFM_ALLOWED_TYPES = [
  'entrainement',
  'exercice',
  'echauffement',
  'situation',
  'match',
] as const;

export type UfmAllowedType = typeof UFM_ALLOWED_TYPES[number];
