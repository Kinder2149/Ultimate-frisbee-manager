// Mission import Ulti Coach — Parties A (Tags Thème/Phase) + B (Exercices)
// One-off script. Relançable sans dupliquer (vérifie existence avant création).
'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WORKSPACE_ID = 'e133fed1-ab18-4e1f-8e10-eb9124645fa6';

// ---------------------------------------------------------------------------
// PARTIE A — Thèmes / Phases / Sous-phases (Contenu - Thèmes & Phases)
// ---------------------------------------------------------------------------
// type: 'Theme' | 'Phase' | 'Sous-phase' (Sous-phase traité comme phase_entrainement aussi)
const CONTENU = [
  // Thèmes
  { url: 'https://app.notion.com/3cc9cc08fab881fabeeeee96cb80a438', nom: 'Le Cut', type: 'Theme', parent: null },
  { url: 'https://app.notion.com/3cc9cc08fab88177bffdc3d1fae1e30b', nom: 'Continuité et prise de décision', type: 'Theme', parent: null },
  { url: 'https://app.notion.com/3cc9cc08fab881ccb55be4f0add10e4a', nom: 'Défense — les bases', type: 'Theme', parent: null },
  { url: 'https://app.notion.com/3cc9cc08fab8812e85bfc8cb672e10ce', nom: "Passer devant l'attaque", type: 'Theme', parent: null },
  { url: 'https://app.notion.com/3cc9cc08fab88199ac1de20f9bd8b185', nom: 'Défense de zone', type: 'Theme', parent: null },
  { url: 'https://app.notion.com/3cc9cc08fab88149ba0ff4835984b874', nom: "Techniques d'attaque", type: 'Theme', parent: null },
  { url: 'https://app.notion.com/3cc9cc08fab881feb68cd503e8619252', nom: 'Défense individuelle — perfectionnement', type: 'Theme', parent: null },
  { url: 'https://app.notion.com/3cc9cc08fab881dda994eb66c71ce29c', nom: 'Défense de zone — perfectionnement', type: 'Theme', parent: null },
  { url: 'https://app.notion.com/3cc9cc08fab88163a8e6f4e93b950ec7', nom: 'Attaque collective — perfectionnement', type: 'Theme', parent: null },
  { url: 'https://app.notion.com/3cc9cc08fab8810ea2d2e1a00b1675cc', nom: "Travail d'équipe", type: 'Theme', parent: null },
  // Phases
  { url: 'https://app.notion.com/3cc9cc08fab8812f8b81c05aa918ae9e', nom: 'Le stack', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881fabeeeee96cb80a438' },
  { url: 'https://app.notion.com/3cc9cc08fab881ab8671f58f8edb6dfe', nom: 'Le 1er rideau (les chiens)', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88199ac1de20f9bd8b185' },
  { url: 'https://app.notion.com/3cc9cc08fab881029e0fdd32ae13746a', nom: 'Le swing des lanceurs (contre la zone)', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88149ba0ff4835984b874' },
  { url: 'https://app.notion.com/3cc9cc08fab8811b9482ce7821c0648d', nom: "La prise d'info", type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881fabeeeee96cb80a438' },
  { url: 'https://app.notion.com/3cc9cc08fab8815e98dbf78f19478a82', nom: "Libérer l'espace", type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881fabeeeee96cb80a438' },
  { url: 'https://app.notion.com/3cc9cc08fab8817e85bde510d5e7757c', nom: 'La position de base (à plat)', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881ccb55be4f0add10e4a' },
  { url: 'https://app.notion.com/3cc9cc08fab881da9351de9fed615cf9', nom: 'Le timing', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88177bffdc3d1fae1e30b' },
  { url: 'https://app.notion.com/3cc9cc08fab881dfb4b3d672f5d33313', nom: 'Le pied de pivot défensif', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab8812e85bfc8cb672e10ce' },
  { url: 'https://app.notion.com/3cc9cc08fab88121b22df2e5c7dae127', nom: 'Les pistons', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88149ba0ff4835984b874' },
  { url: 'https://app.notion.com/3cc9cc08fab8812ca3fad3365b3e48e5', nom: 'Le jeu long', type: 'Phase', parent: null }, // orpheline, décision Kinder en attente
  { url: 'https://app.notion.com/3cc9cc08fab8814aa286f5632dbd0ddc', nom: 'Le découpage du compte', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881ccb55be4f0add10e4a' },
  { url: 'https://app.notion.com/3cc9cc08fab8816b8315c4478687fa87', nom: 'Couper la trajectoire', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab8812e85bfc8cb672e10ce' },
  { url: 'https://app.notion.com/3cc9cc08fab881919771fd45099caafd', nom: 'Le swing', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88177bffdc3d1fae1e30b' },
  { url: 'https://app.notion.com/3cc9cc08fab881a29fbce1788d7a5648', nom: 'Le 2e rideau (le phare)', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88199ac1de20f9bd8b185' },
  { url: 'https://app.notion.com/3cc9cc08fab881fabb31fc2b914f73be', nom: 'Le cut 1', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881fabeeeee96cb80a438' },
  { url: 'https://app.notion.com/3cc9cc08fab88124b793c1776e54d35b', nom: 'Le deep', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88199ac1de20f9bd8b185' },
  { url: 'https://app.notion.com/3cc9cc08fab8817998caeadd70ea2ad1', nom: 'Le crash', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88149ba0ff4835984b874' },
  { url: 'https://app.notion.com/3cc9cc08fab88112b5e1e3dce0fdd92b', nom: 'Le recentrage', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88177bffdc3d1fae1e30b' },
  { url: 'https://app.notion.com/3cc9cc08fab88118a271ff9507414128', nom: 'La passe en courbe', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88177bffdc3d1fae1e30b' },
  { url: 'https://app.notion.com/3cc9cc08fab8814b9adeec1e2c08ed9b', nom: 'Le changement de direction', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881fabeeeee96cb80a438' },
  { url: 'https://app.notion.com/3cc9cc08fab881bc8b6fd3f13d53580a', nom: 'Le triangle de vision', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881ccb55be4f0add10e4a' },
  { url: 'https://app.notion.com/3cc9cc08fab88144a5e0c7c7068974b2', nom: 'Le cut 2', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881fabeeeee96cb80a438' },
  { url: 'https://app.notion.com/3cc9cc08fab88146ad35d06f6404910b', nom: 'La passe qui déclenche', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88177bffdc3d1fae1e30b' },
  { url: 'https://app.notion.com/3cc9cc08fab8817bb261c1a467b74458', nom: 'La passe en mouvement', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88177bffdc3d1fae1e30b' },
  { url: 'https://app.notion.com/3cc9cc08fab881a58aacdf9f0422c8ea', nom: 'La force (ouvert / fermé)', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881ccb55be4f0add10e4a' },
  { url: 'https://app.notion.com/3cc9cc08fab881c78c2cc6d4da803838', nom: 'Le switch', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88199ac1de20f9bd8b185' },
  { url: 'https://app.notion.com/3cc9cc08fab88159b727e0c71af34187', nom: 'La communication', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab88177bffdc3d1fae1e30b' },
  { url: 'https://app.notion.com/3cc9cc08fab881c59434cbfbbe2eb468', nom: 'La zone de réception', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881fabeeeee96cb80a438' },
  { url: 'https://app.notion.com/3cc9cc08fab881e2bdd4f4d4067fb7c3', nom: 'Le recyclage', type: 'Phase', parent: 'https://app.notion.com/3cc9cc08fab881fabeeeee96cb80a438' },
  // Sous-phases
  { url: 'https://app.notion.com/3cc9cc08fab88184978dcebeeece6542', nom: 'Le Classique', type: 'Sous-phase', parent: 'https://app.notion.com/3cc9cc08fab881fabb31fc2b914f73be' },
  { url: 'https://app.notion.com/3cc9cc08fab881ffb823c54453892c0c', nom: 'Mettre sur les talons (la Bise)', type: 'Sous-phase', parent: 'https://app.notion.com/3cc9cc08fab881fabb31fc2b914f73be' },
  { url: 'https://app.notion.com/3cc9cc08fab88133842bfcc2b19dd919', nom: "L'Opportuniste", type: 'Sous-phase', parent: 'https://app.notion.com/3cc9cc08fab881fabb31fc2b914f73be' },
  { url: 'https://app.notion.com/3cc9cc08fab881c0b739f566890e92ee', nom: 'La Clam', type: 'Sous-phase', parent: 'https://app.notion.com/3cc9cc08fab88199ac1de20f9bd8b185' },
  { url: 'https://app.notion.com/3cc9cc08fab881789b65cd2d5595e23c', nom: 'Play — La Praline', type: 'Sous-phase', parent: 'https://app.notion.com/3cc9cc08fab88149ba0ff4835984b874' },
  { url: 'https://app.notion.com/3cc9cc08fab8811bacbeefb32ad5046c', nom: 'Play — Le Petit Train', type: 'Sous-phase', parent: 'https://app.notion.com/3cc9cc08fab88149ba0ff4835984b874' },
  { url: 'https://app.notion.com/3cc9cc08fab881b68c82d161fcf7de42', nom: 'Play — La Toupie', type: 'Sous-phase', parent: 'https://app.notion.com/3cc9cc08fab88149ba0ff4835984b874' },
  { url: 'https://app.notion.com/3cc9cc08fab88122b737d0ee430194c6', nom: 'Play — La Rocco', type: 'Sous-phase', parent: 'https://app.notion.com/3cc9cc08fab88149ba0ff4835984b874' },
  { url: 'https://app.notion.com/3cc9cc08fab881f1911cf7425ad240fa', nom: "Play — L'Émeraude", type: 'Sous-phase', parent: 'https://app.notion.com/3cc9cc08fab88149ba0ff4835984b874' },
  { url: 'https://app.notion.com/3cc9cc08fab881319d77e0a4c7a9ad3d', nom: 'Play — Le Split Stack', type: 'Sous-phase', parent: 'https://app.notion.com/3cc9cc08fab88149ba0ff4835984b874' },
];

// ---------------------------------------------------------------------------
// PARTIE B — Exercices (73)
// notesLines: array of strings compiled into `notes` (joined by \n)
// ---------------------------------------------------------------------------
const EXERCICES = [
  {
    nom: '[DOUBLON — voir "La flèche"] Fléche',
    objectif: 'Fare monter le rythmee et toucher du disc en équipe',
    deroulement: "Les joueurs se mettent en colone face au joueur zéro avec le disc. Le joueur 1 dans la colone part droit devant puis cut d'un côté. Le J0 fait la passe dans la continuité puis se déplace en face du J1.\nJ1 fait la passe à J0 et cut sur la position initiale de J0 qui lui renvoie dans cette même zone\nPuis J2 part et fais le même chose\n\n-> Variable à deux entrées\nJ0 fait la passe à J1 qui part du fond de la colone puis J1 lui renvoie\nJ2 part du début de la colone cette fois ci pour reprendre la posititon de J0\nJ3 repars du fond pour continuer le cycle",
    critereReussite: 'Pas de perte de disc\nJe pars quand la passe n-1 est laché',
    variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: 15, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Progressif', zoneCorps: null, infoPlus: ['Give and go'],
    typeExercice: ['Echauffemen avec disc'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab881fabb31fc2b914f73be'],
    extraNotes: ['DOUBLON de "La flèche" — marqué ainsi dans la fiche Notion elle-même, conservé tel quel'],
  },
  {
    nom: 'A babord', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Pectoraux'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Attaque des Handler', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', "Stratégie d'équipes"], travailSpecifique: 'Handler',
    phases: [], incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Braise', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', "Stratégie d'équipes"], travailSpecifique: 'Mixte',
    phases: [], incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Catch ta zone',
    objectif: "Give and Go / Échauffement avec disque / Jeu sous pression",
    deroulement: "Des binômes partent d'un plot de départ avec un disque pour deux. L'objectif est de progresser jusqu'à différentes zones rapportant un certain nombre de points :\n- Grande zone = 1 point\n- Moyenne zone = 2 points\n- (On peut ajouter une petite zone pour 3 points si souhaité)\nÀ chaque réception réussie dans une zone, on marque les points correspondants, puis on revient à la base pour recommencer. Chaque manche dure 4 minutes maximum.\n\nObjectifs pédagogiques : enchaîner les passes rapidement, maîtriser le Give and Go, jouer sous pression et prendre des décisions rapides.\n\nDéroulement : tous les binômes sont au plot de départ. Au signal, chaque binôme démarre comme il le souhaite. Réception réussie dans une zone → on marque les points de cette zone. Retour à la base pour recommencer.",
    critereReussite: 'Atteindre un nombre de points fixé à l\'avance.\nMaximiser le score dans un temps limité.',
    variablesPlus: 'Ajouter des défenseurs pour gêner la progression.\nRéduire le nombre de zones',
    variablesMinus: 'Rapprocher les zones de la base.\nAutoriser le touché-catché (compte comme réception).',
    materiel: '4 plots × nombre de zones\n1 disque pour 2 joueurs', duree_minutes: 4, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: ['Give and go'],
    typeExercice: ['Attaque', 'Echauffemen avec disc'], elementsTravailles: ['Give And Go', 'Echauffement avec disc'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab881c59434cbfbbe2eb468'],
    extraNotes: ['Format Notion : Travail en rotation continue par manches chronométrées.'],
  },
  {
    nom: 'Conti de Royan',
    objectif: 'Dynamiser Handling\nGive and Go',
    deroulement: "Voir lien. L'objectif est de faire tourner le disc rapidement comme un give and go, puis enchainer sur une mi-longue pour gagner quelques mettre. L'appel du soutiens se fait derrièrre son handler pour faciliter la passe.",
    critereReussite: 'Pas de perte\nDisc catché au niveau de la stack',
    variablesPlus: '', variablesMinus: '',
    materiel: 'Un disc', duree_minutes: 15, nombre_joueurs: 15,
    niveau: 'Confirmé', intensite: null, zoneCorps: null, infoPlus: ['Give and go', 'Dynamiser le Handling'],
    typeExercice: ['Handler', 'Echauffemen avec disc'], elementsTravailles: ['Handler', 'Echauffemen avec disc', 'BASIQUE'], travailSpecifique: 'Handler',
    phases: ['https://app.notion.com/3cc9cc08fab881919771fd45099caafd'],
  },
  {
    nom: 'Contre le mur', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Mollets'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Contre le mur bis', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Mollets'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Craquage', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Fessiers', 'Bas du dos'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Croisement', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Epaules'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Croisé', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Tricpes'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Culbute', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Bas du dos', 'Haut du dos'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Demo BOISS',
    objectif: "Faire voir l'espace de jeu créé par les pivots.",
    deroulement: "1. Petits pivots d'un côté, puis de l'autre → on pose un disque marqueur à chaque extrémité\n2. Grands pivots → on pose deux nouveaux marqueurs\n3. L'écart entre les 4 disques est l'espace gagné.\nLe principe généralisable : quand un concept est abstrait, on le pose au sol.\n\nVariantes à 2 : Boussole, 3 niveaux de lancer (haut/milieu/bas), 3 distances (proche/moyen/loin).\nVariantes à 3 : Je lance → gamme → reçois → remise ; Je lance → cut devant → ouvert → reçois → remise ; (+) le lanceur va en face et défend.",
    critereReussite: "Les joueurs constatent d'eux-mêmes que les grands pivots obligent le défenseur à un déplacement complet.",
    variablesPlus: '', variablesMinus: '',
    materiel: '4 disques posés au sol comme marqueurs', duree_minutes: null, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Réveil musculaire', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffemen avec disc', 'Handler'], elementsTravailles: ['Handler', 'BASIQUE'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8817e85bde510d5e7757c', 'https://app.notion.com/3cc9cc08fab88112b5e1e3dce0fdd92b'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.16, p.41, p.42, p.63) — nombre de joueurs : à 2 puis à 3'],
  },
  {
    nom: 'Diago', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', "Stratégie d'équipes"], travailSpecifique: 'Middle',
    phases: [], incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Dos creux Dos rond', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Hanche', 'Bas du dos', 'Haut du dos', 'Abdominaux'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Duel attaque / défense annoncé',
    objectif: "Mettre la défense en position de marquer des points — elle n'est plus celle qui subit.",
    deroulement: "Chaque milieu attaquant a un numéro. Le handler annonce un numéro → duel attaque / défense.\nBarème : dissuasion +1 pt, interception +2 pts, attaque marque dans l'ouvert −1 pt. Montantes / descendantes sur les scores de défense.\nLe barème récompense la dissuasion : un défenseur qui ferme bien sans jamais toucher le disque marque quand même.",
    critereReussite: 'Le barème ci-dessus — la dissuasion compte, pas seulement l\'interception.',
    variablesPlus: '', variablesMinus: '',
    materiel: 'Disques', duree_minutes: null, nombre_joueurs: 5,
    niveau: 'Confirmé', intensite: 'Intense', zoneCorps: null, infoPlus: null,
    typeExercice: ['Défense'], elementsTravailles: ['Défense Individuelle'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8816b8315c4478687fa87', 'https://app.notion.com/3cc9cc08fab881dfb4b3d672f5d33313'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.38). Équipes de 4 à 5 joueurs, "4 à 6 tentatives" pour la défense (durée non chiffrée en minutes).'],
  },
  {
    nom: 'Echauffement Gamme (Progressif)',
    objectif: null,
    deroulement: "Sur une distance de quelques mètres effectuer des aller retours.\n\nRéveil Musculaire : enroulement de tête le long de la colonne vertébrale jusqu'à toucher les pieds ; le scorpion ; l'araignée ; la salutation (fente, regard gauche/droite/derrière) ; marche pointe des pieds / talons / intérieur-extérieur ; superman sur une jambe ; flamand rose.\n\nDynamisant : tire genou ; tire flamand rose ; ouverture de porte ; fermeture de porte ; dynamique (enchaînement ouverture/fermeture) ; feinte de revers/coup droit exagérée ; petite fille (sautillé) ; talon fesses sur une jambe ; montée de genou sur une jambe ; pas chassé ; brésilien ; pas chassé bas sur les appuis ; pas chassé avant/arrière ; devant une ligne imaginaire (rebonds jambe droite/gauche/pied joint, puis de profil).",
    critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Progressif', zoneCorps: ['Haut du corps', 'Bas du corps'], infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement sans disc', 'BASIQUE'], travailSpecifique: 'Mixte',
    phases: [],
  },
  {
    nom: 'Echauffement Physique', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Intense', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement avec disc'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Echauffement Progressif Mixte', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Progressif', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement avec disc'], travailSpecifique: null,
    phases: [], incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'En cercle ( peu d’espace)',
    objectif: null,
    deroulement: "Sur place, en cercle on trottine tant qu'il ne se passe rien. Je viens faire un squat, du talons fesses plus ou moins dynamique, montée de genou, pas chassé en rond au clap je change de sens, tipping.",
    critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Intense', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement sans disc'], travailSpecifique: 'Mixte',
    phases: [], extraNotes: ['Zone du corps (Notion) : Cardio'],
  },
  {
    nom: 'Evolution du carré avec les plots', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Progressif', zoneCorps: null, infoPlus: null,
    typeExercice: ['Middel'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8811b9482ce7821c0648d'],
    incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Fessiers', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Fessiers'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Flexion', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Hanche'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Fléction dynamique (méthode russe suite)',
    objectif: null,
    deroulement: "Debout sur une jambe, série de flexion extension :\n- On fléchit la jambe droite puis on remonte\n- On fléchit la jambe gauche puis on remonte\nToujours debout on vient monter sur la pointe de pied (jambe gauche, jambe droite).\nPlus on accentue la flexion/extension plus on travaille.\nDeux séries de 10 font vite monter la température, notamment si on vient toucher le sol lors de la deuxième série de flexion.",
    critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Progressif', zoneCorps: ['Bas du corps'], infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement sans disc'], travailSpecifique: 'Mixte',
    phases: [],
  },
  {
    nom: 'Fou', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', "Stratégie d'équipes"], travailSpecifique: 'Handler',
    phases: [], incomplete: true,
  },
  {
    nom: 'Frisbee lumière',
    objectif: 'Placer son regard par rapport au disque. Le disque = la lumière.',
    deroulement: "Jeu à 3 → position sur le porteur + le regard. Variante avec priorité défense.\n« Disque = lumière » : image efficace pour un placement de regard difficile à décrire autrement.",
    critereReussite: 'Le défenseur garde 2 des 3 éléments du triangle en vision directe.',
    variablesPlus: '', variablesMinus: '',
    materiel: 'Disques', duree_minutes: null, nombre_joueurs: 3,
    niveau: 'Débutant', intensite: 'Progressif', zoneCorps: null, infoPlus: null,
    typeExercice: ['Défense', 'Echauffement'], elementsTravailles: ['Défense Individuelle', 'Visualisation'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab881bc8b6fd3f13d53580a', 'https://app.notion.com/3cc9cc08fab8817e85bde510d5e7757c'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.41, p.43) — déroulé exact du jeu à compléter par Kinder'],
  },
  {
    nom: 'Gym tonic', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Haut du dos', 'Bas du dos'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Iron Man',
    objectif: "Échauffement avec disque / Stratégies d'équipe / Défense individuelle ou collective",
    deroulement: "On crée une zone carrée d'environ 2 à 3 mètres de côté (ajustable). Deux équipes de 2 ou 3 joueurs s'affrontent. But : marquer un point en attrapant le disque dans la zone. Après chaque point, l'équipe adverse reprend le disque à l'extérieur de la zone.\nRègles de base : le disque doit être attrapé à l'intérieur de la zone pour marquer ; remise en jeu depuis l'extérieur après chaque point.\nÉvolutions possibles : nombre minimum de passes avant de marquer ; travail technique ciblé (forehand/backhand/passes hautes uniquement) ; restriction de défense (interdire la défense statique) ; variante défense de zone imposée (plusieurs zones, un défenseur par zone).",
    critereReussite: 'Respect du timing pour attaquer la zone au bon moment.\nCapacité à créer de l\'espace face à une défense rapprochée.\nBonne communication d\'équipe.',
    variablesPlus: 'Réduire la taille de la zone.\nAugmenter le nombre de défenseurs.\nAutoriser défense agressive dans la zone.',
    variablesMinus: 'Agrandir la zone.\nJouer en surnombre offensif.\nLimiter la pression défensive (défenseur passif).',
    materiel: 'Plots pour délimiter la zone, disques', duree_minutes: 20, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Intense', zoneCorps: null, infoPlus: ['Give and go', 'Dynamiser le Handling'],
    typeExercice: ['Middel'], elementsTravailles: ['Echauffement avec disc', 'Défense Collective'], travailSpecifique: 'Mixte',
    phases: ['https://app.notion.com/3cc9cc08fab8817e85bde510d5e7757c'],
  },
  {
    nom: 'Iso', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', "Stratégie d'équipes"], travailSpecifique: 'Mixte',
    phases: [], incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Jeu des 4 zones',
    objectif: 'Analyser le terrain et occuper les espaces — progression par zones.',
    deroulement: "La progression en 4 paliers :\n1. Si besoin : touché / catché\n2. Si ça tombe = retour à la base\n3. Ajouter un défenseur\n4. Compétition\nAdaptation à l'effectif intégrée : rajouter X plots de couleur pour X joueurs, plus la zone a de plots, moins il y a d'attente. Les joueurs ramènent un plot une fois le disque catché.",
    critereReussite: 'Selon le palier : conservation, puis progression, puis point marqué.',
    variablesPlus: 'Défenseur · compétition · moins de plots',
    variablesMinus: 'Touché/catché · plus de plots · sans défense',
    materiel: '4 zones délimitées · plots de couleur · disques', duree_minutes: null, nombre_joueurs: null,
    niveau: 'Débutant', intensite: 'Progressif', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffemen avec disc', 'Attaque'], elementsTravailles: ['Echauffement avec disc', 'BASIQUE'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8811b9482ce7821c0648d', 'https://app.notion.com/3cc9cc08fab881c59434cbfbbe2eb468'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.33, p.51, p.63). Existe aussi en version 3 zones.'],
  },
  {
    nom: 'La Boussole',
    objectif: 'Balayer tous les côtés et toutes les hauteurs de passe.',
    deroulement: '3 niveaux de passe × side / back.',
    critereReussite: 'Les 3 niveaux sont réussis des deux côtés.',
    variablesPlus: '3 endroits : proche / moyen / loin\nAjouter la contrainte de pied de pivot',
    variablesMinus: 'Distance courte uniquement\nUn seul côté',
    materiel: 'Disques', duree_minutes: null, nombre_joueurs: 2,
    niveau: 'Débutant', intensite: 'Réveil musculaire', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffemen avec disc'], elementsTravailles: ['Les Lancés', 'Echauffement avec disc'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8817bb261c1a467b74458'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.14, p.16)'],
  },
  {
    nom: 'La Clam (jeu de chat par zones)',
    objectif: 'Comprendre le relais entre défenseurs : on accompagne, on gêne, puis on passe au suivant.',
    deroulement: "Quand un joueur fait un appel, le stack se regroupe et décide qui part à t+1. Au top, je choisis un joueur en le pointant.\n1. Chacun son tour, les joueurs du stack font un appel en traversant au moins 2 zones. Les défenseurs interceptent celui qui arrive/suit/relaie.\n2. 2 joueurs partent en 2 temps, puis en même temps. Si possible 3 puis 4.\n3. Situation plutôt jeu : 2 joueurs max font un appel ; le joueur de la zone 2 conserve l'attaquant, les autres forcent sur les autres.",
    critereReussite: "Le joueur qui traverse est pris en charge sans trou d'une zone à l'autre.",
    variablesPlus: '2 puis 3 puis 4 joueurs simultanés · passage en situation de jeu',
    variablesMinus: 'Un joueur à la fois · zones plus larges',
    materiel: 'Pas de disque · zones délimitées', duree_minutes: null, nombre_joueurs: null,
    niveau: 'Confirmé', intensite: 'Intense', zoneCorps: null, infoPlus: null,
    typeExercice: ['Défense', 'Stratégie'], elementsTravailles: ['Défense Collective', "Stratégie d'équipes"], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab881c0b739f566890e92ee'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.6, p.9). Effectif : stack + 1 défenseur par zone.'],
  },
  {
    nom: 'La Fleur',
    objectif: "Drill de coupes faciles — installer le geste sans opposition.",
    deroulement: "4 appels du centre vers l'intérieur, puis du centre vers l'extérieur.",
    critereReussite: "Les 4 appels sont réalisés dans l'ordre, sans se gêner.",
    variablesPlus: '', variablesMinus: '',
    materiel: 'Disques', duree_minutes: null, nombre_joueurs: 4,
    niveau: 'Débutant', intensite: 'Progressif', zoneCorps: null, infoPlus: null,
    typeExercice: ['Middel', 'Attaque'], elementsTravailles: ['Le Cut'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab881fabb31fc2b914f73be'],
    extraNotes: ["Fiche reconstruite depuis le document de saison (attaque verticale, février) — schéma et variables à compléter par Kinder"],
  },
  {
    nom: 'La flèche',
    objectif: 'Échauffement avec disque / Give and Go / Le cut',
    deroulement: "Version simple\n1. Les joueurs se placent en colonne face au Joueur 0 (J0) qui a le disque.\n2. Le Joueur 1 (J1), en tête de colonne, part tout droit puis cut d'un côté.\n3. J0 lance dans la continuité vers J1, puis se déplace immédiatement en face de J1.\n4. J1 renvoie à J0 et cut vers la position initiale de J0, qui lui renvoie le disque dans cette même zone.\n5. J2 part et enchaîne exactement le même schéma.\n\nVariante à deux entrées\n1. J0 fait la passe à J1 qui part du fond de la colonne → J1 renvoie à J0.\n2. J2 (en tête de colonne) part ensuite pour reprendre la position initiale de J0.\n3. J3 part du fond et le cycle continue avec alternance début/fond de colonne.",
    critereReussite: 'Pas de perte de disque\nDépart du cut uniquement quand la passe n-1 est lâchée',
    variablesPlus: "Réduire l'espace de jeu pour augmenter la vitesse d'exécution.\nImposer un type de lancer (forehand uniquement, backhand uniquement).\nAjouter un défenseur passif puis actif.",
    variablesMinus: "Laisser un temps d'arrêt avant chaque lancer.\nAllonger les distances pour faciliter la précision.\nRetirer la variante à deux entrées.",
    materiel: 'Plots pour marquer les positions, 1 disque minimum.', duree_minutes: 10, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffemen avec disc'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab881fabb31fc2b914f73be'],
  },
  {
    nom: 'La flèche— Cut',
    objectif: "Développer la prise d'information avant le cut.\nAméliorer la qualité et la variété des cuts (en fonction des plots/couleurs).\nHabituer les joueurs à s'adapter rapidement à une consigne ou un signal extérieur.",
    deroulement: "Flèche à 1 entrée vers l'avant, avec des plots de couleur pour faire évoluer l'exercice : Jaune → V1, Vert → V2, Bleu → V3.",
    critereReussite: 'Le joueur coupe dans le bon espace en fonction de la couleur.\nLe cut est fait avec intensité et engagement.\nLe timing entre middle et handler permet une passe fluide.',
    variablesPlus: 'Appeler la couleur du plot pour le cut',
    variablesMinus: '',
    materiel: 'Un disc\nPlot de couleur', duree_minutes: 20, nombre_joueurs: 6,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Attaque', 'Echauffemen avec disc'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8814b9adeec1e2c08ed9b'],
    extraNotes: ['Format Notion : groupe de mini 6 pour que ça tourne'],
  },
  {
    nom: 'La Fontaine',
    objectif: 'Échauffement avec disque / Basique',
    deroulement: "Deux colonnes de joueurs face à face. Le premier joueur de la colonne A part sans disque en ligne droite puis effectue un cut perpendiculaire (90°) à droite ou à gauche. Le joueur en tête de la colonne B (avec disque) envoie le disque dans la zone de réception. Le lanceur devient ensuite coureur dans la colonne opposée, et le joueur suivant devient lanceur. Le coureur revient avec le disque, le redonne dans la file, puis rejoint sa colonne d'origine ou change de côté selon l'organisation choisie.",
    critereReussite: 'Bonne synchronisation entre lanceur et coureur.\nLe disque arrive dans la zone de réception sans que le coureur ait à ralentir ou s\'arrêter.\nLancers précis et cuts réalisés à pleine vitesse.',
    variablesPlus: "Ajouter des cuts plus complexes : devant→derrière, derrière→devant.\nAlterner les côtés du cut de manière aléatoire.\nRéduire l'espace de course pour obliger à des passes plus rapides et précises.\nAjouter un défenseur passif puis actif pour gêner la réception.",
    variablesMinus: "Autoriser un temps d'arrêt avant le lancer.\nFixer un seul côté de cut (droite ou gauche).\nEspacer davantage les colonnes pour laisser plus de temps au lancer.",
    materiel: 'Plots pour délimiter les zones, disques (1 par colonne de lanceur).', duree_minutes: 15, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffemen avec disc'], elementsTravailles: ['BASIQUE', 'Echauffement sans disc'], travailSpecifique: 'Mixte',
    phases: ['https://app.notion.com/3cc9cc08fab8817bb261c1a467b74458'],
  },
  {
    nom: 'La Q', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', "Stratégie d'équipes"], travailSpecifique: 'Mixte',
    phases: [], incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Le basique',
    objectif: 'Imager le cut en match en partant du stack\nToucher du disc\nJouer ensemble avec du rythme',
    deroulement: "Un joueur avec le disc se positionne face à une colonne de joueurs le regardant, espacée de plus ou moins 2 mètres : ce sont les branches (5 branches c'est pas mal pour l'exo + un joueur en attente sur chacune). Le premier joueur de la branche part faire un cut dans la zone arrière, plante et revient en direction du porteur. Au moment du premier cut du joueur 1 sur la branche, le joueur 2 part et fait la même chose : il part à fond au fond, plante et revient en direction du joueur 1 de la branche qui a maintenant le disc. Et ainsi de suite jusqu'au dernier joueur de la branche.",
    critereReussite: 'Flow du jeu\nJe plante pour cuter et revenir vers le porteur\nJe pars quand le J-1 fait son premier cut',
    variablesPlus: 'Faire partir le dernier joueur sur une longue\nLe joueur à la base enchaine tous les give and go : il suit le disc',
    variablesMinus: 'Rapprocher les distances de cut\nNe pas faire de longues au début\nMatérialiser les départs / cut par des plots',
    materiel: 'Un disc\nUn plot par branche au début', duree_minutes: 20, nombre_joueurs: 10,
    niveau: 'Débutant', intensite: 'Progressif', zoneCorps: null, infoPlus: ['Give and go', 'Passe dans la course'],
    typeExercice: ['Middel', 'Echauffemen avec disc', 'Attaque'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab88144a5e0c7c7068974b2'],
  },
  {
    nom: 'Le Cavalier',
    objectif: "Casser une zone trop bloquante en changeant de couloir. Principe de base : mouvement du handling — je donne, je libère ma colonne.",
    deroulement: "Quand l'utiliser : face à une zone trop bloquante, je ne trouve pas mes milieux, il y a beaucoup de vent.\nDéroulement : 1. Par l'extérieur à chaque fois. 2. Passage intérieur-intérieur. 3. La passe qui déclenche.",
    critereReussite: "Le décalage perturbe la défense — 2 choix s'ouvrent selon le rideau.",
    variablesPlus: '', variablesMinus: '',
    materiel: 'Disques', duree_minutes: null, nombre_joueurs: null,
    niveau: 'Confirmé', intensite: 'Progressif', zoneCorps: null, infoPlus: null,
    typeExercice: ['Handler', 'Stratégie'], elementsTravailles: ['Handler', "Stratégie d'équipes"], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab88112b5e1e3dce0fdd92b', 'https://app.notion.com/3cc9cc08fab881029e0fdd32ae13746a'],
    extraNotes: ["Fiche reconstruite depuis les notes manuscrites (PDF p.17, p.31) — le schéma des 3 colonnes n'est pas retranscrit. Nb joueurs : 3 colonnes (A, B, C)."],
  },
  {
    nom: 'Le T en relais',
    objectif: "Cardio et changements de direction — la prépa physique fait travailler le geste du jour.",
    deroulement: "Plots disposés en T. Le joueur touche chaque plot et revient à la base à chaque fois.\nAteliers associés (même feuille) — Pliométrie : bond pieds joints, le plus haut, sur le côté, pied fort ; Pliométrie 2 : pieds joints, sur le côté, foulée, grand. Renforcement : 1 lanceur, 1 back, 1 side — appeler une couleur et lancer de son côté, le regard guide.",
    critereReussite: 'Toucher chaque plot et revenir à la base, sans couper.',
    variablesPlus: '', variablesMinus: '',
    materiel: 'Plots disposés en T', duree_minutes: null, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Intense', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement sans disc'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8814b9adeec1e2c08ed9b'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.3) — nombre de répétitions et dimensions du T à compléter par Kinder. Format : par équipes, en relais.'],
  },
  {
    nom: 'Le Train',
    objectif: 'Échauffement avec disque / Give and Go / Le cut',
    deroulement: "Un porteur de disque est placé à la base (fond de terrain). Les autres joueurs sont alignés sur un côté du terrain, espacés sur toute la longueur, formant un stack géant. Le but est de faire remonter le disque de joueur en joueur jusqu'en haut du terrain, chaque middle sortant du stack pour recevoir et relancer.\n\nPhase 1 – Version simple : le joueur 1 sort pour observer le jeu et feinter vers l'arrière, puis enchaîne avec un cut vers l'avant pour recevoir la passe. Pendant la passe, le joueur 2 commence son appel de la même manière. Le disque continue ainsi jusqu'en haut du terrain.\nPhase 2 – Finition sur longue : le dernier joueur du stack part en profondeur pour un appel de longue ; le porteur du disque à ce moment effectue la passe longue.\nPhase 3 – Variante Give and Go : après sa première passe, le porteur initial suit le disque (coupe immédiatement pour recevoir à nouveau), puis relance au joueur suivant du stack.",
    critereReussite: 'Cuts réalisés au bon moment, sans ralentir la progression du disque.\nPasses précises permettant au receveur de continuer son mouvement.\nCommunication claire entre les joueurs pour synchroniser les départs.',
    variablesPlus: 'Ajouter un défenseur passif puis actif sur chaque receveur.\nRéduire l\'espace entre les joueurs pour accélérer le rythme.\nObliger les passes dans un seul style (forehand uniquement ou backhand uniquement).',
    variablesMinus: "Augmenter l'espacement pour donner plus de temps de réaction.\nAutoriser un temps d'arrêt après chaque réception.\nCommencer avec moins de joueurs pour réduire la complexité.",
    materiel: 'Plots pour marquer les positions du stack, disques (1 minimum).', duree_minutes: 20, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', 'BASIQUE'], travailSpecifique: 'Mixte',
    phases: ['https://app.notion.com/3cc9cc08fab8811bacbeefb32ad5046c'],
  },
  {
    nom: 'Le Z',
    objectif: "Faire des passes dans la course\nPasser par-dessus la défense (upside)\nExagérer le cut pour créer de l'espace",
    deroulement: "Deux colonnes disposées en diagonale s'affrontent dans un enchaînement dynamique de courses et de passes. Chaque joueur part sur une longue course, puis effectue un cut marqué pour recevoir un upside en mouvement, créant un schéma en Z fluide et continu. L'exercice travaille la vision de jeu, le timing des départs et la précision dans des passes aériennes.\nPoints clés : timing (départ déclenché à la passe du joueur précédent), technique de lancer (upside précis et adapté à la course), changement de direction (cut puissant pour casser la défense), enchaînement fluide (éviter les temps morts).",
    critereReussite: 'Départ au cut du joueur précédent (J-1)\nPasse dans la zone définie devant la colonne\nChangement de direction puissant et net\nFlow continu sans perte de rythme',
    variablesPlus: 'Changer le sens du Z\nÉcarter les points de départ\nAjouter un joueur au milieu pour un relais sous la passe',
    variablesMinus: 'Rapprocher les points de départ\nVerbaliser les zones de catch/cut avec des plots',
    materiel: '1 disque\nPlots pour délimiter zones et points de départ', duree_minutes: 15, nombre_joueurs: 6,
    niveau: 'Confirmé', intensite: 'Progressif', zoneCorps: null, infoPlus: ['Disc en hauteur', 'Passe dans la course'],
    typeExercice: ['Echauffemen avec disc', 'Attaque'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab881fabb31fc2b914f73be'],
    extraNotes: ['Format Notion : 2 colonnes de 3 joueurs, rotation fluide (le receveur devient lanceur dans la colonne opposée)'],
  },
  {
    nom: 'Le "U"',
    objectif: 'Échauffement avec disque / Basique',
    deroulement: "Deux colonnes de joueurs face à face, le disque part toujours d'un seul côté.\nPhase 1 – Version simple : 1. Le premier joueur de la colonne sans disque part en diagonale vers la droite. 2. Il reçoit le disque du premier joueur de la colonne opposée. 3. Juste après sa passe, le lanceur part à son tour en diagonale vers la gauche. 4. Il reçoit une passe du joueur qui vient de recevoir le disque. 5. Ce joueur renvoie ensuite le disque au prochain joueur en tête de la colonne opposée. On recommence à l'inverse. Origine du nom : la trajectoire du disque dessine un U.\nPhase 2 – Version évoluée (variations de cuts) : côté ouvert (cut à 90° parallèle au porteur) ; côté fermé (cut vers le centre puis 90° dans la direction initiale).\nPhase 3 – Version avec défense : introduction d'un défenseur passif puis actif sur chaque receveur, travail des passes côté ouvert et fermé selon la position du défenseur.",
    critereReussite: 'Fluidité de la boucle, sans temps morts.\nPasses précises, en mouvement, vers le bon côté (ouvert/fermé).\nCuts effectués à pleine vitesse et au bon timing.',
    variablesPlus: 'Ajouter un défenseur actif pour forcer un lancer côté fermé.\nRéduire la distance entre les colonnes pour augmenter la vitesse d\'exécution.\nObliger à lancer en forehand ou en backhand selon la situation.',
    variablesMinus: "Autoriser un temps d'arrêt avant la passe.\nFaire les diagonales à allure réduite.\nSupprimer les changements de côté et ne jouer que sur un schéma fixe.",
    materiel: 'Plots pour délimiter les colonnes et les zones de cut, disques (1 minimum par colonne de départ).', duree_minutes: 20, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffemen avec disc'], elementsTravailles: ['BASIQUE', 'Echauffement avec disc'], travailSpecifique: 'Mixte',
    phases: ['https://app.notion.com/3cc9cc08fab881fabb31fc2b914f73be'],
  },
  {
    nom: 'Les Petits Chevaux',
    objectif: "Ramener 2 chevaux à la maison. Physique et technique mélangés, en compétition.",
    deroulement: "Liste de tâches : squat, revers à plat, coup droit à plat, jumping jack, 1 passage en T, je donne/contre-cut, abdos, relais tipping.\nParcours en 8 cases → la Maison à la case 5.\nLes 2 manches : A — j'avance d'un ; B — je recule un cheval adverse.",
    critereReussite: 'Chaque tâche accomplie fait avancer un cheval d\'une case.',
    variablesPlus: '', variablesMinus: '',
    materiel: 'Zone de passes · zone physique\n8 cases de parcours\nDisques', duree_minutes: null, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Intense', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement sans disc', 'Les Lancés'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8817e85bde510d5e7757c'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.2) — nombre de répétitions par tâche et durée à compléter par Kinder. 2 équipes, 2 manches.'],
  },
  {
    nom: 'Levez de jambe', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Cuisses', 'Fessiers'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Ligne Imaginaire',
    objectif: null,
    deroulement: "Devant une ligne imaginaire, je viens rebondir devant, derrière avec la jambe droite, la jambe gauche et pied joint. Puis je me mets de profil pour faire la même chose.",
    critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Intense', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8817bb261c1a467b74458'],
  },
  {
    nom: 'Lombrique', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Bas du dos', 'Haut du dos', 'Epaules', 'Pectoraux'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'L’arbre',
    objectif: "Développer la prise d'information du middle (lecture avant cut).\nAméliorer l'enchaînement de cuts (cut 1 → cut 2).\nTravailler la communication et synchronisation entre middle et handlers.",
    deroulement: "Le disque est à la base. Le middle 1 prend l'info. Le middle 1 cut 1 + cut 2. Passe → enchaînement middle 2.",
    critereReussite: 'Le middle déclenche son cut au bon moment (lié à la prise d\'info).\nLes enchaînements se font sans rupture de rythme.\nLe handler suit le disque et propose une solution fluide.\nLa passe trouve la zone de réception prévue.',
    variablesPlus: 'Cut derrière / devant distinct\nTiming : M2 part quand M1 fini Cut 1\nLongue à la fin\nHandler suit le disque',
    variablesMinus: '',
    materiel: 'Un disc', duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Middel', 'Attaque'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8812f8b81c05aa918ae9e', 'https://app.notion.com/3cc9cc08fab88144a5e0c7c7068974b2', 'https://app.notion.com/3cc9cc08fab881e2bdd4f4d4067fb7c3'],
  },
  {
    nom: 'Master Mind',
    objectif: "Retrouver une combinaison cachée. Prise d'information et mémoire visuelle, sous forme de jeu.",
    deroulement: "Base : une solution de 3 disques de couleur, cachée.\n1. Disc × — les joueurs proposent\n2. Plots × — ils posent leur proposition\n3. Résultat — on donne le nombre de bonnes couleurs / bonnes places\nLe contenu est de la prise d'info pure, la forme est un jeu de société : les adultes s'y prennent au jeu et arrêtent de se juger.",
    critereReussite: 'La combinaison est retrouvée.',
    variablesPlus: '', variablesMinus: '',
    materiel: 'Disques de couleur\nPlots de couleur', duree_minutes: null, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Progressif', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement sans disc', 'Visualisation'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8811b9482ce7821c0648d'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.1) — nombre exact de couleurs, règle de scoring, durée à compléter par Kinder. Format : par équipes.'],
  },
  {
    nom: 'Morpion',
    objectif: "Partir sur un signal, pas quand on veut.",
    deroulement: "Chaque joueur a une couleur. Le coach (ou le catch) lève la couleur qui part.\nLe jeu force la prise d'info au lieu de la demander : le joueur ne décide pas de son départ, il réagit à un signal extérieur, comme dans le vrai jeu.",
    critereReussite: 'Le bon joueur part — celui dont la couleur a été levée.',
    variablesPlus: '', variablesMinus: '',
    materiel: 'Plots de couleur', duree_minutes: null, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Progressif', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Middel'], elementsTravailles: ['Echauffement avec disc', 'Le Cut'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8811b9482ce7821c0648d'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.52-53) — grille de morpion et scoring à compléter par Kinder. Format : groupe entier.'],
  },
  {
    nom: 'Méthode russe (au sol)',
    objectif: null,
    deroulement: "Méthode Russe : à plat ventre, travail une jambe puis l'autre.\n- Jambe gauche au-dessus de la jambe droite. La jambe droite essaye de revenir jusqu'aux fesses tandis que la jambe gauche retient.\n- L'inverse.\n- Même chose mais on démarre de la fesse jusqu'au sol : jambe gauche pliée sur la fesse, la jambe droite par-dessus. La jambe gauche essaye de se déplier tandis que la jambe droite retient.",
    critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Bas du corps'], infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement sans disc'], travailSpecifique: 'Mixte',
    phases: [],
  },
  {
    nom: 'Ni oui Ni non', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Nuque'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Papillion', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Cuisses'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Passe à 10',
    objectif: 'Faire monter la température et enchaîner les passes',
    deroulement: "Jeu de possession dans une zone délimitée où deux équipes s'affrontent pour réussir à enchaîner un nombre prédéfini de passes (par défaut 10) sans que le disque ne tombe ou ne soit intercepté. L'équipe adverse prend immédiatement la possession en cas d'erreur. L'objectif est de travailler la précision des passes, la mobilité et la communication collective.",
    critereReussite: "Réussir à enchaîner 10 passes sans drop ni interception\nÉviter de s'enfermer dans une zone",
    variablesPlus: 'Réduire la zone de jeu\nImposer une force défensive\nAjouter un deuxième disque',
    variablesMinus: 'Agrandir la zone de jeu\nAutoriser un nombre limité de passes dans la même zone',
    materiel: 'Un disc\nPlots pour délimiter la zone', duree_minutes: 10, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Intense', zoneCorps: null, infoPlus: ['Give and go', 'Dynamiser le Handling'],
    typeExercice: ['Middel', 'Echauffemen avec disc'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8811b9482ce7821c0648d'],
    extraNotes: ["Notes Notion : zone type endzone d'Ultimate ; nombre de passes adaptable au niveau"],
  },
  {
    nom: 'Pense-bête échauffement',
    objectif: "Monter en température et en mobilité par étapes (visage/contact → corps entier au sol/debout → disque), en gardant les joueurs actifs et engagés via un format ludique (mini-jeux façon Wii Party).",
    deroulement: "Échauffement en 3 temps, dérivé du jeu \"Wii Party\" pour la partie réveil musculaire, puis un travail au sol/dynamique, puis un échauffement avec disque.\n\n1er temps — Réveil du visage / prise de contact (18h45, 15 min) : réveil musculaire en bulle de jeu ; réveil du visage en douceur (paumette/tapping yeux, massage tempe-mâchoire-nuque, étirements, bâillements) ; \"Ca-buto\" (terme non identifié avec certitude sur le scan) ; à chaque changement, mini-jeu en duo (chifoumi, mingle, pierre-feuille-ciseaux, défis : miroir tape-main, faire tourner l'autre, masser les épaules, petite tape rendue, poussée rendue, tape main droite/gauche, main dans le dos).\n\n2e temps — Préparation physique au sol / debout (8h55, 20 min) : prise de pied/sur le côté, tirer vers le ciel puis soleil, mains sur les épaules en pagaie, genou-poitrine/pied montant, flamant rose/piétine, scorpion/escargot, pagaie antéro/rétroversion, balançoire/éléphant, ouverture/fermeture, x5 gammes sur place (talon, pas chassés...), ligne serpentine, brésilien - squat + montée.\n\n3e temps — Avec disque (9h10 environ, jusqu'à fin) : multi-disc (on bouge dans tous les sens, petit trot au call) ; face à face : 5 min petit fav j'attrape/je lance (back/side), 10 min à un défenseur je lance je cours (on divise par 4, on répète si besoin), 20 min un cut fermé/ouvert avec réception ; fin : petit jeu dynamique en complément si besoin.",
    critereReussite: null,
    variablesPlus: '', variablesMinus: '',
    materiel: 'Un disque par binôme pour le 3e temps. Aucun autre matériel identifié sur la fiche manuscrite.',
    duree_minutes: 70, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: null, travailSpecifique: null,
    phases: [],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF "2025 Training Scan", p.4) — transcription incertaine sur certains mots (ex. "Ca-buto"), à relire et corriger par Kinder'],
  },
  {
    nom: 'Praline', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', "Stratégie d'équipes"], travailSpecifique: 'Mixte',
    phases: ['https://app.notion.com/3cc9cc08fab881789b65cd2d5595e23c'],
    incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Prière', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Bas du dos', 'Haut du dos'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Recentrage',
    objectif: "Travailler le recentrage du disc depuis les positions latérales vers le centre\nDévelopper l'anticipation des cuts et la lecture de la défense\nAméliorer le timing et la coordination entre handlers et cutters",
    deroulement: "Exercice collectif pour travailler le recentrage du disc et le timing des cuts. Le principe : un joueur coupe dans l'ouvert ou le fermé, puis reçoit le disc et déclenche une série de passes qui recentrent le jeu. On travaille progressivement du simple au complexe, avec différents niveaux de difficulté.\n\nPhase 1 – Niveau 1 : cut dans l'ouvert à fond quand la défense est sur les talons → demi-tour si nécessaire ; jeu à 3 (handler derrière, puis swing).\nPhase 2 – Niveau 2 : passe dans le dos du défenseur vers le soutien → déclenche l'appel ; défense proche du soutien.\nPhase 3 – Niveau 3 : passe « bise » au défenseur puis swing ; défense éloignée du soutien ; moins dangereux si la passe est assurée.\nPhase 4 – Niveau 4 : passe dans le dos de son défenseur ; poser son pied lors du cut derrière lui. Attention : cut derrière puis revenir vers le stack → autres défenseurs peuvent intervenir.\n\nTips Handler : épaule orientée vers le soutien, chercher la courbe outside pour éviter la défense, prévoir la course du soutien dans la largeur du terrain.\nTips Middle : regarder les hanches du défenseur pour le moment du cut, viser la zone choisie, jouer avec les épaules pour feinter, mettre la défense sur les talons.\nTous : fixer sa défense pour mieux anticiper le mouvement du disc.",
    critereReussite: "Cut précis au moment opportun\nPasse dans le dos du défenseur ou vers le soutien déclenchant l'appel\nMaintien de la fluidité du jeu\nRespect des niveaux de difficulté et des options de recentrage",
    variablesPlus: "Long de ligne : si le recentrage ne fonctionne pas\nHandler de soutien : cut dans l'ouvert quand la défense tourne les hanches → aller chercher la profondeur\nAvec un stack : J2/J3/J4 part du stack à fond derrière pour revenir devant, toujours en diagonale par rapport au stack",
    variablesMinus: "(-1) dans le fermé : une joueuse attentive (nom de code global, ex : jeux de cartes → Roco)",
    materiel: 'Un disc', duree_minutes: 20, nombre_joueurs: null,
    niveau: 'Confirmé', intensite: 'Progressif', zoneCorps: null, infoPlus: ['Recentrage'],
    typeExercice: ['Middel'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab88112b5e1e3dce0fdd92b'],
  },
  {
    nom: 'Remontée de terrain',
    objectif: "Remonter collectivement le disc sur toute la longueur du terrain\nDévelopper la fluidité des passes et des déplacements\nFavoriser l'anticipation et la proposition de solutions de passe (+2)",
    deroulement: "Exercice collectif pour travailler la progression du disc sur toute la longueur du terrain. Les joueurs sont répartis sur la largeur, chacun dans une colonne imaginaire (3 colonnes au total). L'objectif de base : faire remonter le disc jusqu'en haut, sans le faire tomber, tout en avançant chacun à son rythme lorsqu'on n'a pas le disc.\nÉvolutions : les joueurs échangent de position entre colonnes en remontant ; le disc circule uniquement dans une colonne précise (ex. centrale) ; le disc est forcé à revenir sur les côtés (swing) ; le disc ne s'arrête jamais de voler (anticipation et passes rapides, +2).\nEnchaînement possible : un handler central vient chercher la passe derrière pour ouvrir un côté et faciliter le lancement.",
    critereReussite: 'Disc amené jusqu\'en haut sans drop\nMaintien de la fluidité (disc rarement ou jamais arrêté)\nRespect des contraintes de colonne / swing selon la variante\nAnticipation des déplacements (passe +2)',
    variablesPlus: 'Échange de position entre joueurs\nContraindre la circulation du disc\nSwing obligatoire\nDisc toujours en mouvement',
    variablesMinus: 'Liberté totale de circulation du disc\nRéduire la vitesse d\'exécution\nPas d\'échange de position',
    materiel: 'Un disc', duree_minutes: 25, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Progressif', zoneCorps: null, infoPlus: ['Give and go', 'Dynamiser le Handling'],
    typeExercice: ['Middel'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab88112b5e1e3dce0fdd92b'],
    extraNotes: ['Notes Notion : accepter un ou deux tours "joyeux bordel" pour débloquer les joueurs ; insister sur anticipation, communication, timing des cuts ; adapter largeur des colonnes et distance selon le niveau'],
  },
  {
    nom: 'Ressenti (suivi de cut)',
    objectif: "Suivre un cut offensif pour ressentir comment se placer. Puis apprendre à lire son opposant.",
    deroulement: "En marchant → puis en vraie course.\nSur quoi se concentrer pour ressentir : le placement des hanches, le regard, ta position, le moment du cut, quand est-ce que je m'engage, ma position physique (position forte).\nFaire ressentir avant d'expliquer : on commence en marchant, le défenseur n'a rien à réussir, il doit sentir — c'est ce qui fait qu'il trouve la réponse lui-même.",
    critereReussite: "Le défenseur peut dire ce qu'il a senti : où étaient les hanches, quand l'attaquant s'est engagé.",
    variablesPlus: "Zone de plots pour ne pas anticiper · cut avec changements de direction aléatoires",
    variablesMinus: 'En marchant · cut annoncé à l\'avance · sans disque',
    materiel: 'Aucun au départ · zone de plots en variante', duree_minutes: 25, nombre_joueurs: null,
    niveau: 'Tous niveaux', intensite: 'Progressif', zoneCorps: null, infoPlus: null,
    typeExercice: ['Défense'], elementsTravailles: ['Défense Individuelle'], travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab881bc8b6fd3f13d53580a', 'https://app.notion.com/3cc9cc08fab881a58aacdf9f0422c8ea'],
    extraNotes: ['Fiche reconstruite depuis les notes manuscrites (PDF p.10-11). Durée Notion : 20-30 min (approx. 25). Effectif : en binôme (changer de binôme).'],
  },
  {
    nom: 'Roco', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', "Stratégie d'équipes"], travailSpecifique: 'Mixte',
    phases: ['https://app.notion.com/3cc9cc08fab88122b737d0ee430194c6'],
    incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Réveil musculaire',
    objectif: null,
    deroulement: "Panel d'exercices en ateliers par binômes (illustrés en colonnes dans la fiche Notion, sans texte de déroulement continu) : Essuie-glace (balancement des jambes droite/gauche), Culbuto (balance), Dos Creux / Dos Rond (étirement), Position de la grenouille (étirement), Chien tête en bas (en mode dynamique), Étirement Hanche, Half Split (dynamique, balancement droite/gauche), Papillon (dynamique).",
    critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement sans disc'], travailSpecifique: null,
    phases: [],
    extraNotes: ["Fiche Notion structurée en atelier d'images plutôt qu'en texte continu — deux blocs \"test 1\"/\"test 2\" vides en fin de page, ignorés"],
  },
  {
    nom: 'Sapin', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: 'Plot', duree_minutes: null, nombre_joueurs: null,
    niveau: 'Débutant', intensite: 'Progressif', zoneCorps: null, infoPlus: ['Give and go', 'Passe dans la course'],
    typeExercice: ['Middel'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8812f8b81c05aa918ae9e'],
    incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Scorpion', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Abdominaux', 'Haut du dos', 'Bas du dos'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Spain', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', "Stratégie d'équipes"], travailSpecifique: 'Mixte',
    phases: [], incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Split Stack',
    objectif: "Deux groupes séparés, ordre d'appel défini en amont.",
    deroulement: "Stack séparé en deux groupes distincts. Les appels sont orientés soit fermé puis fond, soit ouvert, selon la consigne donnée en amont.",
    critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Play'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab881319d77e0a4c7a9ad3d'],
    extraNotes: ["Fiche reconstruite depuis la page Contenu « Play — Le Split Stack » — matériel à compléter, pas de schéma image repris. Format Notion : ordre des appels numéroté, départ au compte -1."],
  },
  {
    nom: 'Sucide',
    objectif: null,
    deroulement: "Des distances de plus en plus grandes à parcourir avec des cuts de chaque côté.",
    critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Intense', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement sans disc'], travailSpecifique: 'Mixte',
    phases: ['https://app.notion.com/3cc9cc08fab8814b9adeec1e2c08ed9b'],
    extraNotes: ['Zone du corps (Notion) : Cardio'],
  },
  {
    nom: 'Talond fesse', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Cuisses', 'Cheville'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Timing Middle', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: 'Plot', duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Progressif', zoneCorps: null, infoPlus: ['Middle'],
    typeExercice: ['Middel'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab881da9351de9fed615cf9'],
    incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Tipping',
    objectif: null,
    deroulement: "Tipping progressif (50 à 100%), possibilité de combiner avec des gammes classiques.",
    critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Intense', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: null, travailSpecifique: null,
    phases: ['https://app.notion.com/3cc9cc08fab8817bb261c1a467b74458'],
  },
  {
    nom: 'Torero', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Avant bras'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: ['https://app.notion.com/3cc9cc08fab881fabb31fc2b914f73be'],
    incomplete: true, extraNotes: ["Collision de nom avec le play \"Torero\" (Split Stack) — cette fiche est bien un étirement, pas le play, aucune fiche du play \"Torero\" n'existe"],
  },
  {
    nom: 'Touche tes pieds', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Réveil musculaire', zoneCorps: ['Bas du dos', 'Mollets', 'Cuisses'], infoPlus: null,
    typeExercice: ['Etirements'], elementsTravailles: ['Etirements'], travailSpecifique: 'Mixte',
    phases: [], incomplete: true,
  },
  {
    nom: 'Toupi', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: null, zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement', 'Play'], elementsTravailles: ['Play', "Stratégie d'équipes"], travailSpecifique: 'Handler',
    phases: ['https://app.notion.com/3cc9cc08fab881b68c82d161fcf7de42'],
    incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
  {
    nom: 'Zone Carré - Touche plot', objectif: null, deroulement: null, critereReussite: null, variablesPlus: '', variablesMinus: '',
    materiel: null, duree_minutes: null, nombre_joueurs: null,
    niveau: null, intensite: 'Progressif', zoneCorps: null, infoPlus: null,
    typeExercice: ['Echauffement'], elementsTravailles: ['Echauffement sans disc'], travailSpecifique: 'Mixte',
    phases: ['https://app.notion.com/3cc9cc08fab8811b9482ce7821c0648d'],
    incomplete: true, extraNotes: ['Fiche avait un schéma/image dans Notion, non repris'],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildDescription(ex) {
  const parts = [];
  if (ex.objectif) parts.push(ex.objectif);
  if (ex.deroulement) parts.push(ex.deroulement);
  if (parts.length === 0) {
    return `[Fiche Notion incomplète — nom : ${ex.nom}]`;
  }
  return parts.join('\n\n');
}

function buildNotes(ex) {
  const lines = [];
  if (ex.niveau) lines.push(`Niveau Notion : ${ex.niveau}`);
  if (ex.intensite) lines.push(`Intensité : ${ex.intensite}`);
  if (ex.zoneCorps && ex.zoneCorps.length) lines.push(`Zone du corps : ${ex.zoneCorps.join(', ')}`);
  if (ex.infoPlus && ex.infoPlus.length) lines.push(`Info + : ${ex.infoPlus.join(', ')}`);
  if (ex.nombre_joueurs_txt) lines.push(ex.nombre_joueurs_txt);
  if (ex.incomplete) lines.push('Fiche Notion incomplète');
  if (ex.extraNotes) lines.push(...ex.extraNotes);
  // Deduplicate while preserving order
  const seen = new Set();
  const dedup = [];
  for (const l of lines) {
    if (!seen.has(l)) { seen.add(l); dedup.push(l); }
  }
  return dedup.length ? dedup.join('\n') : null;
}

async function main() {
  console.log('=== PARTIE A — Tags Thème/Phase/Sous-phase ===');
  const contenuTagId = new Map(); // notion url -> Tag.id
  let createdThemePhase = 0;
  const orphanPhases = [];

  // Pass order: Theme first, then Phase, then Sous-phase, with retry loop for safety
  const order = ['Theme', 'Phase', 'Sous-phase'];
  for (const t of order) {
    for (const entry of CONTENU.filter((c) => c.type === t)) {
      const category = 'phase_entrainement' === undefined ? '' : '';
      const cat = entry.type === 'Theme' ? 'theme_entrainement' : 'phase_entrainement';
      const parentId = entry.parent ? contenuTagId.get(entry.parent) || null : null;
      if (entry.parent && !parentId) {
        orphanPhases.push(entry.nom);
      }

      let existing = await prisma.tag.findFirst({
        where: { workspaceId: WORKSPACE_ID, label: entry.nom, category: cat },
      });
      if (existing) {
        contenuTagId.set(entry.url, existing.id);
        console.log(`[Tag existant] ${entry.nom} (${cat})`);
        continue;
      }
      try {
        const tag = await prisma.tag.create({
          data: { label: entry.nom, category: cat, parentId, workspaceId: WORKSPACE_ID },
        });
        contenuTagId.set(entry.url, tag.id);
        createdThemePhase++;
        console.log(`[Tag créé] ${entry.nom} (${cat})${parentId ? ' -> parent OK' : ''}`);
      } catch (err) {
        if (err.code === 'P2002') {
          const again = await prisma.tag.findFirst({ where: { workspaceId: WORKSPACE_ID, label: entry.nom, category: cat } });
          if (again) contenuTagId.set(entry.url, again.id);
          console.log(`[Tag doublon géré] ${entry.nom}`);
        } else {
          throw err;
        }
      }
    }
  }
  console.log(`Tags Thème/Phase créés : ${createdThemePhase}`);
  if (orphanPhases.length) console.log(`Phases sans parent résolu (hors "Le jeu long" volontaire) : ${orphanPhases.join(', ')}`);

  // -------------------------------------------------------------------------
  console.log('\n=== PARTIE B — Exercices ===');
  const objectifTagId = new Map(); // label -> Tag.id (category objectif)
  const travailSpecifiqueTagId = new Map(); // label -> Tag.id (category travail_specifique)
  let createdObjectifTags = 0;
  let createdTravailSpecTags = 0;

  async function getOrCreateTag(label, category) {
    const cacheMap = category === 'objectif' ? objectifTagId : travailSpecifiqueTagId;
    if (cacheMap.has(label)) return cacheMap.get(label);
    let existing = await prisma.tag.findFirst({ where: { workspaceId: WORKSPACE_ID, label, category } });
    if (existing) {
      cacheMap.set(label, existing.id);
      return existing.id;
    }
    try {
      const tag = await prisma.tag.create({ data: { label, category, workspaceId: WORKSPACE_ID } });
      cacheMap.set(label, tag.id);
      if (category === 'objectif') createdObjectifTags++; else createdTravailSpecTags++;
      return tag.id;
    } catch (err) {
      if (err.code === 'P2002') {
        const again = await prisma.tag.findFirst({ where: { workspaceId: WORKSPACE_ID, label, category } });
        if (again) { cacheMap.set(label, again.id); return again.id; }
      }
      throw err;
    }
  }

  let createdExercices = 0;
  let skippedExisting = 0;
  let incompleteCount = 0;
  const unresolvedPhases = new Set();

  for (const ex of EXERCICES) {
    const existing = await prisma.exercice.findFirst({ where: { workspaceId: WORKSPACE_ID, nom: ex.nom } });
    if (existing) {
      skippedExisting++;
      console.log(`[Exercice existant, ignoré] ${ex.nom}`);
      continue;
    }

    const description = buildDescription(ex);
    if (!ex.objectif && !ex.deroulement) incompleteCount++;

    // Tags: travail_specifique
    const tagIds = [];
    if (ex.travailSpecifique) {
      tagIds.push(await getOrCreateTag(ex.travailSpecifique, 'travail_specifique'));
    }
    // Tags: objectif (Type d'exercice + Éléments Travaillés, dédupliqués)
    const objectifLabels = new Set();
    (ex.typeExercice || []).forEach((v) => objectifLabels.add(v.trim()));
    (ex.elementsTravailles || []).forEach((v) => objectifLabels.add(v.trim()));
    for (const label of objectifLabels) {
      tagIds.push(await getOrCreateTag(label, 'objectif'));
    }
    // Tags: phase_entrainement (résolution via map Partie A)
    for (const phaseUrl of ex.phases || []) {
      const tagId = contenuTagId.get(phaseUrl);
      if (tagId) tagIds.push(tagId);
      else unresolvedPhases.add(`${ex.nom} -> ${phaseUrl}`);
    }

    const notes = buildNotes(ex);

    try {
      await prisma.exercice.create({
        data: {
          nom: ex.nom,
          description,
          critereReussite: ex.critereReussite || null,
          variablesPlus: ex.variablesPlus || '',
          variablesMinus: ex.variablesMinus || '',
          materiel: ex.materiel || null,
          notes,
          imageUrl: null,
          points: null,
          duree_minutes: ex.duree_minutes || null,
          nombre_joueurs: ex.nombre_joueurs || null,
          workspaceId: WORKSPACE_ID,
          tags: { connect: tagIds.map((id) => ({ id })) },
        },
      });
      createdExercices++;
      console.log(`[Exercice créé] ${ex.nom}`);
    } catch (err) {
      if (err.code === 'P2002') {
        console.log(`[Exercice doublon géré] ${ex.nom}`);
        skippedExisting++;
      } else {
        console.error(`[ERREUR] ${ex.nom} :`, err.message);
        throw err;
      }
    }
  }

  console.log('\n=== RAPPORT FINAL ===');
  console.log(`Tags Thème/Phase créés : ${createdThemePhase}`);
  console.log(`Tags travail_specifique créés : ${createdTravailSpecTags}`);
  console.log(`Tags objectif créés : ${createdObjectifTags}`);
  console.log(`Exercices créés : ${createdExercices}`);
  console.log(`Exercices ignorés (déjà existants) : ${skippedExisting}`);
  console.log(`Exercices avec fiche Notion incomplète (description minimale) : ${incompleteCount}`);
  if (unresolvedPhases.size) {
    console.log(`Phases non résolues (ignorées silencieusement dans les tags) :`);
    unresolvedPhases.forEach((s) => console.log(`  - ${s}`));
  } else {
    console.log('Toutes les relations Phases des exercices ont été résolues.');
  }
}

main()
  .then(() => {
    console.log('\nScript terminé sans erreur Prisma.');
  })
  .catch((e) => {
    console.error('Erreur fatale du script :', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
