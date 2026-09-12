jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { creerContexte, viderBase } = require('../tests/helpers/contexte-test');

/** Ajoute l'utilisateur du contexte à un second espace, avec le rôle demandé. */
async function ajouterEspace(ctx, { nom = 'Autre espace', role = 'MANAGER', isBase = false } = {}) {
  const espace = await prisma.workspace.create({ data: { name: nom, isBase } });
  await prisma.workspaceUser.create({ data: { workspaceId: espace.id, userId: ctx.user.id, role } });
  return espace;
}

beforeEach(async () => { await viderBase(); });
afterAll(async () => { await viderBase(); await prisma.$disconnect(); });

describe('Copie d’un élément vers un autre espace', () => {
  it('copie un exercice avec ses étiquettes, sans toucher à l’original', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const cible = await ajouterEspace(ctx);
    const tag = await prisma.tag.create({ data: { label: 'Passes', category: 'objectif', workspaceId: ctx.workspace.id } });
    const exercice = await prisma.exercice.create({
      data: { nom: 'La flèche', description: 'Colonne', workspaceId: ctx.workspace.id, tags: { connect: { id: tag.id } } },
    });

    const res = await request(app).post(`/api/exercises/${exercice.id}/copier-vers-espace`)
      .set(ctx.entetes).send({ workspaceId: cible.id });

    expect(res.statusCode).toBe(201);
    expect(res.body.espace.name).toBe('Autre espace');

    const copie = await prisma.exercice.findUnique({ where: { id: res.body.element.id }, include: { tags: true } });
    expect(copie.workspaceId).toBe(cible.id);
    expect(copie.nom).toBe('La flèche');
    expect(copie.tags[0].label).toBe('Passes');
    // l'étiquette est recréée dans l'espace d'arrivée, pas partagée
    expect(copie.tags[0].id).not.toBe(tag.id);
    expect(copie.tags[0].workspaceId).toBe(cible.id);

    // l'original reste en place
    expect(await prisma.exercice.count({ where: { workspaceId: ctx.workspace.id } })).toBe(1);
  });

  it('copie un échauffement avec ses blocs', async () => {
    const ctx = await creerContexte({ roleEspace: 'MANAGER' });
    const cible = await ajouterEspace(ctx);
    const ech = await prisma.echauffement.create({
      data: {
        nom: 'Réveil', workspaceId: ctx.workspace.id,
        blocs: { create: [{ ordre: 1, titre: 'Course', workspaceId: ctx.workspace.id }] },
      },
    });

    const res = await request(app).post(`/api/warmups/${ech.id}/copier-vers-espace`)
      .set(ctx.entetes).send({ workspaceId: cible.id });

    expect(res.statusCode).toBe(201);
    const copie = await prisma.echauffement.findUnique({ where: { id: res.body.element.id }, include: { blocs: true } });
    expect(copie.blocs).toHaveLength(1);
    expect(copie.blocs[0].titre).toBe('Course');
    expect(copie.blocs[0].workspaceId).toBe(cible.id);
  });

  it('copie une situation et évite d’écraser un nom déjà pris', async () => {
    const ctx = await creerContexte({ roleEspace: 'MANAGER' });
    const cible = await ajouterEspace(ctx);
    const situation = await prisma.situationMatch.create({
      data: { nom: 'Match à thème', type: 'Match', workspaceId: ctx.workspace.id },
    });
    await prisma.situationMatch.create({ data: { nom: 'Match à thème', type: 'Match', workspaceId: cible.id } });

    const res = await request(app).post(`/api/matches/${situation.id}/copier-vers-espace`)
      .set(ctx.entetes).send({ workspaceId: cible.id });

    expect(res.statusCode).toBe(201);
    expect(res.body.element.nom).toBe('Match à thème (2)');
  });

  it('refuse la copie vers un espace où l’utilisateur est lecteur', async () => {
    const ctx = await creerContexte({ roleEspace: 'MANAGER' });
    const cible = await ajouterEspace(ctx, { role: 'VIEWER' });
    const exercice = await prisma.exercice.create({ data: { nom: 'Le Z', description: 'x', workspaceId: ctx.workspace.id } });

    const res = await request(app).post(`/api/exercises/${exercice.id}/copier-vers-espace`)
      .set(ctx.entetes).send({ workspaceId: cible.id });

    expect(res.statusCode).toBe(403);
    expect(await prisma.exercice.count({ where: { workspaceId: cible.id } })).toBe(0);
  });

  it('refuse la copie vers un espace dont l’utilisateur n’est pas membre', async () => {
    const ctx = await creerContexte({ roleEspace: 'MANAGER' });
    const etranger = await prisma.workspace.create({ data: { name: 'Espace inconnu' } });
    const exercice = await prisma.exercice.create({ data: { nom: 'Le U', description: 'x', workspaceId: ctx.workspace.id } });

    const res = await request(app).post(`/api/exercises/${exercice.id}/copier-vers-espace`)
      .set(ctx.entetes).send({ workspaceId: etranger.id });

    expect(res.statusCode).toBe(403);
    expect(await prisma.exercice.count({ where: { workspaceId: etranger.id } })).toBe(0);
  });

  it('refuse la copie vers la BASE pour un non-administrateur', async () => {
    const ctx = await creerContexte({ roleEspace: 'MANAGER' });
    const base = await ajouterEspace(ctx, { nom: 'BASE', role: 'MANAGER', isBase: true });
    const exercice = await prisma.exercice.create({ data: { nom: 'Le T', description: 'x', workspaceId: ctx.workspace.id } });

    const res = await request(app).post(`/api/exercises/${exercice.id}/copier-vers-espace`)
      .set(ctx.entetes).send({ workspaceId: base.id });

    expect(res.statusCode).toBe(403);
  });

  it('liste les espaces de destination possibles, sans l’espace courant', async () => {
    const ctx = await creerContexte({ roleEspace: 'MANAGER' });
    await ajouterEspace(ctx, { nom: 'Espace ouvert', role: 'MEMBER' });
    await ajouterEspace(ctx, { nom: 'Espace en lecture', role: 'VIEWER' });

    const res = await request(app).get('/api/workspaces/destinations').set(ctx.entetes);

    expect(res.statusCode).toBe(200);
    const noms = res.body.map((e) => e.name);
    expect(noms).toContain('Espace ouvert');
    expect(noms).not.toContain('Espace en lecture');
    expect(noms).not.toContain(ctx.workspace.name);
  });
});
