jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');
const { creerContexte, viderBase } = require('./helpers/contexte-test');

beforeEach(async () => {
  await viderBase();
});

afterAll(async () => {
  await viderBase();
  await prisma.$disconnect();
});

async function importer(ctx, type, corps, dryRun) {
  return request(app).post(`/api/import/${type}?dryRun=${dryRun}`).set(ctx.entetes).send(corps);
}

/** Verifie : la simulation n'ecrit rien, l'application ecrit dans l'espace courant. */
async function verifierImport(ctx, type, corps, compter, trouver) {
  const simulation = await importer(ctx, type, corps, true);
  expect(simulation.statusCode).toBe(200);
  expect(await compter()).toBe(0);

  const application = await importer(ctx, type, corps, false);
  expect(application.statusCode).toBe(200);
  const cree = await trouver();
  expect(cree).toBeTruthy();
  expect(cree.workspaceId).toBe(ctx.workspace.id);
  return cree;
}

describe('Import de contenus (administrateur)', () => {
  it('exercices : simulation sans ecriture, puis import dans l\'espace, puis export', async () => {
    const ctx = await creerContexte({ rolePlateforme: 'ADMIN' });
    const exo = await verifierImport(ctx, 'exercices',
      { exercices: [{ nom: 'Exo importe', description: 'Desc', variablesPlus: '', variablesMinus: '' }] },
      () => prisma.exercice.count(),
      () => prisma.exercice.findFirst({ where: { nom: 'Exo importe' } }));

    const exp = await request(app).get(`/api/admin/export-ufm?type=exercice&id=${exo.id}`)
      .set('Authorization', `Bearer ${ctx.user.id}`);
    expect(exp.statusCode).toBe(200);
    expect(JSON.parse(exp.text).data.id).toBe(exo.id);
  });

  it('entrainements : simulation sans ecriture, puis import dans l\'espace', async () => {
    const ctx = await creerContexte({ rolePlateforme: 'ADMIN' });
    const w = ctx.workspace.id;
    const exo = await prisma.exercice.create({ data: { nom: 'Exo B', description: 'D', variablesPlus: '', variablesMinus: '', workspaceId: w } });
    const ech = await prisma.echauffement.create({ data: { nom: 'Ech B', workspaceId: w, blocs: { create: [{ ordre: 1, titre: 'Bloc', workspaceId: w }] } } });
    const sit = await prisma.situationMatch.create({ data: { type: 'Jeu place', workspaceId: w } });

    await verifierImport(ctx, 'entrainements',
      { entrainements: [{ titre: 'Seance importee', echauffementId: ech.id, situationMatchId: sit.id,
        exercices: [{ exerciceId: exo.id, ordre: 1, duree: 10 }] }] },
      () => prisma.entrainement.count(),
      () => prisma.entrainement.findFirst({ where: { titre: 'Seance importee' } }));
  });

  it('echauffements : import avec ses blocs', async () => {
    const ctx = await creerContexte({ rolePlateforme: 'ADMIN' });
    const ech = await verifierImport(ctx, 'echauffements',
      { echauffements: [{ nom: 'Ech importe', description: 'W', blocs: [{ titre: 'Course', temps: 5 }] }] },
      () => prisma.echauffement.count(),
      () => prisma.echauffement.findFirst({ where: { nom: 'Ech importe' }, include: { blocs: true } }));
    expect(ech.blocs.length).toBe(1);
  });

  it('situations : simulation sans ecriture, puis import dans l\'espace', async () => {
    const ctx = await creerContexte({ rolePlateforme: 'ADMIN' });
    await verifierImport(ctx, 'situations-matchs',
      { situations: [{ type: 'Match importe', description: 'S' }] },
      () => prisma.situationMatch.count(),
      () => prisma.situationMatch.findFirst({ where: { type: 'Match importe' } }));
  });

  it('interdit l\'import a un utilisateur standard (403), sans rien ecrire', async () => {
    const ctx = await creerContexte({ rolePlateforme: 'USER', roleEspace: 'MANAGER' });
    const res = await importer(ctx, 'situations-matchs', { situations: [{ type: 'Intrus' }] }, false);
    expect(res.statusCode).toBe(403);
    expect(await prisma.situationMatch.count()).toBe(0);
  });
});

describe('Import de contenus — etancheite entre espaces', () => {
  it("ne modifie jamais un contenu du meme nom dans un autre espace", async () => {
    const autre = await creerContexte({ rolePlateforme: 'ADMIN' });
    const original = await prisma.exercice.create({
      data: { nom: 'Passe en triangle', description: 'Version de l’autre espace', variablesPlus: '', variablesMinus: '', workspaceId: autre.workspace.id },
    });

    const moi = await creerContexte({ rolePlateforme: 'ADMIN' });
    const res = await importer(moi, 'exercices',
      { exercices: [{ nom: 'Passe en triangle', description: 'Ma version', variablesPlus: '', variablesMinus: '' }] }, false);
    expect(res.statusCode).toBe(200);
    expect(res.body.exercices[0].action).toBe('create');

    const intact = await prisma.exercice.findUnique({ where: { id: original.id } });
    expect(intact.description).toBe('Version de l’autre espace');
    expect(await prisma.exercice.count({ where: { workspaceId: moi.workspace.id } })).toBe(1);
  });

  it("refuse un entrainement qui cite un exercice d'un autre espace", async () => {
    const autre = await creerContexte({ rolePlateforme: 'ADMIN' });
    const exoAutre = await prisma.exercice.create({
      data: { nom: 'Exo etranger', description: 'D', variablesPlus: '', variablesMinus: '', workspaceId: autre.workspace.id },
    });
    const moi = await creerContexte({ rolePlateforme: 'ADMIN' });

    const res = await importer(moi, 'entrainements',
      { entrainements: [{ titre: 'Seance piratee', exercices: [{ exerciceId: exoAutre.id, ordre: 1 }] }] }, false);

    expect(res.statusCode).toBe(200);
    expect(res.body.totals.skipped).toBe(1);
    expect(res.body.entrainements[0].error).toMatch(/introuvable/);
    expect(await prisma.entrainement.count()).toBe(0);
  });

  it("cree les tags importes dans l'espace courant", async () => {
    const moi = await creerContexte({ rolePlateforme: 'ADMIN' });
    const res = await importer(moi, 'exercices',
      { exercices: [{ nom: 'Exo tague', description: 'D', tags: [{ label: 'Tactique', category: 'objectif' }] }] }, false);
    expect(res.statusCode).toBe(200);
    expect(res.body.totals.created).toBe(1);
    const tag = await prisma.tag.findFirst({ where: { label: 'Tactique' } });
    expect(tag.workspaceId).toBe(moi.workspace.id);
  });
});

describe('Import de contenus — robustesse', () => {
  it('une erreur sur un element ne bloque pas les suivants', async () => {
    const moi = await creerContexte({ rolePlateforme: 'ADMIN' });
    const res = await importer(moi, 'exercices', { exercices: [
      { nom: 'Premier', description: 'OK' },
      { nom: 'Sans description' },
      { nom: 'Troisieme', description: 'OK' },
    ] }, false);
    expect(res.statusCode).toBe(200);
    expect(res.body.totals).toMatchObject({ created: 2, skipped: 1 });
    expect(await prisma.exercice.count()).toBe(2);
  });

  it("ne recopie dans les blocs que les champs connus", async () => {
    const autre = await creerContexte();
    const moi = await creerContexte({ rolePlateforme: 'ADMIN' });
    const res = await importer(moi, 'echauffements', { echauffements: [{
      nom: 'Ech intrus', blocs: [{ titre: 'Course', temps: 5, workspaceId: autre.workspace.id, id: 'force' }],
    }] }, false);
    expect(res.statusCode).toBe(200);
    const bloc = await prisma.blocEchauffement.findFirst({ where: { titre: 'Course' } });
    expect(bloc.workspaceId).toBe(moi.workspace.id);
    expect(bloc.temps).toBe('5');
    expect(bloc.id).not.toBe('force');
  });
});
