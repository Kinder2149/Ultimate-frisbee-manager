import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SituationMatch } from '../../../../core/models/situationmatch.model';
import { SituationMatchService } from '../../../../core/services/situationmatch.service';
import { SituationMatchViewComponent } from '../../../../shared/components/situationmatch-view/situationmatch-view.component';

@Component({
  selector: 'app-situationmatch-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, SituationMatchViewComponent],
  templateUrl: './situationmatch-detail.component.html',
  styleUrls: ['./situationmatch-detail.component.css']
})
export class SituationMatchDetailComponent implements OnInit {
  situationMatch: SituationMatch | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private situationMatchService: SituationMatchService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('[SituationMatchDetail] Param id =', id);
    if (!id) {
      this.snackBar.open('Identifiant invalide', 'Fermer', { duration: 3000 });
      this.router.navigate(['/situations-matchs']);
      return;
    }

    this.loading = true;
    this.situationMatchService.getSituationMatchById(id).subscribe({
      next: (sm) => {
        this.situationMatch = sm;
        this.loading = false;
        console.log('[SituationMatchDetail] Chargé:', sm?.id, sm?.nom || sm?.type);
      },
      error: (err) => {
        console.error('[SituationMatchDetail] Erreur chargement', err);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement de la situation/match', 'Fermer', { duration: 3000 });
      }
    });
  }

  retourListe(): void {
    this.router.navigate(['/situations-matchs']);
  }
}

