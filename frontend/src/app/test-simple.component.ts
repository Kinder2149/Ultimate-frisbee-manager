import { Component } from '@angular/core';

@Component({
  selector: 'app-test-simple',
  template: `
    <div style="background: purple; color: white; padding: 50px; font-size: 30px; text-align: center;">
      <h1>🟣 COMPOSANT TEST ULTRA-SIMPLE 🟣</h1>
      <p>Si vous voyez ce texte violet, Angular fonctionne !</p>
      <p>Pas de dépendances, pas de modules complexes</p>
      <p>Test basique : {{ testMessage }}</p>
    </div>
  `
})
export class TestSimpleComponent {
  testMessage = 'SUCCÈS - Composant chargé !';
  
  constructor() {
    console.log('🟣 TestSimpleComponent créé avec succès');
  }
}
