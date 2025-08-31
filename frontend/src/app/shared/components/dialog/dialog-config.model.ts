/**
 * Interface de configuration pour les dialogues génériques
 * Permet de paramétrer facilement le comportement et l'apparence des dialogues
 */
export interface DialogConfig {
  // Configuration du titre et des boutons
  title: string;
  closeButtonText?: string;
  submitButtonText?: string;
  
  // Options d'affichage
  showSubmitButton?: boolean;
  showCloseButton?: boolean;
  hideDialogActions?: boolean; // Masquer complètement la section des actions
  
  // Style et dimensions
  width?: string;
  maxWidth?: string;
  minWidth?: string;
  height?: string;
  maxHeight?: string;
  minHeight?: string;
  panelClass?: string | string[]; // Classe(s) CSS appliquées au MatDialog
  
  // Comportement
  disableClose?: boolean; // Désactive la fermeture en cliquant à l'extérieur
  dangerAction?: boolean; // Indique si l'action est dangereuse (suppression, etc.)
  
  // Données personnalisées
  customData?: unknown; // Données à passer au dialogue
}

/**
 * Interface pour le résultat d'un dialogue
 * @template T Type des données retournées par le dialogue
 */
export interface DialogResult<T = any> {
  /**
   * Action réalisée par l'utilisateur
   * - submit: validation du formulaire
   * - cancel: annulation explicite
   * - delete: suppression d'un élément
   * - close: fermeture du dialogue (clic extérieur, ESC)
   */
  action: 'submit' | 'cancel' | 'delete' | 'close' | string;
  
  /**
   * Données retournées par le dialogue
   * Présent uniquement si action === 'submit' ou 'delete'
   */
  data?: T;
}
