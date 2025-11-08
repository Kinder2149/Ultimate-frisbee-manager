const { prisma } = require('./prisma');

async function getExerciceForExport(id) {
  return prisma.exercice.findUnique({
    where: { id },
    include: { tags: true }
  });
}

async function getEntrainementForExport(id) {
  return prisma.entrainement.findUnique({
    where: { id },
    include: {
      exercices: { orderBy: { ordre: 'asc' }, include: { exercice: { include: { tags: true } } } },
      tags: true,
      echauffement: { include: { blocs: { orderBy: { ordre: 'asc' } } } },
      situationMatch: { include: { tags: true } }
    }
  });
}

async function getEchauffementForExport(id) {
  return prisma.echauffement.findUnique({
    where: { id },
    include: { blocs: { orderBy: { ordre: 'asc' } } }
  });
}

async function getSituationForExport(id) {
  return prisma.situationMatch.findUnique({
    where: { id },
    include: { tags: true }
  });
}

function serializeExercice(entity) {
  if (!entity) return null;
  return {
    id: entity.id,
    nom: entity.nom,
    description: entity.description,
    imageUrl: entity.imageUrl || null,
    schemaUrl: entity.schemaUrl || null,
    materiel: entity.materiel || null,
    notes: entity.notes || null,
    critereReussite: entity.critereReussite || null,
    variablesPlus: entity.variablesPlus,
    variablesMinus: entity.variablesMinus,
    tags: (entity.tags || []).map(t => ({ id: t.id, label: t.label, category: t.category, level: t.level ?? null }))
  };
}

function serializeEntrainement(entity) {
  if (!entity) return null;
  return {
    id: entity.id,
    titre: entity.titre,
    date: entity.date ? new Date(entity.date).toISOString() : null,
    imageUrl: entity.imageUrl || null,
    tags: (entity.tags || []).map(t => ({ id: t.id, label: t.label, category: t.category, level: t.level ?? null })),
    echauffement: entity.echauffement ? serializeEchauffement(entity.echauffement) : null,
    situationMatch: entity.situationMatch ? serializeSituation(entity.situationMatch) : null,
    exercices: (entity.exercices || []).map(x => ({
      ordre: x.ordre,
      duree: x.duree ?? null,
      notes: x.notes ?? null,
      exercice: serializeExercice(x.exercice)
    }))
  };
}

function serializeEchauffement(entity) {
  if (!entity) return null;
  return {
    id: entity.id,
    nom: entity.nom,
    description: entity.description || null,
    imageUrl: entity.imageUrl || null,
    blocs: (entity.blocs || []).map(b => ({
      ordre: b.ordre,
      titre: b.titre,
      repetitions: b.repetitions || null,
      temps: b.temps || null,
      informations: b.informations || null,
      fonctionnement: b.fonctionnement || null,
      notes: b.notes || null
    }))
  };
}

function serializeSituation(entity) {
  if (!entity) return null;
  return {
    id: entity.id,
    nom: entity.nom || null,
    type: entity.type,
    description: entity.description || null,
    temps: entity.temps || null,
    imageUrl: entity.imageUrl || null,
    tags: (entity.tags || []).map(t => ({ id: t.id, label: t.label, category: t.category, level: t.level ?? null }))
  };
}

async function exportOne(type, id) {
  const t = String(type || '').toLowerCase();
  if (!id || typeof id !== 'string' || id.length < 10) {
    const err = new Error('Paramètre id invalide');
    err.statusCode = 400;
    throw err;
  }

  if (!['exercice','entrainement','echauffement','situation'].includes(t)) {
    const err = new Error('Paramètre type invalide');
    err.statusCode = 400;
    throw err;
  }

  let entity = null; let payload = null;
  if (t === 'exercice') {
    entity = await getExerciceForExport(id);
    if (!entity) return { notFound: true };
    payload = serializeExercice(entity);
  }
  if (t === 'entrainement') {
    entity = await getEntrainementForExport(id);
    if (!entity) return { notFound: true };
    payload = serializeEntrainement(entity);
  }
  if (t === 'echauffement') {
    entity = await getEchauffementForExport(id);
    if (!entity) return { notFound: true };
    payload = serializeEchauffement(entity);
  }
  if (t === 'situation') {
    entity = await getSituationForExport(id);
    if (!entity) return { notFound: true };
    payload = serializeSituation(entity);
  }

  return {
    filename: `${t}-${id}.ufm.json`,
    content: {
      version: '1.0',
      type: t,
      data: payload
    }
  };
}

module.exports = {
  exportOne
};
