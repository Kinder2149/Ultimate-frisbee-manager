const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    // Vérifier que le schéma est valide et possède safeParse
    if (!schema || typeof schema.safeParse !== 'function') {
      const err = new Error('Validation schema is invalid or missing safeParse');
      err.statusCode = 500;
      err.code = 'VALIDATION_SCHEMA_INVALID';
      return next(err);
    }

    // Utiliser safeParse pour récupérer les données transformées par Zod
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Logs détaillés pour diagnostiquer le problème
      // eslint-disable-next-line no-console
      console.log('[VALIDATION] Body reçu:', JSON.stringify(req.body));
      // eslint-disable-next-line no-console
      console.log('[VALIDATION] Erreur Zod complète:', JSON.stringify(result.error, null, 2));
      
      const zodErr = result && result.error ? result.error : undefined;
      const validationError = new Error('Les données fournies sont invalides.');
      validationError.statusCode = 400;
      validationError.code = 'VALIDATION_ERROR';
      const zodIssues = zodErr && Array.isArray(zodErr.errors) ? zodErr.errors : [];
      validationError.details = zodIssues.length > 0
        ? zodIssues.map((err) => ({
            field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
            message: err.message,
          }))
        : [{ field: '', message: 'Payload invalide.' }];
      
      // eslint-disable-next-line no-console
      console.log('[VALIDATION] Détails formatés:', JSON.stringify(validationError.details));
      return next(validationError);
    }

    // Réinjecter les données validées/normalisées par Zod pour la suite de la chaîne
    req.body = result.data;
    return next();
  } catch (error) {
    // Pour les autres types d'erreurs, on passe l'erreur originale.
    return next(error);
  }
};

module.exports = { validate };
