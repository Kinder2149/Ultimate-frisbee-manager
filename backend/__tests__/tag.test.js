jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { creerContexte, viderBase } = require('../tests/helpers/contexte-test');

const tagValide = { label: 'Passe longue', category: 'objectif', color: '#FF0000' };

beforeEach(async () => {
  await viderBase();
});

afterAll(async () => {
  await viderBase();
  await prisma.$disconnect();
});

describe('API - Tags', () => {
  describe('Authentification', () => {
    it('refuse une requete sans jeton (401)', async () => {
      const res = await request(app).get('/api/tags');
      expect(res.statusCode).toBe(401);
    });

    it('refuse une requete sans espace de travail (400)', async () => {
      const { user } = await creerContexte();
      const res = await request(app).get('/api/tags').set('Authorization', `Bearer ${user.id}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.code).toBe('WORKSPACE_ID_REQUIRED');
    });
  });

  describe('Lecture', () => {
    it('renvoie une liste vide pour un espace sans tag', async () => {
      const ctx = await creerContexte();
      const res = await request(app).get('/api/tags').set(ctx.entetes);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("n'expose jamais les tags d'un autre espace", async () => {
      const espaceA = await creerContexte();
      const espaceB = await creerContexte();
      await request(app).post('/api/tags').set(espaceA.entetes).send(tagValide);

      const res = await request(app).get('/api/tags').set(espaceB.entetes);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("refuse l'acces a un espace dont on n'est pas membre (403)", async () => {
      const moi = await creerContexte();
      const autre = await creerContexte();
      const res = await request(app)
        .get('/api/tags')
        .set({ Authorization: `Bearer ${moi.user.id}`, 'X-Workspace-Id': autre.workspace.id });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('Creation', () => {
    it('cree un tag valide (201)', async () => {
      const ctx = await creerContexte({ roleEspace: 'MANAGER' });
      const res = await request(app).post('/api/tags').set(ctx.entetes).send(tagValide);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.label).toBe(tagValide.label);
      expect(res.body.workspaceId).toBe(ctx.workspace.id);
    });

    it('autorise un membre a creer un tag', async () => {
      const ctx = await creerContexte({ roleEspace: 'MEMBER' });
      const res = await request(app).post('/api/tags').set(ctx.entetes).send(tagValide);
      expect(res.statusCode).toBe(201);
    });

    it('interdit a un lecteur de creer un tag (403)', async () => {
      const ctx = await creerContexte({ roleEspace: 'VIEWER' });
      const res = await request(app).post('/api/tags').set(ctx.entetes).send(tagValide);
      expect(res.statusCode).toBe(403);
      expect(await prisma.tag.count()).toBe(0);
    });

    it('refuse un tag sans libelle (400)', async () => {
      const ctx = await creerContexte();
      const res = await request(app).post('/api/tags').set(ctx.entetes).send({ category: 'objectif' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Les données fournies sont invalides.');
    });

    it('refuse une categorie inconnue (400)', async () => {
      const ctx = await creerContexte();
      const res = await request(app).post('/api/tags').set(ctx.entetes).send({ label: 'X', category: 'inexistante' });
      expect(res.statusCode).toBe(400);
    });
  });
});
