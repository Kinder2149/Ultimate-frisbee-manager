const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const makeToken = async (role = 'ADMIN') => {
  await prisma.user.deleteMany({});
  const user = await prisma.user.create({
    data: {
      email: `export-admin-${Date.now()}@ultimate.com`,
      nom: 'Admin', prenom: 'Export',
      passwordHash: bcrypt.hashSync('password123', 10),
      role,
    },
  });
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const createFixtures = async () => {
  // Nettoyage ciblé
  await prisma.entrainementExercice.deleteMany({});
  await prisma.entrainement.deleteMany({});
  await prisma.exercice.deleteMany({});
  await prisma.echauffement.deleteMany({});
  await prisma.blocEchauffement.deleteMany({});
  await prisma.situationMatch.deleteMany({});
  await prisma.tag.deleteMany({});

  const tag = await prisma.tag.create({ data: { label: '10min', category: 'temps' } });

  const exo = await prisma.exercice.create({
    data: {
      nom: 'Exo Export', description: 'Desc', variablesPlus: '[]', variablesMinus: '[]',
      tags: { connect: [{ id: tag.id }] },
    },
  });

  const ech = await prisma.echauffement.create({ data: { nom: 'Warmup', description: 'W', blocs: { create: [{ ordre: 1, titre: 'Bloc 1' }] } } });

  const sit = await prisma.situationMatch.create({ data: { type: 'Match', description: 'S', tags: { connect: [{ id: tag.id }] } } });

  const ent = await prisma.entrainement.create({
    data: {
      titre: 'Entrainement Export', date: new Date(), echauffementId: ech.id, situationMatchId: sit.id,
      tags: { connect: [{ id: tag.id }] },
      exercices: { create: [{ exerciceId: exo.id, ordre: 1, duree: 10 }] },
    },
  });

  return { tag, exo, ech, sit, ent };
};

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API - Export UFM', () => {
  it('GET /api/admin/export-ufm (exercice) renvoie un .ufm.json avec headers', async () => {
    const token = await makeToken('ADMIN');
    const { exo } = await createFixtures();

    const res = await request(app)
      .get(`/api/admin/export-ufm?type=exercice&id=${exo.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(String(res.headers['content-disposition'] || '')).toMatch(/attachment;\s*filename=/i);
    const body = JSON.parse(res.text);
    expect(body).toHaveProperty('version', '1.0');
    expect(body).toHaveProperty('type', 'exercice');
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id', exo.id);
  });

  it('GET /api/admin/export-ufm (entrainement) renvoie 200 avec structure data.exercices', async () => {
    const token = await makeToken('ADMIN');
    const { ent } = await createFixtures();
    const res = await request(app)
      .get(`/api/admin/export-ufm?type=entrainement&id=${ent.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.text);
    expect(body.type).toBe('entrainement');
    expect(Array.isArray(body.data.exercices)).toBe(true);
  });

  it('GET /api/admin/export-ufm 404 quand entité absente', async () => {
    const token = await makeToken('ADMIN');
    const res = await request(app)
      .get(`/api/admin/export-ufm?type=exercice&id=00000000-0000-4000-8000-000000000000`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/admin/export-ufm 400 paramètres manquants', async () => {
    const token = await makeToken('ADMIN');
    const res = await request(app)
      .get(`/api/admin/export-ufm`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(400);
  });
});
