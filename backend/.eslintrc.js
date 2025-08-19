module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    // Règles de formatage
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    
    // Règles de nomenclature (suivant les conventions documentées)
    'camelcase': ['error', { properties: 'always' }],
    
    // Bonnes pratiques
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'error',
    
    // Règles spécifiques au projet
    'max-len': ['warn', { 'code': 100, 'ignoreComments': true, 'ignoreStrings': true }],
    'no-var': 'error',
    'object-curly-spacing': ['error', 'always'],
    'comma-dangle': ['error', 'only-multiline'],
  },
  ignorePatterns: [
    'node_modules/',
    'prisma/client/',
    'coverage/',
    'dist/',
  ],
};
