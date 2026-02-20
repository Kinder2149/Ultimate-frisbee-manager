/**
 * Tests E2E - Mode Terrain Mobile
 * 
 * Vérifie que le mode terrain mobile fonctionne correctement :
 * - Chronomètre (démarrer, pause, arrêter)
 * - Bloc notes avec sauvegarde auto
 * - Arrêt auto chrono au changement de page
 */

describe('Mobile - Mode Terrain', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/mobile/terrain');
    cy.wait(500);
  });

  describe('Chronomètre', () => {
    it('devrait afficher le chronomètre à 00:00', () => {
      cy.get('.timer-display').should('contain', '00:00');
    });

    it('devrait démarrer le chronomètre', () => {
      cy.contains('Démarrer').click();
      cy.wait(2000);

      // Vérifier que le temps a changé
      cy.get('.timer-display').should('not.contain', '00:00');
    });

    it('devrait mettre en pause le chronomètre', () => {
      cy.contains('Démarrer').click();
      cy.wait(2000);

      cy.contains('Pause').click();
      cy.wait(500);

      // Récupérer le temps actuel
      cy.get('.timer-display').invoke('text').then(pausedTime => {
        cy.wait(2000);

        // Vérifier que le temps n'a pas changé
        cy.get('.timer-display').should('contain', pausedTime);
      });
    });

    it('devrait arrêter et réinitialiser le chronomètre', () => {
      cy.contains('Démarrer').click();
      cy.wait(2000);

      cy.contains('Arrêter').click();
      cy.wait(500);

      cy.get('.timer-display').should('contain', '00:00');
    });

    it('devrait formater le temps correctement (MM:SS)', () => {
      cy.contains('Démarrer').click();
      cy.wait(2000);

      cy.get('.timer-display').invoke('text').should('match', /^\d{2}:\d{2}$/);
    });
  });

  describe('Bloc Notes', () => {
    it('devrait afficher une textarea pour les notes', () => {
      cy.get('textarea[placeholder*="notes"]').should('exist');
    });

    it('devrait sauvegarder automatiquement les notes (debounce 1s)', () => {
      const testNote = 'Test note automatique ' + Date.now();

      cy.get('textarea[placeholder*="notes"]').clear().type(testNote);
      cy.wait(1500); // Debounce 1s + marge

      // Vérifier indication "sauvegardé"
      cy.contains('sauvegardé').should('be.visible');
    });

    it('devrait persister les notes après rechargement', () => {
      const testNote = 'Test persistence ' + Date.now();

      cy.get('textarea[placeholder*="notes"]').clear().type(testNote);
      cy.wait(1500);

      // Recharger la page
      cy.reload();
      cy.wait(500);

      // Vérifier que la note est toujours là
      cy.get('textarea[placeholder*="notes"]').should('have.value', testNote);
    });

    it('devrait afficher l\'indication "Notes sauvegardées"', () => {
      cy.get('textarea[placeholder*="notes"]').clear().type('Test');
      cy.wait(1500);

      cy.get('.notes-saved-indicator').should('be.visible');
      cy.contains('sauvegardé').should('be.visible');
    });
  });

  describe('Arrêt automatique chronomètre', () => {
    it('devrait arrêter le chrono au changement d\'onglet', () => {
      // Démarrer le chrono
      cy.contains('Démarrer').click();
      cy.wait(2000);

      // Vérifier que le chrono tourne
      cy.get('.timer-display').should('not.contain', '00:00');

      // Changer d'onglet
      cy.contains('Accueil').click();
      cy.wait(500);

      // Revenir sur Terrain
      cy.contains('Terrain').click();
      cy.wait(500);

      // Vérifier que le chrono est arrêté (00:00)
      cy.get('.timer-display').should('contain', '00:00');
    });
  });

  describe('Entraînement du jour (si implémenté)', () => {
    it('devrait afficher l\'entraînement actif', () => {
      // Ce test dépend de l'implémentation
      cy.get('.active-training').then($training => {
        if ($training.length > 0) {
          cy.get('.active-training h3').should('exist');
        }
      });
    });
  });

  describe('Responsive', () => {
    it('devrait être optimisé pour mobile (375x667)', () => {
      cy.viewport(375, 667);
      cy.visit('/mobile/terrain');
      cy.wait(500);

      cy.get('.timer-display').should('be.visible');
      cy.get('textarea[placeholder*="notes"]').should('be.visible');
    });
  });
});
