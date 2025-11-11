const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const makeToken = async (role = 'ADMIN') => {
  await prisma.user.deleteMany({});
  const user = await prisma.user.create({
    data: {
      email: `admin-list-${Date.now()}@ultimate.com`,
      nom: 'Admin', prenom: 'List',
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

  const tag = await prisma.tag.create({ data: { label: 'tag-list', category: 'meta' } });

  const exo = await prisma.exercice.create({
    data: {
      nom: 'Exo List', description: 'Desc', variablesPlus: '[]', variablesMinus: '[]',
      tags: { connect: [{ id: tag.id }] },
    },
  });

  const ech = await prisma.echauffement.create({ data: { nom: 'Warmup List', description: 'W', blocs: { create: [{ ordre: 1, titre: 'Bloc 1' }] } } });

  const sit = await prisma.situationMatch.create({ data: { type: 'Match List', description: 'S', tags: { connect: [{ id: tag.id }] } } });

  const ent = await prisma.entrainement.create({
    data: {
      titre: 'Entrainement List', date: new Date(), echauffementId: ech.id, situationMatchId: sit.id,
      tags: { connect: [{ id: tag.id }] },
      exercices: { create: [{ exerciceId: exo.id, ordre: 1, duree: 10 }] },
    },
  });

  return { tag, exo, ech, sit, ent };
};

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API - Admin list-<type>', () => {
  it('GET /api/admin/list-exercices renvoie un tableau d\'IDs', async () => {
    const token = await makeToken('ADMIN');
    const { exo } = await createFixtures();
    const res = await request(app)
      .get('/api/admin/list-exercices')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ids = res.body.map(i => i.id || i);
    expect(ids).toContain(exo.id);
  });

  it('GET /api/admin/list-entrainements renvoie un tableau d\'IDs', async () => {
    const token = await makeToken('ADMIN');
    const { ent } = await createFixtures();
    const res = await request(app)
      .get('/api/admin/list-entrainements')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ids = res.body.map(i => i.id || i);
    expect(ids).toContain(ent.id);
  });

  it('GET /api/admin/list-echauffements renvoie un tableau d\'IDs', async () => {
    const token = await makeToken('ADMIN');
    const { ech } = await createFixtures();
    const res = await request(app)
      .get('/api/admin/list-echauffements')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ids = res.body.map(i => i.id || i);
    expect(ids).toContain(ech.id);
  });

  it('GET /api/admin/list-situations-matchs renvoie un tableau d\'IDs', async () => {
    const token = await makeToken('ADMIN');
    const { sit } = await createFixtures();
    const res = await request(app)
      .get('/api/admin/list-situations-matchs')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ids = res.body.map(i => i.id || i);
    expect(ids).toContain(sit.id);
  });
});
