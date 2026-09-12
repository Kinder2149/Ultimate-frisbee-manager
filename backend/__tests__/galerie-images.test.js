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
const IMG1 = 'https://res.cloudinary.com/test/image/upload/a.png';
const IMG2 = 'https://res.cloudinary.com/test/image/upload/b.png';

beforeEach(async () => {
  await viderBase();
  uploadBuffer.mockClear();
});

afterAll(async () => {
  await viderBase();
  await prisma.$disconnect();
});

describe('Galerie — envoi d\'une image seule', () => {
  it.each([
    ['/api/exercises', 'exercices'],
    ['/api/warmups', 'echauffements'],
    ['/api/matches', 'situations-matchs'],
  ])('renvoie l\'adresse de l\'image sur %s/images', async (route, dossier) => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const res = await request(app).post(`${route}/images`).set(ctx.entetes).attach('image', imageFactice, 'photo.png');
    expect(res.statusCode).toBe(201);
    expect(res.body.url).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    expect(uploadBuffer.mock.calls[0][1]).toBe(`ultimate-frisbee-manager/${dossier}`);
  });

  it('refuse une requête sans fichier (400)', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const res = await request(app).post('/api/exercises/images').set(ctx.entetes);
    expect(res.statusCode).toBe(400);
  });

  it('refuse un lecteur avant tout envoi (403)', async () => {
    const ctx = await creerContexte({ roleEspace: 'VIEWER' });
    const res = await request(app).post('/api/exercises/images').set(ctx.entetes).attach('image', imageFactice, 'photo.png');
    expect(res.statusCode).toBe(403);
    expect(uploadBuffer).not.toHaveBeenCalled();
  });
});

describe('Galerie — images supplémentaires d\'une fiche', () => {
  it('exercice : enregistre, modifie dans l\'ordre et recopie à la duplication', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const cree = await request(app).post('/api/exercises').set(ctx.entetes)
      .field('nom', 'Exercice galerie').field('description', 'Test')
      .field('imagesSupplementaires', JSON.stringify([IMG1, IMG2]));
    expect(cree.statusCode).toBe(201);
    expect(cree.body.imagesSupplementaires).toEqual([IMG1, IMG2]);

    const modifie = await request(app).put(`/api/exercises/${cree.body.id}`).set(ctx.entetes)
      .field('imagesSupplementaires', JSON.stringify([IMG2]));
    expect(modifie.statusCode).toBe(200);
    expect(modifie.body.imagesSupplementaires).toEqual([IMG2]);

    // une modification qui ne parle pas de la galerie ne l'efface pas
    await request(app).put(`/api/exercises/${cree.body.id}`).set(ctx.entetes).field('nom', 'Exercice renommé');
    expect((await prisma.exercice.findUnique({ where: { id: cree.body.id } })).imagesSupplementaires).toEqual([IMG2]);

    const copie = await request(app).post(`/api/exercises/${cree.body.id}/duplicate`).set(ctx.entetes);
    expect((await prisma.exercice.findUnique({ where: { id: copie.body.id } })).imagesSupplementaires).toEqual([IMG2]);
  });

  it('échauffement et situation : enregistrent la galerie', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const ech = await request(app).post('/api/warmups').set(ctx.entetes)
      .field('nom', 'Échauffement galerie').field('imagesSupplementaires', JSON.stringify([IMG1]));
    expect(ech.statusCode).toBe(201);
    expect(ech.body.imagesSupplementaires).toEqual([IMG1]);

    const sit = await request(app).post('/api/matches').set(ctx.entetes)
      .field('type', 'Situation').field('imagesSupplementaires', JSON.stringify([IMG1, IMG2]));
    expect(sit.statusCode).toBe(201);
    expect(sit.body.imagesSupplementaires).toEqual([IMG1, IMG2]);
  });

  it('refuse une adresse qui n\'est pas une URL', async () => {
    const ctx = await creerContexte({ roleEspace: 'MEMBER' });
    const res = await request(app).post('/api/exercises').set(ctx.entetes)
      .field('nom', 'Exercice galerie').field('description', 'Test')
      .field('imagesSupplementaires', JSON.stringify(['pas une adresse']));
    expect(res.statusCode).toBe(400);
  });
});
