const { prisma } = require('../prisma');

/**
 * Envoi d'un élément (exercice, échauffement, situation/match) d'un utilisateur à un autre.
 *
 * Principes :
 * - l'envoi contient une **photo de la fiche au moment de l'envoi** : si l'expéditeur modifie
 *   ou supprime son original ensuite, le destinataire reçoit quand même ce qui lui a été envoyé ;
 * - rien n'entre chez le destinataire sans son accord (accepter / refuser) ;
 * - à l'acceptation, si un élément du même nom existe déjà, le destinataire choisit :
 *   garder les deux (suffixe « (2) ») ou remplacer le sien.
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

const normaliser = (nom) => String(nom || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’'"“”]/g, '')
  .toLowerCase().replace(/\s+/g, ' ').trim();

/** Étiquettes gardées dans la photo : libellé + catégorie suffisent à les retrouver ailleurs. */
const photoTags = (tags) => (tags || []).map((t) => ({
  label: t.label, category: t.category, color: t.color ?? null, level: t.level ?? null,
}));

/** Photo de la fiche à envoyer, lue dans l'espace de travail courant. */
async function photographierElement(famille, id, workspaceId) {
  if (famille === 'exercice') {
    const e = await prisma.exercice.findFirst({ where: { id, workspaceId }, include: { tags: true } });
    if (!e) throw erreur('Exercice non trouvé', 404, 'NOT_FOUND');
    return {
      nom: e.nom,
      contenu: {
        nom: e.nom, description: e.description, imageUrl: e.imageUrl,
        imagesSupplementaires: e.imagesSupplementaires, materiel: e.materiel, notes: e.notes,
        critereReussite: e.critereReussite, variablesPlus: e.variablesPlus, variablesMinus: e.variablesMinus,
        points: e.points, duree_minutes: e.duree_minutes, nombre_joueurs: e.nombre_joueurs,
        tags: photoTags(e.tags),
      },
    };
  }

  if (famille === 'echauffement') {
    const e = await prisma.echauffement.findFirst({
      where: { id, workspaceId },
      include: { tags: true, blocs: { orderBy: { ordre: 'asc' } } },
    });
    if (!e) throw erreur('Échauffement non trouvé', 404, 'NOT_FOUND');
    return {
      nom: e.nom,
      contenu: {
        nom: e.nom, description: e.description, imageUrl: e.imageUrl,
        imagesSupplementaires: e.imagesSupplementaires,
        tags: photoTags(e.tags),
        blocs: e.blocs.map((b) => ({
          ordre: b.ordre, titre: b.titre, repetitions: b.repetitions, temps: b.temps,
          informations: b.informations, fonctionnement: b.fonctionnement, notes: b.notes,
        })),
      },
    };
  }

  if (famille === 'situation') {
    const e = await prisma.situationMatch.findFirst({ where: { id, workspaceId }, include: { tags: true } });
    if (!e) throw erreur('Situation/Match non trouvée', 404, 'NOT_FOUND');
    return {
      nom: e.nom || e.type,
      contenu: {
        nom: e.nom, type: e.type, description: e.description, temps: e.temps,
        imageUrl: e.imageUrl, imagesSupplementaires: e.imagesSupplementaires,
        nombre_joueurs: e.nombre_joueurs, tags: photoTags(e.tags),
      },
    };
  }

  throw erreur("Type d'élément inconnu", 400, 'UNKNOWN_FAMILY');
}

/** Crée l'envoi après avoir vérifié le destinataire. */
async function envoyer({ famille, elementId, destinataireId, message, expediteur, workspaceId }) {
  if (!destinataireId) throw erreur('Destinataire manquant', 400, 'RECIPIENT_REQUIRED');
  if (destinataireId === expediteur.id) throw erreur('Vous ne pouvez pas vous envoyer un élément à vous-même', 400, 'SELF_SEND');

  const destinataire = await prisma.user.findUnique({ where: { id: destinataireId } });
  if (!destinataire || !destinataire.isActive) throw erreur('Destinataire introuvable', 404, 'RECIPIENT_NOT_FOUND');

  const { nom, contenu } = await photographierElement(famille, elementId, workspaceId);

  const dejaEnAttente = await prisma.envoi.findFirst({
    where: { expediteurId: expediteur.id, destinataireId, famille, nom, statut: 'EN_ATTENTE' },
  });
  if (dejaEnAttente) {
    throw erreur(`« ${nom} » attend déjà une réponse de cette personne`, 409, 'ALREADY_PENDING');
  }

  return prisma.envoi.create({
    data: {
      famille, nom, contenu,
      message: message ? String(message).slice(0, 500) : null,
      expediteurId: expediteur.id,
      destinataireId,
    },
    include: { destinataire: { select: { id: true, email: true, nom: true, prenom: true } } },
  });
}

/** Espace d'arrivée par défaut : l'espace personnel du destinataire. */
async function espaceParDefaut(userId) {
  const personnel = await prisma.workspaceUser.findFirst({
    where: { userId, role: 'MANAGER', workspace: { ownerId: userId } },
    include: { workspace: true },
  });
  if (personnel) return personnel.workspace;

  const autre = await prisma.workspaceUser.findFirst({
    where: { userId, role: { in: ['MANAGER', 'MEMBER'] }, workspace: { isBase: false } },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' },
  });
  return autre ? autre.workspace : null;
}

/** Élément du même nom déjà présent dans l'espace d'arrivée, s'il existe. */
async function elementEnConflit(famille, nom, workspaceId) {
  const modele = FAMILLES[famille]?.modele;
  if (!modele || !nom) return null;
  const candidats = await prisma[modele].findMany({ where: { workspaceId } });
  return candidats.find((c) => normaliser(c.nom) === normaliser(nom)) || null;
}

async function reporterTags(tx, tags, workspaceId) {
  const ids = [];
  for (const t of tags || []) {
    const tag = await tx.tag.upsert({
      where: { workspaceId_label_category: { workspaceId, label: t.label, category: t.category } },
      update: {},
      create: { label: t.label, category: t.category, color: t.color, level: t.level, workspaceId },
    });
    ids.push(tag.id);
  }
  return ids;
}

async function nomDisponible(tx, modele, nom, workspaceId) {
  if (!nom) return nom;
  let candidat = nom;
  for (let i = 2; i < 50; i++) {
    const existe = await tx[modele].findFirst({ where: { nom: candidat, workspaceId }, select: { id: true } });
    if (!existe) return candidat;
    candidat = `${nom} (${i})`;
  }
  return `${nom} (copie)`;
}

/** Crée l'élément chez le destinataire à partir de la photo. */
async function creerDepuisPhoto(tx, envoi, workspaceId, nomFinal) {
  const c = envoi.contenu || {};
  const tagIds = await reporterTags(tx, c.tags, workspaceId);
  const connect = { connect: tagIds.map((id) => ({ id })) };

  if (envoi.famille === 'exercice') {
    return tx.exercice.create({
      data: {
        nom: nomFinal, description: c.description || '', imageUrl: c.imageUrl || null,
        imagesSupplementaires: c.imagesSupplementaires || [], materiel: c.materiel || null,
        notes: c.notes || null, critereReussite: c.critereReussite || null,
        variablesPlus: c.variablesPlus || '', variablesMinus: c.variablesMinus || '',
        points: c.points || '', duree_minutes: c.duree_minutes ?? null, nombre_joueurs: c.nombre_joueurs ?? null,
        workspaceId, tags: connect,
      },
    });
  }

  if (envoi.famille === 'echauffement') {
    return tx.echauffement.create({
      data: {
        nom: nomFinal, description: c.description || null, imageUrl: c.imageUrl || null,
        imagesSupplementaires: c.imagesSupplementaires || [], workspaceId, tags: connect,
        blocs: {
          create: (c.blocs || []).map((b, i) => ({
            ordre: b.ordre || i + 1, titre: b.titre, repetitions: b.repetitions || null,
            temps: b.temps || null, informations: b.informations || null,
            fonctionnement: b.fonctionnement || null, notes: b.notes || null, workspaceId,
          })),
        },
      },
    });
  }

  return tx.situationMatch.create({
    data: {
      nom: nomFinal, type: c.type || 'Situation', description: c.description || null,
      temps: c.temps || null, imageUrl: c.imageUrl || null,
      imagesSupplementaires: c.imagesSupplementaires || [], nombre_joueurs: c.nombre_joueurs ?? null,
      workspaceId, tags: connect,
    },
  });
}

/** Envoi en attente destiné à cet utilisateur, ou erreur. */
async function envoiEnAttente(envoiId, destinataireId) {
  const envoi = await prisma.envoi.findUnique({ where: { id: envoiId } });
  if (!envoi || envoi.destinataireId !== destinataireId) throw erreur('Envoi introuvable', 404, 'NOT_FOUND');
  if (envoi.statut !== 'EN_ATTENTE') throw erreur('Cet envoi a déjà été traité', 409, 'ALREADY_DECIDED');
  return envoi;
}

/**
 * Accepte un envoi.
 * @param {'garder-les-deux'|'remplacer'} surDoublon - que faire si le nom existe déjà
 */
async function accepter({ envoiId, destinataire, workspaceId, surDoublon = 'garder-les-deux' }) {
  const envoi = await envoiEnAttente(envoiId, destinataire.id);

  let espace;
  if (workspaceId) {
    const lien = await prisma.workspaceUser.findFirst({
      where: { workspaceId, userId: destinataire.id },
      include: { workspace: true },
    });
    if (!lien) throw erreur("Vous n'avez pas accès à cet espace", 403, 'WORKSPACE_FORBIDDEN');
    if (lien.role !== 'MANAGER' && lien.role !== 'MEMBER') {
      throw erreur('Vous êtes lecteur dans cet espace : impossible d\'y déposer un élément', 403, 'WORKSPACE_WRITE_REQUIRED');
    }
    if (lien.workspace.isBase === true && String(destinataire.role).toUpperCase() !== 'ADMIN') {
      throw erreur('Dépôt interdit dans la BASE', 403, 'BASE_MUTATION_FORBIDDEN');
    }
    espace = lien.workspace;
  } else {
    espace = await espaceParDefaut(destinataire.id);
    if (!espace) throw erreur("Aucun espace où déposer l'élément", 400, 'NO_TARGET_WORKSPACE');
  }

  const modele = FAMILLES[envoi.famille]?.modele;
  if (!modele) throw erreur("Type d'élément inconnu", 400, 'UNKNOWN_FAMILY');

  const existant = await elementEnConflit(envoi.famille, envoi.nom, espace.id);

  const cree = await prisma.$transaction(async (tx) => {
    if (existant && surDoublon === 'remplacer') {
      await tx[modele].delete({ where: { id: existant.id } });
      return creerDepuisPhoto(tx, envoi, espace.id, envoi.nom);
    }
    const nomFinal = await nomDisponible(tx, modele, envoi.nom, espace.id);
    return creerDepuisPhoto(tx, envoi, espace.id, nomFinal);
  }, { timeout: 30000 });

  await prisma.envoi.update({
    where: { id: envoi.id },
    data: { statut: 'ACCEPTE', decideAt: new Date(), elementCreeId: cree.id, espaceCibleId: espace.id, resultatVu: false },
  });

  return { element: cree, espace: { id: espace.id, name: espace.name }, remplace: Boolean(existant && surDoublon === 'remplacer') };
}

async function refuser({ envoiId, destinataire }) {
  const envoi = await envoiEnAttente(envoiId, destinataire.id);
  return prisma.envoi.update({
    where: { id: envoi.id },
    data: { statut: 'REFUSE', decideAt: new Date(), resultatVu: false },
  });
}

/** Envois reçus en attente, avec l'élément du même nom déjà présent chez le destinataire. */
async function listerRecus(destinataire) {
  const envois = await prisma.envoi.findMany({
    where: { destinataireId: destinataire.id, statut: 'EN_ATTENTE' },
    include: { expediteur: { select: { id: true, email: true, nom: true, prenom: true, iconUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const espace = await espaceParDefaut(destinataire.id);
  const resultats = [];
  for (const envoi of envois) {
    const existant = espace ? await elementEnConflit(envoi.famille, envoi.nom, espace.id) : null;
    resultats.push({
      ...envoi,
      espaceParDefaut: espace ? { id: espace.id, name: espace.name } : null,
      doublon: existant ? { id: existant.id, nom: existant.nom } : null,
    });
  }
  return resultats;
}

/** Envois émis : suivi de ce qu'on a envoyé, et résultats pas encore vus. */
async function listerEmis(expediteur) {
  return prisma.envoi.findMany({
    where: { expediteurId: expediteur.id },
    include: { destinataire: { select: { id: true, email: true, nom: true, prenom: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

/** Marque comme vus les résultats (accepté / refusé) des envois de cet utilisateur. */
async function marquerResultatsVus(expediteur) {
  const { count } = await prisma.envoi.updateMany({
    where: { expediteurId: expediteur.id, statut: { in: ['ACCEPTE', 'REFUSE'] }, resultatVu: false },
    data: { resultatVu: true },
  });
  return count;
}

/** Utilisateurs à qui on peut envoyer un élément. */
async function listerDestinataires(expediteur) {
  const utilisateurs = await prisma.user.findMany({
    where: { isActive: true, id: { not: expediteur.id } },
    select: { id: true, email: true, nom: true, prenom: true, iconUrl: true },
    orderBy: { email: 'asc' },
  });
  return utilisateurs;
}

module.exports = {
  envoyer,
  accepter,
  refuser,
  listerRecus,
  listerEmis,
  marquerResultatsVus,
  listerDestinataires,
  elementEnConflit,
  FAMILLES,
};
