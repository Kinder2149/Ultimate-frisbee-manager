const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fonction utilitaire pour créer un utilisateur et un token
const setupTestUser = async () => {
  await prisma.user.deleteMany({});
  const user = await prisma.user.create({
    data: {
      email: `test-admin-${Date.now()}@ultimate.com`,
      nom: 'Admin',
      prenom: 'Test',
      password: bcrypt.hashSync('password123', 10),
      role: 'ADMIN',
    },
  });
  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  return token;
};

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API - Routes des Tags', () => {

  beforeEach(async () => {
    // Nettoyer les tags avant chaque test pour garantir l'isolement
    await prisma.tag.deleteMany({});
  });

  describe('GET /api/tags', () => {
    it('devrait retourner un statut 200 et un tableau vide', async () => {
      const token = await setupTestUser();
      const response = await request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/tags', () => {
    it('devrait retourner une erreur 401 si aucun token n\'est fourni', async () => {
      const response = await request(app).post('/api/tags').send({ label: 'Test' });
      expect(response.statusCode).toBe(401);
    });

    it('devrait créer un nouveau tag avec des données valides', async () => {
      const token = await setupTestUser();
      const nouveauTag = { label: 'Test Tag', category: 'physique', color: '#FF0000' };

      const response = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(nouveauTag);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.label).toBe(nouveauTag.label);
    });

    it('devrait retourner une erreur 400 pour des données invalides', async () => {
      const token = await setupTestUser();
      const tagInvalide = { category: 'physique' }; // label manquant

      const response = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .send(tagInvalide);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Les données fournies sont invalides.');
      expect(response.body.details[0].message).toBe('Le libellé est requis.');
    });
  });
});
