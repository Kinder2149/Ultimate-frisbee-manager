/**
 * Interface pour les événements de pagination
 * Utilisé pour typer correctement les événements de changement de page
 */
export interface PaginationEvent {
  /**
   * Numéro de la page actuelle
   */
  page: number;
  
  /**
   * Nombre d'éléments par page
   */
  pageSize: number;
  
  /**
   * Nombre total d'éléments (optionnel, peut être défini plus tard)
   */
  totalItems?: number;
}
