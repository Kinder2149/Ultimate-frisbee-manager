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

async function admin() {
  const ctx = await creerContexte({ rolePlateforme: 'ADMIN' });
  return { ...ctx, auth: { Authorization: `Bearer ${ctx.user.id}` } };
}

describe('Administration — export au format UFM', () => {
  it("exporte un exercice en fichier telechargeable", async () => {
    const a = await admin();
    const { exo } = await creerContenus(a.workspace.id);

    const res = await request(app).get(`/api/admin/export-ufm?type=exercice&id=${exo.id}`).set(a.auth);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(String(res.headers['content-disposition'] || '')).toMatch(/attachment;\s*filename=/i);
    const corps = JSON.parse(res.text);
    expect(corps).toMatchObject({ version: '1.0', type: 'exercice' });
    expect(corps.data.id).toBe(exo.id);
  });

  it('exporte un entrainement avec ses exercices', async () => {
    const a = await admin();
    const { ent, exo } = await creerContenus(a.workspace.id);

    const res = await request(app).get(`/api/admin/export-ufm?type=entrainement&id=${ent.id}`).set(a.auth);

    expect(res.statusCode).toBe(200);
    const corps = JSON.parse(res.text);
    expect(corps.type).toBe('entrainement');
    expect(Array.isArray(corps.data.exercices)).toBe(true);
    expect(corps.data.exercices.length).toBe(1);
    expect(JSON.stringify(corps.data.exercices)).toContain(exo.id);
  });

  it('renvoie 404 pour un element inexistant', async () => {
    const a = await admin();
    const res = await request(app)
      .get('/api/admin/export-ufm?type=exercice&id=00000000-0000-4000-8000-000000000000').set(a.auth);
    expect(res.statusCode).toBe(404);
  });

  it('renvoie 400 si le type ou l\'identifiant manque', async () => {
    const a = await admin();
    const res = await request(app).get('/api/admin/export-ufm').set(a.auth);
    expect(res.statusCode).toBe(400);
  });

  it('interdit l\'export a un utilisateur standard (403)', async () => {
    const ctx = await creerContexte({ rolePlateforme: 'USER' });
    const { exo } = await creerContenus(ctx.workspace.id);
    const res = await request(app).get(`/api/admin/export-ufm?type=exercice&id=${exo.id}`)
      .set('Authorization', `Bearer ${ctx.user.id}`);
    expect(res.statusCode).toBe(403);
  });
});
