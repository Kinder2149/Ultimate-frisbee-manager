// Tests d'intégration pour valider les endpoints API
// Fichier: cypress/e2e/api-tests/api-endpoints.cy.js

describe('Tests des endpoints API', () => {
  const API_BASE_URL = 'http://localhost:3001/api';

  context('Entraînements API', () => {
    it('GET /entrainements - devrait retourner la liste des entraînements', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/entrainements`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        // Loguer les résultats pour référence
        cy.log(`Nombre d'entraînements reçus: ${response.body.length}`);
      });
    });

    it('GET /entrainements/:id - devrait retourner un entraînement spécifique ou 404', () => {
      // Utilisation d'un ID fictif pour tester
      const testId = '60d21b4967d0d8992e610c85'; 
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/entrainements/${testId}`,
        failOnStatusCode: false
      }).then((response) => {
        // Accepter 200 si l'ID existe ou 404 s'il n'existe pas
        expect(response.status).to.be.oneOf([200, 404]);
        if (response.status === 200) {
          expect(response.body).to.have.property('id');
          expect(response.body).to.have.property('title');
        }
      });
    });

    // Ce test est commenté car il pourrait modifier les données
    /* 
    it('POST /entrainements - devrait créer un nouvel entraînement', () => {
      const newEntrainement = {
        title: 'Test Cypress Entraînement',
        description: 'Créé par test automatisé',
        date: new Date().toISOString(),
        duration: 60,
        intensity: 'medium',
        phases: []
      };

      cy.request({
        method: 'POST',
        url: `${API_BASE_URL}/entrainements`,
        body: newEntrainement,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body.title).to.eq(newEntrainement.title);
      });
    });
    */
  });

  context('Exercices API', () => {
    it('GET /exercices - devrait retourner la liste des exercices', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/exercices`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        cy.log(`Nombre d'exercices reçus: ${response.body.length}`);
      });
    });

    it('GET /exercices/:id - devrait retourner un exercice spécifique ou 404', () => {
      // Utilisation d'un ID fictif pour tester
      const testId = '60d21b4967d0d8992e610c88'; 
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/exercices/${testId}`,
        failOnStatusCode: false
      }).then((response) => {
        // Accepter 200 si l'ID existe ou 404 s'il n'existe pas
        expect(response.status).to.be.oneOf([200, 404]);
        if (response.status === 200) {
          expect(response.body).to.have.property('id');
          expect(response.body).to.have.property('title');
        }
      });
    });
  });

  context('Tags API', () => {
    it('GET /tags - devrait retourner la liste des tags', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/tags`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        cy.log(`Nombre de tags reçus: ${response.body.length}`);
      });
    });

    it('GET /tags/:id - devrait retourner un tag spécifique ou 404', () => {
      // Utilisation d'un ID fictif pour tester
      const testId = '60d21b4967d0d8992e610c89'; 
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/tags/${testId}`,
        failOnStatusCode: false
      }).then((response) => {
        // Accepter 200 si l'ID existe ou 404 s'il n'existe pas
        expect(response.status).to.be.oneOf([200, 404]);
        if (response.status === 200) {
          expect(response.body).to.have.property('id');
          expect(response.body).to.have.property('name');
        }
      });
    });
  });

  // Test pour vérifier que les URLs incorrectes retournent bien une erreur 404
  context('Tests des chemins d\'URLs incorrects', () => {
    it('GET /entrainements/entrainements - devrait retourner 404 (URL incorrecte)', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/entrainements/entrainements`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('GET /entrainements/exercices - devrait retourner 404 (URL incorrecte)', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/entrainements/exercices`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('GET /entrainements/tags - devrait retourner 404 (URL incorrecte)', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/entrainements/tags`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });
});
