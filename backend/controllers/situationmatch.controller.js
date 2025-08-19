/**
 * Controller pour la gestion des situations et matchs
 * Gère : type (Match/Situation), description, tags, temps
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Récupère toutes les situations/matchs
 * @route GET /api/situations-matchs
 */
exports.getAllSituationsMatchs = async (req, res) => {
  try {
    console.log('Récupération de toutes les situations/matchs');
    
    const situationsMatchs = await prisma.situationMatch.findMany({
      include: {
        tags: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`${situationsMatchs.length} situations/matchs trouvées`);
    res.json(situationsMatchs);
  } catch (error) {
    console.error('Erreur lors de la récupération des situations/matchs:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des situations/matchs',
      details: error.message 
    });
  }
};

/**
 * Récupère une situation/match par son ID
 * @route GET /api/situations-matchs/:id
 */
exports.getSituationMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Récupération de la situation/match: ${id}`);
    
    const situationMatch = await prisma.situationMatch.findUnique({
      where: { id },
      include: {
        tags: true
      }
    });
    
    if (!situationMatch) {
      console.log(`Situation/match ${id} non trouvée`);
      return res.status(404).json({ error: 'Situation/match non trouvée' });
    }
    
    console.log(`Situation/match trouvée: ${situationMatch.type} - ${situationMatch.description || 'Sans description'}`);
    res.json(situationMatch);
  } catch (error) {
    console.error('Erreur lors de la récupération de la situation/match:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de la situation/match',
      details: error.message 
    });
  }
};

/**
 * Crée une nouvelle situation/match
 * @route POST /api/situations-matchs
 */
exports.createSituationMatch = async (req, res) => {
  try {
    const { type, description, temps, tagIds } = req.body;
    
    console.log('Création d\'une nouvelle situation/match:', {
      type,
      description: description || 'Sans description',
      temps: temps || 'Non défini',
      tagsCount: tagIds?.length || 0
    });
    
    // Validation du type obligatoire
    if (!type || (type !== 'Match' && type !== 'Situation')) {
      return res.status(400).json({ 
        error: 'Le type est obligatoire et doit être "Match" ou "Situation"' 
      });
    }
    
    // Préparer les données de création
    const createData = {
      type,
      description: description || null,
      temps: temps || null
    };
    
    // Ajouter les tags si fournis
    if (tagIds && tagIds.length > 0) {
      createData.tags = {
        connect: tagIds.map(tagId => ({ id: tagId }))
      };
    }
    
    const nouvelleSituationMatch = await prisma.situationMatch.create({
      data: createData,
      include: {
        tags: true
      }
    });
    
    console.log('Situation/match créée avec succès:', {
      id: nouvelleSituationMatch.id,
      type: nouvelleSituationMatch.type,
      tagsCount: nouvelleSituationMatch.tags.length
    });
    
    res.status(201).json(nouvelleSituationMatch);
  } catch (error) {
    console.error('Erreur lors de la création de la situation/match:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de la situation/match',
      details: error.message 
    });
  }
};

/**
 * Met à jour une situation/match existante
 * @route PUT /api/situations-matchs/:id
 */
exports.updateSituationMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, temps, tagIds } = req.body;
    
    console.log(`Mise à jour de la situation/match: ${id}`, {
      type,
      description: description || 'Sans description',
      temps: temps || 'Non défini',
      tagsCount: tagIds?.length || 0
    });
    
    // Vérifier si la situation/match existe
    const situationMatchExistante = await prisma.situationMatch.findUnique({ 
      where: { id },
      include: { tags: true }
    });
    
    if (!situationMatchExistante) {
      console.log(`Situation/match ${id} non trouvée`);
      return res.status(404).json({ error: 'Situation/match non trouvée' });
    }
    
    // Validation du type si fourni
    if (type && type !== 'Match' && type !== 'Situation') {
      return res.status(400).json({ 
        error: 'Le type doit être "Match" ou "Situation"' 
      });
    }
    
    // Préparer les données de mise à jour
    const updateData = {};
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description || null;
    if (temps !== undefined) updateData.temps = temps || null;
    
    // Gestion des tags : déconnecter tous puis reconnecter les nouveaux
    if (tagIds !== undefined) {
      // Déconnecter tous les tags existants
      await prisma.situationMatch.update({
        where: { id },
        data: {
          tags: {
            disconnect: situationMatchExistante.tags.map(tag => ({ id: tag.id }))
          }
        }
      });
      
      // Connecter les nouveaux tags
      if (tagIds.length > 0) {
        updateData.tags = {
          connect: tagIds.map(tagId => ({ id: tagId }))
        };
      }
    }
    
    const situationMatchMiseAJour = await prisma.situationMatch.update({
      where: { id },
      data: updateData,
      include: {
        tags: true
      }
    });
    
    console.log('Situation/match mise à jour avec succès:', {
      id: situationMatchMiseAJour.id,
      type: situationMatchMiseAJour.type,
      tagsCount: situationMatchMiseAJour.tags.length
    });
    
    res.json(situationMatchMiseAJour);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la situation/match:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour de la situation/match',
      details: error.message 
    });
  }
};

/**
 * Supprime une situation/match
 * @route DELETE /api/situations-matchs/:id
 */
exports.deleteSituationMatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Tentative de suppression de la situation/match: ${id}`);
    
    // Vérifier si la situation/match existe
    const situationMatch = await prisma.situationMatch.findUnique({ 
      where: { id },
      include: { tags: true }
    });
    
    if (!situationMatch) {
      console.log(`Situation/match ${id} non trouvée`);
      return res.status(404).json({ error: 'Situation/match non trouvée' });
    }
    
    console.log(`Situation/match trouvée: ${situationMatch.type}, avec ${situationMatch.tags.length} tags`);
    
    // Supprimer la situation/match (les relations tags seront automatiquement supprimées)
    console.log('Suppression de la situation/match...');
    await prisma.situationMatch.delete({ where: { id } });
    console.log(`Situation/match ${id} supprimée avec succès`);
    
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erreur lors de la suppression de la situation/match:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression de la situation/match',
      details: error.message 
    });
  }
};

/**
 * Duplique une situation/match existante
 * @route POST /api/situations-matchs/:id/duplicate
 */
exports.duplicateSituationMatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Duplication de la situation/match: ${id}`);
    
    // Récupérer la situation/match originale avec ses tags
    const situationMatchOriginale = await prisma.situationMatch.findUnique({
      where: { id },
      include: {
        tags: true
      }
    });
    
    if (!situationMatchOriginale) {
      console.log(`Situation/match ${id} non trouvée pour duplication`);
      return res.status(404).json({ error: 'Situation/match non trouvée' });
    }
    
    console.log(`Duplication de: ${situationMatchOriginale.type} - ${situationMatchOriginale.description || 'Sans description'}`);
    
    // Créer la copie avec un nom modifié
    const createData = {
      type: situationMatchOriginale.type,
      description: situationMatchOriginale.description ? 
        `${situationMatchOriginale.description} (Copie)` : 
        `${situationMatchOriginale.type} (Copie)`,
      temps: situationMatchOriginale.temps
    };
    
    // Ajouter les tags si présents
    if (situationMatchOriginale.tags.length > 0) {
      createData.tags = {
        connect: situationMatchOriginale.tags.map(tag => ({ id: tag.id }))
      };
    }
    
    const situationMatchDupliquee = await prisma.situationMatch.create({
      data: createData,
      include: {
        tags: true
      }
    });
    
    console.log('Situation/match dupliquée avec succès:', {
      originalId: id,
      newId: situationMatchDupliquee.id,
      type: situationMatchDupliquee.type,
      tagsCount: situationMatchDupliquee.tags.length
    });
    
    res.status(201).json(situationMatchDupliquee);
  } catch (error) {
    console.error('Erreur lors de la duplication de la situation/match:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la duplication de la situation/match',
      details: error.message 
    });
  }
};
