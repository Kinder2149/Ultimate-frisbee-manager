import { Tag } from "../../../core/models/tag.model";

/**
 * Interface pour la suggestion de tags
 */
export interface TagSuggestion {
  id: string;
  label: string;
  category: string;
  confidence?: number;
  source?: string;
  selected?: boolean;
  color?: string;
  level?: number;
}

/**
 * Interface pour le mapping des tags
 */
export interface TagMapping {
  sourceTag: {
    label: string;
    color?: string;
    confidence?: number;
  };
  suggestions: TagSuggestion[];
  mappedTag?: Partial<Tag>;
  validated?: boolean;
  ignored?: boolean;
}
