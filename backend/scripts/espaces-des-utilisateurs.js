// Met les comptes existants au nouveau régime d'espaces :
//   - un espace personnel par utilisateur, dont il est gestionnaire ;
//   - l'espace collectif « Ulti Coach » en lecture (un rôle supérieur déjà accordé est conservé) ;
//   - retrait de l'espace BASE, désormais réservé aux administrateurs de la plateforme.
// Les administrateurs ne sont pas touchés (ils gardent BASE et TEST).
// Par défaut : ESSAI À BLANC. Exécution : --executer
'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const { nomEspacePersonnel } = require('../services/business/workspace.service');

const prisma = new PrismaClient();
const EXECUTER = process.argv.includes('--executer');
const COACH = 'Ulti Coach';
const BASE = 'BASE';

async function main() {
  console.log(EXECUTER ? '=== MISE À JOUR RÉELLE ===' : '=== ESSAI À BLANC (rien n\'est écrit) ===');

  const coach = await prisma.workspace.findFirst({ where: { name: COACH } });
  const base = await prisma.workspace.findFirst({ where: { name: BASE } });
  if (!coach) { console.log(`✗ espace « ${COACH} » introuvable, rien fait`); return; }

  const utilisateurs = await prisma.user.findMany({
    include: { workspaces: { include: { workspace: true } } },
    orderBy: { createdAt: 'asc' },
  });

  for (const u of utilisateurs) {
    if (String(u.role).toUpperCase() === 'ADMIN') { console.log(`= ${u.email} : administrateur, inchangé`); continue; }

    const actions = [];
    let espace = u.workspaces.find((l) => l.workspace.ownerId === u.id)?.workspace
      || await prisma.workspace.findFirst({ where: { ownerId: u.id } });

    if (!espace) {
      const nom = nomEspacePersonnel(u);
      actions.push(`créer « ${nom} » (gestionnaire)`);
      if (EXECUTER) {
        espace = await prisma.workspace.create({ data: { name: nom, ownerId: u.id } });
        await prisma.workspaceUser.create({ data: { workspaceId: espace.id, userId: u.id, role: 'MANAGER' } });
      }
    }

    if (!u.workspaces.some((l) => l.workspaceId === coach.id)) {
      actions.push(`${COACH} en lecture`);
      if (EXECUTER) await prisma.workspaceUser.create({ data: { workspaceId: coach.id, userId: u.id, role: 'VIEWER' } });
    }

    const lienBase = base && u.workspaces.find((l) => l.workspaceId === base.id);
    if (lienBase) {
      actions.push(`retirer de ${BASE}`);
      if (EXECUTER) await prisma.workspaceUser.delete({ where: { id: lienBase.id } });
    }

    console.log(`${actions.length ? '+' : '='} ${u.email} : ${actions.join(' · ') || 'déjà à jour'}`);
  }

  const restant = base ? await prisma.workspaceUser.count({ where: { workspaceId: base.id } }) : 0;
  console.log(`\nMembres restants dans ${BASE} : ${restant}${EXECUTER ? '' : ' (avant exécution)'}`);
}

main().catch(e => { console.error('ÉCHEC :', e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
