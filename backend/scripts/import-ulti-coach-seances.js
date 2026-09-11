// Import Ulti Coach — les 41 séances vérifiées de Notion vers Entrainement.
// Par défaut : ESSAI À BLANC (lecture seule, rien n'est écrit).
// Import réel : node scripts/import-ulti-coach-seances.js --executer
// Relançable sans dupliquer : une séance dont le titre existe déjà dans l'espace est ignorée.
'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const WORKSPACE_ID = 'e133fed1-ab18-4e1f-8e10-eb9124645fa6';
const EXECUTER = process.argv.includes('--executer');
const SEANCES = require('./data/ulti-coach-seances.json');
const COULEUR_PUBLIC = '#009688';

/** Nom comparable : sans accents, sans casse, sans article de tête, apostrophes unifiées. */
function normaliser(nom) {
  return String(nom || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'").toLowerCase().trim()
    .replace(/^(le |la |les |l')/, '')
    .replace(/\s+/g, ' ');
}

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

function bloc(titre, texte) {
  return texte && String(texte).trim() ? `${titre} :\n${String(texte).trim()}` : '';
}

/** Tout le contenu d'un exercice de séance, en texte lisible (pour une note de séance). */
function texteComplet(ex) {
  return [
    ex.nb && `Joueurs : ${ex.nb}`,
    ex.mat && `Matériel : ${ex.mat.replace(/\n/g, ' · ')}`,
    ex.duree && `Durée : ${ex.duree}`,
    bloc('Objectif', ex.obj),
    bloc('Critère de réussite', ex.crit),
    bloc('Déroulement', ex.der),
    ex.vp && ex.vp.length && bloc('Variables (+)', ex.vp.map(v => `- ${v}`).join('\n')),
    ex.vm && ex.vm.length && bloc('Variables (−)', ex.vm.map(v => `- ${v}`).join('\n')),
    bloc('Notes', ex.notes),
  ].filter(Boolean).join('\n\n');
}

async function main() {
  console.log(EXECUTER ? '=== IMPORT RÉEL ===' : '=== ESSAI À BLANC (rien n\'est écrit) ===');

  const [tags, lexique, catalogue, existants] = await Promise.all([
    prisma.tag.findMany({ where: { workspaceId: WORKSPACE_ID } }),
    prisma.lexique.findMany({ where: { workspaceId: WORKSPACE_ID } }),
    prisma.exercice.findMany({ where: { workspaceId: WORKSPACE_ID }, select: { id: true, nom: true } }),
    prisma.entrainement.findMany({ where: { workspaceId: WORKSPACE_ID }, select: { titre: true } }),
  ]);

  const tag = (categorie, label) => tags.find(t => t.category === categorie && t.label === label);
  const terme = t => lexique.find(l => l.terme === t);
  const parNom = new Map(catalogue.map(e => [normaliser(e.nom), e]));
  const titresExistants = new Set(existants.map(e => e.titre));

  const bilan = {
    seances: 0, ignorees: [], echauffements: 0, blocs: 0, matchs: 0,
    fichesCreees: [], fichesReutilisees: [], manquants: [], proches: [], publicACreer: new Set(),
  };

  // Noms de nouvelles fiches présents dans plusieurs séances : on les distingue par la séance.
  const compteNoms = {};
  for (const s of SEANCES) for (const ex of s.ex) {
    if (!ex.ref && !parNom.has(normaliser(ex.nom))) compteNoms[normaliser(ex.nom)] = (compteNoms[normaliser(ex.nom)] || 0) + 1;
  }

  for (const s of SEANCES) {
    if (titresExistants.has(s.titre)) { bilan.ignorees.push(s.titre); continue; }

    const tagIds = [];
    const theme = s.theme && tag('theme_entrainement', s.theme);
    if (s.theme && !theme) bilan.manquants.push(`thème « ${s.theme} » (${s.titre})`);
    if (theme) tagIds.push(theme.id);
    for (const p of s.phases) {
      const t = tag('phase_entrainement', p);
      if (t) tagIds.push(t.id); else bilan.manquants.push(`phase « ${p} » (${s.titre})`);
    }
    let publicTag = s.niveau && tag('public_seance', s.niveau);
    if (s.niveau && !publicTag) bilan.publicACreer.add(s.niveau);

    const lexiqueIds = [];
    for (const l of s.lexique) {
      const t = terme(l);
      if (t) lexiqueIds.push(t.id); else bilan.manquants.push(`lexique « ${l} » (${s.titre})`);
    }

    // Exercices : fiche du catalogue si le nom existe, sinon nouvelle fiche.
    const plan = s.ex.map(ex => {
      const nomRef = ex.ref || ex.nom;
      const trouve = parNom.get(normaliser(nomRef));
      if (ex.ref && !trouve) bilan.manquants.push(`fiche catalogue « ${ex.ref} » (${s.titre})`);
      if (trouve) {
        bilan.fichesReutilisees.push(`${trouve.nom}  ←  ${s.titre}`);
        return { exerciceId: trouve.id, notes: ex.ref ? ex.seanceNote : texteComplet(ex) };
      }
      const proche = catalogue.find(c => distance(normaliser(c.nom), normaliser(nomRef)) <= 2);
      if (proche) bilan.proches.push(`« ${nomRef} » ressemble à la fiche « ${proche.nom} » (${s.titre})`);
      const court = s.titre.replace(/\s*\((Débutant|Hétérogène|Confirmé)\)$/, '');
      const nom = compteNoms[normaliser(ex.nom)] > 1 ? `${ex.nom} — ${court}` : ex.nom;
      bilan.fichesCreees.push(nom);
      return {
        nouvelle: {
          nom,
          description: [bloc('Objectif', ex.obj), bloc('Déroulement', ex.der)].filter(Boolean).join('\n\n') || ex.obj || nom,
          critereReussite: ex.crit || null,
          materiel: ex.mat || null,
          notes: [ex.nb && `Joueurs : ${ex.nb}`, ex.duree && `Durée : ${ex.duree}`, ex.notes, `Source : séance « ${s.titre} » (Notion)`].filter(Boolean).join('\n\n'),
          variablesPlus: JSON.stringify(ex.vp || []),
          variablesMinus: JSON.stringify(ex.vm || []),
        },
      };
    });

    bilan.seances++;
    if (s.ech.length) { bilan.echauffements++; bilan.blocs += s.ech.length; }
    if (s.match) bilan.matchs++;
    if (!EXECUTER) continue;

    await prisma.$transaction(async tx => {
      if (s.niveau && !publicTag) {
        publicTag = await tx.tag.create({ data: { label: s.niveau, category: 'public_seance', color: COULEUR_PUBLIC, workspaceId: WORKSPACE_ID } });
        tags.push(publicTag);
      }
      if (publicTag) tagIds.push(publicTag.id);

      const liens = [];
      for (const [i, p] of plan.entries()) {
        let exerciceId = p.exerciceId;
        if (p.nouvelle) {
          const cree = await tx.exercice.create({
            data: { ...p.nouvelle, workspaceId: WORKSPACE_ID, tags: { connect: tagIds.filter(id => id !== publicTag?.id).map(id => ({ id })) } },
          });
          exerciceId = cree.id;
        }
        if (liens.some(l => l.exerciceId === exerciceId)) continue; // même fiche deux fois dans une séance
        liens.push({ exerciceId, ordre: i + 1, notes: p.notes || null, workspaceId: WORKSPACE_ID });
      }

      const echauffement = s.ech.length ? await tx.echauffement.create({
        data: {
          nom: `Échauffement — ${s.titre}`, workspaceId: WORKSPACE_ID,
          blocs: { create: s.ech.map(([titre, info], i) => ({ ordre: i + 1, titre, informations: info || null, workspaceId: WORKSPACE_ID })) },
        },
      }) : null;

      const match = s.match ? await tx.situationMatch.create({
        data: { nom: `Match — ${s.titre}`, type: 'Match', description: s.match, workspaceId: WORKSPACE_ID },
      }) : null;

      await tx.entrainement.create({
        data: {
          titre: s.titre,
          date: s.date ? new Date(`${s.date}T12:00:00Z`) : null,
          rang: s.rang ?? null,
          workspaceId: WORKSPACE_ID,
          echauffementId: echauffement?.id ?? null,
          situationMatchId: match?.id ?? null,
          tags: { connect: tagIds.map(id => ({ id })) },
          lexique: { connect: lexiqueIds.map(id => ({ id })) },
          exercices: { create: liens },
        },
      });
    }, { timeout: 60000 });
    console.log(`  ✓ ${s.titre}`);
  }

  console.log('\n--- BILAN ---');
  console.log(`Séances à importer : ${bilan.seances} (déjà présentes, ignorées : ${bilan.ignorees.length})`);
  console.log(`Échauffements : ${bilan.echauffements} (${bilan.blocs} blocs) · Situations de match : ${bilan.matchs}`);
  console.log(`Fiches exercices créées : ${bilan.fichesCreees.length} · fiches du catalogue réutilisées : ${bilan.fichesReutilisees.length}`);
  console.log(`Tags « public » à créer : ${[...bilan.publicACreer].join(', ') || 'aucun'}`);
  console.log(`\nÉléments introuvables (${bilan.manquants.length}) :`); bilan.manquants.forEach(m => console.log('  ✗ ' + m));
  console.log(`\nFiches du catalogue réutilisées :`); bilan.fichesReutilisees.forEach(m => console.log('  ↺ ' + m));
  console.log(`\nNoms proches d'une fiche existante (à vérifier, NON reliés) :`); bilan.proches.forEach(m => console.log('  ? ' + m));
  console.log(`\nNouvelles fiches :`); bilan.fichesCreees.forEach(m => console.log('  + ' + m));
}

main()
  .catch(e => { console.error('ÉCHEC :', e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
