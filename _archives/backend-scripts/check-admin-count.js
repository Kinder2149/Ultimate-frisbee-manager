/**
 * Script de vérification : compte les administrateurs actifs en base.
 * Lecture seule — aucune modification.
 *
 * Usage : node scripts/check-admin-count.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const activeAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true, email: true, nom: true, prenom: true, createdAt: true }
    });

    const inactiveAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: false },
      select: { id: true, email: true, nom: true, prenom: true, createdAt: true }
    });

    const totalUsers = await prisma.user.count();

    console.log('=== VÉRIFICATION ADMIN ===');
    console.log(`Total utilisateurs : ${totalUsers}`);
    console.log(`Admins actifs      : ${activeAdmins.length}`);
    console.log(`Admins inactifs    : ${inactiveAdmins.length}`);
    console.log('');

    if (activeAdmins.length === 0) {
      console.error('🔴 CRITIQUE : Aucun administrateur actif en base !');
      console.error('   Action requise : restaurer un admin via SQL direct.');
      console.error('   Voir docs/reference/ADMIN_RECOVERY.md');
      process.exitCode = 1;
    } else if (activeAdmins.length === 1) {
      console.warn('🟠 ATTENTION : Un seul administrateur actif.');
      console.warn('   Recommandation : ajouter un second admin de secours.');
    } else {
      console.log('🟢 OK : Plusieurs administrateurs actifs.');
    }

    console.log('');
    console.log('--- Admins actifs ---');
    for (const a of activeAdmins) {
      console.log(`  [${a.id}] ${a.email} (${a.nom} ${a.prenom || ''}) — créé le ${a.createdAt.toISOString()}`);
    }

    if (inactiveAdmins.length > 0) {
      console.log('');
      console.log('--- Admins inactifs ---');
      for (const a of inactiveAdmins) {
        console.log(`  [${a.id}] ${a.email} (${a.nom} ${a.prenom || ''}) — créé le ${a.createdAt.toISOString()}`);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification :', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
