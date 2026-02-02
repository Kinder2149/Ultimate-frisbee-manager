import { Tag } from '../../../../core/models/tag.model';

export function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(v => (v ?? '').toString().trim())
      .filter(v => v.length > 0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map(v => (v ?? '').toString().trim())
          .filter(v => v.length > 0);
      }
    } catch {
      // ignore
    }

    return [trimmed];
  }

  return [];
}

export function tagsToTagIds(tags: Array<Tag | null | undefined>): string[] {
  return tags
    .filter((t): t is Tag => !!t)
    .map(t => t.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}
