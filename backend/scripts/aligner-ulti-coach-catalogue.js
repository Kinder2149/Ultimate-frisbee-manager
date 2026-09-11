// Alignement du catalogue Ulti Coach (UFM) sur la banque d'exercices Notion.
// Référence : scripts/data/ulti-coach-notion-catalogue.json (77 fiches, état du 11/09/2026).
// Par défaut : ESSAI À BLANC (lecture seule). Exécution : --executer
//
// 1. supprime les fiches créées depuis les séances (absentes de Notion) et le doublon « Fléche »
// 2. range les fiches de type « Echauffement » seul ou « Etirements » dans la famille Échauffements
// 3. crée les fiches et phases manquantes
// 4. recalcule les tags de chaque exercice depuis Notion (type + éléments, travail spécifique, phases)
// 5. supprime les tags objectif / travail spécifique devenus inutilisés
'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const W = 'e133fed1-ab18-4e1f-8e10-eb9124645fa6';
const EXECUTER = process.argv.includes('--executer');
const REF = require('./data/ulti-coach-notion-catalogue.json');
const PLACEHOLDER = /^\[Fiche Notion incomplète/;

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’'“”"]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const fiches = REF.fiches.map(([notionId, nom, type, elements, travailSpecifique, phases, niveau, intensite, zones, infoPlus]) =>
  ({ notionId, nom, type, elements, travailSpecifique, phases: phases.map(id => REF.phases[id]), niveau, intensite, zones, infoPlus }));
const estEchauffement = f => (f.type.length === 1 && f.type[0] === 'Echauffement') || (f.type.length === 1 && f.type[0] === 'Etirements');

function infos(f) {
  return [
    f.type[0] === 'Etirements' ? 'Étirement' : 'Échauffement',
    f.intensite && `Intensité : ${f.intensite}`,
    f.zones.length && `Zone du corps : ${f.zones.join(', ')}`,
    f.niveau && `Niveau : ${f.niveau}`,
  ].filter(Boolean).join(' · ');
}

async function main() {
  console.log(EXECUTER ? '=== ALIGNEMENT RÉEL ===' : '=== ESSAI À BLANC (rien n\'est écrit) ===');
  const exercices = await prisma.exercice.findMany({ where: { workspaceId: W }, include: { entrainements: true } });
  const echauffements = await prisma.echauffement.findMany({ where: { workspaceId: W } });
  const tags = await prisma.tag.findMany({ where: { workspaceId: W } });

  const issusSeances = exercices.filter(e => /Source : séance/.test(e.notes || ''));
  const catalogue = exercices.filter(e => !issusSeances.includes(e));
  const parNom = new Map(catalogue.map(e => [norm(e.nom), e]));
  const refNoms = new Set(fiches.map(f => norm(f.nom)));
  const horsNotion = catalogue.filter(e => !refNoms.has(norm(e.nom)));

  const aRanger = fiches.filter(estEchauffement);
  const aGarder = fiches.filter(f => !estEchauffement(f));
  const aCreer = aGarder.filter(f => !parNom.has(norm(f.nom)));
  const echExistants = new Set(echauffements.map(e => norm(e.nom)));
  const phasesManquantes = REF.nouvellesPhases.filter(p => !tags.some(t => t.category === 'phase_entrainement' && t.label === p.nom));

  // Liens de séance qui disparaîtront avec les fiches supprimées
  const liensPerdus = [...issusSeances, ...horsNotion].reduce((n, e) => n + e.entrainements.length, 0);
  const rangesUtilises = aRanger.map(f => parNom.get(norm(f.nom))).filter(e => e && e.entrainements.length);

  console.log(`\nFiches créées depuis les séances à supprimer : ${issusSeances.length}`);
  console.log(`Fiches du catalogue absentes de Notion à supprimer : ${horsNotion.map(e => e.nom).join(' · ') || 'aucune'}`);
  console.log(`Liens séance → exercice retirés avec elles : ${liensPerdus}`);
  console.log(`Fiches à ranger dans Échauffements : ${aRanger.length} (dont déjà présentes comme échauffement : ${aRanger.filter(f => echExistants.has(norm(f.nom))).length})`);
  if (rangesUtilises.length) console.log(`  ⚠ utilisées dans une séance : ${rangesUtilises.map(e => e.nom).join(', ')}`);
  console.log(`Exercices conservés : ${aGarder.length} (à créer : ${aCreer.map(f => f.nom).join(' · ') || 'aucun'})`);
  console.log(`Phases à créer : ${phasesManquantes.map(p => p.nom).join(', ') || 'aucune'}`);
  const introuvables = aGarder.flatMap(f => f.phases.filter(p => !tags.some(t => t.category === 'phase_entrainement' && t.label === p) && !REF.nouvellesPhases.some(n => n.nom === p)));
  console.log(`Phases référencées introuvables : ${[...new Set(introuvables)].join(', ') || 'aucune'}`);
  if (!EXECUTER) {
    console.log(`\nTotal visé : ${aGarder.length} exercices + ${aRanger.length} échauffements = ${fiches.length} fiches (Notion : ${fiches.length})`);
    return;
  }

  // 1. Suppressions (les liens EntrainementExercice partent en cascade)
  await prisma.exercice.deleteMany({ where: { id: { in: [...issusSeances, ...horsNotion].map(e => e.id) } } });
  console.log(`✓ ${issusSeances.length + horsNotion.length} fiches supprimées`);

  // 2. Phases manquantes
  const theme = label => tags.find(t => t.category === 'theme_entrainement' && t.label === label);
  for (const p of phasesManquantes) {
    const t = await prisma.tag.create({ data: { label: p.nom, category: 'phase_entrainement', parentId: theme(p.theme)?.id ?? null, workspaceId: W } });
    tags.push(t);
  }
  console.log(`✓ ${phasesManquantes.length} phases créées`);

  // 3. Échauffements / étirements
  let ranges = 0;
  for (const f of aRanger) {
    const ex = parNom.get(norm(f.nom));
    const texte = ex && !PLACEHOLDER.test(ex.description || '') ? ex.description.trim() : '';
    await prisma.$transaction(async tx => {
      if (!echExistants.has(norm(f.nom))) {
        await tx.echauffement.create({
          data: {
            nom: f.nom, description: infos(f), imageUrl: ex?.imageUrl ?? null, workspaceId: W,
            blocs: texte ? { create: [{ ordre: 1, titre: f.nom, informations: texte, workspaceId: W }] } : undefined,
          },
        });
      }
      if (ex) await tx.exercice.delete({ where: { id: ex.id } });
    });
    ranges++;
  }
  console.log(`✓ ${ranges} fiches rangées dans Échauffements`);

  // 4. Exercices : création des manquants + tags recalculés depuis Notion
  const tagDe = async (label, category) => {
    label = label.trim();
    let t = tags.find(x => x.category === category && x.label === label);
    if (!t) { t = await prisma.tag.create({ data: { label, category, workspaceId: W } }); tags.push(t); }
    return t.id;
  };
  let crees = 0;
  for (const f of aGarder) {
    const ids = [];
    for (const l of new Set([...f.type, ...f.elements].map(x => x.trim()))) ids.push(await tagDe(l, 'objectif'));
    if (f.travailSpecifique) ids.push(await tagDe(f.travailSpecifique, 'travail_specifique'));
    for (const p of f.phases) {
      const t = tags.find(x => x.category === 'phase_entrainement' && x.label === p);
      if (t) ids.push(t.id);
    }
    const existant = parNom.get(norm(f.nom));
    if (existant) {
      await prisma.exercice.update({ where: { id: existant.id }, data: { tags: { set: ids.map(id => ({ id })) } } });
    } else {
      const c = REF.contenusNouveaux[f.notionId] || {};
      await prisma.exercice.create({
        data: {
          nom: f.nom, workspaceId: W,
          description: [c.objectif && `Objectif :\n${c.objectif}`, c.deroulement && `Déroulement :\n${c.deroulement}`].filter(Boolean).join('\n\n') || f.nom,
          notes: [f.niveau && `Niveau Notion : ${f.niveau}`, c.note].filter(Boolean).join('\n') || null,
          variablesPlus: '[]', variablesMinus: '[]',
          tags: { connect: ids.map(id => ({ id })) },
        },
      });
      crees++;
    }
  }
  console.log(`✓ ${aGarder.length - crees} exercices re-tagués, ${crees} créés`);

  // 5. Tags objectif / travail spécifique inutilisés
  const inutiles = await prisma.tag.findMany({
    where: { workspaceId: W, category: { in: ['objectif', 'travail_specifique'] }, exercices: { none: {} }, entrainements: { none: {} }, situationsMatchs: { none: {} } },
  });
  await prisma.tag.deleteMany({ where: { id: { in: inutiles.map(t => t.id) } } });
  console.log(`✓ ${inutiles.length} tags inutilisés supprimés : ${inutiles.map(t => t.label).join(', ')}`);
}

main()
  .catch(e => { console.error('ÉCHEC :', e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
