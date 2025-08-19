/**
 * Modèle simplifié pour un entraînement
 * 
 * Ce modèle sert de documentation et représente la structure
 * d'un entraînement dans le système simplifié.
 * La persistence est gérée par Prisma.
 */
const EntrainementSimple = {
  id: 'string', // UUID généré automatiquement
  titre: 'string', // Seul champ obligatoire
  createdAt: 'Date', // Généré automatiquement
  updatedAt: 'Date', // Généré automatiquement
};

module.exports = EntrainementSimple;
