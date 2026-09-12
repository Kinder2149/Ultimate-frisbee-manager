jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { creerContexte, viderBase } = require('../tests/helpers/contexte-test');

async function creerFamille(workspaceId, label) {
  return prisma.tag.create({
    data: { label, category: 'type_echauffement', color: '#8BC34A', workspaceId },
  });
}

beforeEach(async () => { await viderBase(); });
afterAll(async () => { await viderBase(); await prisma.$disconnect(); });

describe("Échauffement — famille (type d'échauffement)", () => {
  it('enregistre la famille à la création et la renvoie', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const famille = await creerFamille(ctx.workspace.id, 'Réveil musculaire');

    const res = await request(app).post('/api/warmups').set(ctx.entetes)
      .send({ nom: 'Étirement du dos', tagIds: [famille.id] });

    expect(res.statusCode).toBe(201);
    expect(res.body.tags.map(t => t.label)).toEqual(['Réveil musculaire']);

    const liste = await request(app).get('/api/warmups').set(ctx.entetes);
    expect(liste.body.data[0].tags[0].label).toBe('Réveil musculaire');
  });

  it('remplace la famille en modification et la recopie à la duplication', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const reveil = await creerFamille(ctx.workspace.id, 'Réveil musculaire');
    const physique = await creerFamille(ctx.workspace.id, 'Physique');

    const cree = await request(app).post('/api/warmups').set(ctx.entetes)
      .send({ nom: 'Mise en route', tagIds: [reveil.id] });

    const modifie = await request(app).put(`/api/warmups/${cree.body.id}`).set(ctx.entetes)
      .send({ nom: 'Mise en route', tagIds: [physique.id] });
    expect(modifie.statusCode).toBe(200);
    expect(modifie.body.tags.map(t => t.label)).toEqual(['Physique']);

    const copie = await request(app).post(`/api/warmups/${cree.body.id}/duplicate`).set(ctx.entetes);
    const enBase = await prisma.echauffement.findUnique({ where: { id: copie.body.id }, include: { tags: true } });
    expect(enBase.tags.map(t => t.label)).toEqual(['Physique']);
  });

  it("laisse la famille intacte quand la modification n'en parle pas", async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const physique = await creerFamille(ctx.workspace.id, 'Physique');
    const cree = await request(app).post('/api/warmups').set(ctx.entetes)
      .send({ nom: 'Gammes de passes', tagIds: [physique.id] });

    await request(app).put(`/api/warmups/${cree.body.id}`).set(ctx.entetes).send({ nom: 'Gammes de passes (v2)' });

    const enBase = await prisma.echauffement.findUnique({ where: { id: cree.body.id }, include: { tags: true } });
    expect(enBase.tags.map(t => t.label)).toEqual(['Physique']);
  });
});
