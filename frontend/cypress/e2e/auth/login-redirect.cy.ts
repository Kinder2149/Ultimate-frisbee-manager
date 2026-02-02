/// <reference types="cypress" />

describe('Auth - login puis redirection', () => {
  const getCredentials = () => {
    const email = Cypress.env('E2E_EMAIL');
    const password = Cypress.env('E2E_PASSWORD');
    return { email, password };
  };

  const login = (email: string, password: string) => {
    cy.visit('/login');

    cy.get('input[formcontrolname="email"]').should('be.visible').clear().type(email);
    cy.get('input[formcontrolname="password"]').should('be.visible').clear().type(password, { log: false });

    cy.get('button[type="submit"]').should('be.enabled').click();
  };

  const assertRedirectAfterLogin = (expected: 'desktop' | 'mobile') => {
    // Le login component navigue vers returnUrl (par défaut '/').
    // Sur mobile, MobileGuard redirige ensuite vers /mobile.
    // Si aucun workspace n'est encore sélectionné, WorkspaceSelectedGuard peut rediriger vers /select-workspace.
    cy.url({ timeout: 30000 }).should('not.include', '/login');

    if (expected === 'desktop') {
      cy.location('pathname', { timeout: 30000 }).should((pathname: string) => {
        expect(['/', '/select-workspace']).to.include(pathname);
      });
      return;
    }

    cy.location('pathname', { timeout: 30000 }).should((pathname: string) => {
      expect(['/mobile', '/select-workspace']).to.include(pathname);
    });
  };

  beforeEach(() => {
    // Éviter que le mode "desktop forcé" ne perturbe les tests.
    cy.clearLocalStorage('ufm.forceDesktop');
    cy.clearCookies();
  });

  it('Desktop: login -> redirection vers / (ou /select-workspace)', function () {
    const { email, password } = getCredentials();
    expect(email, 'CYPRESS_E2E_EMAIL (ou env.E2E_EMAIL) doit être défini').to.be.a('string').and.not.be.empty;
    expect(password, 'CYPRESS_E2E_PASSWORD (ou env.E2E_PASSWORD) doit être défini').to.be.a('string').and.not.be.empty;

    cy.viewport(1280, 800);
    login(email, password);
    assertRedirectAfterLogin('desktop');
  });

  it('Mobile: login -> redirection vers /mobile (ou /select-workspace)', function () {
    const { email, password } = getCredentials();
    expect(email, 'CYPRESS_E2E_EMAIL (ou env.E2E_EMAIL) doit être défini').to.be.a('string').and.not.be.empty;
    expect(password, 'CYPRESS_E2E_PASSWORD (ou env.E2E_PASSWORD) doit être défini').to.be.a('string').and.not.be.empty;

    cy.viewport(390, 844);
    login(email, password);
    assertRedirectAfterLogin('mobile');
  });
});
