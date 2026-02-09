const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');

const registerUser = async (over = {}) => {
  const supabaseUserId = over.supabaseUserId || `00000000-0000-0000-0000-${String(Date.now()).padStart(12, '0')}`;
  const email = over.email || `register-${Date.now()}@ultimate.com`;
  await prisma.user.deleteMany({ where: { id: supabaseUserId } });
  await prisma.user.deleteMany({ where: { email: email.toLowerCase() } });
  const res = await request(app)
    .post('/api/auth/register')
    .set('Content-Type', 'application/json')
    .send({ supabaseUserId, email, nom: 'Test', prenom: 'Register' });
  return { res, supabaseUserId, email };
};

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API - Auth (Supabase) et profil local', () => {
  it('POST /api/auth/register crée un profil local', async () => {
    const { res, email, supabaseUserId } = await registerUser({});
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id', supabaseUserId);
    expect(res.body.user).toHaveProperty('email', email.toLowerCase());
  });

  it('POST /api/auth/login n\'est pas exposé', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'x@x.com', password: 'x' });
    expect(res.statusCode).toBe(404);
  });
});
