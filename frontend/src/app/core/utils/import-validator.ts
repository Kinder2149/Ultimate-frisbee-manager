import { UFM_ALLOWED_TYPES, UfmAllowedType } from '@ufm/shared/constants/export-import';
import { mapLegacyTag } from '@ufm/shared/constants/tag-mapping';

export interface MissingField {
  field: string;
  critical: boolean;
}

export interface TagMismatch {
  original: string;
  mapped?: string;
}

export interface ValidationResult {
  missingFields: MissingField[];
  unknownFields: string[];
  tagMismatches: TagMismatch[];
}

const REQUIRED_FIELDS: Record<UfmAllowedType, string[]> = {
  entrainement: ['nom'],
  exercice: ['nom'],
  echauffement: ['nom'],
  situation: ['nom'],
  match: ['nom']
};

const OPTIONAL_FIELDS: Record<UfmAllowedType, string[]> = {
  entrainement: ['description', 'tags', 'elements'],
  exercice: ['description', 'tags', 'duree', 'niveau'],
  echauffement: ['description', 'tags', 'duree'],
  situation: ['description', 'tags'],
  match: ['description', 'tags', 'adversaire', 'date']
};

export function validate(type: string, data: any): ValidationResult {
  const t = normalizeType(type);
  const missingFields: MissingField[] = [];
  const unknownFields: string[] = [];
  const tagMismatches: TagMismatch[] = [];

  const required = new Set(REQUIRED_FIELDS[t] || []);
  const optional = new Set(OPTIONAL_FIELDS[t] || []);

  // Champs manquants
  for (const f of required) {
    if (!(f in data) || data[f] === undefined || data[f] === null || data[f] === '') {
      missingFields.push({ field: f, critical: true });
    }
  }

  // Champs inconnus
  const known = new Set<string>([...required, ...optional]);
  Object.keys(data || {}).forEach(k => {
    if (!known.has(k)) unknownFields.push(k);
  });

  // Tags mapping/mismatch
  const tags = Array.isArray(data?.tags) ? (data.tags as unknown[]) : [];
  for (const raw of tags) {
    if (typeof raw !== 'string') continue;
    const res = mapLegacyTag(raw);
    if (res.changed) {
      tagMismatches.push({ original: raw, mapped: res.mapped });
    }
  }

  return { missingFields, unknownFields, tagMismatches };
}

function normalizeType(type: string): UfmAllowedType {
  const t = (type || '').toLowerCase();
  if ((UFM_ALLOWED_TYPES as readonly string[]).includes(t)) return t as UfmAllowedType;
  throw new Error(`Type inconnu: ${type}`);
}
