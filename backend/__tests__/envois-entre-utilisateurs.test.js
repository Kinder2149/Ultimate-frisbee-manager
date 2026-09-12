jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { creerContexte, viderBase } = require('../tests/helpers/contexte-test');

/** Espace personnel (le destinataire en est gestionnaire, et il en est le propriétaire). */
async function espacePersonnel(user, nom = 'Espace perso') {
  const espace = await prisma.workspace.create({ data: { name: nom, ownerId: user.id } });
  await prisma.workspaceUser.create({ data: { workspaceId: espace.id, userId: user.id, role: 'MANAGER' } });
  return espace;
}

async function creerExercice(workspaceId, nom, tag = null) {
  return prisma.exercice.create({
    data: {
      nom, description: 'Contenu original', workspaceId,
      ...(tag ? { tags: { connect: { id: tag.id } } } : {}),
    },
  });
}

beforeEach(async () => { await viderBase(); });
afterAll(async () => { await viderBase(); await prisma.$disconnect(); });

describe('Envoi d’un élément à un autre utilisateur', () => {
  it('envoie, apparaît chez le destinataire, et dépose l’élément à l’acceptation', async () => {
    const expediteur = await creerContexte({ roleEspace: 'MEMBER' });
    const destinataire = await creerContexte({ roleEspace: 'MANAGER' });
    const espace = await espacePersonnel(destinataire.user);
    const tag = await prisma.tag.create({ data: { label: 'Passes', category: 'objectif', workspaceId: expediteur.workspace.id } });
    const exercice = await creerExercice(expediteur.workspace.id, 'La flèche', tag);

    const envoi = await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'exercice', elementId: exercice.id, destinataireId: destinataire.user.id, message: 'regarde la variante' });
    expect(envoi.statusCode).toBe(201);
    expect(envoi.body.statut).toBe('EN_ATTENTE');

    // l'expéditeur ne dépose rien chez le destinataire avant accord
    expect(await prisma.exercice.count({ where: { workspaceId: espace.id } })).toBe(0);

    const recus = await request(app).get('/api/envois/recus').set(destinataire.entetes);
    expect(recus.body).toHaveLength(1);
    expect(recus.body[0].nom).toBe('La flèche');
    expect(recus.body[0].message).toBe('regarde la variante');
    expect(recus.body[0].espaceParDefaut.id).toBe(espace.id);
    expect(recus.body[0].doublon).toBeNull();

    const accepte = await request(app).post(`/api/envois/${envoi.body.id}/accepter`).set(destinataire.entetes).send({});
    expect(accepte.statusCode).toBe(201);

    const copie = await prisma.exercice.findUnique({ where: { id: accepte.body.element.id }, include: { tags: true } });
    expect(copie.workspaceId).toBe(espace.id);
    expect(copie.nom).toBe('La flèche');
    expect(copie.tags[0].label).toBe('Passes');
    expect(copie.tags[0].workspaceId).toBe(espace.id);
  });

  it('livre ce qui a été envoyé même si l’original a été supprimé entre-temps', async () => {
    const expediteur = await creerContexte({ roleEspace: 'MEMBER' });
    const destinataire = await creerContexte({ roleEspace: 'MANAGER' });
    await espacePersonnel(destinataire.user);
    const exercice = await creerExercice(expediteur.workspace.id, 'Le Z');

    const envoi = await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'exercice', elementId: exercice.id, destinataireId: destinataire.user.id });

    await prisma.exercice.delete({ where: { id: exercice.id } });

    const accepte = await request(app).post(`/api/envois/${envoi.body.id}/accepter`).set(destinataire.entetes).send({});
    expect(accepte.statusCode).toBe(201);
    expect(accepte.body.element.description).toBe('Contenu original');
  });

  it('signale le doublon, puis garde les deux ou remplace selon le choix', async () => {
    const expediteur = await creerContexte({ roleEspace: 'MEMBER' });
    const destinataire = await creerContexte({ roleEspace: 'MANAGER' });
    const espace = await espacePersonnel(destinataire.user);
    await creerExercice(espace.id, 'La Fontaine');

    const premier = await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'exercice', elementId: (await creerExercice(expediteur.workspace.id, 'La Fontaine')).id, destinataireId: destinataire.user.id });

    const recus = await request(app).get('/api/envois/recus').set(destinataire.entetes);
    expect(recus.body[0].doublon.nom).toBe('La Fontaine');

    // garder les deux : la copie prend le suffixe
    const garde = await request(app).post(`/api/envois/${premier.body.id}/accepter`).set(destinataire.entetes)
      .send({ surDoublon: 'garder-les-deux' });
    expect(garde.body.element.nom).toBe('La Fontaine (2)');
    expect(await prisma.exercice.count({ where: { workspaceId: espace.id } })).toBe(2);

    // remplacer : l'ancien disparaît, le nom reste propre
    const second = await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'exercice', elementId: (await creerExercice(expediteur.workspace.id, 'La Fontaine bis')).id, destinataireId: destinataire.user.id });
    await prisma.envoi.update({ where: { id: second.body.id }, data: { nom: 'La Fontaine' } });

    const remplace = await request(app).post(`/api/envois/${second.body.id}/accepter`).set(destinataire.entetes)
      .send({ surDoublon: 'remplacer' });
    expect(remplace.body.remplace).toBe(true);
    expect(remplace.body.element.nom).toBe('La Fontaine');
    expect(await prisma.exercice.count({ where: { workspaceId: espace.id } })).toBe(2);
  });

  it('refuse un envoi sans rien créer', async () => {
    const expediteur = await creerContexte({ roleEspace: 'MEMBER' });
    const destinataire = await creerContexte({ roleEspace: 'MANAGER' });
    const espace = await espacePersonnel(destinataire.user);
    const exercice = await creerExercice(expediteur.workspace.id, 'Morpion');

    const envoi = await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'exercice', elementId: exercice.id, destinataireId: destinataire.user.id });

    const refus = await request(app).post(`/api/envois/${envoi.body.id}/refuser`).set(destinataire.entetes).send({});
    expect(refus.statusCode).toBe(200);
    expect(refus.body.statut).toBe('REFUSE');
    expect(await prisma.exercice.count({ where: { workspaceId: espace.id } })).toBe(0);
    expect((await request(app).get('/api/envois/recus').set(destinataire.entetes)).body).toHaveLength(0);
  });

  it('montre à l’expéditeur le résultat de ses envois, puis le marque comme vu', async () => {
    const expediteur = await creerContexte({ roleEspace: 'MEMBER' });
    const destinataire = await creerContexte({ roleEspace: 'MANAGER' });
    await espacePersonnel(destinataire.user);
    const exercice = await creerExercice(expediteur.workspace.id, 'Le Cavalier');

    const envoi = await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'exercice', elementId: exercice.id, destinataireId: destinataire.user.id });
    await request(app).post(`/api/envois/${envoi.body.id}/accepter`).set(destinataire.entetes).send({});

    const emis = await request(app).get('/api/envois/emis').set(expediteur.entetes);
    expect(emis.body[0].statut).toBe('ACCEPTE');
    expect(emis.body[0].resultatVu).toBe(false);

    const vus = await request(app).post('/api/envois/resultats-vus').set(expediteur.entetes).send({});
    expect(vus.body.marques).toBe(1);
    expect((await request(app).get('/api/envois/emis').set(expediteur.entetes)).body[0].resultatVu).toBe(true);
  });

  it('interdit de traiter un envoi qui ne nous est pas destiné, ou déjà traité', async () => {
    const expediteur = await creerContexte({ roleEspace: 'MEMBER' });
    const destinataire = await creerContexte({ roleEspace: 'MANAGER' });
    const tiers = await creerContexte({ roleEspace: 'MANAGER' });
    await espacePersonnel(destinataire.user);
    const exercice = await creerExercice(expediteur.workspace.id, 'Iron Man');

    const envoi = await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'exercice', elementId: exercice.id, destinataireId: destinataire.user.id });

    expect((await request(app).post(`/api/envois/${envoi.body.id}/accepter`).set(tiers.entetes).send({})).statusCode).toBe(404);

    await request(app).post(`/api/envois/${envoi.body.id}/refuser`).set(destinataire.entetes).send({});
    expect((await request(app).post(`/api/envois/${envoi.body.id}/accepter`).set(destinataire.entetes).send({})).statusCode).toBe(409);
  });

  it('refuse un second envoi identique tant que le premier attend une réponse', async () => {
    const expediteur = await creerContexte({ roleEspace: 'MEMBER' });
    const destinataire = await creerContexte({ roleEspace: 'MANAGER' });
    await espacePersonnel(destinataire.user);
    const exercice = await creerExercice(expediteur.workspace.id, 'Passe à 10');

    await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'exercice', elementId: exercice.id, destinataireId: destinataire.user.id });
    const doublon = await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'exercice', elementId: exercice.id, destinataireId: destinataire.user.id });

    expect(doublon.statusCode).toBe(409);
  });

  it('envoie aussi un échauffement avec ses blocs et une situation', async () => {
    const expediteur = await creerContexte({ roleEspace: 'MEMBER' });
    const destinataire = await creerContexte({ roleEspace: 'MANAGER' });
    const espace = await espacePersonnel(destinataire.user);

    const ech = await prisma.echauffement.create({
      data: {
        nom: 'Réveil', workspaceId: expediteur.workspace.id,
        blocs: { create: [{ ordre: 1, titre: 'Course', workspaceId: expediteur.workspace.id }] },
      },
    });
    const envoiEch = await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'echauffement', elementId: ech.id, destinataireId: destinataire.user.id });
    const accepteEch = await request(app).post(`/api/envois/${envoiEch.body.id}/accepter`).set(destinataire.entetes).send({});
    const copieEch = await prisma.echauffement.findUnique({ where: { id: accepteEch.body.element.id }, include: { blocs: true } });
    expect(copieEch.blocs[0].titre).toBe('Course');
    expect(copieEch.blocs[0].workspaceId).toBe(espace.id);

    const situation = await prisma.situationMatch.create({
      data: { nom: 'Match à thème', type: 'Match', workspaceId: expediteur.workspace.id },
    });
    const envoiSit = await request(app).post('/api/envois').set(expediteur.entetes)
      .send({ famille: 'situation', elementId: situation.id, destinataireId: destinataire.user.id });
    const accepteSit = await request(app).post(`/api/envois/${envoiSit.body.id}/accepter`).set(destinataire.entetes).send({});
    expect(accepteSit.statusCode).toBe(201);
    expect(accepteSit.body.element.type).toBe('Match');
  });

  it('liste les destinataires possibles sans soi-même ni les comptes désactivés', async () => {
    const moi = await creerContexte({ roleEspace: 'MANAGER' });
    const autre = await creerContexte({ roleEspace: 'MANAGER' });
    const inactif = await creerContexte({ roleEspace: 'MANAGER' });
    await prisma.user.update({ where: { id: inactif.user.id }, data: { isActive: false } });

    const res = await request(app).get('/api/envois/destinataires').set(moi.entetes);

    const ids = res.body.map((u) => u.id);
    expect(ids).toContain(autre.user.id);
    expect(ids).not.toContain(moi.user.id);
    expect(ids).not.toContain(inactif.user.id);
  });

  it('refuse un envoi à soi-même', async () => {
    const moi = await creerContexte({ roleEspace: 'MEMBER' });
    const exercice = await creerExercice(moi.workspace.id, 'La Boussole');

    const res = await request(app).post('/api/envois').set(moi.entetes)
      .send({ famille: 'exercice', elementId: exercice.id, destinataireId: moi.user.id });

    expect(res.statusCode).toBe(400);
  });
});
