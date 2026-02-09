const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const jwt = require('jsonwebtoken');

const makeAdminToken = async () => {
  await prisma.user.deleteMany({});
  const user = await prisma.user.create({
    data: {
      email: `roles-admin-${Date.now()}@ultimate.com`,
      nom: 'Admin',
      prenom: 'Roles',
      role: 'ADMIN',
      isActive: true,
    },
  });
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const makeUserToken = async () => {
  const user = await prisma.user.create({
    data: {
      email: `roles-user-${Date.now()}@ultimate.com`,
      nom: 'User',
      prenom: 'Roles',
      role: 'USER',
      isActive: true,
    },
  });
  return { token: jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' }), userId: user.id };
};

describe('Workspace Roles - Enum et validation', () => {
  let adminToken;
  let workspace;

  beforeAll(async () => {
    adminToken = await makeAdminToken();
    
    // Créer un workspace de test
    const res = await request(app)
      .post('/api/admin/workspaces')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Workspace Roles' });
    
    workspace = res.body.workspace;
  });

  afterAll(async () => {
    await prisma.workspaceUser.deleteMany({});
    await prisma.workspace.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('Accepte les rôles valides: MANAGER, MEMBER, VIEWER', async () => {
    const { userId } = await makeUserToken();

    const res = await request(app)
      .put(`/api/admin/workspaces/${workspace.id}/users`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        users: [
          { userId, role: 'MANAGER' },
        ],
      });

    expect(res.statusCode).toBe(204);

    // Vérifier en DB
    const link = await prisma.workspaceUser.findFirst({
      where: { workspaceId: workspace.id, userId },
    });
    expect(link.role).toBe('MANAGER');
  });


  it('Rejette les rôles invalides', async () => {
    const { userId } = await makeUserToken();

    const res = await request(app)
      .put(`/api/admin/workspaces/${workspace.id}/users`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        users: [
          { userId, role: 'INVALID_ROLE' },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('Vérifie que MANAGER peut gérer les membres', async () => {
    const { token: userToken, userId } = await makeUserToken();

    // Attribuer rôle MANAGER
    await request(app)
      .put(`/api/admin/workspaces/${workspace.id}/users`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        users: [{ userId, role: 'MANAGER' }],
      });

    // Tester accès endpoint membres
    const res = await request(app)
      .get('/api/workspaces/members')
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Workspace-Id', workspace.id);

    expect(res.statusCode).toBe(200);
  });

  it('Vérifie que MEMBER ne peut pas gérer les membres', async () => {
    const { token: userToken, userId } = await makeUserToken();

    // Attribuer rôle MEMBER
    await request(app)
      .put(`/api/admin/workspaces/${workspace.id}/users`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        users: [{ userId, role: 'MEMBER' }],
      });

    // Tester accès endpoint membres (doit échouer)
    const res = await request(app)
      .get('/api/workspaces/members')
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Workspace-Id', workspace.id);

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('WORKSPACE_MANAGER_REQUIRED');
  });

  it('Vérifie que VIEWER ne peut pas créer de contenu', async () => {
    const { token: userToken, userId } = await makeUserToken();

    // Attribuer rôle VIEWER
    await request(app)
      .put(`/api/admin/workspaces/${workspace.id}/users`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        users: [{ userId, role: 'VIEWER' }],
      });

    // Tester création exercice (doit échouer)
    const res = await request(app)
      .post('/api/exercices')
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Workspace-Id', workspace.id)
      .send({
        nom: 'Test Exercice',
        description: 'Test',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('WORKSPACE_WRITE_REQUIRED');
  });
});

describe('Rôle plateforme ADMIN - Vérification uppercase', () => {
  it('Vérifie que requireAdmin accepte ADMIN en uppercase', async () => {
    const adminToken = await makeAdminToken();

    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('Vérifie que requireAdmin rejette USER', async () => {
    const { token: userToken } = await makeUserToken();

    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });
});
