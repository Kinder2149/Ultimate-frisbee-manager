const { prisma } = require('../prisma');

/**
 * Copie d'un élément (exercice, échauffement, situation/match) vers un autre espace.
 *
 * Règles communes :
 * - l'utilisateur doit pouvoir écrire dans l'espace d'arrivée (gestionnaire ou membre) ;
 * - l'espace BASE n'accepte de copie que d'un administrateur de la plateforme ;
 * - les étiquettes sont retrouvées ou recréées dans l'espace d'arrivée, par libellé et catégorie ;
 * - la copie est indépendante : modifier l'original ne change rien à la copie.
 */

const FAMILLES = {
  exercice: { modele: 'exercice', libelle: 'Exercice' },
  echauffement: { modele: 'echauffement', libelle: 'Échauffement' },
  situation: { modele: 'situationMatch', libelle: 'Situation/Match' },
};

function erreur(message, statusCode, code) {
  const e = new Error(message);
  e.statusCode = statusCode;
  e.code = code;
  return e;
}

/** Vérifie que l'utilisateur peut écrire dans l'espace d'arrivée. */
async function verifierEspaceCible(cibleId, user) {
  const lien = await prisma.workspaceUser.findFirst({
    where: { workspaceId: cibleId, userId: user.id },
    include: { workspace: true },
  });
  if (!lien) throw erreur("Vous n'avez pas accès à l'espace de destination", 403, 'WORKSPACE_FORBIDDEN');
  if (lien.role !== 'MANAGER' && lien.role !== 'MEMBER') {
    throw erreur("Vous êtes lecteur dans l'espace de destination : la copie y est impossible", 403, 'WORKSPACE_WRITE_REQUIRED');
  }
  if (lien.workspace.isBase === true && String(user.role).toUpperCase() !== 'ADMIN') {
    throw erreur('Copie interdite vers la BASE (réservée aux administrateurs plateforme)', 403, 'BASE_MUTATION_FORBIDDEN');
  }
  return lien.workspace;
}

/** Retrouve (ou recrée) dans l'espace d'arrivée les étiquettes de l'élément copié. */
async function reporterTags(tx, tags, cibleId) {
  const ids = [];
  for (const t of tags || []) {
    const tag = await tx.tag.upsert({
      where: { workspaceId_label_category: { workspaceId: cibleId, label: t.label, category: t.category } },
      update: {},
      create: { label: t.label, category: t.category, color: t.color, level: t.level, workspaceId: cibleId },
    });
    ids.push(tag.id);
  }
  return ids;
}

/** Nom libre dans l'espace d'arrivée : « Nom », puis « Nom (2) », « Nom (3) »… */
async function nomDisponible(tx, modele, nom, cibleId) {
  if (!nom) return nom;
  let candidat = nom;
  for (let i = 2; i < 50; i++) {
    const existe = await tx[modele].findFirst({ where: { nom: candidat, workspaceId: cibleId }, select: { id: true } });
    if (!existe) return candidat;
    candidat = `${nom} (${i})`;
  }
  return `${nom} (copie)`;
}

async function copierElement({ famille, id, sourceWorkspaceId, cibleWorkspaceId, user }) {
  const config = FAMILLES[famille];
  if (!config) throw erreur("Type d'élément inconnu", 400, 'UNKNOWN_FAMILY');
  if (!cibleWorkspaceId) throw erreur('Espace de destination manquant', 400, 'TARGET_REQUIRED');
  if (cibleWorkspaceId === sourceWorkspaceId) {
    throw erreur("L'élément est déjà dans cet espace : utilisez « Dupliquer »", 400, 'SAME_WORKSPACE');
  }

  const espaceCible = await verifierEspaceCible(cibleWorkspaceId, user);

  return prisma.$transaction(async (tx) => {
    if (famille === 'exercice') {
      const source = await tx.exercice.findFirst({ where: { id, workspaceId: sourceWorkspaceId }, include: { tags: true } });
      if (!source) throw erreur('Exercice non trouvé', 404, 'NOT_FOUND');
      const tagIds = await reporterTags(tx, source.tags, cibleWorkspaceId);
      const copie = await tx.exercice.create({
        data: {
          nom: await nomDisponible(tx, 'exercice', source.nom, cibleWorkspaceId),
          description: source.description,
          imageUrl: source.imageUrl,
          imagesSupplementaires: source.imagesSupplementaires,
          materiel: source.materiel,
          notes: source.notes,
          critereReussite: source.critereReussite,
          variablesPlus: source.variablesPlus,
          variablesMinus: source.variablesMinus,
          points: source.points,
          duree_minutes: source.duree_minutes,
          nombre_joueurs: source.nombre_joueurs,
          workspaceId: cibleWorkspaceId,
          tags: { connect: tagIds.map((tid) => ({ id: tid })) },
        },
        include: { tags: true },
      });
      return { element: copie, espaceCible };
    }

    if (famille === 'echauffement') {
      const source = await tx.echauffement.findFirst({
        where: { id, workspaceId: sourceWorkspaceId },
        include: { tags: true, blocs: { orderBy: { ordre: 'asc' } } },
      });
      if (!source) throw erreur('Échauffement non trouvé', 404, 'NOT_FOUND');
      const tagIds = await reporterTags(tx, source.tags, cibleWorkspaceId);
      const copie = await tx.echauffement.create({
        data: {
          nom: await nomDisponible(tx, 'echauffement', source.nom, cibleWorkspaceId),
          description: source.description,
          imageUrl: source.imageUrl,
          imagesSupplementaires: source.imagesSupplementaires,
          workspaceId: cibleWorkspaceId,
          tags: { connect: tagIds.map((tid) => ({ id: tid })) },
          blocs: {
            create: source.blocs.map((b) => ({
              ordre: b.ordre,
              titre: b.titre,
              repetitions: b.repetitions,
              temps: b.temps,
              informations: b.informations,
              fonctionnement: b.fonctionnement,
              notes: b.notes,
              workspaceId: cibleWorkspaceId,
            })),
          },
        },
        include: { tags: true, blocs: { orderBy: { ordre: 'asc' } } },
      });
      return { element: copie, espaceCible };
    }

    const source = await tx.situationMatch.findFirst({ where: { id, workspaceId: sourceWorkspaceId }, include: { tags: true } });
    if (!source) throw erreur('Situation/Match non trouvée', 404, 'NOT_FOUND');
    const tagIds = await reporterTags(tx, source.tags, cibleWorkspaceId);
    const copie = await tx.situationMatch.create({
      data: {
        nom: await nomDisponible(tx, 'situationMatch', source.nom, cibleWorkspaceId),
        type: source.type,
        description: source.description,
        temps: source.temps,
        imageUrl: source.imageUrl,
        imagesSupplementaires: source.imagesSupplementaires,
        nombre_joueurs: source.nombre_joueurs,
        workspaceId: cibleWorkspaceId,
        tags: { connect: tagIds.map((tid) => ({ id: tid })) },
      },
      include: { tags: true },
    });
    return { element: copie, espaceCible };
  }, { timeout: 30000 });
}

/** Espaces où l'utilisateur peut recevoir une copie (hors espace courant). */
async function espacesDeDestination(user, espaceCourantId) {
  const liens = await prisma.workspaceUser.findMany({
    where: { userId: user.id, role: { in: ['MANAGER', 'MEMBER'] } },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });
  const estAdmin = String(user.role).toUpperCase() === 'ADMIN';
  return liens
    .filter((l) => l.workspaceId !== espaceCourantId)
    .filter((l) => l.workspace.isBase !== true || estAdmin)
    .map((l) => ({ id: l.workspace.id, name: l.workspace.name, role: l.role }));
}

module.exports = { copierElement, espacesDeDestination, FAMILLES };
