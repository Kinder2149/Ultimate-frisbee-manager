const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Créer une erreur personnalisée pour notre errorHandler
      const validationError = new Error('Les données fournies sont invalides.');
      validationError.statusCode = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      console.log('--- ERREUR DE VALIDATION ZOD ---');
      console.dir(error, { depth: null });
      console.log('------------------------------------');
      return next(validationError);
    }
    // Pour les autres types d'erreurs
    next(error);
  }
};

module.exports = { validate };
