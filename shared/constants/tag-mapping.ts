// Mapping legacy -> canonical pour les tags
// Langue: français

export const TAG_LEGACY_MAPPING: Record<string, string> = {
  'échauffement': 'warmup',
  'warmup': 'warmup',
  'defense': 'defense',
  'défense': 'defense',
  'offense': 'offense',
  'attaque': 'offense'
};

export function mapLegacyTag(tag: string): { mapped?: string; changed: boolean } {
  const key = String(tag || '').toLowerCase().trim();
  if (key in TAG_LEGACY_MAPPING) {
    return { mapped: TAG_LEGACY_MAPPING[key], changed: TAG_LEGACY_MAPPING[key] !== tag };
  }
  return { changed: false };
}
