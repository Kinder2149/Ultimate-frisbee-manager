const matter = require('gray-matter');
const { TAG_CATEGORIES, isValidCategory, isValidLevel } = require('@ufm/shared/constants/tag-categories');

/**
 * Service de parsing Markdown pour l'import d'exercices
 */

function normalizeWhitespace(str) {
  return (str || '').replace(/\r\n?/g, '\n').trim();
}

function extractSection(md, sectionTitle) {
  const pattern = new RegExp(`(^|\n)##\\s+${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\n([\\s\\S]*?)(?=\n##\\s+|$)`, 'i');
  const match = md.match(pattern);
  return match ? match[2].trim() : '';
}

function listFromSection(md, sectionTitle) {
  const section = extractSection(md, sectionTitle);
  if (!section) return [];
  return section
    .split('\n')
    .map(l => l.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}

function concatSections(md, titles) {
  const parts = [];
  for (const t of titles) {
    const content = extractSection(md, t);
    if (content) parts.push(`## ${t}\n${content}`);
  }
  return parts.join('\n\n').trim();
}

const NIVEAU_LABELS = { 1: 'Débutant', 2: 'Intermédiaire', 3: 'Confirmé', 4: 'Avancé', 5: 'Expert' };

function levelFromLabelOrNumber(value) {
  if (value == null) return undefined;
  if (typeof value === 'number') return value;
  const s = String(value).trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const entry = Object.entries(NIVEAU_LABELS).find(([, label]) => label.toLowerCase() === s.toLowerCase());
  return entry ? parseInt(entry[0], 10) : undefined;
}

function toTagObjects(frontmatter) {
  const tags = [];
  (frontmatter.objectif || []).forEach(label => {
    tags.push({ label: String(label).trim(), category: TAG_CATEGORIES.OBJECTIF });
  });
  (frontmatter.travail_specifique || []).forEach(label => {
    tags.push({ label: String(label).trim(), category: TAG_CATEGORIES.TRAVAIL_SPECIFIQUE });
  });
  if (frontmatter.niveau) {
    const level = levelFromLabelOrNumber(frontmatter.niveau);
    if (level) {
      tags.push({ label: NIVEAU_LABELS[level], category: TAG_CATEGORIES.NIVEAU, level });
    }
  }
  if (frontmatter.temps) {
    tags.push({ label: String(frontmatter.temps).trim(), category: TAG_CATEGORIES.TEMPS });
  }
  if (frontmatter.format) {
    tags.push({ label: String(frontmatter.format).trim(), category: TAG_CATEGORIES.FORMAT });
  }
  (frontmatter.theme_entrainement || []).forEach(label => {
    tags.push({ label: String(label).trim(), category: TAG_CATEGORIES.THEME_ENTRAINEMENT });
  });
  return tags.filter(t => isValidCategory(t.category) && (isValidLevel(t.level, t.category)));
}

function computeEffectiveImageUrl(exo) {
  if (exo && exo.imageUrl) {
    const trimmed = String(exo.imageUrl).trim();
    if (trimmed) return trimmed;
  }

  const rawSchemaUrls = exo && exo.schemaUrls;
  if (Array.isArray(rawSchemaUrls) && rawSchemaUrls.length) {
    const first = String(rawSchemaUrls[0] || '').trim();
    if (first) return first;
  } else if (typeof rawSchemaUrls === 'string') {
    const trimmed = rawSchemaUrls.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length) {
          const first = String(parsed[0] || '').trim();
          if (first) return first;
        } else {
          return trimmed;
        }
      } catch (_) {
        return trimmed;
      }
    }
  }

  if (exo && exo.schemaUrl) {
    const trimmed = String(exo.schemaUrl).trim();
    if (trimmed) return trimmed;
  }

  return null;
}

/**
 * Parse un tableau de fichiers Markdown en exercices
 * @param {Array} mdItems - [{name?, content}]
 * @returns {Array} - Exercices parsés
 */
function parseMarkdownToExercises(mdItems) {
  const exercices = [];
  for (const item of mdItems) {
    const { data: fm, content } = matter(item.content);
    const variablesPlusList = listFromSection(content, 'Variables (+)');
    const variablesMinusList = listFromSection(content, 'Variables (-)');
    const description = concatSections(content, [
      'Description', 'Phase 1', 'Phase 2', 'Phase 3', 'Critères de réussite', 'Matériel', 'Durée', 'Notes'
    ]);

    const mdSchemaUrls = fm.schemaUrls;
    let effectiveImageUrl = fm.imageUrl || null;
    if (!effectiveImageUrl && Array.isArray(mdSchemaUrls) && mdSchemaUrls.length) {
      effectiveImageUrl = mdSchemaUrls[0] || null;
    } else if (!effectiveImageUrl && typeof mdSchemaUrls === 'string') {
      const trimmed = mdSchemaUrls.trim();
      if (trimmed) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length) {
            effectiveImageUrl = String(parsed[0] || '').trim() || null;
          } else {
            effectiveImageUrl = trimmed || null;
          }
        } catch (_) {
          effectiveImageUrl = trimmed || null;
        }
      }
    }
    if (!effectiveImageUrl && fm.schemaUrl) {
      const trimmed = String(fm.schemaUrl).trim();
      effectiveImageUrl = trimmed || null;
    }

    exercices.push({
      externalId: fm.externalId || null,
      nom: fm.title || item.name || 'Sans titre',
      description: normalizeWhitespace(description),
      imageUrl: effectiveImageUrl,
      variablesText: '',
      variablesPlus: variablesPlusList.join('; '),
      variablesMinus: variablesMinusList.join('; '),
      tags: toTagObjects(fm)
    });
  }
  return exercices;
}

module.exports = {
  parseMarkdownToExercises,
  computeEffectiveImageUrl,
  normalizeWhitespace
};
