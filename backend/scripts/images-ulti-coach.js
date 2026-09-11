// Rattache aux fiches Ulti Coach l'image de leur page Notion (schéma d'exercice, d'étirement, de play).
// Usage : node scripts/images-ulti-coach.js <lot.json>
// lot.json : [{ "nom": "Sapin", "url": "<lien Notion signé, valide 5 min>" }, ...]
// Cloudinary télécharge l'image lui-même ; la fiche (exercice ou échauffement) reçoit l'URL Cloudinary.
// Une fiche qui a déjà une image est ignorée (relançable).
'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { cloudinary } = require('../services/cloudinary');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const W = 'e133fed1-ab18-4e1f-8e10-eb9124645fa6';
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'“”"]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const slug = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  const lot = require(path.resolve(process.argv[2]));
  const [exercices, echauffements] = await Promise.all([
    prisma.exercice.findMany({ where: { workspaceId: W }, select: { id: true, nom: true, imageUrl: true } }),
    prisma.echauffement.findMany({ where: { workspaceId: W }, select: { id: true, nom: true, imageUrl: true } }),
  ]);
  for (const { nom, url } of lot) {
    const ex = exercices.find(e => norm(e.nom) === norm(nom));
    const ech = echauffements.find(e => norm(e.nom) === norm(nom));
    const cible = ex || ech;
    if (!cible) { console.log(`✗ ${nom} : fiche introuvable`); continue; }
    if (cible.imageUrl) { console.log(`= ${nom} : a déjà une image`); continue; }
    try {
      const famille = ex ? 'exercices' : 'echauffements';
      const res = await cloudinary.uploader.upload(url, { folder: `ultimate-frisbee-manager/${famille}`, public_id: `ulti-coach-${slug(nom)}`, overwrite: true });
      if (ex) await prisma.exercice.update({ where: { id: ex.id }, data: { imageUrl: res.secure_url } });
      else await prisma.echauffement.update({ where: { id: ech.id }, data: { imageUrl: res.secure_url } });
      console.log(`✓ ${nom} (${famille})`);
    } catch (e) {
      console.log(`✗ ${nom} : ${e.message || e.error?.message || e}`);
    }
  }
}

main().catch(e => { console.error('ÉCHEC :', e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
