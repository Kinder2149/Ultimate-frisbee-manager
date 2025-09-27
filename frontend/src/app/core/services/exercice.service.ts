import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Exercice } from '../models/exercice.model';
import { EntityCrudService } from '../../shared/services/entity-crud.service';

@Injectable({
  providedIn: 'root'
})
export class ExerciceService {
  private exerciceCrudService: EntityCrudService<Exercice>;

  constructor(private entityCrudService: EntityCrudService<Exercice>) {
    this.exerciceCrudService = this.entityCrudService.configure('exercices', {
      // Le backend gère maintenant la transformation des données,
      // le frontend envoie des données brutes.
      // La gestion de l'upload de fichier est également gérée par le backend.
      fileUploadField: 'image'
    });
  }

  getExercices(): Observable<Exercice[]> {
    return this.exerciceCrudService.getAll();
  }

  getExerciceById(id: string): Observable<Exercice> {
    return this.exerciceCrudService.getById(id);
  }

  createExercice(data: Partial<Exercice>): Observable<Exercice> {
    return this.exerciceCrudService.create(data as Exercice).pipe(
      tap(() => this.exerciceCrudService.invalidateCache())
    );
  }

  updateExercice(id: string, data: Partial<Exercice>): Observable<Exercice> {
    return this.exerciceCrudService.update(id, data as Exercice).pipe(
      tap(() => this.exerciceCrudService.invalidateCache())
    );
  }

  deleteExercice(id: string): Observable<void> {
    return this.exerciceCrudService.delete(id).pipe(
      tap(() => this.exerciceCrudService.invalidateCache())
    );
  }

  duplicateExercice(id: string): Observable<Exercice> {
    const endpoint = `exercices/${id}/duplicate`;
    return this.exerciceCrudService.http.post<Exercice>(endpoint, {}).pipe(
      tap(() => this.exerciceCrudService.invalidateCache())
    );
  }
}