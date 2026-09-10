const { isValidCategory, isValidLevel } = require('@ufm/shared/constants/tag-categories');
const { prisma } = require('../services/prisma');
const { parseMarkdownToExercises, computeEffectiveImageUrl } = require('../services/markdown-parser.service');
const { boolFromQuery } = require('../services/import-validation.service');

/*
 * Import de contenus dans l'espace de travail courant.
 *
 * Regles appliquees a tous les types (corrige le 2026-09-10) :
 *  - tout contenu importe est rattache a l'espace courant (req.workspaceId),
 *    sinon il etait enregistre sans espace et n'apparaissait nulle part ;
 *  - la recherche d'un element existant (mise a jour plutot que creation)
 *    se limite a l'espace courant : un import ne peut plus modifier le
 *    contenu d'un autre espace ;
 *  - les identifiants cites dans le fichier (exercices, echauffement,
 *    situation, tags) doivent appartenir a l'espace courant ;
 *  - les tags sont resolus par la cle d'unicite actuelle
 *    (workspaceId, label, category) ;
 *  - chaque element est traite dans sa propre transaction : une erreur ne
 *    bloque plus les elements suivants (auparavant, une seule requete en
 *    echec rendait toute la transaction inutilisable).
 */

/** Espace courant, pose par workspaceGuard. */
function espaceCourant(req, res) {
  const workspaceId = req.workspaceId;
  if (!workspaceId) {
    res.status(400).json({ error: 'Espace de travail non spécifié', code: 'WORKSPACE_ID_REQUIRED' });
    return null;
  }
  return workspaceId;
}

/** Controle d'un tag fourni par le fichier. */
function verifierTag(t) {
  if (!t || !t.label || !isValidCategory(t.category) || !isValidLevel(t.level, t.category)) {
    throw new Error(`Tag invalide: ${JSON.stringify(t)}`);
  }
}

/**
 * Resout les tags d'un element dans l'espace.
 * - apply  : cree ceux qui manquent (client = transaction)
 * - dryRun : ne cree rien, compte ceux qui seraient crees
 */
async function resoudreTags(client, tags, workspaceId, { creer, clesVues, report }) {
  const ids = [];
  for (const t of tags || []) {
    verifierTag(t);
    const label = t.label.trim();
    const cle = { workspaceId_label_category: { workspaceId, label, category: t.category } };
    if (creer) {
      const tag = await client.tag.upsert({
        where: cle,
        update: { level: t.level ?? null },
        create: { label, category: t.category, level: t.level ?? null, workspaceId },
      });
      ids.push(tag.id);
    } else {
      const existant = await client.tag.findUnique({ where: cle, select: { id: true } });
      if (existant) {
        ids.push(existant.id);
      } else if (report && clesVues) {
        const k = `${label}|${t.category}`;
        if (!clesVues.has(k)) { clesVues.add(k); report.tagsCreated += 1; }
      }
    }
  }
  return ids;
}

/** Verifie que tous les identifiants designent des elements de l'espace. */
async function verifierAppartenance(client, modele, ids, workspaceId, libelle) {
  const uniques = [...new Set((ids || []).filter(Boolean))];
  if (!uniques.length) return;
  const trouves = await client[modele].count({ where: { id: { in: uniques }, workspaceId } });
  if (trouves !== uniques.length) {
    throw new Error(`${libelle} introuvable(s) dans cet espace`);
  }
}

/** Blocs d'echauffement : uniquement les champs connus, textes normalises. */
const CHAMPS_TEXTE_BLOC = ['repetitions', 'temps', 'informations', 'fonctionnement', 'notes'];
function nettoyerBlocs(blocs, workspaceId) {
  return (Array.isArray(blocs) ? blocs : []).map((b, i) => {
    const titre = String((b && b.titre) || '').trim();
    if (!titre) throw new Error(`bloc ${i + 1} : titre manquant`);
    const bloc = { titre, ordre: Number.isInteger(b.ordre) ? b.ordre : i + 1, workspaceId };
    for (const champ of CHAMPS_TEXTE_BLOC) {
      if (b[champ] !== undefined && b[champ] !== null) bloc[champ] = String(b[champ]);
    }
    return bloc;
  });
}

/** Exercices d'un entrainement : uniquement les champs connus. */
function nettoyerLiens(exercices, workspaceId) {
  return (Array.isArray(exercices) ? exercices : [])
    .filter(ex => ex && ex.exerciceId)
    .map((ex, i) => ({
      exerciceId: ex.exerciceId,
      ordre: Number.isInteger(ex.ordre) ? ex.ordre : i + 1,
      duree: Number.isInteger(ex.duree) ? ex.duree : null,
      notes: ex.notes ? String(ex.notes) : null,
      workspaceId,
    }));
}

/** Traite un element dans sa propre transaction ; renvoie son compte-rendu. */
async function traiterElement(fn) {
  return prisma.$transaction(fn);
}

// Import direct depuis des fichiers Markdown envoyes par le frontend
// Body attendu: { files: [{ name?: string, content: string }] }
exports.importExercicesFromMarkdown = async (req, res) => {
  const body = req.body;
  if (!body || !Array.isArray(body.files)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { files: [{name?, content}] }' });
  }
  try {
    const exercices = parseMarkdownToExercises(body.files);
    req.body = { exercices };
    return exports.importExercices(req, res);
  } catch (error) {
    console.error('Erreur import depuis Markdown:', error);
    return res.status(500).json({ error: 'Erreur serveur durant import Markdown', details: error.message });
  }
};

// Body attendu: { entrainements: [ { titre, date?, imageUrl?, tagIds? or tags?, echauffementId?, situationMatchId?, exercices?: [{ exerciceId, ordre?, duree?, notes? }] } ] }
exports.importEntrainements = async (req, res) => {
  const workspaceId = espaceCourant(req, res);
  if (!workspaceId) return;
  const dryRun = boolFromQuery(req.query.dryRun, true);
  const payload = req.body;
  if (!payload || !Array.isArray(payload.entrainements)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { entrainements: [...] }' });
  }

  const report = {
    dryRun,
    totals: { input: payload.entrainements.length, created: 0, updated: 0, skipped: 0 },
    entrainements: [],
    tagsCreated: 0,
  };
  const clesVues = new Set();

  // Controles communs a la simulation et a l'application
  const preparer = async (client, ent, creer) => {
    const titre = String(ent.titre || '').trim();
    if (!titre) throw new Error('titre manquant');
    let tagIds;
    if (Array.isArray(ent.tags)) {
      tagIds = await resoudreTags(client, ent.tags, workspaceId, { creer, clesVues, report });
    } else {
      tagIds = Array.isArray(ent.tagIds) ? ent.tagIds : [];
      await verifierAppartenance(client, 'tag', tagIds, workspaceId, 'Tag(s)');
    }
    const liens = nettoyerLiens(ent.exercices, workspaceId);
    await verifierAppartenance(client, 'exercice', liens.map(l => l.exerciceId), workspaceId, 'Exercice(s)');
    if (ent.echauffementId) await verifierAppartenance(client, 'echauffement', [ent.echauffementId], workspaceId, 'Echauffement');
    if (ent.situationMatchId) await verifierAppartenance(client, 'situationMatch', [ent.situationMatchId], workspaceId, 'Situation');
    const existant = await client.entrainement.findFirst({ where: { titre, workspaceId }, select: { id: true } });
    return { titre, tagIds, liens, existant };
  };

  try {
    for (const ent of payload.entrainements) {
      try {
        if (dryRun) {
          const { titre, tagIds, existant } = await preparer(prisma, ent, false);
          const action = existant ? 'update' : 'create';
          report.totals[action === 'create' ? 'created' : 'updated'] += 1;
          report.entrainements.push({ titre, action, exists: !!existant, imported: false, missing: [], tagIdsCount: tagIds.length, exercicesCount: Array.isArray(ent.exercices) ? ent.exercices.length : 0 });
          continue;
        }
        const ligne = await traiterElement(async (tx) => {
          const { titre, tagIds, liens, existant } = await preparer(tx, ent, true);
          const commun = {
            titre,
            imageUrl: ent.imageUrl || null,
            echauffementId: ent.echauffementId || null,
            situationMatchId: ent.situationMatchId || null,
          };
          if (!existant) {
            const cree = await tx.entrainement.create({
              data: {
                ...commun,
                date: ent.date ? new Date(ent.date) : null,
                workspaceId,
                tags: { connect: tagIds.map(id => ({ id })) },
                exercices: { create: liens },
              },
            });
            return { titre, action: 'create', id: cree.id, exists: false, imported: true, missing: [], tagIdsCount: tagIds.length, exercicesCount: liens.length };
          }
          await tx.entrainementExercice.deleteMany({ where: { entrainementId: existant.id } });
          const maj = await tx.entrainement.update({
            where: { id: existant.id },
            data: {
              ...commun,
              date: ent.date ? new Date(ent.date) : undefined,
              tags: { set: [], connect: tagIds.map(id => ({ id })) },
              exercices: { create: liens },
            },
          });
          return { titre, action: 'update', id: maj.id, exists: true, imported: true, missing: [], tagIdsCount: tagIds.length, exercicesCount: liens.length };
        });
        report.totals[ligne.action === 'create' ? 'created' : 'updated'] += 1;
        report.entrainements.push(ligne);
      } catch (e) {
        report.totals.skipped += 1;
        report.entrainements.push({ titre: ent.titre || '(sans titre)', action: 'skip', error: e.message });
      }
    }
    return res.json(report);
  } catch (error) {
    console.error('Erreur import entrainements:', error);
    return res.status(500).json({ error: 'Erreur serveur durant import entrainements', details: error.message });
  }
};

// Body attendu: { echauffements: [ { nom, description?, imageUrl?, blocs?: [{ ordre?, titre, repetitions?, temps?, informations?, fonctionnement?, notes? }] } ] }
exports.importEchauffements = async (req, res) => {
  const workspaceId = espaceCourant(req, res);
  if (!workspaceId) return;
  const dryRun = boolFromQuery(req.query.dryRun, true);
  const payload = req.body;
  if (!payload || !Array.isArray(payload.echauffements)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { echauffements: [...] }' });
  }

  const report = {
    dryRun,
    totals: { input: payload.echauffements.length, created: 0, updated: 0, skipped: 0 },
    echauffements: [],
  };

  const preparer = async (client, e) => {
    const nom = String(e.nom || '').trim();
    if (!nom) throw new Error('nom manquant');
    const blocs = nettoyerBlocs(e.blocs, workspaceId);
    const existant = await client.echauffement.findFirst({ where: { nom, workspaceId }, select: { id: true } });
    return { nom, blocs, existant };
  };

  try {
    for (const e of payload.echauffements) {
      try {
        if (dryRun) {
          const { nom, blocs, existant } = await preparer(prisma, e);
          const action = existant ? 'update' : 'create';
          report.totals[action === 'create' ? 'created' : 'updated'] += 1;
          report.echauffements.push({ nom, action, exists: !!existant, imported: false, missing: [], blocsCount: blocs.length });
          continue;
        }
        const ligne = await traiterElement(async (tx) => {
          const { nom, blocs, existant } = await preparer(tx, e);
          if (!existant) {
            const cree = await tx.echauffement.create({
              data: {
                nom,
                description: e.description || null,
                imageUrl: e.imageUrl || null,
                workspaceId,
                blocs: { create: blocs },
              },
            });
            return { nom, action: 'create', id: cree.id, exists: false, imported: true, missing: [], blocsCount: blocs.length };
          }
          await tx.blocEchauffement.deleteMany({ where: { echauffementId: existant.id } });
          const maj = await tx.echauffement.update({
            where: { id: existant.id },
            data: {
              nom,
              description: e.description !== undefined ? e.description : undefined,
              imageUrl: e.imageUrl !== undefined ? e.imageUrl : undefined,
              blocs: { create: blocs },
            },
          });
          return { nom, action: 'update', id: maj.id, exists: true, imported: true, missing: [], blocsCount: blocs.length };
        });
        report.totals[ligne.action === 'create' ? 'created' : 'updated'] += 1;
        report.echauffements.push(ligne);
      } catch (err) {
        report.totals.skipped += 1;
        report.echauffements.push({ nom: e.nom || '(sans nom)', action: 'skip', error: err.message });
      }
    }
    return res.json(report);
  } catch (error) {
    console.error('Erreur import echauffements:', error);
    return res.status(500).json({ error: 'Erreur serveur durant import echauffements', details: error.message });
  }
};

// Body attendu: { situations: [ { nom?, type, description?, temps?, imageUrl?, tags?: [{label, category, level?}] } ] }
exports.importSituationsMatchs = async (req, res) => {
  const workspaceId = espaceCourant(req, res);
  if (!workspaceId) return;
  const dryRun = boolFromQuery(req.query.dryRun, true);
  const payload = req.body;
  if (!payload || !Array.isArray(payload.situations)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { situations: [...] }' });
  }

  const report = {
    dryRun,
    totals: { input: payload.situations.length, created: 0, updated: 0, skipped: 0 },
    situations: [],
    tagsCreated: 0,
  };
  const clesVues = new Set();

  const preparer = async (client, s, creer) => {
    const type = String(s.type || '').trim();
    if (!type) throw new Error('type manquant');
    const tagIds = await resoudreTags(client, s.tags, workspaceId, { creer, clesVues, report });
    const existant = await client.situationMatch.findFirst({ where: { type, nom: s.nom || null, workspaceId }, select: { id: true } });
    return { type, tagIds, existant };
  };

  try {
    for (const s of payload.situations) {
      try {
        if (dryRun) {
          const { type, existant } = await preparer(prisma, s, false);
          const action = existant ? 'update' : 'create';
          report.totals[action === 'create' ? 'created' : 'updated'] += 1;
          report.situations.push({ type, nom: s.nom || null, action, exists: !!existant, imported: false, missing: [], tagsCount: Array.isArray(s.tags) ? s.tags.length : 0 });
          continue;
        }
        const ligne = await traiterElement(async (tx) => {
          const { type, tagIds, existant } = await preparer(tx, s, true);
          if (!existant) {
            const cree = await tx.situationMatch.create({
              data: {
                nom: s.nom || null,
                type,
                description: s.description || null,
                temps: s.temps != null ? String(s.temps) : null,
                imageUrl: s.imageUrl || null,
                workspaceId,
                tags: { connect: tagIds.map(id => ({ id })) },
              },
            });
            return { type, nom: s.nom || null, action: 'create', id: cree.id, exists: false, imported: true, missing: [], tagsCount: tagIds.length };
          }
          const maj = await tx.situationMatch.update({
            where: { id: existant.id },
            data: {
              nom: s.nom !== undefined ? s.nom : undefined,
              description: s.description !== undefined ? s.description : undefined,
              temps: s.temps !== undefined ? (s.temps != null ? String(s.temps) : null) : undefined,
              imageUrl: s.imageUrl !== undefined ? s.imageUrl : undefined,
              tags: { set: [], connect: tagIds.map(id => ({ id })) },
            },
          });
          return { type, nom: s.nom || null, action: 'update', id: maj.id, exists: true, imported: true, missing: [], tagsCount: tagIds.length };
        });
        report.totals[ligne.action === 'create' ? 'created' : 'updated'] += 1;
        report.situations.push(ligne);
      } catch (err) {
        report.totals.skipped += 1;
        report.situations.push({ nom: s.nom || null, type: s.type || '(sans type)', action: 'skip', error: err.message });
      }
    }
    return res.json(report);
  } catch (error) {
    console.error('Erreur import situations:', error);
    return res.status(500).json({ error: 'Erreur serveur durant import situations', details: error.message });
  }
};

// Body attendu: { exercices: [ { nom, description, imageUrl?, variablesPlus?, variablesMinus?, tags?: [{label, category, level?}] } ] }
exports.importExercices = async (req, res) => {
  const workspaceId = espaceCourant(req, res);
  if (!workspaceId) return;
  const dryRun = boolFromQuery(req.query.dryRun, true);
  const payload = req.body;
  if (!payload || !Array.isArray(payload.exercices)) {
    return res.status(400).json({ error: 'Payload invalide: attendez { exercices: [...] }' });
  }

  // Pagination pour eviter le delai maximal des fonctions Vercel (10 s)
  const batchSize = parseInt(req.query.batchSize) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const exercicesATraiter = payload.exercices.slice(offset, offset + batchSize);
  const hasMore = offset + batchSize < payload.exercices.length;

  const report = {
    dryRun,
    pagination: {
      total: payload.exercices.length,
      offset,
      batchSize,
      processed: exercicesATraiter.length,
      hasMore,
      nextOffset: hasMore ? offset + batchSize : null,
    },
    totals: { input: exercicesATraiter.length, created: 0, updated: 0, skipped: 0 },
    exercices: [],
    tagsCreated: 0,
  };
  const clesVues = new Set();

  const preparer = async (client, exo, creer) => {
    const nom = (exo.nom || '').trim();
    const description = (exo.description || '').trim();
    const manquants = [];
    if (!nom) manquants.push('nom');
    if (!description) manquants.push('description');
    if (manquants.length) throw new Error('champs manquants: ' + manquants.join(', '));
    const tagIds = await resoudreTags(client, exo.tags, workspaceId, { creer, clesVues, report });
    const donnees = {
      nom,
      description,
      imageUrl: computeEffectiveImageUrl(exo),
      variablesPlus: exo.variablesPlus || '',
      variablesMinus: exo.variablesMinus || '',
    };
    const existant = await client.exercice.findFirst({ where: { nom, workspaceId }, select: { id: true } });
    return { donnees, tagIds, existant };
  };

  try {
    for (const exo of exercicesATraiter) {
      try {
        if (dryRun) {
          const { donnees, tagIds, existant } = await preparer(prisma, exo, false);
          const action = existant ? 'update' : 'create';
          report.totals[action === 'create' ? 'created' : 'updated'] += 1;
          report.exercices.push({ nom: donnees.nom, action, exists: !!existant, imported: false, missing: [], tagIdsCount: tagIds.length });
          continue;
        }
        const ligne = await traiterElement(async (tx) => {
          const { donnees, tagIds, existant } = await preparer(tx, exo, true);
          if (!existant) {
            const cree = await tx.exercice.create({
              data: { ...donnees, workspaceId, tags: { connect: tagIds.map(id => ({ id })) } },
            });
            return { nom: donnees.nom, action: 'create', id: cree.id, exists: false, imported: true, missing: [], tagIdsCount: tagIds.length };
          }
          const maj = await tx.exercice.update({
            where: { id: existant.id },
            data: { ...donnees, tags: { set: [], connect: tagIds.map(id => ({ id })) } },
          });
          return { nom: donnees.nom, action: 'update', id: maj.id, exists: true, imported: true, missing: [], tagIdsCount: tagIds.length };
        });
        report.totals[ligne.action === 'create' ? 'created' : 'updated'] += 1;
        report.exercices.push(ligne);
      } catch (e) {
        report.totals.skipped += 1;
        report.exercices.push({ nom: exo.nom || '(sans nom)', action: 'skip', error: e.message });
      }
    }
    return res.json(report);
  } catch (error) {
    console.error('Erreur import:', error);
    return res.status(500).json({ error: 'Erreur serveur durant import', details: error.message });
  }
};
