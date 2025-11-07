import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrainingSimple, TrainingSimpleCreate } from '../models/training.simple';
import { EntityCrudService, CrudOptions } from '../../shared/services/entity-crud.service';

@Injectable({
  providedIn: 'root'
})
export class TrainingSimpleService {
  private readonly endpoint = 'entrainements-simple';
  private readonly crudOptions: Partial<CrudOptions<TrainingSimple>> = {
    cachePrefix: 'training',
    cacheTTL: 300,
    useCache: true,
    transformBeforeSend: (entity: TrainingSimple): Partial<TrainingSimple> => ({
      titre: entity.titre
    })
  };

  constructor(private readonly crudService: EntityCrudService<TrainingSimple>) {}

  public getAllTrainings(): Observable<TrainingSimple[]> {
    return this.crudService.getAll(this.endpoint, this.crudOptions);
  }

  public createTraining(training: TrainingSimpleCreate): Observable<TrainingSimple> {
    if (!training?.titre?.trim()) {
      throw new Error('Le titre de l\'entraînement est requis');
    }
    this.invalidateCache();
    const trainingToCreate: TrainingSimple = {
      ...training,
      id: '',
      date: training.date || new Date().toISOString().split('T')[0]
    };
    return this.crudService.create(this.endpoint, trainingToCreate, this.crudOptions);
  }

  public deleteTraining(id: string): Observable<void> {
    if (!id?.trim()) {
      throw new Error('Un identifiant valide est requis pour supprimer un entraînement');
    }
    this.invalidateCache();
    return this.crudService.delete(this.endpoint, id, this.crudOptions);
  }

  public getTrainingById(id: string): Observable<TrainingSimple> {
    if (!id?.trim()) {
      throw new Error('Un identifiant valide est requis pour récupérer un entraînement');
    }
    return this.crudService.getById(this.endpoint, id, this.crudOptions);
  }

  public updateTraining(id: string, training: TrainingSimpleCreate): Observable<TrainingSimple> {
    if (!id?.trim() || !training?.titre?.trim()) {
      throw new Error('Un ID et un titre valides sont requis');
    }
    this.invalidateCache();
    const trainingToUpdate: TrainingSimple = { ...training, id };
    return this.crudService.update(this.endpoint, id, trainingToUpdate, this.crudOptions);
  }

  public invalidateCache(): void {
    (this.crudService as any).invalidateListCache(this.endpoint, { cachePrefix: 'training' });
  }
}
