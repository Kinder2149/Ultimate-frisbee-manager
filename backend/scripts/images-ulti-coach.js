// Rattache aux fiches Ulti Coach les images de leur page Notion (schéma d'exercice, d'étirement, de play).
// Usage : node scripts/images-ulti-coach.js <lot.json>
// lot.json : [{ "nom": "Sapin", "url": "<lien Notion signé, valide 5 min>" }, ...]
//            ou [{ "nom": "Réveil musculaire", "urls": ["<lien 1>", "<lien 2>", ...] }, ...]
// La première image devient l'image principale, les suivantes la galerie (imagesSupplementaires).
// Cloudinary télécharge les images lui-même ; la fiche (exercice ou échauffement) reçoit les URL Cloudinary.
// Une image déjà en place n'est pas remplacée : le script complète seulement ce qui manque (relançable).
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
  const champs = { id: true, nom: true, imageUrl: true, imagesSupplementaires: true };
  const [exercices, echauffements] = await Promise.all([
    prisma.exercice.findMany({ where: { workspaceId: W }, select: champs }),
    prisma.echauffement.findMany({ where: { workspaceId: W }, select: champs }),
  ]);

  for (const entree of lot) {
    const { nom } = entree;
    const liens = entree.urls || (entree.url ? [entree.url] : []);
    const ex = exercices.find(e => norm(e.nom) === norm(nom));
    const ech = echauffements.find(e => norm(e.nom) === norm(nom));
    const cible = ex || ech;
    if (!cible) { console.log(`✗ ${nom} : fiche introuvable`); continue; }

    const dejaEnPlace = (cible.imageUrl ? 1 : 0) + (cible.imagesSupplementaires || []).length;
    const aEnvoyer = liens.slice(dejaEnPlace);
    if (!aEnvoyer.length) { console.log(`= ${nom} : ${dejaEnPlace} image(s) déjà en place`); continue; }

    const famille = ex ? 'exercices' : 'echauffements';
    const ajoutees = [];
    try {
      for (const [i, url] of aEnvoyer.entries()) {
        const rang = dejaEnPlace + i;
        const res = await cloudinary.uploader.upload(url, {
          folder: `ultimate-frisbee-manager/${famille}`,
          public_id: `ulti-coach-${slug(nom)}${rang ? '-' + (rang + 1) : ''}`,
          overwrite: true,
        });
        ajoutees.push(res.secure_url);
      }
    } catch (e) {
      console.log(`✗ ${nom} : ${e.message || e.error?.message || e}`);
      if (!ajoutees.length) continue;
    }

    const principale = cible.imageUrl || ajoutees[0];
    const supplementaires = [...(cible.imagesSupplementaires || []), ...(cible.imageUrl ? ajoutees : ajoutees.slice(1))];
    const donnees = { imageUrl: principale, imagesSupplementaires: supplementaires };
    if (ex) await prisma.exercice.update({ where: { id: ex.id }, data: donnees });
    else await prisma.echauffement.update({ where: { id: ech.id }, data: donnees });
    console.log(`✓ ${nom} (${famille}) : +${ajoutees.length} image(s), total ${1 + supplementaires.length}`);
  }
}

main().catch(e => { console.error('ÉCHEC :', e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
