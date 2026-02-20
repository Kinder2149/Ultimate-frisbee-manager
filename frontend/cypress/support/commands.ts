/// <reference types="cypress" />

/**
 * Custom command pour bypasser l'authentification en mode test
 * Permet de tester l'UI mobile sans authentification réelle
 */
Cypress.Commands.add('login', () => {
  cy.log('Bypass authentification pour tests E2E');
  
  // Visiter la page pour initialiser le contexte
  cy.visit('/');
  
  // Attendre que la page soit chargée
  cy.wait(500);
});

/**
 * Custom command pour logout
 */
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('supabase.auth.token');
  cy.visit('/');
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login via API Supabase
       * @param email - Email de l'utilisateur (optionnel, utilise CYPRESS_E2E_EMAIL par défaut)
       * @param password - Mot de passe (optionnel, utilise CYPRESS_E2E_PASSWORD par défaut)
       */
      login(email?: string, password?: string): Chainable<void>
      
      /**
       * Logout et nettoyage du localStorage
       */
      logout(): Chainable<void>
    }
  }
}