jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { creerContexte, creerContenus, viderBase } = require('../tests/helpers/contexte-test');

/*
 * Etancheite entre espaces par identifiant : un gestionnaire de l'espace B,
 * connaissant l'identifiant d'un element de l'espace A, ne doit pouvoir ni
 * le lire, ni le modifier, ni le dupliquer, ni le supprimer.
 */

let espaceA, espaceB, contenusA, lexiqueA;

beforeEach(async () => {
  await viderBase();
  espaceA = await creerContexte({ roleEspace: 'MANAGER' });
  espaceB = await creerContexte({ roleEspace: 'MANAGER' });
  contenusA = await creerContenus(espaceA.workspace.id);
  lexiqueA = await prisma.lexique.create({
    data: { terme: 'Terme A', definition: 'Def', categorie: 'Attaque', workspaceId: espaceA.workspace.id },
  });
});

afterAll(async () => {
  await viderBase();
  await prisma.$disconnect();
});

const ressources = [
  ['/api/exercises', () => contenusA.exo.id, { nom: 'Pirate', description: 'Pirate' }],
  ['/api/trainings', () => contenusA.ent.id, { titre: 'Pirate' }],
  ['/api/warmups', () => contenusA.ech.id, { nom: 'Pirate' }],
  ['/api/matches', () => contenusA.sit.id, { type: 'Match', nom: 'Pirate' }],
  ['/api/tags', () => contenusA.tag.id, { label: 'Pirate', category: 'objectif' }],
  ['/api/lexique', () => lexiqueA.id, { terme: 'Pirate', definition: 'Pirate', categorie: 'Attaque' }],
];

describe("Etancheite par identifiant — depuis un autre espace", () => {
  it.each(ressources)('%s/:id — lecture refusee', async (route, id) => {
    const res = await request(app).get(`${route}/${id()}`).set(espaceB.entetes);
    expect([403, 404]).toContain(res.statusCode);
  });

  it.each(ressources)('%s/:id — modification refusee, element intact', async (route, id, corps) => {
    const avant = await request(app).get(`${route}/${id()}`).set(espaceA.entetes);
    const res = await request(app).put(`${route}/${id()}`).set(espaceB.entetes).send(corps);
    expect([403, 404]).toContain(res.statusCode);
    const apres = await request(app).get(`${route}/${id()}`).set(espaceA.entetes);
    expect(apres.statusCode).toBe(200);
    expect(JSON.stringify(apres.body)).toBe(JSON.stringify(avant.body));
  });

  it.each(ressources)('%s/:id — suppression refusee, element toujours present', async (route, id) => {
    const res = await request(app).delete(`${route}/${id()}`).set(espaceB.entetes);
    expect([403, 404]).toContain(res.statusCode);
    const apres = await request(app).get(`${route}/${id()}`).set(espaceA.entetes);
    expect(apres.statusCode).toBe(200);
  });

  it.each(ressources.filter(([r]) => r !== '/api/tags' && r !== '/api/lexique'))(
    '%s/:id/duplicate — duplication refusee', async (route, id) => {
      const avant = await prisma.workspace.findUnique({ where: { id: espaceB.workspace.id } });
      const res = await request(app).post(`${route}/${id()}/duplicate`).set(espaceB.entetes);
      expect([403, 404]).toContain(res.statusCode);
      expect(avant).toBeTruthy();
    });
});

describe('Etancheite des listes', () => {
  it.each(['/api/exercises', '/api/trainings', '/api/warmups', '/api/matches', '/api/tags', '/api/lexique'])(
    "%s — la liste de l'espace B ne contient rien de l'espace A", async (route) => {
      const res = await request(app).get(route).set(espaceB.entetes);
      expect(res.statusCode).toBe(200);
      const liste = Array.isArray(res.body) ? res.body : (res.body.data || res.body.items || []);
      expect(liste).toEqual([]);
    });
});
