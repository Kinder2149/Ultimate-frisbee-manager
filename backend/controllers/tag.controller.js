const { PrismaClient } = require('@prisma/client');
const { TAG_CATEGORIES, isValidCategory, isValidLevel } = require('../../shared/constants/tag-categories');
const prisma = new PrismaClient();

/**
 * Récupérer tous les tags (avec filtres optionnels)
 * @route GET /api/tags
 * @query category (optionnel) — filtre par catégorie exacte
 * @query query (optionnel) — recherche texte dans le label (contains, insensitive)
 */
exports.getAllTags = async (req, res) => {
  try {
    const { category, query } = req.query;

    const where = {};
    if (category) {
      where.category = String(category);
    }
    if (query) {
      where.label = { contains: String(query), mode: 'insensitive' };
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { label: 'asc' }
      ]
    });
    
    res.json(tags);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des tags' });
  }
};

/**
 * Récupérer un tag par son ID
 * @route GET /api/tags/:id
 */
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await prisma.tag.findUnique({
      where: { id }
    });
    
    if (!tag) {
      return res.status(404).json({ error: 'Tag non trouvé' });
    }
    
    res.json(tag);
  } catch (error) {
    console.error('Erreur lors de la récupération du tag:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du tag' });
  }
};

/**
 * Créer un nouveau tag
 * @route POST /api/tags
 */
exports.createTag = async (req, res) => {
  try {
    const { label, category, color, level } = req.body;
    
    // Validation des données
    if (!label || !category) {
      return res.status(400).json({ 
        error: 'Le libellé et la catégorie sont requis' 
      });
    }

    // Validation de la catégorie
    if (!isValidCategory(category)) {
      return res.status(400).json({ 
        error: 'Catégorie invalide' 
      });
    }

    // Validation du niveau
    if (!isValidLevel(level, category)) {
      return res.status(400).json({ 
        error: 'Le niveau doit être compris entre 1 et 5 pour la catégorie "niveau"' 
      });
    }

    // Validation de couleur HEX (optionnel)
    if (color && !(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color))) {
      return res.status(400).json({ error: 'Le format de couleur doit être un code HEX valide (#RRGGBB ou #RGB)' });
    }
    
    // Création du tag
    const nouveauTag = await prisma.tag.create({
      data: {
        label,
        category,
        color: color || null,
        // Ne plus essayer d'assigner level si non fourni
        level: level !== undefined ? level : null
      }
    });
    
    res.status(201).json(nouveauTag);
  } catch (error) {
    // Gérer l'erreur d'unicité
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Ce tag existe déjà dans cette catégorie. Les tags doivent être uniques par catégorie.' 
      });
    }
    
    console.error('Erreur lors de la création du tag:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du tag', details: error.message });
  }
};

/**
 * Mettre à jour un tag
 * @route PUT /api/tags/:id
 */
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, color, level } = req.body;
    
    // Vérifier si le tag existe
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      return res.status(404).json({ error: 'Tag non trouvé' });
    }
    
    // Validation basique des données
    if (!label) {
      return res.status(400).json({ error: 'Label est requis' });
    }
    
    // Validation pour le niveau (uniquement si la catégorie est 'niveau')
    if (tag.category === 'niveau' && level !== undefined && (level < 1 || level > 5)) {
      return res.status(400).json({
        error: 'Pour la catégorie "niveau", le champ "level" doit être un entier entre 1 et 5'
      });
    }
    
    // Validation de couleur HEX (optionnel)
    if (color && !(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color))) {
      return res.status(400).json({ error: 'Le format de couleur doit être un code HEX valide (#RRGGBB ou #RGB)' });
    }
    
    // Préparer les données de mise à jour
    const updateData = {
      label,
      color: color || null
    };
    
    // Mettre à jour le level uniquement si la catégorie est 'niveau'
    if (tag.category === 'niveau' && level !== undefined) {
      updateData.level = level;
    }
    
    // Mettre à jour le tag
    const tagUpdated = await prisma.tag.update({
      where: { id },
      data: updateData
    });
    
    res.json(tagUpdated);
  } catch (error) {
    // Gérer l'erreur d'unicité
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Ce tag existe déjà dans cette catégorie. Les tags doivent être uniques par catégorie.' 
      });
    }
    
    console.error('Erreur lors de la mise à jour du tag:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du tag' });
  }
};

/**
 * Supprimer un tag
 * @route DELETE /api/tags/:id
 */
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const force = String(req.query.force || '').toLowerCase() === 'true';

    // Vérifier si le tag existe et récupérer les décomptes d'utilisation
    const tag = await prisma.tag.findUnique({
      where: { id },
      select: {
        id: true,
        label: true,
        _count: {
          select: {
            exercices: true,
            entrainements: true,
            situationsMatchs: true
          }
        }
      }
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag non trouvé' });
    }

    const usages = tag._count;
    const totalUsages = usages.exercices + usages.entrainements + usages.situationsMatchs;

    if (totalUsages > 0 && !force) {
      return res.status(409).json({
        error: 'Ce tag est utilisé par des entités. Vous pouvez retirer le tag des entités ou forcer la suppression.',
        exercicesCount: usages.exercices,
        entrainementsCount: usages.entrainements,
        situationsCount: usages.situationsMatchs
      });
    }

    if (totalUsages > 0 && force) {
      // Détacher toutes les relations puis supprimer dans une transaction
      await prisma.$transaction(async (tx) => {
        // Déconnecter des relations M-N en vidant les sets
        await tx.tag.update({
          where: { id },
          data: {
            exercices: { set: [] },
            entrainements: { set: [] },
            situationsMatchs: { set: [] }
          }
        });
        await tx.tag.delete({ where: { id } });
      });
      return res.status(204).send();
    }

    // Aucun usage: suppression simple
    await prisma.tag.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du tag:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la suppression du tag', details: error.message });
  }
};