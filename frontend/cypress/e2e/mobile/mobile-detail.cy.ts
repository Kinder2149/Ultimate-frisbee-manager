/**
 * Tests E2E - Détail Mobile
 * 
 * Vérifie que la page détail mobile fonctionne correctement :
 * - Affichage métadonnées
 * - Sections collapsibles
 * - Visualiseur images
 * - Actions (favoris, dupliquer, supprimer, éditer)
 */

describe('Mobile - Détail', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Affichage Détail Exercice', () => {
    beforeEach(() => {
      // Naviguer vers un exercice depuis Library
      cy.visit('/mobile/library');
      cy.wait(500);
      cy.get('.item-card').first().click();
      cy.wait(500);
    });

    it('devrait afficher le header avec titre et bouton retour', () => {
      cy.get('app-mobile-header').should('exist');
      cy.get('app-mobile-header h1').should('not.be.empty');
      cy.get('app-mobile-header button[mat-icon-button]').should('exist'); // Bouton retour
    });

    it('devrait afficher les métadonnées (durée, joueurs)', () => {
      cy.get('.metadata-section').should('exist');
      cy.get('.metadata-item').should('have.length.at.least', 1);
    });

    it('devrait afficher la description', () => {
      cy.get('app-collapsible-section').should('exist');
      cy.contains('Description').should('be.visible');
    });

    it('devrait afficher les tags', () => {
      cy.contains('Tags').should('be.visible');
    });
  });

  describe('Sections Collapsibles', () => {
    beforeEach(() => {
      cy.visit('/mobile/library');
      cy.wait(500);
      cy.get('.item-card').first().click();
      cy.wait(500);
    });

    it('devrait ouvrir/fermer la section Description', () => {
      // Trouver la section Description
      cy.contains('Description').parent('app-collapsible-section').as('descSection');

      // Vérifier état initial (ouvert par défaut)
      cy.get('@descSection').should('have.class', 'open');

      // Cliquer pour fermer
      cy.get('@descSection').find('.section-header').click();
      cy.wait(300);
      cy.get('@descSection').should('not.have.class', 'open');

      // Cliquer pour ouvrir
      cy.get('@descSection').find('.section-header').click();
      cy.wait(300);
      cy.get('@descSection').should('have.class', 'open');
    });
  });

  describe('Actions Détail', () => {
    beforeEach(() => {
      cy.visit('/mobile/library');
      cy.wait(500);
      cy.get('.item-card').first().click();
      cy.wait(500);
    });

    it('devrait afficher 3 boutons d\'action (Favoris, Dupliquer, Supprimer)', () => {
      cy.get('.actions-section').should('exist');
      cy.get('.actions-section button').should('have.length', 3);

      // Vérifier les labels
      cy.contains('favoris').should('be.visible');
      cy.contains('Dupliquer').should('be.visible');
      cy.contains('Supprimer').should('be.visible');
    });

    it('devrait ajouter/retirer des favoris', () => {
      // Cliquer sur favoris
      cy.contains('favoris').click();
      cy.wait(500);

      // Vérifier snackbar
      cy.get('mat-snack-bar-container').should('be.visible');
    });

    it('devrait dupliquer un exercice', () => {
      cy.contains('Dupliquer').click();
      cy.wait(1000);

      // Vérifier redirection vers nouveau détail
      cy.url().should('include', '/mobile/detail/exercice/');
      cy.get('mat-snack-bar-container').should('contain', 'dupliqué');
    });

    it('devrait supprimer un exercice avec confirmation', () => {
      cy.contains('Supprimer').click();
      cy.wait(500);

      // Vérifier dialog de confirmation
      cy.get('app-mobile-confirm-dialog').should('exist');
      cy.contains('Confirmer la suppression').should('be.visible');

      // Annuler
      cy.contains('Annuler').click();
      cy.wait(300);

      // Toujours sur la page détail
      cy.get('app-mobile-detail').should('exist');
    });

    it('devrait naviguer vers édition', () => {
      // Cliquer sur action Éditer dans le header
      cy.get('app-mobile-header button[mat-icon-button]').last().click();
      cy.wait(500);

      // Menu contextuel
      cy.contains('Éditer').click();
      cy.wait(500);

      cy.url().should('include', '/mobile/edit/exercice/');
    });
  });

  describe('Visualiseur Images', () => {
    beforeEach(() => {
      // Naviguer vers un exercice avec image
      cy.visit('/mobile/library');
      cy.wait(500);
      cy.get('.item-card').first().click();
      cy.wait(500);
    });

    it('devrait ouvrir le visualiseur au clic sur image', () => {
      // Si image présente
      cy.get('.detail-image').then($img => {
        if ($img.length > 0) {
          cy.get('.detail-image').first().click();
          cy.wait(300);

          cy.get('app-mobile-image-viewer').should('be.visible');
        }
      });
    });

    it('devrait fermer le visualiseur avec bouton X', () => {
      cy.get('.detail-image').then($img => {
        if ($img.length > 0) {
          cy.get('.detail-image').first().click();
          cy.wait(300);

          cy.get('app-mobile-image-viewer button.close').click();
          cy.wait(300);

          cy.get('app-mobile-image-viewer').should('not.be.visible');
        }
      });
    });
  });

  describe('Navigation Retour', () => {
    it('devrait revenir à la bibliothèque avec bouton retour', () => {
      cy.visit('/mobile/library');
      cy.wait(500);
      cy.get('.item-card').first().click();
      cy.wait(500);

      // Cliquer sur bouton retour
      cy.get('app-mobile-header button[mat-icon-button]').first().click();
      cy.wait(500);

      cy.url().should('include', '/mobile/home');
    });
  });
});
