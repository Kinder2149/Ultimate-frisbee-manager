import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContentItem } from '../models/content-item.model';
import { Exercice } from '../../../core/models/exercice.model';
import { Entrainement } from '../../../core/models/entrainement.model';
import { Echauffement } from '../../../core/models/echauffement.model';
import { SituationMatch } from '../../../core/models/situationmatch.model';

import { ExerciceService } from '../../../core/services/exercice.service';
import { EntrainementService } from '../../../core/services/entrainement.service';
import { EchauffementService } from '../../../core/services/echauffement.service';
import { SituationMatchService } from '../../../core/services/situationmatch.service';

export interface CacheOptions {
  forceRefresh?: boolean;
}

/**
 * Service d'agrégation des données pour la vue mobile.
 * Consomme les 4 services core et expose des ContentItem[] unifiés.
 * 
 * Responsabilités :
 * - Charger tous les contenus (exercices, entraînements, échauffements, situations)
 * - Transformer les modèles core en ContentItem
 * - Charger un contenu par type et ID
 * - Déléguer le cache aux services core
 */
@Injectable({
  providedIn: 'root'
})
export class MobileDataService {
  constructor(
    private exerciceService: ExerciceService,
    private entrainementService: EntrainementService,
    private echauffementService: EchauffementService,
    private situationMatchService: SituationMatchService
  ) {}

  /**
   * Charge tous les contenus de tous les types.
   * @param options Options de cache (forceRefresh, etc.)
   * @returns Observable<ContentItem[]> Liste unifiée de tous les contenus
   */
  getAllContent(options: CacheOptions = {}): Observable<ContentItem[]> {
    return forkJoin({
      exercices: this.exerciceService.getExercices(options),
      entrainements: this.entrainementService.getEntrainements(options),
      echauffements: this.echauffementService.getEchauffements(options),
      situationsMatchs: this.situationMatchService.getSituationsMatchs(options)
    }).pipe(
      map(data => this.transformAllToContentItems(data))
    );
  }

  /**
   * Charge un contenu spécifique par type et ID.
   * @param type Type de contenu ('exercice', 'entrainement', 'echauffement', 'situation')
   * @param id ID du contenu
   * @param options Options de cache
   * @returns Observable<ContentItem> Contenu transformé
   */
  getContentById(
    type: ContentItem['type'],
    id: string,
    options: CacheOptions = {}
  ): Observable<ContentItem> {
    switch (type) {
      case 'exercice':
        return this.exerciceService.getExerciceById(id, options).pipe(
          map(exercice => this.mapExercice(exercice))
        );
      case 'entrainement':
        return this.entrainementService.getEntrainementById(id, options).pipe(
          map(entrainement => this.mapEntrainement(entrainement))
        );
      case 'echauffement':
        return this.echauffementService.getEchauffementById(id, options).pipe(
          map(echauffement => this.mapEchauffement(echauffement))
        );
      case 'situation':
        return this.situationMatchService.getSituationMatchById(id, options).pipe(
          map(situation => this.mapSituation(situation))
        );
      default:
        throw new Error(`Type de contenu inconnu: ${type}`);
    }
  }

  /**
   * Transforme toutes les données core en ContentItem[].
   */
  private transformAllToContentItems(data: {
    exercices: Exercice[];
    entrainements: Entrainement[];
    echauffements: Echauffement[];
    situationsMatchs: SituationMatch[];
  }): ContentItem[] {
    const items: ContentItem[] = [];

    data.exercices.forEach(exercice => {
      if (exercice.id) {
        items.push(this.mapExercice(exercice));
      }
    });

    data.entrainements.forEach(entrainement => {
      if (entrainement.id) {
        items.push(this.mapEntrainement(entrainement));
      }
    });

    data.echauffements.forEach(echauffement => {
      if (echauffement.id) {
        items.push(this.mapEchauffement(echauffement));
      }
    });

    data.situationsMatchs.forEach(situation => {
      if (situation.id) {
        items.push(this.mapSituation(situation));
      }
    });

    return items;
  }

  /**
   * Transforme un Exercice en ContentItem.
   */
  private mapExercice(exercice: Exercice): ContentItem {
    return {
      id: exercice.id!,
      type: 'exercice',
      title: exercice.nom,
      description: exercice.description,
      createdAt: new Date(exercice.createdAt!),
      tags: exercice.tags,
      imageUrl: exercice.imageUrl,
      originalData: exercice
    };
  }

  /**
   * Transforme un Entrainement en ContentItem.
   */
  private mapEntrainement(entrainement: Entrainement): ContentItem {
    return {
      id: entrainement.id!,
      type: 'entrainement',
      title: entrainement.titre,
      createdAt: new Date(entrainement.createdAt!),
      tags: entrainement.tags,
      duree: this.calculateDureeEntrainement(entrainement),
      originalData: entrainement
    };
  }

  /**
   * Transforme un Echauffement en ContentItem.
   */
  private mapEchauffement(echauffement: Echauffement): ContentItem {
    return {
      id: echauffement.id!,
      type: 'echauffement',
      title: echauffement.nom,
      description: echauffement.description,
      createdAt: new Date(echauffement.createdAt!),
      nombreBlocs: echauffement.blocs?.length || 0,
      originalData: echauffement
    };
  }

  /**
   * Transforme une SituationMatch en ContentItem.
   */
  private mapSituation(situation: SituationMatch): ContentItem {
    return {
      id: situation.id!,
      type: 'situation',
      title: situation.nom || 'Sans titre',
      description: situation.description,
      createdAt: new Date(situation.createdAt!),
      tags: situation.tags,
      imageUrl: situation.imageUrl,
      originalData: situation
    };
  }

  /**
   * Calcule la durée totale d'un entraînement.
   */
  private calculateDureeEntrainement(entrainement: Entrainement): number {
    if (!entrainement.exercices || entrainement.exercices.length === 0) {
      return 0;
    }
    return entrainement.exercices.reduce((total, ex) => {
      if (!ex.duree) return total;
      const duree = typeof ex.duree === 'number' ? ex.duree : parseInt(String(ex.duree), 10) || 0;
      return total + duree;
    }, 0);
  }
}
