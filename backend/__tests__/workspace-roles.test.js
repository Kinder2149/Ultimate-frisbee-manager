jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { creerContexte, viderBase } = require('../tests/helpers/contexte-test');

const exerciceValide = { nom: 'Exercice de test', description: 'Description de test' };

beforeEach(async () => {
  await viderBase();
});

afterAll(async () => {
  await viderBase();
  await prisma.$disconnect();
});

describe("Roles dans un espace — affectation par l'administrateur", () => {
  it('accepte les roles valides (gestionnaire, membre, lecteur)', async () => {
    const admin = await creerContexte({ rolePlateforme: 'ADMIN' });
    const cible = await creerContexte();

    for (const role of ['MANAGER', 'MEMBER', 'VIEWER']) {
      const res = await request(app)
        .put(`/api/admin/workspaces/${admin.workspace.id}/users`)
        .set('Authorization', `Bearer ${admin.user.id}`)
        .send({ users: [{ userId: cible.user.id, role }] });
      expect(res.statusCode).toBe(204);

      const lien = await prisma.workspaceUser.findFirst({
        where: { workspaceId: admin.workspace.id, userId: cible.user.id },
      });
      expect(lien.role).toBe(role);
    }
  });

  it('rejette un role inconnu (400)', async () => {
    const admin = await creerContexte({ rolePlateforme: 'ADMIN' });
    const cible = await creerContexte();

    const res = await request(app)
      .put(`/api/admin/workspaces/${admin.workspace.id}/users`)
      .set('Authorization', `Bearer ${admin.user.id}`)
      .send({ users: [{ userId: cible.user.id, role: 'INVALID_ROLE' }] });

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('Roles dans un espace — ce que chacun peut faire', () => {
  it('un gestionnaire peut consulter les membres', async () => {
    const ctx = await creerContexte({ roleEspace: 'MANAGER' });
    const res = await request(app).get('/api/workspaces/members').set(ctx.entetes);
    expect(res.statusCode).toBe(200);
  });

  it('un membre ne peut pas gerer les membres (403)', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const res = await request(app).get('/api/workspaces/members').set(ctx.entetes);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('WORKSPACE_MANAGER_REQUIRED');
  });

  it('un membre peut creer un exercice', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const res = await request(app).post('/api/exercises').set(ctx.entetes).send(exerciceValide);
    expect(res.statusCode).toBe(201);
  });

  it('un lecteur ne peut pas creer de contenu (403) et rien n\'est ecrit', async () => {
    const ctx = await creerContexte({ roleEspace: 'VIEWER' });
    const res = await request(app).post('/api/exercises').set(ctx.entetes).send(exerciceValide);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('WORKSPACE_WRITE_REQUIRED');
    expect(await prisma.exercice.count()).toBe(0);
  });
});

describe("Role plateforme — acces a l'administration", () => {
  it('un administrateur accede a la vue globale', async () => {
    const admin = await creerContexte({ rolePlateforme: 'ADMIN' });
    const res = await request(app).get('/api/admin/overview').set('Authorization', `Bearer ${admin.user.id}`);
    expect(res.statusCode).toBe(200);
  });

  it("un utilisateur standard n'y accede pas (403)", async () => {
    const ctx = await creerContexte({ rolePlateforme: 'USER' });
    const res = await request(app).get('/api/admin/overview').set('Authorization', `Bearer ${ctx.user.id}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });
});
