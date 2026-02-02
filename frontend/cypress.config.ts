/// <reference types="node" />
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on: any, config: any) {
      // implement node event listeners here
      // Permettre de passer des credentials via env sans les hardcoder dans les specs
      config.env.E2E_EMAIL = config.env.E2E_EMAIL || process.env.CYPRESS_E2E_EMAIL;
      config.env.E2E_PASSWORD = config.env.E2E_PASSWORD || process.env.CYPRESS_E2E_PASSWORD;
      return config;
    },
  },
});
