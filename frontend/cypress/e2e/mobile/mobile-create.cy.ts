/**
 * Tests E2E - Création Mobile
 * 
 * Vérifie que la création mobile fonctionne correctement :
 * - Sélection type de contenu
 * - Stepper multi-étapes
 * - Validation formulaires
 * - Sauvegarde
 * 
 * NOTE: Ces tests nécessitent des données de test (tags, etc.)
 */

describe('Mobile - Création', () => {
  beforeEach(() => {
    cy.login();
  });

  describe('Page Sélection Type', () => {
    beforeEach(() => {
      cy.visit('/mobile/create');
      cy.wait(500);
    });

    it('devrait afficher 4 cartes de sélection', () => {
      cy.get('.type-card').should('have.length', 4);

      cy.contains('Exercice').should('be.visible');
      cy.contains('Entraînement').should('be.visible');
      cy.contains('Échauffement').should('be.visible');
      cy.contains('Situation').should('be.visible');
    });

    it('devrait naviguer vers création Exercice', () => {
      cy.contains('Exercice').click();
      cy.wait(500);

      cy.url().should('include', '/mobile/create/exercice');
      cy.get('app-mobile-create-exercice').should('exist');
    });

    it('devrait naviguer vers création Entraînement', () => {
      cy.contains('Entraînement').click();
      cy.wait(500);

      cy.url().should('include', '/mobile/create/entrainement');
    });
  });

  describe('Création Exercice - Stepper', () => {
    beforeEach(() => {
      cy.visit('/mobile/create/exercice');
      cy.wait(500);
    });

    it('devrait afficher le stepper avec 5 étapes', () => {
      cy.get('app-mobile-stepper').should('exist');
      cy.get('.step-indicator').should('have.length', 5);
    });

    it('devrait bloquer navigation si étape 1 invalide', () => {
      // Essayer de passer à l'étape suivante sans remplir
      cy.contains('Suivant').click();
      cy.wait(300);

      // Toujours sur étape 1
      cy.get('.step-indicator').first().should('have.class', 'active');
    });

    it('devrait permettre navigation après remplissage étape 1', () => {
      // Remplir nom et description
      cy.get('input[formControlName="nom"]').type('Test Exercice E2E');
      cy.get('textarea[formControlName="description"]').type('Description test');

      cy.contains('Suivant').click();
      cy.wait(300);

      // Étape 2 active
      cy.get('.step-indicator').eq(1).should('have.class', 'active');
    });

    it('devrait permettre retour étape précédente', () => {
      cy.get('input[formControlName="nom"]').type('Test');
      cy.get('textarea[formControlName="description"]').type('Test');
      cy.contains('Suivant').click();
      cy.wait(300);

      // Retour
      cy.contains('Précédent').click();
      cy.wait(300);

      // Étape 1 active
      cy.get('.step-indicator').first().should('have.class', 'active');
    });
  });

  describe('Création Exercice - Formulaire Complet', () => {
    beforeEach(() => {
      cy.visit('/mobile/create/exercice');
      cy.wait(500);
    });

    it('devrait créer un exercice complet', () => {
      // Étape 1 : Informations
      cy.get('input[formControlName="nom"]').type('Exercice Test E2E ' + Date.now());
      cy.get('textarea[formControlName="description"]').type('Description complète de test');
      cy.contains('Suivant').click();
      cy.wait(300);

      // Étape 2 : Paramètres
      cy.get('input[formControlName="duree_minutes"]').clear().type('15');
      cy.get('input[formControlName="nombre_joueurs_min"]').clear().type('4');
      cy.get('input[formControlName="nombre_joueurs_max"]').clear().type('8');
      cy.contains('Suivant').click();
      cy.wait(300);

      // Étape 3 : Image (skip)
      cy.contains('Suivant').click();
      cy.wait(300);

      // Étape 4 : Tags (skip)
      cy.contains('Suivant').click();
      cy.wait(300);

      // Étape 5 : Résumé et création
      cy.get('.summary-section').should('exist');
      cy.contains('Créer').click();
      cy.wait(2000);

      // Vérifier redirection vers détail
      cy.url().should('include', '/mobile/detail/exercice/');
      cy.get('mat-snack-bar-container').should('contain', 'créé');
    });
  });

  describe('Création Entraînement - Stepper', () => {
    beforeEach(() => {
      cy.visit('/mobile/create/entrainement');
      cy.wait(500);
    });

    it('devrait afficher le stepper avec 6 étapes', () => {
      cy.get('.step-indicator').should('have.length', 6);
    });

    it('devrait permettre sélection échauffement', () => {
      // Étape 1
      cy.get('input[formControlName="titre"]').type('Entraînement Test');
      cy.get('input[formControlName="date"]').type('2026-02-20');
      cy.contains('Suivant').click();
      cy.wait(300);

      // Étape 2 : Échauffement
      cy.get('app-mobile-relation-selector').should('exist');
      // Sélectionner un échauffement si disponible
      cy.get('.relation-item').then($items => {
        if ($items.length > 0) {
          cy.get('.relation-item').first().click();
        }
      });
    });
  });

  describe('Bouton Annuler', () => {
    it('devrait annuler et revenir à /mobile/create', () => {
      cy.visit('/mobile/create/exercice');
      cy.wait(500);

      cy.contains('Annuler').click();
      cy.wait(500);

      cy.url().should('include', '/mobile/create');
      cy.url().should('not.include', '/exercice');
    });
  });

  describe('Validation Formulaires', () => {
    beforeEach(() => {
      cy.visit('/mobile/create/exercice');
      cy.wait(500);
    });

    it('devrait afficher erreurs si champs requis vides', () => {
      // Essayer de soumettre sans remplir
      cy.contains('Suivant').click();
      cy.wait(300);

      // Vérifier messages d'erreur
      cy.get('mat-error').should('be.visible');
    });

    it('devrait valider format durée (nombre)', () => {
      cy.get('input[formControlName="nom"]').type('Test');
      cy.get('textarea[formControlName="description"]').type('Test');
      cy.contains('Suivant').click();
      cy.wait(300);

      // Entrer texte dans durée
      cy.get('input[formControlName="duree_minutes"]').clear().type('abc');
      cy.contains('Suivant').click();
      cy.wait(300);

      // Devrait rester sur étape 2
      cy.get('.step-indicator').eq(1).should('have.class', 'active');
    });
  });
});
