/**
 * Interface de base pour tous les modèles de données
 * Définit les propriétés communes à tous les objets
 */
export interface BaseModel {
  /**
   * Identifiant unique de l'objet
   */
  id: string;
  
  /**
   * Date de création de l'objet (optionnelle)
   */
  createdAt?: Date | string;
  
  /**
   * Date de dernière mise à jour de l'objet (optionnelle)
   */
  updatedAt?: Date | string;
}
