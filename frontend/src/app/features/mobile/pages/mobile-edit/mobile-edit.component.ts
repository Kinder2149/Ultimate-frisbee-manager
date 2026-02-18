import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mobile-edit',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Chargement...</div>`
})
export class MobileEditComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const type = params['type'];
      const id = params['id'];
      
      if (!type || !id) {
        this.router.navigate(['/mobile/library']);
        return;
      }

      // Rediriger vers le composant de création approprié en mode édition
      const routes: Record<string, string> = {
        exercice: '/mobile/edit/exercice',
        entrainement: '/mobile/edit/entrainement',
        echauffement: '/mobile/edit/echauffement',
        situation: '/mobile/edit/situation'
      };

      const targetRoute = routes[type];
      if (targetRoute) {
        this.router.navigate([targetRoute, id]);
      } else {
        this.router.navigate(['/mobile/library']);
      }
    });
  }
}
