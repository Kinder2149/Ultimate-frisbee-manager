jest.mock('../middleware/auth.middleware', () =>
  require('../tests/helpers/contexte-test').authentificationSimulee());

const { prisma } = require('../services/prisma');
const { viderBase } = require('../tests/helpers/contexte-test');
const { ensureDefaultWorkspaceAndLink, nomEspacePersonnel } = require('../services/business/workspace.service');

async function creerUtilisateur(email, role = 'USER') {
  return prisma.user.create({ data: { email, nom: '', prenom: email.split('@')[0], role } });
}

beforeEach(async () => { await viderBase(); });
afterAll(async () => { await viderBase(); await prisma.$disconnect(); });

describe('Espaces attribués à un utilisateur', () => {
  it('donne un espace personnel en gestionnaire et Ulti Coach en lecture', async () => {
    await prisma.workspace.create({ data: { name: 'Ulti Coach' } });
    const user = await creerUtilisateur('arthur.dessez@ufm.test');

    const espaces = await ensureDefaultWorkspaceAndLink(user.id);

    const personnel = espaces.find((e) => e.ownerId === user.id);
    expect(personnel).toBeTruthy();
    expect(personnel.name).toBe('Espace de Arthur Dessez');
    expect(personnel.role).toBe('MANAGER');

    const coach = espaces.find((e) => e.name === 'Ulti Coach');
    expect(coach.role).toBe('VIEWER');
  });

  it("ne rattache pas l'utilisateur à l'espace BASE", async () => {
    await prisma.workspace.create({ data: { name: 'BASE', isBase: true } });
    await prisma.workspace.create({ data: { name: 'Ulti Coach' } });
    const user = await creerUtilisateur('luna@ufm.test');

    const espaces = await ensureDefaultWorkspaceAndLink(user.id);

    expect(espaces.some((e) => e.name === 'BASE')).toBe(false);
  });

  it('ne crée rien en double et ne rétrograde pas un rôle déjà accordé', async () => {
    const coach = await prisma.workspace.create({ data: { name: 'Ulti Coach' } });
    const user = await creerUtilisateur('paul@ufm.test');
    await prisma.workspaceUser.create({ data: { workspaceId: coach.id, userId: user.id, role: 'MANAGER' } });

    await ensureDefaultWorkspaceAndLink(user.id);
    const espaces = await ensureDefaultWorkspaceAndLink(user.id);

    expect(espaces.filter((e) => e.name === 'Ulti Coach')).toHaveLength(1);
    expect(espaces.find((e) => e.name === 'Ulti Coach').role).toBe('MANAGER');
    expect(espaces.filter((e) => e.ownerId === user.id)).toHaveLength(1);
    expect(await prisma.workspace.count({ where: { ownerId: user.id } })).toBe(1);
  });

  it("met en forme le nom de l'espace à partir du nom renseigné", async () => {
    expect(nomEspacePersonnel({ prenom: 'Luna', nom: 'Zarate', email: 'l@z.fr' })).toBe('Espace de Luna Zarate');
    expect(nomEspacePersonnel({ prenom: '', nom: '', email: 'val.coutry@gmail.com' })).toBe('Espace de Val Coutry');
  });
});
