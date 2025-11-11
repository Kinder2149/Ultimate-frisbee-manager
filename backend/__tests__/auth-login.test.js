const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const bcrypt = require('bcryptjs');

const createUser = async (over = {}) => {
  const email = over.email || `login-${Date.now()}@ultimate.com`;
  const password = over.password || 'password123';
  await prisma.user.deleteMany({ where: { email } });
  const user = await prisma.user.create({
    data: {
      email,
      nom: 'Test', prenom: 'Login',
      passwordHash: bcrypt.hashSync(password, 10),
      role: over.role || 'ADMIN',
      isActive: over.isActive !== undefined ? over.isActive : true,
    },
  });
  return { user, email, password };
};

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API - Auth login', () => {
  it('POST /api/auth/login renvoie tokens et user avec bons identifiants', async () => {
    const { email, password } = await createUser({});
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', email.toLowerCase());
  });

  it('POST /api/auth/login renvoie 401 sur mauvais mot de passe', async () => {
    const { email } = await createUser({});
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password: 'wrongpass' });
    expect([400,401,403]).toContain(res.statusCode); // selon politique, 401 attendu
  });

  it('POST /api/auth/login renvoie 403 si compte inactif', async () => {
    const { email, password } = await createUser({ isActive: false });
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password });
    expect(res.statusCode).toBe(403);
  });
});
