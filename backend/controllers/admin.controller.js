/**
 * Contrôleur Admin - Aperçu agrégé des données
 */
const { prisma } = require('../services/prisma');
const bcrypt = require('bcryptjs');

/**
 * GET /api/admin/overview
 * Retourne des compteurs globaux et un aperçu paginé des entités
 */
exports.getOverview = async (req, res) => {
  try {
    // Compteurs globaux en parallèle
    const [
      exercicesCount,
      entrainementsCount,
      echauffementsCount,
      situationsCount,
      tagsCount,
      usersCount
    ] = await Promise.all([
      prisma.exercice.count(),
      prisma.entrainement.count(),
      prisma.echauffement.count(),
      prisma.situationMatch.count(),
      prisma.tag.count(),
      prisma.user.count()
    ]);

    // Listes récentes limitées (pour aperçu)
    const limit = 20;
    const [
      exercicesRaw,
      entrainements,
      echauffementsRaw,
      situationsRaw,
      tagsRaw,
      users
    ] = await Promise.all([
      prisma.exercice.findMany({ orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, nom: true, createdAt: true } }),
      prisma.entrainement.findMany({ orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, titre: true, createdAt: true } }),
      prisma.echauffement.findMany({ orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, nom: true, createdAt: true } }),
      prisma.situationMatch.findMany({ orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, nom: true, type: true, createdAt: true } }),
      prisma.tag.findMany({ orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, label: true, category: true, createdAt: true } }),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, email: true, nom: true, prenom: true, role: true, isActive: true, iconUrl: true, createdAt: true } })
    ]);

    // Mapping pour uniformiser les champs côté frontend
    const exercices = exercicesRaw.map(e => ({ id: e.id, titre: e.nom, createdAt: e.createdAt }));
    const echauffements = echauffementsRaw.map(e => ({ id: e.id, titre: e.nom, createdAt: e.createdAt }));
    const situations = situationsRaw.map(s => ({ id: s.id, titre: s.nom || s.type, createdAt: s.createdAt }));
    const tags = tagsRaw.map(t => ({ id: t.id, name: t.label, category: t.category, createdAt: t.createdAt }));

    res.json({
      counts: {
        exercices: exercicesCount,
        entrainements: entrainementsCount,
        echauffements: echauffementsCount,
        situations: situationsCount,
        tags: tagsCount,
        users: usersCount
      },
      recent: { exercices, entrainements, echauffements, situations, tags, users }
    });
  } catch (error) {
    console.error('Erreur Admin Overview:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de l\'aperçu admin' });
  }
};

/**
 * POST /api/admin/users
 * Créer un nouvel utilisateur (admin uniquement)
 */
exports.createUser = async (req, res) => {
  try {
    const { email, password, nom, prenom, role = 'user', isActive = true } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Email requis" });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: "Mot de passe requis (min 6 caractères)" });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        nom: nom?.trim() || null,
        prenom: prenom?.trim() || null,
        role: role || 'user',
        isActive: !!isActive,
        iconUrl: null
      }
    });

    return res.status(201).json({
      user: {
        id: created.id,
        email: created.email,
        nom: created.nom,
        prenom: created.prenom,
        role: created.role,
        isActive: created.isActive,
        iconUrl: created.iconUrl
      }
    });
  } catch (error) {
    console.error('Erreur Admin createUser:', error);
    res.status(500).json({ error: "Erreur serveur lors de la création de l'utilisateur" });
  }
};

/**
 * GET /api/admin/users
 * Liste des utilisateurs (admin uniquement)
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, nom: true, prenom: true, role: true, isActive: true, iconUrl: true, createdAt: true }
    });
    res.json({ users });
  } catch (error) {
    console.error('Erreur Admin getUsers:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
};

/**
 * PATCH /api/admin/users/:id
 * Mettre à jour le rôle et/ou l'état actif d'un utilisateur (admin uniquement)
 */
exports.getAllContent = async (req, res) => {
  try {
    const [exercicesRaw, entrainements, echauffementsRaw, situationsRaw] = await Promise.all([
      prisma.exercice.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, nom: true, createdAt: true, tags: { select: { label: true, category: true, color: true } } }
      }),
      prisma.entrainement.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, titre: true, createdAt: true }
      }),
      prisma.echauffement.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, nom: true, createdAt: true }
      }),
      prisma.situationMatch.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, nom: true, type: true, createdAt: true, tags: { select: { label: true, category: true, color: true } } }
      })
    ]);

    // Mapping pour uniformiser le champ 'titre' et la structure
    const exercices = exercicesRaw.map(e => ({ ...e, titre: e.nom, tags: e.tags || [] }));
    const entrainementsMapped = entrainements.map(e => ({ ...e, tags: [] }));
    const echauffements = echauffementsRaw.map(e => ({ ...e, titre: e.nom, tags: [] }));
    const situations = situationsRaw.map(s => ({ ...s, titre: s.nom || s.type, tags: s.tags || [] }));

    res.json({
      exercices,
      entrainements: entrainementsMapped,
      echauffements,
      situations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les contenus:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des contenus.' });
  }
};

exports.getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, label: true, category: true, createdAt: true }
    });
    res.json({ tags });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les tags:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des tags.' });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { items } = req.body; // items: { id: string, type: string }[]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Aucun élément à supprimer fourni.' });
    }

    const deletionsByType = items.reduce((acc, item) => {
      const type = item.type.toLowerCase();
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item.id);
      return acc;
    }, {});

    const transactionPromises = [];

    for (const type in deletionsByType) {
      const ids = deletionsByType[type];
      let model;
      switch (type) {
        case 'exercice':
          model = prisma.exercice;
          break;
        case 'entraînement':
          model = prisma.entrainement;
          break;
        case 'échauffement':
          model = prisma.echauffement;
          break;
        case 'situation':
          model = prisma.situationMatch;
          break;
        case 'tag':
          model = prisma.tag;
          break;
        default:
          continue;
      }
      if (model) {
        transactionPromises.push(model.deleteMany({ where: { id: { in: ids } } }));
      }
    }

    if (transactionPromises.length === 0) {
      return res.status(400).json({ error: 'Aucun type d\'élément valide à supprimer.' });
    }

    const result = await prisma.$transaction(transactionPromises);

    res.json({ message: 'Éléments supprimés avec succès.', counts: result });

  } catch (error) {
    console.error('Erreur lors de la suppression en masse:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression.' });
  }
};

exports.bulkDuplicate = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Aucun élément à dupliquer fourni.' });
    }

    const transactionPromises = items.map(async (item) => {
      switch (item.type.toLowerCase()) {
        case 'exercice': {
          const original = await prisma.exercice.findUnique({ where: { id: item.id }, include: { tags: true } });
          if (!original) return null;
          const { id, createdAt, updatedAt, ...dataToCopy } = original;
          return prisma.exercice.create({
            data: {
              ...dataToCopy,
              nom: `${original.nom} (Copie)`,
              tags: { connect: original.tags.map(t => ({ id: t.id })) }
            }
          });
        }
        case 'entrainement': {
          const original = await prisma.entrainement.findUnique({ where: { id: item.id } });
          if (!original) return null;
          const { id, createdAt, updatedAt, ...dataToCopy } = original;
          return prisma.entrainement.create({ data: { ...dataToCopy, titre: `${original.titre} (Copie)` } });
        }
        case 'échauffement': {
          const original = await prisma.echauffement.findUnique({ where: { id: item.id } });
          if (!original) return null;
          const { id, createdAt, updatedAt, ...dataToCopy } = original;
          return prisma.echauffement.create({ data: { ...dataToCopy, nom: `${original.nom} (Copie)` } });
        }
        case 'tag': {
          const original = await prisma.tag.findUnique({ where: { id: item.id } });
          if (!original) return null;
          const { id, createdAt, ...dataToCopy } = original;
          return prisma.tag.create({ data: { ...dataToCopy, label: `${original.label} (Copie)` } });
        }
        case 'situation': {
          const original = await prisma.situationMatch.findUnique({ where: { id: item.id }, include: { tags: true } });
          if (!original) return null;
          const { id, createdAt, updatedAt, ...dataToCopy } = original;
          return prisma.situationMatch.create({
            data: {
              ...dataToCopy,
              nom: `${original.nom} (Copie)`,
              tags: { connect: original.tags.map(t => ({ id: t.id })) }
            }
          });
        }
        default:
          return null;
      }
    });

    await prisma.$transaction(await Promise.all(transactionPromises));

    res.json({ message: 'Éléments dupliqués avec succès.' });

  } catch (error) {
    console.error('Erreur lors de la duplication en masse:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la duplication.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body || {};

    const data = {};
    if (typeof role === 'string') data.role = role;
    if (typeof isActive === 'boolean') data.isActive = isActive;

    const updated = await prisma.user.update({ where: { id }, data });
    return res.json({
      user: {
        id: updated.id,
        email: updated.email,
        nom: updated.nom,
        prenom: updated.prenom,
        role: updated.role,
        isActive: updated.isActive,
        iconUrl: updated.iconUrl
      }
    });
  } catch (error) {
    console.error('Erreur Admin updateUser:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'utilisateur' });
  }
};
