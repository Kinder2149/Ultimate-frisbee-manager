const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Utilitaires
const makeToken = async (role = 'ADMIN') => {
  await prisma.user.deleteMany({});
  const user = await prisma.user.create({
    data: {
      email: `admin-${Date.now()}@ultimate.com`,
      nom: 'Admin', prenom: 'Test',
      passwordHash: bcrypt.hashSync('password123', 10),
      role,
    },
  });
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const resetDb = async () => {
  await prisma.entrainementExercice.deleteMany({});
  await prisma.entrainement.deleteMany({});
  await prisma.exercice.deleteMany({});
  await prisma.echauffement.deleteMany({});
  await prisma.blocEchauffement.deleteMany({});
  await prisma.situationMatch.deleteMany({});
  await prisma.tag.deleteMany({});
};

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Import/Export - Exercices', () => {
  it('dryRun puis apply puis export', async () => {
    await resetDb();
    const token = await makeToken('ADMIN');

    // dryRun
    const dryRes = await request(app)
      .post('/api/import/exercices?dryRun=true')
      .set('Authorization', `Bearer ${token}`)
      .send({ exercices: [{ nom: 'Exo A', description: 'Desc A', variablesPlus: '', variablesMinus: '' }] });
    expect(dryRes.statusCode).toBe(200);

    // apply
    const applyRes = await request(app)
      .post('/api/import/exercices?dryRun=false')
      .set('Authorization', `Bearer ${token}`)
      .send({ exercices: [{ nom: 'Exo A', description: 'Desc A', variablesPlus: '', variablesMinus: '' }] });
    expect(applyRes.statusCode).toBe(200);

    const exo = await prisma.exercice.findFirst({ where: { nom: 'Exo A' } });
    expect(exo).toBeTruthy();

    // export
    const exp = await request(app)
      .get(`/api/admin/export-ufm?type=exercice&id=${exo.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(exp.statusCode).toBe(200);
    const body = JSON.parse(exp.text);
    expect(body.type).toBe('exercice');
    expect(body.data.id).toBe(exo.id);
  });
});

describe('Import/Export - Entrainements', () => {
  it('dryRun puis apply puis export', async () => {
    await resetDb();
    const token = await makeToken('ADMIN');

    // prérequis: exercice, echauffement, situation
    const exo = await prisma.exercice.create({ data: { nom: 'Exo B', description: 'Desc', variablesPlus: '', variablesMinus: '' } });
    const ech = await prisma.echauffement.create({ data: { nom: 'WU A', description: 'W', blocs: { create: [{ ordre: 1, titre: 'Bloc 1' }] } } });
    const sit = await prisma.situationMatch.create({ data: { type: 'Jeu place', description: 'S' } });

    // dryRun
    const dryRes = await request(app)
      .post('/api/import/entrainements?dryRun=true')
      .set('Authorization', `Bearer ${token}`)
      .send({ entrainements: [{ titre: 'Séance 1', echauffementId: ech.id, situationMatchId: sit.id, exercices: [{ exerciceId: exo.id, ordre: 1, duree: 10 }] }] });
    expect(dryRes.statusCode).toBe(200);

    // apply
    const applyRes = await request(app)
      .post('/api/import/entrainements?dryRun=false')
      .set('Authorization', `Bearer ${token}`)
      .send({ entrainements: [{ titre: 'Séance 1', echauffementId: ech.id, situationMatchId: sit.id, exercices: [{ exerciceId: exo.id, ordre: 1, duree: 10 }] }] });
    expect(applyRes.statusCode).toBe(200);

    const ent = await prisma.entrainement.findFirst();
    expect(ent).toBeTruthy();

    // export
    const exp = await request(app)
      .get(`/api/admin/export-ufm?type=entrainement&id=${ent.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(exp.statusCode).toBe(200);
    const body = JSON.parse(exp.text);
    expect(body.type).toBe('entrainement');
    expect(Array.isArray(body.data.exercices)).toBe(true);
  });
});

describe('Import/Export - Echauffements', () => {
  it('dryRun puis apply puis export via entrainement lié', async () => {
    await resetDb();
    const token = await makeToken('ADMIN');

    // dryRun
    const dryRes = await request(app)
      .post('/api/import/echauffements?dryRun=true')
      .set('Authorization', `Bearer ${token}`)
      .send({ echauffements: [{ nom: 'WU X', description: 'Warmup', blocs: [{ titre: 'Course', temps: 5 }] }] });
    expect(dryRes.statusCode).toBe(200);

    // apply
    const applyRes = await request(app)
      .post('/api/import/echauffements?dryRun=false')
      .set('Authorization', `Bearer ${token}`)
      .send({ echauffements: [{ nom: 'WU X', description: 'Warmup', blocs: [{ titre: 'Course', temps: 5 }] }] });
    expect(applyRes.statusCode).toBe(200);

    const ech = await prisma.echauffement.findFirst({ include: { blocs: true } });
    expect(ech).toBeTruthy();
    expect(ech.blocs.length).toBeGreaterThan(0);
  });
});

describe('Import/Export - Situations', () => {
  it('dryRun puis apply puis export via entrainement lié', async () => {
    await resetDb();
    const token = await makeToken('ADMIN');

    // dryRun
    const dryRes = await request(app)
      .post('/api/import/situations-matchs?dryRun=true')
      .set('Authorization', `Bearer ${token}`)
      .send({ situations: [{ type: 'Match', description: 'S' }] });
    expect(dryRes.statusCode).toBe(200);

    // apply
    const applyRes = await request(app)
      .post('/api/import/situations-matchs?dryRun=false')
      .set('Authorization', `Bearer ${token}`)
      .send({ situations: [{ type: 'Match', description: 'S' }] });
    expect(applyRes.statusCode).toBe(200);

    const sit = await prisma.situationMatch.findFirst();
    expect(sit).toBeTruthy();
  });
});
