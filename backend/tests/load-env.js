// tests/load-env.js
const dotenv = require('dotenv');
const path = require('path');

// Charge explicitement le fichier .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
