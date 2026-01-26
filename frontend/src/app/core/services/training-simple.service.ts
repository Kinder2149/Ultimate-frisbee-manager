import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainingSimple, TrainingSimpleCreate } from '../models/training.simple';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingSimpleService {
  private readonly apiUrl = `${environment.apiUrl}/entrainements-simple`;

  constructor(private http: HttpClient) {}

  public getAllTrainings(): Observable<TrainingSimple[]> {
    return this.http.get<TrainingSimple[]>(this.apiUrl);
  }

  public createTraining(training: TrainingSimpleCreate): Observable<TrainingSimple> {
    if (!training?.titre?.trim()) {
      throw new Error('Le titre de l\'entraînement est requis');
    }
    const trainingToCreate: TrainingSimple = {
      ...training,
      id: '',
      date: training.date || new Date().toISOString().split('T')[0]
    };
    return this.http.post<TrainingSimple>(this.apiUrl, trainingToCreate);
  }

  public deleteTraining(id: string): Observable<void> {
    if (!id?.trim()) {
      throw new Error('Un identifiant valide est requis pour supprimer un entraînement');
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  public getTrainingById(id: string): Observable<TrainingSimple> {
    if (!id?.trim()) {
      throw new Error('Un identifiant valide est requis pour récupérer un entraînement');
    }
    return this.http.get<TrainingSimple>(`${this.apiUrl}/${id}`);
  }

  public updateTraining(id: string, training: TrainingSimpleCreate): Observable<TrainingSimple> {
    if (!id?.trim() || !training?.titre?.trim()) {
      throw new Error('Un ID et un titre valides sont requis');
    }
    const trainingToUpdate: TrainingSimple = { ...training, id };
    return this.http.put<TrainingSimple>(`${this.apiUrl}/${id}`, trainingToUpdate);
  }
}
