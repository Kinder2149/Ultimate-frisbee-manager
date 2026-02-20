/**
 * Tests E2E - Accueil Mobile
 * 
 * Vérifie que la page d'accueil mobile fonctionne correctement :
 * - Feed unifié
 * - Filtres par catégorie
 * - Recherche globale
 * - Navigation vers détail
 */

describe('Mobile - Accueil', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/mobile/home');
    cy.wait(500);
  });

  describe('Feed Unifié', () => {
    it('devrait afficher le feed de contenus', () => {
      cy.get('.content-feed').should('exist');
      cy.get('.feed-card').should('have.length.at.least', 1);
    });

    it('devrait afficher les cartes avec titre et métadonnées', () => {
      cy.get('.feed-card').first().within(() => {
        cy.get('h3').should('exist'); // Titre
        cy.get('.card-meta').should('exist'); // Métadonnées
      });
    });

    it('devrait naviguer vers le détail au clic sur une carte', () => {
      cy.get('.feed-card').first().click();
      cy.wait(500);

      cy.url().should('include', '/mobile/detail/');
      cy.get('app-mobile-detail').should('exist');
    });
  });

  describe('Filtres par Catégorie', () => {
    it('devrait afficher les chips de filtres', () => {
      cy.get('.filter-chips').should('exist');
      cy.get('mat-chip').should('have.length.at.least', 5);

      // Vérifier les catégories
      cy.contains('Tout').should('be.visible');
      cy.contains('Exercices').should('be.visible');
      cy.contains('Entraînements').should('be.visible');
      cy.contains('Échauffements').should('be.visible');
      cy.contains('Situations').should('be.visible');
    });

    it('devrait filtrer par Exercices', () => {
      cy.contains('Exercices').click();
      cy.wait(500);

      // Vérifier que seuls les exercices sont affichés
      cy.get('.feed-card').each($card => {
        cy.wrap($card).should('contain', 'Exercice');
      });
    });

    it('devrait filtrer par Entraînements', () => {
      cy.contains('Entraînements').click();
      cy.wait(500);

      cy.get('.feed-card').each($card => {
        cy.wrap($card).should('contain', 'Entraînement');
      });
    });

    it('devrait revenir à "Tout" et afficher tous les contenus', () => {
      cy.contains('Exercices').click();
      cy.wait(500);

      cy.contains('Tout').click();
      cy.wait(500);

      // Vérifier que différents types sont affichés
      cy.get('.feed-card').should('have.length.at.least', 2);
    });
  });

  describe('Recherche Globale', () => {
    it('devrait afficher une barre de recherche', () => {
      cy.get('.search-bar input').should('exist');
      cy.get('.search-bar input').should('have.attr', 'placeholder');
    });

    it('devrait filtrer les contenus lors de la recherche', () => {
      // Compter les items initiaux
      cy.get('.feed-card').then($items => {
        const initialCount = $items.length;

        // Rechercher
        cy.get('.search-bar input').type('passe');
        cy.wait(500); // Debounce

        // Vérifier filtrage
        cy.get('.feed-card').should('have.length.lessThan', initialCount);
      });
    });

    it('devrait afficher "Aucun résultat" si recherche vide', () => {
      cy.get('.search-bar input').type('zzzzzzzzz');
      cy.wait(500);

      cy.contains('Aucun résultat').should('be.visible');
    });
  });

  describe('Tri', () => {
    it('devrait afficher un bouton de tri', () => {
      cy.get('button[aria-label*="tri"]').should('exist');
    });

    it('devrait trier par récent/ancien', () => {
      cy.get('button[aria-label*="tri"]').click();
      cy.wait(500);

      // Vérifier changement d'ordre
      cy.get('.feed-card').first().invoke('text').then(firstTitle => {
        cy.get('button[aria-label*="tri"]').click();
        cy.wait(500);

        cy.get('.feed-card').first().invoke('text').should('not.equal', firstTitle);
      });
    });
  });

  describe('Pull to Refresh (si implémenté)', () => {
    it('devrait recharger le feed avec pull-to-refresh', () => {
      // Ce test nécessite une implémentation spécifique
      // À adapter selon votre code
      cy.get('.content-feed').trigger('touchstart', { touches: [{ clientX: 200, clientY: 100 }] });
      cy.get('.content-feed').trigger('touchmove', { touches: [{ clientX: 200, clientY: 300 }] });
      cy.get('.content-feed').trigger('touchend');
      cy.wait(1000);

      cy.get('.feed-card').should('exist');
    });
  });

  describe('Responsive', () => {
    it('devrait être optimisé pour mobile (375x667)', () => {
      cy.viewport(375, 667);
      cy.visit('/mobile/home');
      cy.wait(500);

      cy.get('.content-feed').should('be.visible');
      cy.get('.filter-chips').should('be.visible');
    });
  });
});
