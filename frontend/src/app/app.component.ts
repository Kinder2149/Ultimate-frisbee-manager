import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Ultimate Frisbee Manager';
  
  isDropdownOpen = {
    add: false,
    exercices: false,
    entrainements: false,
    echauffements: false,
    situations: false
  };

  constructor(private cdr: ChangeDetectorRef) {}

  toggleDropdown(menu: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Toggle dropdown:', menu, 'Current state:', (this.isDropdownOpen as any)[menu]);
    
    // Fermer tous les autres menus
    Object.keys(this.isDropdownOpen).forEach(key => {
      if (key !== menu) {
        (this.isDropdownOpen as any)[key] = false;
      }
    });
    
    // Basculer le menu sélectionné
    (this.isDropdownOpen as any)[menu] = !(this.isDropdownOpen as any)[menu];
    
    console.log('New state:', (this.isDropdownOpen as any)[menu]);
    console.log('All dropdown states:', this.isDropdownOpen);
    
    // Force la détection des changements Angular
    this.cdr.detectChanges();
    
    console.log('DOM Element for', menu, ':', document.querySelector(`.dropdown.${menu} .dropdown-menu`));
    
    // Vérification après détection forcée
    setTimeout(() => {
      console.log('After timeout - dropdown state for', menu, ':', (this.isDropdownOpen as any)[menu]);
      console.log('DOM Element after timeout:', document.querySelector(`.dropdown.${menu} .dropdown-menu`));
    }, 100);
  }

  closeAllDropdowns(): void {
    Object.keys(this.isDropdownOpen).forEach(key => {
      (this.isDropdownOpen as any)[key] = false;
    });
  }
}
