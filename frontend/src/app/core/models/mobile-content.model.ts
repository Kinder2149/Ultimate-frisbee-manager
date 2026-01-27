/**
 * Modèles TypeScript pour la vue mobile "Exploration & Accès Rapide"
 * Architecture Netflix-like avec sections dynamiques
 */

import { Tag } from './tag.model';

/**
 * Types de contenu disponibles dans l'application
 */
export type ContentTypeId = 'exercices' | 'entrainements' | 'echauffements' | 'situations';

/**
 * Configuration globale de la vue mobile
 */
export interface ContentConfig {
  availableContentTypes: ContentType[];
  currentWorkspace: WorkspaceInfo;
  userPermissions: UserPermissions;
}

/**
 * Type de contenu avec ses catégories
 */
export interface ContentType {
  id: ContentTypeId;
  label: string;
  icon: string;
  categories: Category[];
}

/**
 * Catégorie métier (ex: "Technique", "Physique", "Tactique")
 */
export interface Category {
  id: string;
  label: string;
  contentType: ContentTypeId;
  order: number;
}

/**
 * Information workspace minimal
 */
export interface WorkspaceInfo {
  id: string;
  name: string;
}

/**
 * Permissions utilisateur par type de contenu
 */
export interface UserPermissions {
  [contentType: string]: {
    canRead: boolean;
    canCreate: boolean;
    canEdit: boolean;
  };
}

/**
 * Filtre disponible pour un type de contenu
 */
export interface Filter {
  id: string;
  label: string;
  type: 'single' | 'multiple' | 'range';
  values: FilterValue[];
  compatibleCategories?: string[];
}

/**
 * Valeur d'un filtre
 */
export interface FilterValue {
  id: string;
  label: string;
  count?: number;
}

/**
 * Section de contenu dynamique (ex: "Récents", "Plus utilisés")
 */
export interface ContentSection {
  id: string;
  label: string;
  type: 'carousel' | 'grid' | 'list';
  items: ContentItem[];
  order: number;
  totalCount: number;
}

/**
 * Item de contenu unifié (exercice, entraînement, etc.)
 */
export interface ContentItem {
  id: string;
  type: ContentTypeId;
  title: string;
  metadata: ContentMetadata;
  permissions: ItemPermissions;
}

/**
 * Métadonnées d'un item de contenu
 */
export interface ContentMetadata {
  duration?: string;
  imageUrl?: string;
  tags?: Tag[];
  isFavorite?: boolean;
  isRecent?: boolean;
  lastUsed?: Date;
  createdAt?: Date;
  description?: string;
}

/**
 * Permissions sur un item individuel
 */
export interface ItemPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Paramètres pour récupérer les sections de contenu
 */
export interface ContentParams {
  contentType: ContentTypeId;
  category?: string;
  filters?: { [filterId: string]: string | string[] };
  searchTerm?: string;
}

/**
 * État global de la vue mobile
 */
export interface MobileContentState {
  activeContentType: ContentTypeId;
  activeCategory: string | null;
  activeFilters: { [filterId: string]: string | string[] };
  searchTerm: string;
  sections: ContentSection[];
  availableCategories: Category[];
  availableFilters: Filter[];
  isLoading: boolean;
  error: string | null;
}

/**
 * État des filtres
 */
export interface FiltersState {
  activeFilters: { [filterId: string]: string | string[] };
  showFavoritesOnly: boolean;
  showRecentsOnly: boolean;
}
