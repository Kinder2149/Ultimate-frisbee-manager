jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { creerContexte, viderBase } = require('../tests/helpers/contexte-test');

const termeValide = { terme: 'Swing', definition: 'Circulation latérale du disque.', categorie: 'Attaque' };

beforeEach(async () => {
  await viderBase();
});

afterAll(async () => {
  await viderBase();
  await prisma.$disconnect();
});

describe('Lexique — droits d’écriture selon le rôle', () => {
  it('un membre peut ajouter, modifier puis supprimer un terme', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });

    const cree = await request(app).post('/api/lexique').set(ctx.entetes).send({ ...termeValide, motImage: true });
    expect(cree.statusCode).toBe(201);
    expect(cree.body.motImage).toBe(true);

    const modifie = await request(app).put(`/api/lexique/${cree.body.id}`).set(ctx.entetes).send({ categorie: 'Play' });
    expect(modifie.statusCode).toBe(200);
    expect(modifie.body.categorie).toBe('Play');

    const supprime = await request(app).delete(`/api/lexique/${cree.body.id}`).set(ctx.entetes);
    expect(supprime.statusCode).toBeLessThan(300);
    expect(await prisma.lexique.count()).toBe(0);
  });

  it('un lecteur peut consulter mais ni ajouter, ni modifier, ni supprimer (403)', async () => {
    const ctx = await creerContexte({ roleEspace: 'VIEWER' });
    const terme = await prisma.lexique.create({ data: { ...termeValide, workspaceId: ctx.workspace.id } });

    const liste = await request(app).get('/api/lexique').set(ctx.entetes);
    expect(liste.statusCode).toBe(200);
    expect(liste.body).toHaveLength(1);

    const ajout = await request(app).post('/api/lexique').set(ctx.entetes).send(termeValide);
    const modif = await request(app).put(`/api/lexique/${terme.id}`).set(ctx.entetes).send({ definition: 'Piratée' });
    const suppr = await request(app).delete(`/api/lexique/${terme.id}`).set(ctx.entetes);
    expect([ajout.statusCode, modif.statusCode, suppr.statusCode]).toEqual([403, 403, 403]);

    const intact = await prisma.lexique.findUnique({ where: { id: terme.id } });
    expect(intact.definition).toBe(termeValide.definition);
  });

  it('refuse une catégorie inconnue (400)', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const res = await request(app).post('/api/lexique').set(ctx.entetes).send({ ...termeValide, categorie: 'Inventée' });
    expect(res.statusCode).toBe(400);
  });
});
