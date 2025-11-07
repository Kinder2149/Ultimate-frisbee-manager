/**
 * Middleware pour transformer le corps de la requête (req.body) avant la validation.
 * Gère spécifiquement les données provenant de formulaires multipart/form-data.
 */
// Fonction utilitaire pour valider un format UUID
const isUuid = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof str === 'string' && uuidRegex.test(str);
};

const transformFormData = (req, res, next) => {
  // Champs attendus comme des objets/tableaux JSON stringifiés
  const jsonFields = ['blocs', 'exercices'];
  for (const field of jsonFields) {
    if (typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (e) {
        console.error(`Erreur de parsing JSON pour le champ '${field}':`, e);
        req.body[field] = []; // Sécurité pour éviter un crash
      }
    }
  }

  // Champs attendus comme des tableaux de chaînes (séparées par des virgules)
  const arrayStringFields = ['variablesPlus', 'variablesMinus'];
  for (const field of arrayStringFields) {
    let value = req.body[field];
    // Si c'est une chaîne: tenter un JSON.parse d'abord (cas d'un tableau encodé JSON)
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          value = parsed;
        } else {
          // fallback: split par virgule
          value = value.split(',');
        }
      } catch (_) {
        // Non JSON: fallback split
        value = value.split(',');
      }
    }
    if (Array.isArray(value)) {
      // Aplatir les niveaux qui seraient des chaînes JSON
      const flattened = [];
      for (const item of value) {
        if (typeof item === 'string') {
          const trimmed = item.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
              const inner = JSON.parse(trimmed);
              if (Array.isArray(inner)) {
                for (const innerItem of inner) {
                  if (innerItem != null && String(innerItem).trim() !== '') {
                    flattened.push(String(innerItem).trim());
                  }
                }
                continue;
              }
            } catch (_) {
              // pas un JSON valide: tomber au cas par défaut
            }
          }
          if (trimmed !== '') flattened.push(trimmed);
        } else if (item != null) {
          const str = String(item).trim();
          if (str !== '') flattened.push(str);
        }
      }
      req.body[field] = flattened;
    } else {
      req.body[field] = [];
    }
  }

  // Traitement spécifique pour tagIds
  // Important: ne pas forcer à [] si absent pour éviter d'effacer les tags à la mise à jour
  if (Object.prototype.hasOwnProperty.call(req.body, 'tagIds')) {
    let tagIds = req.body.tagIds;
    if (typeof tagIds === 'string') {
      tagIds = tagIds.split(',');
    }
    if (Array.isArray(tagIds)) {
      const normalized = tagIds.map(id => String(id).trim()).filter(isUuid);
      if (normalized.length === 0) {
        // Si vide après normalisation, supprimer la clé pour ne pas réinitialiser les tags
        delete req.body.tagIds;
      } else {
        req.body.tagIds = normalized;
      }
    } else {
      // Si fourni mais invalide, normaliser en []
      delete req.body.tagIds;
    }
  }

  // Normalisation des champs string simples
  const stringFields = ['nom', 'description', 'materiel', 'notes', 'critereReussite'];
  stringFields.forEach((f) => {
    if (typeof req.body[f] === 'string') {
      const trimmed = req.body[f].trim();
      // Si chaîne vide, préférer undefined pour laisser Zod gérer required/optional
      req.body[f] = trimmed === '' ? undefined : trimmed;
    }
  });

  // Normalisation des URLs (chaîne vide -> undefined)
  const urlFields = ['imageUrl', 'schemaUrl'];
  urlFields.forEach((f) => {
    if (typeof req.body[f] === 'string') {
      const trimmed = req.body[f].trim();
      req.body[f] = trimmed === '' ? undefined : trimmed;
    }
  });

  // --- Étape de Sécurisation Finale ---
  // S'assurer que tous les champs qui doivent être des tableaux le sont.
  const allArrayFields = ['blocs', 'exercices', 'variablesPlus', 'variablesMinus'];
  allArrayFields.forEach(field => {
    if (!Array.isArray(req.body[field])) {
      req.body[field] = [];
    }
  });

  // Log pour le débogage (léger)
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[transformFormData] Payload normalisé (aperçu):', {
      keys: Object.keys(req.body),
      types: Object.fromEntries(Object.entries(req.body).map(([k, v]) => [k, Array.isArray(v) ? 'array' : typeof v])),
    });
  }

  next();
};

module.exports = { transformFormData };
