// Import Ulti Coach — les 20 séances Notion hors des 41 vérifiées
// (4 « À valider Kinder » + 16 anciennes pages 2023-2024), repérées par un tag « Statut de la séance ».
// Par défaut : ESSAI À BLANC (lecture seule, rien n'est écrit).
// Import réel : node scripts/import-ulti-coach-seances-complement.js --executer
// Relançable sans dupliquer : une séance dont le titre existe déjà dans l'espace est ignorée.
//
// Fidélité à Notion : une séance n'est reliée à une fiche que si la relation « Exercices » de Notion
// la relie. Les exercices seulement cités dans le texte restent dans le texte (situation « Contenu »).
'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const W = 'e133fed1-ab18-4e1f-8e10-eb9124645fa6';
const EXECUTER = process.argv.includes('--executer');
const SEANCES = require('./data/ulti-coach-seances-complement.json');
const COULEUR_STATUT = '#9E9E9E';

// Séances dont la relation Notion « Exercices » est renseignée
const AVEC_RELATION = new Set([
  '3d79cc08fab88146bd6fc75d054a3f4d',
  '3d79cc08fab881e9bd68d8c782e827b7',
  '3d79cc08fab8811eb118e23d396f652a',
]);

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[’'“”"]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Texte de la situation liée : match éventuel + contenus sans autre place dans UFM. */
function texteSituation(s, exercicesCites) {
  const autres = [
    exercicesCites.length && exercicesCites.map(e => `${e.nom} : ${e.notes}`).join('\n\n'),
    s.contenu,
  ].filter(Boolean).join('\n\n');
  if (s.match && autres) return `${s.match}\n\n— Autres contenus notés dans Notion —\n${autres}`;
  return s.match || autres || null;
}

async function main() {
  console.log(EXECUTER ? '=== IMPORT RÉEL ===' : '=== ESSAI À BLANC (rien n\'est écrit) ===');

  const [tags, lexique, catalogue, existants] = await Promise.all([
    prisma.tag.findMany({ where: { workspaceId: W } }),
    prisma.lexique.findMany({ where: { workspaceId: W } }),
    prisma.exercice.findMany({ where: { workspaceId: W }, select: { id: true, nom: true } }),
    prisma.entrainement.findMany({ where: { workspaceId: W }, select: { titre: true } }),
  ]);
  const tag = (categorie, label) => tags.find(t => t.category === categorie && t.label === label);
  const parNom = new Map(catalogue.map(e => [norm(e.nom), e]));
  const titres = new Set(existants.map(e => e.titre));
  const manquants = [];
  let aImporter = 0;

  for (const s of SEANCES) {
    if (titres.has(s.titre)) { console.log(`  = déjà présente : ${s.titre}`); continue; }
    aImporter++;

    const tagIds = [];
    if (s.theme) { const t = tag('theme_entrainement', s.theme); t ? tagIds.push(t.id) : manquants.push(`thème « ${s.theme} »`); }
    for (const p of s.phases) { const t = tag('phase_entrainement', p); t ? tagIds.push(t.id) : manquants.push(`phase « ${p} »`); }
    if (s.niveau) { const t = tag('public_seance', s.niveau); t ? tagIds.push(t.id) : manquants.push(`public « ${s.niveau} »`); }
    const lexiqueIds = s.lexique.map(l => lexique.find(x => x.terme === l)).filter(Boolean).map(l => l.id);
    if (lexiqueIds.length !== s.lexique.length) manquants.push(`lexique de « ${s.titre} »`);

    const relie = AVEC_RELATION.has(s.notionId);
    const liens = [];
    for (const [i, ex] of (relie ? s.ex : []).entries()) {
      const fiche = parNom.get(norm(ex.nom));
      if (!fiche) { manquants.push(`fiche « ${ex.nom} » (${s.titre})`); continue; }
      liens.push({ exerciceId: fiche.id, ordre: i + 1, notes: ex.notes || null, workspaceId: W });
    }
    const situation = texteSituation(s, relie ? [] : s.ex);

    console.log(`  + ${s.titre}  [${s.statut}] — ${s.ech.length} blocs d'échauffement, ${liens.length} fiche(s) reliée(s), situation : ${situation ? (s.match ? 'Match' : 'Contenu') : 'aucune'}`);
    if (!EXECUTER) continue;

    await prisma.$transaction(async tx => {
      let statut = tag('statut_seance', s.statut);
      if (!statut) {
        statut = await tx.tag.create({ data: { label: s.statut, category: 'statut_seance', color: COULEUR_STATUT, workspaceId: W } });
        tags.push(statut);
      }
      const echauffement = s.ech.length ? await tx.echauffement.create({
        data: {
          nom: `Échauffement — ${s.titre}`, workspaceId: W,
          blocs: { create: s.ech.map(([titre, info], i) => ({ ordre: i + 1, titre, informations: info || null, workspaceId: W })) },
        },
      }) : null;
      const match = situation ? await tx.situationMatch.create({
        data: {
          nom: `${s.match ? 'Match' : 'Contenu'} — ${s.titre}`,
          type: s.match ? 'Match' : 'Situation',
          description: situation, workspaceId: W,
        },
      }) : null;
      await tx.entrainement.create({
        data: {
          titre: s.titre,
          date: s.date ? new Date(`${s.date}T12:00:00Z`) : null,
          rang: s.rang ?? null,
          workspaceId: W,
          echauffementId: echauffement?.id ?? null,
          situationMatchId: match?.id ?? null,
          tags: { connect: [...tagIds, statut.id].map(id => ({ id })) },
          lexique: { connect: lexiqueIds.map(id => ({ id })) },
          exercices: { create: liens },
        },
      });
    }, { timeout: 60000 });
  }

  console.log(`\nSéances à importer : ${aImporter} / ${SEANCES.length}`);
  console.log(`Éléments introuvables (${manquants.length}) :`); manquants.forEach(m => console.log('  ✗ ' + m));
  if (!EXECUTER) console.log(`Tags « Statut de la séance » créés si absents : ${[...new Set(SEANCES.map(s => s.statut))].join(', ')} (couleur ${COULEUR_STATUT})`);
}

main()
  .catch(e => { console.error('ÉCHEC :', e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
