/**
 * Labels pour les niveaux d'étoiles (1-5)
 * @description Correspondance entre le niveau numérique et son libellé
 */
export const NIVEAU_LABELS: { [key: number]: string } = {
  1: 'Débutant',
  2: 'Intermédiaire',
  3: 'Confirmé',
  4: 'Avancé',
  5: 'Expert'
};

/**
 * Couleurs par défaut pour chaque catégorie
 * @description Définit une couleur par défaut pour chaque catégorie de tag
 */
export const DEFAULT_TAG_COLORS: { [key: string]: string } = {
  'objectif': '#4CAF50', // Vert
  'travail_specifique': '#2196F3',  // Bleu
  'niveau': '#9C27B0',   // Violet
  'temps': '#607D8B',    // Bleu-gris
  'format': '#795548',   // Marron
  'theme_entrainement': '#FF5722',    // Orange
  'phase_entrainement': '#FF9800',    // Orange clair (sous Thème)
  'public_seance': '#009688',         // Teal (distinct de "niveau")
  'statut_seance': '#9E9E9E',         // Gris (repère : à valider, archive)
  'type_echauffement': '#8BC34A'      // Vert clair (physique / réveil musculaire)
};
