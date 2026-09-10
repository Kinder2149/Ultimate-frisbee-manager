// tests/load-env.js — execute avant chaque fichier de test.
// Force le mode test PUIS charge .env.test en ecrasant tout : ainsi la
// configuration de l'application (config/index.js) ne recharge jamais
// backend/.env, qui pointe sur la base de production.
const dotenv = require('dotenv');
const path = require('path');

process.env.NODE_ENV = 'test';
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test'), override: true });
