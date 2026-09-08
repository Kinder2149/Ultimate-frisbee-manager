import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LexiqueService } from '../../../core/services/lexique.service';
import { Lexique, LEXIQUE_CATEGORIES, LexiqueCategorie } from '../../../core/models/lexique.model';

/**
 * Page de consultation du lexique (vocabulaire commun du club)
 */
@Component({
  selector: 'app-lexique-list',
  templateUrl: './lexique-list.component.html',
  styleUrls: ['./lexique-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LexiqueListComponent implements OnInit {
  lexiques: Lexique[] = [];
  categories = LEXIQUE_CATEGORIES;
  selectedCategorie: LexiqueCategorie | '' = '';
  errorMessage = '';

  constructor(private lexiqueService: LexiqueService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.lexiqueService.getAll(this.selectedCategorie || undefined).subscribe({
      next: (data) => {
        this.lexiques = data;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Erreur lors du chargement du lexique:', err);
        this.errorMessage = 'Impossible de charger le lexique.';
      }
    });
  }

  onFilterChange(): void {
    this.load();
  }
}
