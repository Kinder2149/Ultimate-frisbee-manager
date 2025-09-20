const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler.middleware');
const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(cors());

// Middleware pour parser le JSON
app.use(express.json());

// Initialisation des routes
require('./routes')(app);

// Middleware de gestion des erreurs (doit être le dernier)
app.use(errorHandler);

module.exports = app;
