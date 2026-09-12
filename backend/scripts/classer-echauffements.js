// Classe les échauffements de l'espace Ulti Coach en deux familles (tag « Type d'échauffement ») :
//   - « Physique »           : mise en route dynamique, jeux, gammes
//   - « Réveil musculaire »  : étirements et mobilisation au sol
// La famille vient de la fiche Notion : une fiche dont le contenu commence par « Étirement » est un
// réveil musculaire, « Échauffement » un travail physique. Les cas particuliers sont listés ci-dessous.
// Par défaut : ESSAI À BLANC. Exécution : --executer
'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const W = 'e133fed1-ab18-4e1f-8e10-eb9124645fa6';
const EXECUTER = process.argv.includes('--executer');
const CATEGORIE = 'type_echauffement';
const COULEUR = '#8BC34A';
const PHYSIQUE = 'Physique';
const REVEIL = 'Réveil musculaire';

// Fiches dont le classement ne se déduit pas du texte de la fiche
const CAS_PARTICULIERS = {
  'Réveil musculaire': REVEIL,        // suite d'étirements, malgré le type « Échauffement » de Notion
  'Méthode russe (au sol)': REVEIL,   // mobilisation au sol, intensité « Réveil musculaire »
  'Pense-bête échauffement': PHYSIQUE, // aide-mémoire de mise en route
};

function famille(e) {
  if (CAS_PARTICULIERS[e.nom]) return CAS_PARTICULIERS[e.nom];
  const texte = (e.description || '').replace(/<[^>]*>/g, ' ');
  if (/Étirement|Etirement/i.test(texte)) return REVEIL;
  if (/Échauffement|Echauffement/i.test(texte)) return PHYSIQUE;
  return null;
}

async function main() {
  console.log(EXECUTER ? '=== CLASSEMENT RÉEL ===' : '=== ESSAI À BLANC (rien n\'est écrit) ===');

  const echauffements = await prisma.echauffement.findMany({
    where: { workspaceId: W, NOT: { nom: { startsWith: 'Échauffement —' } } },
    include: { tags: true },
    orderBy: { nom: 'asc' },
  });

  const tags = {};
  for (const label of [PHYSIQUE, REVEIL]) {
    let tag = await prisma.tag.findFirst({ where: { workspaceId: W, category: CATEGORIE, label } });
    if (!tag) {
      console.log(`  + étiquette à créer : « ${label} »`);
      if (EXECUTER) tag = await prisma.tag.create({ data: { label, category: CATEGORIE, color: COULEUR, workspaceId: W } });
    }
    tags[label] = tag;
  }

  const bilan = { [PHYSIQUE]: [], [REVEIL]: [], nonClasses: [] };
  for (const e of echauffements) {
    const cible = famille(e);
    if (!cible) { bilan.nonClasses.push(e.nom); continue; }
    bilan[cible].push(e.nom);
    if (!EXECUTER) continue;
    const autres = e.tags.filter(t => t.category !== CATEGORIE).map(t => ({ id: t.id }));
    await prisma.echauffement.update({
      where: { id: e.id },
      data: { tags: { set: [...autres, { id: tags[cible].id }] } },
    });
  }

  console.log(`\n${PHYSIQUE} (${bilan[PHYSIQUE].length}) : ${bilan[PHYSIQUE].join(' · ')}`);
  console.log(`\n${REVEIL} (${bilan[REVEIL].length}) : ${bilan[REVEIL].join(' · ')}`);
  console.log(`\nNon classés (${bilan.nonClasses.length}) : ${bilan.nonClasses.join(' · ') || 'aucun'}`);
  console.log(`\nTotal : ${echauffements.length} échauffements du catalogue`);
}

main().catch(e => { console.error('ÉCHEC :', e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
