const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { viderBase } = require('../tests/helpers/contexte-test');

/*
 * Route publique d'inscription (appelee apres signUp Supabase, parfois sans
 * session). Limite connue non couverte ici : les identifiants recus ne sont
 * pas encore verifies aupres de Supabase (voir auth.controller.js).
 */

const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';

beforeEach(async () => { await viderBase(); });
afterAll(async () => { await viderBase(); await prisma.$disconnect(); });

describe('Inscription publique', () => {
  it('cree le profil a la premiere inscription', async () => {
    const res = await request(app).post('/api/auth/register').send({ supabaseUserId: ID_A, email: 'Nouveau@Club.fr' });
    expect(res.statusCode).toBe(201);
    const u = await prisma.user.findUnique({ where: { id: ID_A } });
    expect(u.email).toBe('nouveau@club.fr');
    expect(u.role).toBe('USER');
  });

  it("renvoie le profil existant quand l'identifiant ET l'email correspondent", async () => {
    await prisma.user.create({ data: { id: ID_A, email: 'coach@club.fr', nom: 'Coach' } });
    const res = await request(app).post('/api/auth/register').send({ supabaseUserId: ID_A, email: 'coach@club.fr' });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.id).toBe(ID_A);
  });

  it("ne divulgue jamais le profil d'un compte existant sans son email (409)", async () => {
    await prisma.user.create({ data: { id: ID_A, email: 'coach@club.fr', nom: 'Coach', role: 'ADMIN' } });
    const res = await request(app).post('/api/auth/register').send({ supabaseUserId: ID_A, email: 'intrus@x.fr' });
    expect(res.statusCode).toBe(409);
    expect(res.body.user).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('coach@club.fr');
    expect(JSON.stringify(res.body)).not.toContain('ADMIN');
  });

  it('refuse proprement un email deja utilise (409, pas 500)', async () => {
    await prisma.user.create({ data: { id: ID_A, email: 'coach@club.fr', nom: 'Coach' } });
    const res = await request(app).post('/api/auth/register').send({ supabaseUserId: ID_B, email: 'coach@club.fr' });
    expect(res.statusCode).toBe(409);
    expect(await prisma.user.count({ where: { email: 'coach@club.fr' } })).toBe(1);
  });

  it("refuse une inscription sans identifiant ou sans email (400)", async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@y.fr' });
    expect(res.statusCode).toBe(400);
  });
});
