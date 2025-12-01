const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { prisma } = require('../services/prisma');

/**
 * Helper: crée un utilisateur ADMIN et retourne un token JWT utilisable
 * pour appeler les routes protégées (même logique que dans export.test.js).
 */
const makeAdminToken = async () => {
  await prisma.user.deleteMany({});
  const user = await prisma.user.create({
    data: {
      email: `ex-upload-admin-${Date.now()}@ultimate.com`,
      nom: 'Admin',
      prenom: 'Upload',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: 'ADMIN',
    },
  });

  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Prépare les tags minimaux requis pour créer un exercice
 * - 1 tag de catégorie "objectif"
 * - >=1 tag de catégorie "travail_specifique"
 */
const createExerciseTags = async () => {
  await prisma.tag.deleteMany({});

  const objectif = await prisma.tag.create({
    data: {
      label: 'Objectif Test',
      category: 'objectif',
      color: '#FF0000',
    },
  });

  const travailSpecifique = await prisma.tag.create({
    data: {
      label: 'Travail Spécifique Test',
      category: 'travail_specifique',
      color: '#0000FF',
    },
  });

  return { objectif, travailSpecifique };
};

afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * Ce test crée un exercice avec upload d'image et permet de suivre
 * tout le flux via les logs déjà présents :
 * - logBody (req.body avant validation)
 * - logs dans createExercice (résumé des champs + données envoyées à Prisma)
 */
describe('API - Création exercice avec upload d\'image', () => {
  it('POST /api/exercices crée un exercice avec imageUrl renseigné', async () => {
    const token = await makeAdminToken();
    const { objectif, travailSpecifique } = await createExerciseTags();

    // Préparer un tableau de tagIds conforme aux règles métier
    const tagIds = [objectif.id, travailSpecifique.id];

    // Faux contenu d'image (le middleware ne vérifie que l'extension du nom de fichier)
    const fakeImageBuffer = Buffer.from('fake image content');

    const res = await request(app)
      .post('/api/exercices')
      .set('Authorization', `Bearer ${token}`)
      .field('nom', 'Exercice Upload Test')
      .field('description', 'Exercice créé par le test d\'upload.')
      // On envoie tagIds sous forme de JSON string pour coller au comportement du transformFormData
      .field('tagIds', JSON.stringify(tagIds))
      // Variables et points vides pour simplifier
      .field('variablesPlus', JSON.stringify([]))
      .field('variablesMinus', JSON.stringify([]))
      .field('points', JSON.stringify([]))
      .field('schemaUrls', JSON.stringify([]))
      // Champ fichier: doit s'appeler 'image' pour matcher createUploader('image', 'exercices')
      .attach('image', fakeImageBuffer, 'test-upload.png');

    // Vérifications de base
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('nom', 'Exercice Upload Test');

    // Le contrôleur renvoie l'exercice avec imageUrl déjà renseigné (URL Cloudinary complète)
    // ou, en cas de mock Cloudinary, au moins une chaîne non vide.
    expect(res.body).toHaveProperty('imageUrl');
    expect(typeof res.body.imageUrl).toBe('string');
    expect(res.body.imageUrl.length).toBeGreaterThan(0);

    // Pour aider au débogage manuel, on logue l\'imageUrl et l\'ID de l\'exercice créé
    // (s'ajoute aux logs déjà présents dans les middlewares / contrôleur).
    // eslint-disable-next-line no-console
    console.log('[TEST-UPLOAD] Exercice créé:', {
      id: res.body.id,
      imageUrl: res.body.imageUrl,
      tags: res.body.tags?.map(t => ({ id: t.id, category: t.category })),
    });
  });
});
