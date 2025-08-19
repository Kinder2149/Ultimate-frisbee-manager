import { Injectable } from '@angular/core';

/**
 * Interface générique pour les entités avec un identifiant
 */
export interface EntityWithId {
  id: string;
  [key: string]: unknown;
}

/**
 * Configuration de mappage pour un attribut
 */
export interface AttributeMapping<T = unknown> {
  /** Chemin source (avec support pour la notation par points) */
  source: string;
  /** Chemin de destination (avec support pour la notation par points) */
  target: string;
  /** Fonction de transformation optionnelle */
  transform?: (value: unknown, sourceObj: Record<string, unknown>) => T;
  /** Valeur par défaut si la source est manquante */
  defaultValue?: T;
}

/**
 * Configuration de mappage pour une entité
 */
export interface EntityMapping {
  /** Attributs à mapper */
  attributes: AttributeMapping[];
  /** Mappage des collections enfants */
  collections?: {
    [collectionName: string]: EntityMapping;
  };
}

/**
 * Service générique pour le mappage de données
 * Permet de transformer les structures de données entre différents formats
 * avec un minimum de code spécifique
 */
@Injectable({
  providedIn: 'root'
})
export class MapperService {

  constructor() { }

  /**
   * Mappe un objet source vers un objet cible selon une configuration de mappage
   * @param source Objet source
   * @param mapping Configuration de mappage
   * @returns Objet transformé
   */
  map<T = Record<string, unknown>>(source: Record<string, unknown>, mapping: EntityMapping): T {
    if (!source) return {} as T;
    
    const result: Record<string, unknown> = {};
    
    // Mapper les attributs simples
    for (const attr of mapping.attributes) {
      this.mapAttribute(source, result, attr);
    }
    
    // Mapper les collections
    if (mapping.collections) {
      for (const [collectionName, collectionMapping] of Object.entries(mapping.collections)) {
        const sourceCollection = this.getValueByPath(source, collectionName);
        
        if (Array.isArray(sourceCollection)) {
          result[collectionName] = sourceCollection.map(item => 
            this.map(item, collectionMapping)
          );
        } else {
          result[collectionName] = [];
        }
      }
    }
    
    return result as T;
  }
  
  /**
   * Mappe un attribut spécifique de l'objet source vers l'objet cible
   * @param source Objet source
   * @param target Objet cible
   * @param mapping Configuration de mappage pour l'attribut
   */
  private mapAttribute(source: Record<string, unknown>, target: Record<string, unknown>, mapping: AttributeMapping): void {
    let value = this.getValueByPath(source, mapping.source);
    
    // Appliquer la transformation si définie
    if (mapping.transform && value !== undefined) {
      try {
        value = mapping.transform(value, source);
      } catch (error) {
        console.error(`Erreur lors de la transformation de ${mapping.source}:`, error);
        value = mapping.defaultValue;
      }
    }
    
    // Utiliser la valeur par défaut si nécessaire
    if (value === undefined || value === null) {
      value = mapping.defaultValue;
    }
    
    // Définir la valeur dans l'objet cible
    this.setValueByPath(target, mapping.target, value);
  }
  
  /**
   * Récupère une valeur d'un objet en utilisant une notation par points
   * Par exemple: "user.address.city" -> obj.user.address.city
   * @param obj Objet source
   * @param path Chemin de la propriété
   * @returns Valeur trouvée ou undefined
   */
  getValueByPath(obj: Record<string, unknown>, path: string): unknown {
    if (!obj || !path) return undefined;
    
    const parts = path.split('.');
    let current: unknown = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      if (typeof current === 'object' && current !== null) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
  
  /**
   * Définit une valeur dans un objet en utilisant une notation par points
   * Par exemple: "user.address.city" -> obj.user.address.city = value
   * @param obj Objet cible
   * @param path Chemin de la propriété
   * @param value Valeur à définir
   */
  setValueByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
    if (!obj || !path) return;
    
    const parts = path.split('.');
    let current: Record<string, unknown> = obj;
    
    // Parcourir tous les segments sauf le dernier
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      // Créer l'objet intermédiaire s'il n'existe pas
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      
      current = current[part] as Record<string, unknown>;
    }
    
    // Définir la valeur finale
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }
  
  /**
   * Crée un mappeur spécialisé pour un type d'entité spécifique
   * @param mapping Configuration de mappage pour le type d'entité
   * @returns Fonction de mappage spécialisée
   */
  createEntityMapper<TSource extends Record<string, unknown>, TTarget>(mapping: EntityMapping): (source: TSource) => TTarget {
    return (source: TSource) => this.map<TTarget>(source, mapping);
  }
  
  /**
   * Crée un mappeur pour une collection d'entités
   * @param mapping Configuration de mappage pour le type d'entité
   * @returns Fonction de mappage pour une collection
   */
  createCollectionMapper<TSource extends Record<string, unknown>, TTarget>(mapping: EntityMapping): (sources: TSource[]) => TTarget[] {
    return (sources: TSource[]) => {
      if (!sources || !Array.isArray(sources)) return [];
      return sources.map(source => this.map<TTarget>(source, mapping));
    };
  }
}
