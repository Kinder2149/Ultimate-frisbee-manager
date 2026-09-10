jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { creerContexte, creerContenus, viderBase } = require('../tests/helpers/contexte-test');

beforeEach(async () => {
  await viderBase();
});

afterAll(async () => {
  await viderBase();
  await prisma.$disconnect();
});

const cas = [
  ['exercices', 'exo'],
  ['entrainements', 'ent'],
  ['echauffements', 'ech'],
  ['situations-matchs', 'sit'],
];

describe('Administration — listes globales de contenus', () => {
  it.each(cas)('liste %s : renvoie les elements avec leur identifiant', async (type, cle) => {
    const admin = await creerContexte({ rolePlateforme: 'ADMIN' });
    const contenus = await creerContenus(admin.workspace.id);

    const res = await request(app).get(`/api/admin/list-${type}`).set('Authorization', `Bearer ${admin.user.id}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.map(i => i.id)).toContain(contenus[cle].id);
  });

  it.each(cas)("liste %s : interdite a un utilisateur standard (403)", async (type) => {
    const ctx = await creerContexte({ rolePlateforme: 'USER' });
    const res = await request(app).get(`/api/admin/list-${type}`).set('Authorization', `Bearer ${ctx.user.id}`);
    expect(res.statusCode).toBe(403);
  });
});
