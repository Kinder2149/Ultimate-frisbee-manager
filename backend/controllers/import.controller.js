const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
  TAG_CATEGORIES,
  isValidCategory,
  isValidLevel
} = require('../../shared/constants/tag-categories');

const matter = require('gray-matter');

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

function parseMarkdownToExercises(mdItems) {
  // mdItems: array of { name?: string, content: string }
  const exercices = [];
  for (const item of mdItems) {
    const { data: fm, content } = matter(item.content);
    const variablesPlusList = listFromSection(content, 'Variables (+)');
    const variablesMinusList = listFromSection(content, 'Variables (-)');
    const description = concatSections(content, [
      'Description', 'Phase 1', 'Phase 2', 'Phase 3', 'Critères de réussite', 'Matériel', 'Durée', 'Notes'
    ]);
    exercices.push({
      externalId: fm.externalId || null,
      nom: fm.title || item.name || 'Sans titre',
      description: normalizeWhitespace(description),
      imageUrl: fm.imageUrl || null,
      schemaUrl: fm.schemaUrl || null,
      variablesText: '',
      variablesPlus: variablesPlusList.join('; '),
      variablesMinus: variablesMinusList.join('; '),
      tags: toTagObjects(fm)
    });
  }
  return exercices;
}

function boolFromQuery(value, defaultValue = false) {
  if (value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  const s = String(value).toLowerCase();
  return ['1', 'true', 'yes', 'y'].includes(s);
}

async function ensureTag(tagInput) {
  // tagInput: { label, category, level? }
  const label = (tagInput.label || '').trim();
  const category = tagInput.category;
  const level = tagInput.level ?? null;

  if (!label || !isValidCategory(category) || !isValidLevel(level, category)) {
    throw new Error(`Tag invalide: ${JSON.stringify(tagInput)}`);
  }

  // upsert par contrainte unique composite [label, category]
  const tag = await prisma.tag.upsert({
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

  // Résoudre tous les tags (création si nécessaire)
  const tagIds = [];
  for (const t of exo.tags || []) {
    const tag = await ensureTag(t);
    tagIds.push(tag.id);
  }

  return {
    data: {
      nom,
      description,
      imageUrl: exo.imageUrl || null,
      schemaUrl: exo.schemaUrl || null,
      variablesText: exo.variablesText || '',
      variablesPlus: exo.variablesPlus || '',
      variablesMinus: exo.variablesMinus || ''
    },
    tagIds
  };
}

// Nouveau: import direct depuis des fichiers Markdown envoyés par le frontend
// Body attendu: { files: [{ name?: string, content: string }] }
exports.importExercicesFromMarkdown = async (req, res) => {
  const dryRun = boolFromQuery(req.query.dryRun, true);
  const body = req.body;
  if (!body || !Array.isArray(body.files)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { files: [{name?, content}] }' });
  }
  try {
    const exercices = parseMarkdownToExercises(body.files);
    // réutiliser le handler JSON en injectant req.body
    req.body = { exercices };
    return exports.importExercices(req, res);
  } catch (error) {
    console.error('Erreur import depuis Markdown:', error);
    return res.status(500).json({ error: 'Erreur serveur durant import Markdown', details: error.message });
  }
};


exports.importExercices = async (req, res) => {
  const dryRun = boolFromQuery(req.query.dryRun, true);
  const payload = req.body;

  if (!payload || !Array.isArray(payload.exercices)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { exercices: [...] }' });
  }

  const report = {
    dryRun,
    totals: { input: payload.exercices.length, created: 0, updated: 0, skipped: 0 },
    exercices: [],
    tagsCreated: 0
  };

  try {
    // Collecte préalable des tags pour compter les créations distinctes (optionnel)
    const tagKeysSeen = new Set();

    // Première passe: validation et résolution tags (peut créer en dry-run? non)
    // En dryRun: on ne crée pas réellement, on simule en vérifiant la validité et l'état existant
    if (dryRun) {
      for (const exo of payload.exercices) {
        try {
          const { data, tagIds } = await (async () => {
            // Simule ensureTag: vérifie seulement la validité et existence
            const tagIdsSimu = [];
            for (const t of exo.tags || []) {
              if (!t.label || !isValidCategory(t.category) || !isValidLevel(t.level, t.category)) {
                throw new Error(`Tag invalide: ${JSON.stringify(t)}`);
              }
              // check existence
              const existingTag = await prisma.tag.findUnique({
                where: { label_category: { label: t.label.trim(), category: t.category } },
                select: { id: true }
              });
              if (!existingTag) {
                const key = `${t.label.trim()}|${t.category}`;
                if (!tagKeysSeen.has(key)) {
                  tagKeysSeen.add(key);
                  report.tagsCreated += 1;
                }
              } else {
                tagIdsSimu.push(existingTag.id);
              }
            }
            return { data: {
              nom: (exo.nom || '').trim(),
              description: (exo.description || '').trim(),
              imageUrl: exo.imageUrl || null,
              schemaUrl: exo.schemaUrl || null,
              variablesText: exo.variablesText || '',
              variablesPlus: exo.variablesPlus || '',
              variablesMinus: exo.variablesMinus || ''
            }, tagIds: tagIdsSimu };
          })();

          if (!data.nom || !data.description) throw new Error('nom/description manquant');

          const existing = await prisma.exercice.findFirst({ where: { nom: data.nom }, select: { id: true } });
          const action = existing ? 'update' : 'create';
          report.totals[action === 'create' ? 'created' : 'updated'] += 1;
          report.exercices.push({ nom: data.nom, action, tagIdsCount: tagIds.length });
        } catch (e) {
          report.totals.skipped += 1;
          report.exercices.push({ nom: exo.nom || '(sans nom)', action: 'skip', error: e.message });
        }
      }
      return res.json(report);
    }

    // Mode apply: exécuter dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      for (const exo of payload.exercices) {
        try {
          // Résoudre/Créer les tags réellement
          const tagIds = [];
          for (const t of exo.tags || []) {
            const tag = await tx.tag.upsert({
              where: { label_category: { label: t.label.trim(), category: t.category } },
              update: { level: t.level ?? null },
              create: { label: t.label.trim(), category: t.category, level: t.level ?? null }
            });
            tagIds.push(tag.id);
          }

          const nom = (exo.nom || '').trim();
          const description = (exo.description || '').trim();
          if (!nom || !description) throw new Error('nom/description manquant');

          const existing = await tx.exercice.findFirst({ where: { nom }, select: { id: true } });

          if (!existing) {
            const created = await tx.exercice.create({
              data: {
                nom,
                description,
                imageUrl: exo.imageUrl || null,
                schemaUrl: exo.schemaUrl || null,
                variablesText: exo.variablesText || '',
                variablesPlus: exo.variablesPlus || '',
                variablesMinus: exo.variablesMinus || '',
                tags: { connect: tagIds.map(id => ({ id })) }
              }
            });
            report.totals.created += 1;
            report.exercices.push({ nom, action: 'create', id: created.id, tagIdsCount: tagIds.length });
          } else {
            const updated = await tx.exercice.update({
              where: { id: existing.id },
              data: {
                nom,
                description,
                imageUrl: exo.imageUrl || null,
                schemaUrl: exo.schemaUrl || null,
                variablesText: exo.variablesText || '',
                variablesPlus: exo.variablesPlus || '',
                variablesMinus: exo.variablesMinus || '',
                tags: { set: [], connect: tagIds.map(id => ({ id })) }
              }
            });
            report.totals.updated += 1;
            report.exercices.push({ nom, action: 'update', id: updated.id, tagIdsCount: tagIds.length });
          }
        } catch (e) {
          report.totals.skipped += 1;
          report.exercices.push({ nom: exo.nom || '(sans nom)', action: 'skip', error: e.message });
        }
      }
      return report;
    });

    return res.json(result);
  } catch (error) {
    console.error('Erreur import:', error);
    return res.status(500).json({ error: 'Erreur serveur durant import', details: error.message });
  }
};
