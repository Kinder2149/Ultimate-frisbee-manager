const { exportOne } = require('../services/export.service');

/**
 * GET /api/admin/export-ufm?type=exercice|entrainement|echauffement|situation&id=...
 * Protégé par authenticateToken + requireAdmin (défini dans admin.routes.js)
 */
exports.exportUfm = async (req, res) => {
  const { type, id } = req.query || {};
  if (process.env.NODE_ENV !== 'production') {
    console.log('[exportUfm] demande reçue', { type, id });
  }

  try {
    if (!type || !id) {
      return res.status(400).json({ error: "Paramètres requis: type et id" });
    }

    const result = await exportOne(type, id);

    if (result?.notFound) {
      return res.status(404).json({ error: 'Entité introuvable' });
    }

    const filename = result.filename || `${type}-${id}.ufm.json`;
    const payload = result.content || {};

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(JSON.stringify(payload, null, 2));
  } catch (error) {
    const status = error.statusCode || 500;
    console.error('[exportUfm] erreur', { status, message: error?.message });
    return res.status(status).json({ error: error?.message || 'Erreur serveur durant export' });
  }
};
