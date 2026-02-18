import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { MobileHeaderComponent } from '../../components/mobile-header/mobile-header.component';
import { MobileNavigationService } from '../../../../core/services/mobile-navigation.service';
import { Entrainement } from '../../../../core/models/entrainement.model';

@Component({
  selector: 'app-mobile-terrain',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MobileHeaderComponent
  ],
  templateUrl: './mobile-terrain.component.html',
  styleUrls: ['./mobile-terrain.component.scss']
})
export class MobileTerrainComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private notesChange$ = new Subject<string>();
  
  timerRunning = false;
  timerSeconds = 0;
  timerInterval: any;

  activeTraining$ = this.mobileNavigationService.activeTraining$;
  favorites$ = this.mobileNavigationService.favorites$;

  sessionNotes = '';
  notesSaved = false;
  private notesTimeout: any;

  constructor(
    private mobileNavigationService: MobileNavigationService
  ) {}

  ngOnInit(): void {
    this.mobileNavigationService.setCurrentTab('terrain');
    this.mobileNavigationService.enableTerrainMode();
    this.loadNotes();
    this.setupNotesAutoSave();
  }

  ngOnDestroy(): void {
    this.mobileNavigationService.disableTerrainMode();
    this.stopTimer();
    this.saveNotes();
    if (this.notesTimeout) {
      clearTimeout(this.notesTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  startTimer(): void {
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
    }, 1000);
  }

  pauseTimer(): void {
    this.timerRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  stopTimer(): void {
    this.timerRunning = false;
    this.timerSeconds = 0;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private setupNotesAutoSave(): void {
    this.notesChange$
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.saveNotes();
        this.notesSaved = true;
        if (this.notesTimeout) {
          clearTimeout(this.notesTimeout);
        }
        this.notesTimeout = setTimeout(() => {
          this.notesSaved = false;
        }, 2000);
      });
  }

  onNotesChange(): void {
    this.notesChange$.next(this.sessionNotes);
  }

  private loadNotes(): void {
    try {
      const saved = localStorage.getItem('ufm.mobile.terrain.notes');
      if (saved) {
        this.sessionNotes = saved;
      }
    } catch (error) {
      console.error('Erreur chargement notes:', error);
    }
  }

  private saveNotes(): void {
    try {
      localStorage.setItem('ufm.mobile.terrain.notes', this.sessionNotes);
    } catch (error) {
      console.error('Erreur sauvegarde notes:', error);
    }
  }
}
