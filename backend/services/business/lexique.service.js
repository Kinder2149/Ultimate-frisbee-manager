const { prisma } = require('../prisma');

/**
 * Service métier pour la gestion du lexique (vocabulaire commun du club)
 */

async function getAllLexiques(workspaceId, filters = {}) {
  const { categorie, query } = filters;

  const where = { workspaceId };
  if (categorie) {
    where.categorie = String(categorie);
  }
  if (query) {
    where.terme = { contains: String(query), mode: 'insensitive' };
  }

  return prisma.lexique.findMany({
    where,
    orderBy: [
      { categorie: 'asc' },
      { terme: 'asc' }
    ]
  });
}

async function getLexiqueById(id, workspaceId) {
  return prisma.lexique.findFirst({
    where: { id, workspaceId }
  });
}

async function createLexique(data, workspaceId) {
  const { terme, definition, categorie, motImage } = data;

  return prisma.lexique.create({
    data: {
      terme,
      definition,
      categorie,
      motImage: motImage ?? false,
      workspaceId
    }
  });
}

async function updateLexique(id, data, workspaceId) {
  const existing = await prisma.lexique.findFirst({ where: { id, workspaceId } });
  if (!existing) {
    const error = new Error('Terme de lexique non trouvé');
    error.statusCode = 404;
    throw error;
  }

  return prisma.lexique.update({
    where: { id },
    data
  });
}

async function deleteLexique(id, workspaceId) {
  const existing = await prisma.lexique.findFirst({ where: { id, workspaceId } });
  if (!existing) {
    const error = new Error('Terme de lexique non trouvé');
    error.statusCode = 404;
    throw error;
  }

  await prisma.lexique.delete({ where: { id } });
}

module.exports = {
  getAllLexiques,
  getLexiqueById,
  createLexique,
  updateLexique,
  deleteLexique,
};
