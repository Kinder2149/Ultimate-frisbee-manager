/**
 * Tests E2E - Navigation Mobile
 * 
 * Vérifie que la navigation mobile fonctionne correctement :
 * - 5 onglets présents (Accueil, Bibliothèque, Créer, Terrain, Profil)
 * - Navigation entre onglets
 * - Highlight onglet actif
 * - Routes correctes
 */

describe('Mobile - Navigation', () => {
  beforeEach(() => {
    // Login via API
    cy.login();
  });

  describe('Bottom Navigation', () => {
    it('devrait afficher 5 onglets dans la bottom nav', () => {
      cy.visit('/mobile/home');
      cy.wait(500);

      // Vérifier présence des 5 onglets
      cy.get('app-mobile-bottom-nav').should('exist');
      cy.get('app-mobile-bottom-nav .nav-item').should('have.length', 5);

      // Vérifier les labels
      cy.contains('Accueil').should('be.visible');
      cy.contains('Bibliothèque').should('be.visible');
      cy.contains('Créer').should('be.visible');
      cy.contains('Terrain').should('be.visible');
      cy.contains('Profil').should('be.visible');
    });

    it('devrait naviguer vers Accueil', () => {
      cy.visit('/mobile/library');
      cy.wait(500);

      cy.contains('Accueil').click();
      cy.url().should('include', '/mobile/home');
      cy.get('app-mobile-home').should('exist');
    });

    it('devrait naviguer vers Bibliothèque', () => {
      cy.visit('/mobile/home');
      cy.wait(500);

      cy.contains('Bibliothèque').click();
      cy.url().should('include', '/mobile/library');
      cy.get('app-mobile-library').should('exist');
    });

    it('devrait naviguer vers Créer', () => {
      cy.visit('/mobile/home');
      cy.wait(500);

      cy.contains('Créer').click();
      cy.url().should('include', '/mobile/create');
      cy.get('app-mobile-create').should('exist');
    });

    it('devrait naviguer vers Terrain', () => {
      cy.visit('/mobile/home');
      cy.wait(500);

      cy.contains('Terrain').click();
      cy.url().should('include', '/mobile/terrain');
      cy.get('app-mobile-terrain').should('exist');
    });

    it('devrait naviguer vers Profil', () => {
      cy.visit('/mobile/home');
      cy.wait(500);

      cy.contains('Profil').click();
      cy.url().should('include', '/mobile/profile');
      cy.get('app-mobile-profile').should('exist');
    });

    it('devrait highlight l\'onglet actif', () => {
      cy.visit('/mobile/home');
      cy.wait(500);

      // Vérifier que Accueil est actif
      cy.get('app-mobile-bottom-nav .nav-item').first().should('have.class', 'active');

      // Naviguer vers Library
      cy.contains('Bibliothèque').click();
      cy.wait(300);

      // Vérifier que Library est actif
      cy.get('app-mobile-bottom-nav .nav-item').eq(1).should('have.class', 'active');
    });
  });

  describe('Routes Mobile', () => {
    it('devrait charger /mobile/home', () => {
      cy.visit('/mobile/home');
      cy.get('app-mobile-home').should('exist');
      cy.get('app-mobile-header').should('exist');
      cy.get('app-mobile-bottom-nav').should('exist');
    });

    it('devrait charger /mobile/library', () => {
      cy.visit('/mobile/library');
      cy.get('app-mobile-library').should('exist');
      cy.get('mat-tab-group').should('exist');
    });

    it('devrait charger /mobile/create', () => {
      cy.visit('/mobile/create');
      cy.get('app-mobile-create').should('exist');
    });

    it('devrait charger /mobile/terrain', () => {
      cy.visit('/mobile/terrain');
      cy.get('app-mobile-terrain').should('exist');
    });

    it('devrait charger /mobile/profile', () => {
      cy.visit('/mobile/profile');
      cy.get('app-mobile-profile').should('exist');
    });
  });

  describe('Responsive Mobile', () => {
    it('devrait être optimisé pour mobile (viewport 375x667)', () => {
      cy.viewport(375, 667);
      cy.visit('/mobile/home');
      cy.wait(500);

      // Vérifier que la bottom nav est visible
      cy.get('app-mobile-bottom-nav').should('be.visible');

      // Vérifier taille tactile minimum (48px)
      cy.get('app-mobile-bottom-nav .nav-item').first().should('have.css', 'min-height', '48px');
    });

    it('devrait être optimisé pour tablette (viewport 768x1024)', () => {
      cy.viewport(768, 1024);
      cy.visit('/mobile/home');
      cy.wait(500);

      cy.get('app-mobile-bottom-nav').should('be.visible');
    });
  });
});
