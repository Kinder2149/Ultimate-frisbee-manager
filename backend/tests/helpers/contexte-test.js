/**
 * Outils communs aux tests d'API.
 *
 * Depuis le 2026-09-06, le serveur n'accepte plus que des jetons signes par
 * Supabase (ES256/RS256, verifies via JWKS). Les tests ne peuvent donc plus
 * fabriquer de jetons eux-memes : ils simulent le middleware
 * d'authentification et testent ce qui compte — les routes, les droits par
 * espace et les regles metier.
 *
 * Utilisation dans un fichier de test (jest.mock doit rester en tete) :
 *
 *   jest.mock('../middleware/auth.middleware', () =>
 *     require('../tests/helpers/contexte-test').authentificationSimulee());
 *
 *   const ctx = await creerContexte({ roleEspace: 'MANAGER' });
 *   await request(app).get('/api/tags').set(ctx.entetes);
 */
const { prisma } = require('../../services/prisma');

/**
 * Remplace le middleware d'authentification reel.
 * Comportement calque sur le vrai : sans en-tete Authorization -> 401.
 * Le « jeton » attendu est simplement l'identifiant de l'utilisateur de test.
 */
function authentificationSimulee() {
  const reel = jest.requireActual('../../middleware/auth.middleware');
  return {
    ...reel,
    authenticateToken: async (req, res, next) => {
      const entete = req.headers.authorization || '';
      const id = entete.startsWith('Bearer ') ? entete.slice(7).trim() : '';
      if (!id) {
        return res.status(401).json({ error: 'Token manquant', code: 'NO_TOKEN' });
      }
      const utilisateur = await prisma.user.findUnique({ where: { id } });
      if (!utilisateur || !utilisateur.isActive) {
        return res.status(401).json({ error: 'Token invalide', code: 'INVALID_TOKEN' });
      }
      req.user = utilisateur;
      return next();
    },
  };
}

/**
 * Cree un utilisateur, un espace et le lien entre les deux.
 * Renvoie les en-tetes prets a l'emploi pour supertest.
 */
async function creerContexte({ roleEspace = 'MANAGER', rolePlateforme = 'USER', espaceDeBase = false } = {}) {
  const suffixe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const user = await prisma.user.create({
    data: { email: `test-${suffixe}@ufm.test`, nom: 'Test', prenom: 'Utilisateur', role: rolePlateforme },
  });
  const workspace = await prisma.workspace.create({
    data: { name: `Espace de test ${suffixe}`, isBase: espaceDeBase },
  });
  await prisma.workspaceUser.create({
    data: { userId: user.id, workspaceId: workspace.id, role: roleEspace },
  });
  return {
    user,
    workspace,
    entetes: { Authorization: `Bearer ${user.id}`, 'X-Workspace-Id': workspace.id },
  };
}

/**
 * Vide toute la base de test, dans l'ordre des dependances.
 * Tout le contenu est supprime explicitement, y compris celui sans espace
 * (le script d'amorcage de Prisma en cree) : la suppression des espaces
 * ne l'emporterait pas par cascade.
 */
async function viderBase() {
  // Garde-fou ultime : ne jamais rien effacer ailleurs que dans la base de test.
  const [{ base }] = await prisma.$queryRawUnsafe('SELECT current_database() AS base');
  const hote = (process.env.DATABASE_URL || '').split('@')[1] || '';
  if (base !== 'ufm_test' || !/^(localhost|127\.0\.0\.1):5433\//.test(hote)) {
    throw new Error(`viderBase REFUSE : base "${base}" sur "${hote}" n'est pas la base de test locale`);
  }
  await prisma.entrainementExercice.deleteMany({});
  await prisma.entrainement.deleteMany({});
  await prisma.blocEchauffement.deleteMany({});
  await prisma.echauffement.deleteMany({});
  await prisma.situationMatch.deleteMany({});
  await prisma.exercice.deleteMany({});
  await prisma.lexique.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.workspaceUser.deleteMany({});
  await prisma.workspace.deleteMany({});
  await prisma.user.deleteMany({});
}


/** Un contenu de chaque type (exercice, echauffement, situation, entrainement), rattache a l'espace. */
async function creerContenus(workspaceId) {
  const tag = await prisma.tag.create({ data: { label: `tag-${Date.now()}`, category: 'objectif', workspaceId } });
  const exo = await prisma.exercice.create({
    data: { nom: 'Exo de test', description: 'Desc', variablesPlus: '[]', variablesMinus: '[]', workspaceId,
      tags: { connect: [{ id: tag.id }] } },
  });
  const ech = await prisma.echauffement.create({
    data: { nom: 'Echauffement de test', workspaceId, blocs: { create: [{ ordre: 1, titre: 'Bloc 1', workspaceId }] } },
  });
  const sit = await prisma.situationMatch.create({ data: { type: 'Match', nom: 'Situation de test', workspaceId } });
  const ent = await prisma.entrainement.create({
    data: { titre: 'Entrainement de test', date: new Date(), echauffementId: ech.id, situationMatchId: sit.id, workspaceId,
      exercices: { create: [{ exerciceId: exo.id, ordre: 1, duree: 10, workspaceId }] } },
  });
  return { tag, exo, ech, sit, ent };
}

module.exports = { authentificationSimulee, creerContexte, creerContenus, viderBase };
