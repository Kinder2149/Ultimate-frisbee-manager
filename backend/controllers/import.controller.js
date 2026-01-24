const { TAG_CATEGORIES, isValidCategory, isValidLevel } = require('@ufm/shared/constants/tag-categories');
const { prisma } = require('../services/prisma');
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
    // On prépare déjà une imageUrl effective à partir des anciens champs éventuels
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

  // Image principale effective calculée à partir des anciens champs éventuels
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

// Helper pour unifier la logique de détermination de l image principale
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

// --- Nouveaux Handlers d'Import ---

// Body attendu: { entrainements: [ { titre, date?, imageUrl?, tagIds? or tags?, echauffementId?, situationMatchId?, exercices?: [{ exerciceId, ordre?, duree?, notes? }] } ] }
exports.importEntrainements = async (req, res) => {
  const dryRun = boolFromQuery(req.query.dryRun, true);
  const payload = req.body;

  if (!payload || !Array.isArray(payload.entrainements)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { entrainements: [...] }' });
  }

  const report = {
    dryRun,
    totals: { input: payload.entrainements.length, created: 0, updated: 0, skipped: 0 },
    entrainements: [],
    tagsCreated: 0
  };

  try {
    const tagKeysSeen = new Set();

    if (dryRun) {
      for (const ent of payload.entrainements) {
        try {
          const titre = String(ent.titre || '').trim();
          if (!titre) throw new Error('titre manquant');

          // Vérifier tags (ids ou objets)
          const tagIdsSimu = [];
          if (Array.isArray(ent.tags)) {
            for (const t of ent.tags) {
              if (!t.label || !isValidCategory(t.category) || !isValidLevel(t.level, t.category)) {
                throw new Error(`Tag invalide: ${JSON.stringify(t)}`);
              }
              const existing = await prisma.tag.findUnique({ where: { label_category: { label: t.label.trim(), category: t.category } }, select: { id: true } });
              if (!existing) {
                const key = `${t.label.trim()}|${t.category}`;
                if (!tagKeysSeen.has(key)) { tagKeysSeen.add(key); report.tagsCreated += 1; }
              } else { tagIdsSimu.push(existing.id); }
            }
          }

          const existing = await prisma.entrainement.findFirst({ where: { titre }, select: { id: true } });
          const action = existing ? 'update' : 'create';
          report.totals[action === 'create' ? 'created' : 'updated'] += 1;
          report.entrainements.push({ titre, action, exists: !!existing, imported: false, missing: [], tagIdsCount: tagIdsSimu.length, exercicesCount: Array.isArray(ent.exercices) ? ent.exercices.length : 0 });
        } catch (e) {
          report.totals.skipped += 1;
          report.entrainements.push({ titre: ent.titre || '(sans titre)', action: 'skip', error: e.message });
        }
      }
      return res.json(report);
    }

    // apply
    const result = await prisma.$transaction(async (tx) => {
      for (const ent of payload.entrainements) {
        try {
          const titre = String(ent.titre || '').trim();
          if (!titre) throw new Error('titre manquant');

          // Résoudre tags
          const tagIds = [];
          if (Array.isArray(ent.tags)) {
            for (const t of ent.tags) {
              const tag = await tx.tag.upsert({
                where: { label_category: { label: t.label.trim(), category: t.category } },
                update: { level: t.level ?? null },
                create: { label: t.label.trim(), category: t.category, level: t.level ?? null }
              });
              tagIds.push(tag.id);
            }
          } else if (Array.isArray(ent.tagIds)) {
            tagIds.push(...ent.tagIds);
          }

          const existing = await tx.entrainement.findFirst({ where: { titre }, select: { id: true } });

          if (!existing) {
            const created = await tx.entrainement.create({
              data: {
                titre,
                date: ent.date ? new Date(ent.date) : null,
                imageUrl: ent.imageUrl || null,
                echauffementId: ent.echauffementId || null,
                situationMatchId: ent.situationMatchId || null,
                tags: { connect: tagIds.map(id => ({ id })) },
                exercices: {
                  create: (ent.exercices || []).filter(ex => ex && ex.exerciceId).map((ex, i) => ({
                    exerciceId: ex.exerciceId,
                    ordre: ex.ordre || i + 1,
                    duree: ex.duree || null,
                    notes: ex.notes || null
                  }))
                }
              }
            });
            report.totals.created += 1;
            report.entrainements.push({ titre, action: 'create', id: created.id, exists: false, imported: true, missing: [], tagIdsCount: tagIds.length, exercicesCount: (ent.exercices || []).length });
          } else {
            // Remplacer les relations
            await tx.entrainementExercice.deleteMany({ where: { entrainementId: existing.id } });
            const updated = await tx.entrainement.update({
              where: { id: existing.id },
              data: {
                titre,
                date: ent.date ? new Date(ent.date) : undefined,
                imageUrl: ent.imageUrl !== undefined ? ent.imageUrl : undefined,
                echauffementId: ent.echauffementId !== undefined ? ent.echauffementId : undefined,
                situationMatchId: ent.situationMatchId !== undefined ? ent.situationMatchId : undefined,
                tags: { set: [], connect: tagIds.map(id => ({ id })) },
                exercices: {
                  create: (ent.exercices || []).filter(ex => ex && ex.exerciceId).map((ex, i) => ({
                    exerciceId: ex.exerciceId,
                    ordre: ex.ordre || i + 1,
                    duree: ex.duree || null,
                    notes: ex.notes || null
                  }))
                }
              }
            });
            report.totals.updated += 1;
            report.entrainements.push({ titre, action: 'update', id: updated.id, exists: true, imported: true, missing: [], tagIdsCount: tagIds.length, exercicesCount: (ent.exercices || []).length });
          }
        } catch (e) {
          report.totals.skipped += 1;
          report.entrainements.push({ titre: ent.titre || '(sans titre)', action: 'skip', error: e.message });
        }
      }
      return report;
    });

    return res.json(result);
  } catch (error) {
    console.error('Erreur import entrainements:', error);
    return res.status(500).json({ error: 'Erreur serveur durant import entrainements', details: error.message });
  }
};

// Body attendu: { echauffements: [ { nom, description?, imageUrl?, blocs?: [{ ordre?, titre, repetitions?, temps?, informations?, fonctionnement?, notes? }] } ] }
exports.importEchauffements = async (req, res) => {
  const dryRun = boolFromQuery(req.query.dryRun, true);
  const payload = req.body;

  if (!payload || !Array.isArray(payload.echauffements)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { echauffements: [...] }' });
  }

  const report = {
    dryRun,
    totals: { input: payload.echauffements.length, created: 0, updated: 0, skipped: 0 },
    echauffements: []
  };

  try {
    if (dryRun) {
      for (const e of payload.echauffements) {
        try {
          const nom = String(e.nom || '').trim();
          if (!nom) throw new Error('nom manquant');
          const existing = await prisma.echauffement.findFirst({ where: { nom }, select: { id: true } });
          const action = existing ? 'update' : 'create';
          report.totals[action === 'create' ? 'created' : 'updated'] += 1;
          report.echauffements.push({ nom, action, exists: !!existing, imported: false, missing: [], blocsCount: Array.isArray(e.blocs) ? e.blocs.length : 0 });
        } catch (err) {
          report.totals.skipped += 1;
          report.echauffements.push({ nom: e.nom || '(sans nom)', action: 'skip', error: err.message });
        }
      }
      return res.json(report);
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const e of payload.echauffements) {
        try {
          const nom = String(e.nom || '').trim();
          if (!nom) throw new Error('nom manquant');
          const existing = await tx.echauffement.findFirst({ where: { nom }, select: { id: true } });
          if (!existing) {
            const created = await tx.echauffement.create({
              data: {
                nom,
                description: e.description || null,
                imageUrl: e.imageUrl || null,
                blocs: { create: (e.blocs || []).map((b, i) => ({ ...b, ordre: b.ordre || i + 1 })) }
              },
              include: { blocs: true }
            });
            report.totals.created += 1;
            report.echauffements.push({ nom, action: 'create', id: created.id, exists: false, imported: true, missing: [], blocsCount: (e.blocs || []).length });
          } else {
            await tx.blocEchauffement.deleteMany({ where: { echauffementId: existing.id } });
            const updated = await tx.echauffement.update({
              where: { id: existing.id },
              data: {
                nom,
                description: e.description !== undefined ? e.description : undefined,
                imageUrl: e.imageUrl !== undefined ? e.imageUrl : undefined,
                blocs: { create: (e.blocs || []).map((b, i) => ({ ...b, ordre: b.ordre || i + 1 })) }
              },
              include: { blocs: true }
            });
            report.totals.updated += 1;
            report.echauffements.push({ nom, action: 'update', id: updated.id, exists: true, imported: true, missing: [], blocsCount: (e.blocs || []).length });
          }
        } catch (err) {
          report.totals.skipped += 1;
          report.echauffements.push({ nom: e.nom || '(sans nom)', action: 'skip', error: err.message });
        }
      }
      return report;
    });

    return res.json(result);
  } catch (error) {
    console.error('Erreur import echauffements:', error);
    return res.status(500).json({ error: 'Erreur serveur durant import echauffements', details: error.message });
  }
};

// Body attendu: { situations: [ { nom?, type, description?, temps?, imageUrl?, tags?: [{label, category, level?}] } ] }
exports.importSituationsMatchs = async (req, res) => {
  const dryRun = boolFromQuery(req.query.dryRun, true);
  const payload = req.body;

  if (!payload || !Array.isArray(payload.situations)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { situations: [...] }' });
  }

  const report = {
    dryRun,
    totals: { input: payload.situations.length, created: 0, updated: 0, skipped: 0 },
    situations: [],
    tagsCreated: 0
  };

  try {
    const tagKeysSeen = new Set();

    if (dryRun) {
      for (const s of payload.situations) {
        try {
          const type = String(s.type || '').trim();
          if (!type) throw new Error('type manquant');
          if (Array.isArray(s.tags)) {
            for (const t of s.tags) {
              if (!t.label || !isValidCategory(t.category) || !isValidLevel(t.level, t.category)) {
                throw new Error(`Tag invalide: ${JSON.stringify(t)}`);
              }
              const existing = await prisma.tag.findUnique({ where: { label_category: { label: t.label.trim(), category: t.category } }, select: { id: true } });
              if (!existing) {
                const key = `${t.label.trim()}|${t.category}`;
                if (!tagKeysSeen.has(key)) { tagKeysSeen.add(key); report.tagsCreated += 1; }
              }
            }
          }
          const existingSit = await prisma.situationMatch.findFirst({ where: { type, nom: s.nom || null }, select: { id: true } });
          const action = existingSit ? 'update' : 'create';
          report.totals[action === 'create' ? 'created' : 'updated'] += 1;
          report.situations.push({ type, nom: s.nom || null, action, exists: !!existingSit, imported: false, missing: [], tagsCount: Array.isArray(s.tags) ? s.tags.length : 0 });
        } catch (err) {
          report.totals.skipped += 1;
          report.situations.push({ nom: s.nom || null, type: s.type || '(sans type)', action: 'skip', error: err.message });
        }
      }
      return res.json(report);
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const s of payload.situations) {
        try {
          const type = String(s.type || '').trim();
          if (!type) throw new Error('type manquant');
          const tagIds = [];
          if (Array.isArray(s.tags)) {
            for (const t of s.tags) {
              const tag = await tx.tag.upsert({
                where: { label_category: { label: t.label.trim(), category: t.category } },
                update: { level: t.level ?? null },
                create: { label: t.label.trim(), category: t.category, level: t.level ?? null }
              });
              tagIds.push(tag.id);
            }
          }
          const existingSit = await tx.situationMatch.findFirst({ where: { type, nom: s.nom || null }, select: { id: true } });
          if (!existingSit) {
            const created = await tx.situationMatch.create({
              data: {
                nom: s.nom || null,
                type,
                description: s.description || null,
                temps: s.temps || null,
                imageUrl: s.imageUrl || null,
                tags: { connect: tagIds.map(id => ({ id })) }
              },
              include: { tags: true }
            });
            report.totals.created += 1;
            report.situations.push({ type, nom: s.nom || null, action: 'create', id: created.id, exists: false, imported: true, missing: [], tagsCount: tagIds.length });
          } else {
            const updated = await tx.situationMatch.update({
              where: { id: existingSit.id },
              data: {
                nom: s.nom !== undefined ? s.nom : undefined,
                description: s.description !== undefined ? s.description : undefined,
                temps: s.temps !== undefined ? s.temps : undefined,
                imageUrl: s.imageUrl !== undefined ? s.imageUrl : undefined,
                tags: { set: [], connect: tagIds.map(id => ({ id })) }
              },
              include: { tags: true }
            });
            report.totals.updated += 1;
            report.situations.push({ type, nom: s.nom || null, action: 'update', id: updated.id, exists: true, imported: true, missing: [], tagsCount: tagIds.length });
          }
        } catch (err) {
          report.totals.skipped += 1;
          report.situations.push({ nom: s.nom || null, type: s.type || '(sans type)', action: 'skip', error: err.message });
        }
      }
      return report;
    });

    return res.json(result);
  } catch (error) {
    console.error('Erreur import situations:', error);
    return res.status(500).json({ error: 'Erreur serveur durant import situations', details: error.message });
  }
};


exports.importExercices = async (req, res) => {
  const dryRun = boolFromQuery(req.query.dryRun, true);
  const payload = req.body;

  if (!payload || !Array.isArray(payload.exercices)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { exercices: [...] }' });
  }

  // Pagination pour éviter timeout Vercel Functions (10s max)
  const batchSize = parseInt(req.query.batchSize) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const exercicesToProcess = payload.exercices.slice(offset, offset + batchSize);
  const hasMore = offset + batchSize < payload.exercices.length;

  const report = {
    dryRun,
    pagination: {
      total: payload.exercices.length,
      offset,
      batchSize,
      processed: exercicesToProcess.length,
      hasMore,
      nextOffset: hasMore ? offset + batchSize : null
    },
    totals: { input: exercicesToProcess.length, created: 0, updated: 0, skipped: 0 },
    exercices: [],
    tagsCreated: 0
  };

  try {
    // Collecte préalable des tags pour compter les créations distinctes (optionnel)
    const tagKeysSeen = new Set();

    // Première passe: validation et résolution tags (peut créer en dry-run? non)
    // En dryRun: on ne crée pas réellement, on simule en vérifiant la validité et l'état existant
    if (dryRun) {
      for (const exo of exercicesToProcess) {
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
            const effectiveImageUrl = computeEffectiveImageUrl(exo);
            return { data: {
              nom: (exo.nom || '').trim(),
              description: (exo.description || '').trim(),
              imageUrl: effectiveImageUrl,
              variablesPlus: exo.variablesPlus || '',
              variablesMinus: exo.variablesMinus || ''
            }, tagIds: tagIdsSimu };
          })();

          const missing = [];
          if (!data.nom) missing.push('nom');
          if (!data.description) missing.push('description');
          if (missing.length) throw new Error('champs manquants: ' + missing.join(', '));

          const existing = await prisma.exercice.findFirst({ where: { nom: data.nom }, select: { id: true } });
          const action = existing ? 'update' : 'create';
          report.totals[action === 'create' ? 'created' : 'updated'] += 1;
          report.exercices.push({ nom: data.nom, action, exists: !!existing, imported: false, missing: [], tagIdsCount: tagIds.length });
        } catch (e) {
          report.totals.skipped += 1;
          report.exercices.push({ nom: exo.nom || '(sans nom)', action: 'skip', error: e.message });
        }
      }
      return res.json(report);
    }

    // Mode apply: exécuter dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      for (const exo of exercicesToProcess) {
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
          const missing = [];
          if (!nom) missing.push('nom');
          if (!description) missing.push('description');
          if (missing.length) throw new Error('champs manquants: ' + missing.join(', '));

          const existing = await tx.exercice.findFirst({ where: { nom }, select: { id: true } });

          const effectiveImageUrl = computeEffectiveImageUrl(exo);

          if (!existing) {
            const created = await tx.exercice.create({
              data: {
                nom,
                description,
                imageUrl: effectiveImageUrl,
                variablesPlus: exo.variablesPlus || '',
                variablesMinus: exo.variablesMinus || '',
                tags: { connect: tagIds.map(id => ({ id })) }
              }
            });
            report.totals.created += 1;
            report.exercices.push({ nom, action: 'create', id: created.id, exists: false, imported: true, missing: [], tagIdsCount: tagIds.length });
          } else {
            const updated = await tx.exercice.update({
              where: { id: existing.id },
              data: {
                nom,
                description,
                imageUrl: effectiveImageUrl,
                variablesPlus: exo.variablesPlus || '',
                variablesMinus: exo.variablesMinus || '',
                tags: { set: [], connect: tagIds.map(id => ({ id })) }
              }
            });
            report.totals.updated += 1;
            report.exercices.push({ nom, action: 'update', id: updated.id, exists: true, imported: true, missing: [], tagIdsCount: tagIds.length });
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
