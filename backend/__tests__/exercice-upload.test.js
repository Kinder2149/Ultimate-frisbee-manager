jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

// Aucun fichier ne part vers Cloudinary pendant les tests : l'envoi est simule.
jest.mock('../services/upload.service', () => ({
  uploadBuffer: jest.fn(async (_buffer, folder) => ({
    secure_url: `https://res.cloudinary.com/test/image/upload/${folder}/image-test.png`,
    public_id: `${folder}/image-test`,
  })),
  deleteByPublicId: jest.fn(async () => ({ result: 'ok' })),
  getUrl: jest.fn((id) => `https://res.cloudinary.com/test/${id}`),
}));

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { uploadBuffer } = require('../services/upload.service');
const { creerContexte, viderBase } = require('../tests/helpers/contexte-test');

const imageFactice = Buffer.from('contenu image factice');

function envoyerExercice(ctx, fichier = { nom: 'photo.png' }) {
  const req = request(app)
    .post('/api/exercises')
    .set(ctx.entetes)
    .field('nom', 'Exercice avec image')
    .field('description', 'Cree par le test d\'envoi d\'image.');
  return fichier ? req.attach('image', imageFactice, fichier.nom) : req;
}

beforeEach(async () => {
  await viderBase();
  uploadBuffer.mockClear();
});

afterAll(async () => {
  await viderBase();
  await prisma.$disconnect();
});

describe("Exercice — envoi d'image avec la creation", () => {
  it("cree l'exercice et enregistre l'adresse de l'image", async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });

    const res = await envoyerExercice(ctx);

    expect(res.statusCode).toBe(201);
    expect(res.body.nom).toBe('Exercice avec image');
    expect(res.body.imageUrl).toMatch(/^https:\/\/res\.cloudinary\.com\//);

    expect(uploadBuffer).toHaveBeenCalledTimes(1);
    expect(uploadBuffer.mock.calls[0][1]).toBe('ultimate-frisbee-manager/exercices');

    const enBase = await prisma.exercice.findUnique({ where: { id: res.body.id } });
    expect(enBase.imageUrl).toBe(res.body.imageUrl);
    expect(enBase.workspaceId).toBe(ctx.workspace.id);
  });

  it("cree l'exercice sans image quand aucun fichier n'est joint", async () => {
    const ctx = await creerContexte();
    const res = await envoyerExercice(ctx, null);
    expect(res.statusCode).toBe(201);
    expect(uploadBuffer).not.toHaveBeenCalled();
  });

  it("refuse un fichier qui n'est pas une image, sans rien creer", async () => {
    const ctx = await creerContexte();
    const res = await envoyerExercice(ctx, { nom: 'document.pdf' });
    // erreur de l'utilisateur : 400, et non une erreur serveur 500
    expect(res.statusCode).toBe(400);
    expect(uploadBuffer).not.toHaveBeenCalled();
    expect(await prisma.exercice.count()).toBe(0);
  });

  it("ne cree rien si l'envoi vers Cloudinary echoue", async () => {
    const ctx = await creerContexte();
    uploadBuffer.mockRejectedValueOnce(new Error('Cloudinary indisponible'));
    const res = await envoyerExercice(ctx);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(await prisma.exercice.count()).toBe(0);
  });

  it("refuse un lecteur AVANT tout envoi vers Cloudinary (403)", async () => {
    const ctx = await creerContexte({ roleEspace: 'VIEWER' });
    const res = await envoyerExercice(ctx);
    expect(res.statusCode).toBe(403);
    // le fichier ne doit jamais atteindre le stockage d'images
    expect(uploadBuffer).not.toHaveBeenCalled();
    expect(await prisma.exercice.count()).toBe(0);
  });

  it.each([
    ['/api/trainings', 'titre'],
    ['/api/warmups', 'nom'],
    ['/api/matches', 'type'],
  ])("refuse un lecteur avant tout envoi d'image sur %s", async (route, champ) => {
    const ctx = await creerContexte({ roleEspace: 'VIEWER' });
    const res = await request(app).post(route).set(ctx.entetes)
      .field(champ, 'Contenu de test').attach('image', imageFactice, 'photo.png');
    expect(res.statusCode).toBe(403);
    expect(uploadBuffer).not.toHaveBeenCalled();
  });
});
