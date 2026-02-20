/**
 * Tests E2E - Bibliothèque Mobile
 * 
 * Vérifie que la bibliothèque mobile fonctionne correctement :
 * - 4 tabs (Exercices, Entraînements, Échauffements, Situations)
 * - Recherche par tab
 * - Affichage des éléments
 * - Navigation vers détail
 */

describe('Mobile - Bibliothèque', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/mobile/library');
    cy.wait(500);
  });

  describe('Tabs Bibliothèque', () => {
    it('devrait afficher 4 tabs', () => {
      cy.get('mat-tab-group').should('exist');
      cy.get('.mat-mdc-tab').should('have.length', 4);

      // Vérifier les labels
      cy.contains('Exercices').should('be.visible');
      cy.contains('Entraînements').should('be.visible');
      cy.contains('Échauffements').should('be.visible');
      cy.contains('Situations').should('be.visible');
    });

    it('devrait changer de tab au clic', () => {
      // Tab Exercices actif par défaut
      cy.get('.mat-mdc-tab').first().should('have.class', 'mat-mdc-tab-active');

      // Cliquer sur Entraînements
      cy.contains('Entraînements').click();
      cy.wait(300);
      cy.get('.mat-mdc-tab').eq(1).should('have.class', 'mat-mdc-tab-active');
    });
  });

  describe('Recherche', () => {
    it('devrait afficher une barre de recherche dans chaque tab', () => {
      // Tab Exercices
      cy.get('.search-bar').should('exist');
      cy.get('.search-field input').should('have.attr', 'placeholder', 'Rechercher un exercice...');

      // Tab Entraînements
      cy.contains('Entraînements').click();
      cy.wait(300);
      cy.get('.search-field input').should('have.attr', 'placeholder', 'Rechercher un entraînement...');
    });

    it('devrait filtrer les exercices lors de la recherche', () => {
      // Compter les exercices initiaux
      cy.get('.item-card').then($items => {
        const initialCount = $items.length;

        // Rechercher un terme
        cy.get('.search-field input').type('passe');
        cy.wait(500); // Debounce 300ms

        // Vérifier que le nombre d'items a changé
        cy.get('.item-card').should('have.length.lessThan', initialCount);
      });
    });

    it('devrait afficher "Aucun résultat" si recherche sans résultat', () => {
      cy.get('.search-field input').type('zzzzzzzzzzz');
      cy.wait(500);

      cy.contains('Aucun exercice trouvé').should('be.visible');
    });

    it('devrait effacer la recherche avec le bouton clear', () => {
      cy.get('.search-field input').type('test');
      cy.wait(500);

      // Bouton clear visible
      cy.get('.search-field button[mat-icon-button]').should('be.visible');

      // Cliquer sur clear
      cy.get('.search-field button[mat-icon-button]').click();
      cy.wait(300);

      // Input vide
      cy.get('.search-field input').should('have.value', '');
    });
  });

  describe('Affichage des éléments', () => {
    it('devrait afficher les exercices avec nom et durée', () => {
      cy.get('.item-card').first().within(() => {
        cy.get('h3').should('exist'); // Nom
        cy.get('p').should('exist'); // Durée
      });
    });

    it('devrait naviguer vers le détail au clic sur un exercice', () => {
      cy.get('.item-card').first().click();
      cy.wait(500);

      cy.url().should('include', '/mobile/detail/exercice/');
      cy.get('app-mobile-detail').should('exist');
    });
  });

  describe('Bouton Créer', () => {
    it('devrait afficher un bouton FAB "+" (si implémenté)', () => {
      // Ce test dépend de l'implémentation du FAB
      // À adapter selon votre code
      cy.get('button[mat-fab]').should('exist');
    });

    it('devrait rediriger vers /mobile/create/exercice depuis tab Exercices', () => {
      cy.get('button[mat-fab]').click();
      cy.wait(500);

      cy.url().should('include', '/mobile/create/exercice');
    });
  });

  describe('Navigation entre tabs', () => {
    it('devrait afficher les entraînements dans le tab Entraînements', () => {
      cy.contains('Entraînements').click();
      cy.wait(500);

      cy.get('.item-card').should('exist');
      cy.get('.item-card').first().within(() => {
        cy.get('h3').should('exist'); // Titre
      });
    });

    it('devrait afficher les échauffements dans le tab Échauffements', () => {
      cy.contains('Échauffements').click();
      cy.wait(500);

      cy.get('.item-card').should('exist');
    });

    it('devrait afficher les situations dans le tab Situations', () => {
      cy.contains('Situations').click();
      cy.wait(500);

      cy.get('.item-card').should('exist');
    });
  });
});
