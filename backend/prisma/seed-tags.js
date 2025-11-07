/*
 * Seed/upsert des tags nécessaires pour l'import Markdown
 * - Idempotent (utilise upsert par contrainte unique [label, category])
 * - Corrige/complète les niveaux (1..5) selon NIVEAU_LABELS
 */
const { PrismaClient } = require('@prisma/client');
const {
  TAG_CATEGORIES,
  DEFAULT_TAG_COLORS,
  NIVEAU_LABELS,
} = require('../../shared/constants/tag-categories');

const prisma = new PrismaClient();

async function upsertTag({ label, category, color, level = null }) {
  return prisma.tag.upsert({
    where: { label_category: { label, category } },
    update: { color: color || null, level: level ?? null },
    create: { label, category, color: color || null, level: level ?? null },
  });
}

async function main() {
  console.log('🌱 Upsert des tags requis pour l\'import Markdown');

  // Le contenu de ce script a été volontairement commenté pour empêcher la création automatique de tags.
  // L'objectif est de gérer tous les tags via l'interface utilisateur.
  /*
  // OBJECTIF
  const objectifs = ['Échauffement', 'Technique', 'Tactique', 'Physique'];
  for (const label of objectifs) {
    await upsertTag({
      label,
      category: TAG_CATEGORIES.OBJECTIF,
      color: DEFAULT_TAG_COLORS[TAG_CATEGORIES.OBJECTIF],
    });
  }

  // TRAVAIL SPÉCIFIQUE
  const travaux = ['Passes', 'Réceptions', 'Défense'];
  for (const label of travaux) {
    await upsertTag({
      label,
      category: TAG_CATEGORIES.TRAVAIL_SPECIFIQUE,
      color: DEFAULT_TAG_COLORS[TAG_CATEGORIES.TRAVAIL_SPECIFIQUE],
    });
  }

  // NIVEAUX (1..5) selon constantes partagées
  // NIVEAU_LABELS: {1:'Débutant',2:'Intermédiaire',3:'Confirmé',4:'Avancé',5:'Expert'}
  for (const [levelStr, label] of Object.entries(NIVEAU_LABELS)) {
    const level = parseInt(levelStr, 10);
    await upsertTag({
      label,
      category: TAG_CATEGORIES.NIVEAU,
      color: DEFAULT_TAG_COLORS[TAG_CATEGORIES.NIVEAU],
      level,
    });
  }

  // TEMPS (exemples courants)
  const temps = ['5-10 min', '10-15 min', '15-30 min'];
  for (const label of temps) {
    await upsertTag({
      label,
      category: TAG_CATEGORIES.TEMPS,
      color: DEFAULT_TAG_COLORS[TAG_CATEGORIES.TEMPS],
    });
  }

  // FORMAT
  const formats = ['Individuel', 'Binôme', 'Équipe'];
  for (const label of formats) {
    await upsertTag({
      label,
      category: TAG_CATEGORIES.FORMAT,
      color: DEFAULT_TAG_COLORS[TAG_CATEGORIES.FORMAT],
    });
  }

  // THÈME ENTRAÎNEMENT (exemples courants)
  const themes = ['Endurance', 'Vitesse', 'Coordination', 'Stratégie', 'Mental'];
  for (const label of themes) {
    await upsertTag({
      label,
      category: TAG_CATEGORIES.THEME_ENTRAINEMENT,
      color: DEFAULT_TAG_COLORS[TAG_CATEGORIES.THEME_ENTRAINEMENT],
    });
  }
  */

  console.log('✅ Upsert des tags terminé.');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Erreur seed-tags:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { main };
