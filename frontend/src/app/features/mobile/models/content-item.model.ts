import { Exercice } from '../../../core/models/exercice.model';
import { Entrainement } from '../../../core/models/entrainement.model';
import { Echauffement } from '../../../core/models/echauffement.model';
import { SituationMatch } from '../../../core/models/situationmatch.model';
import { Tag } from '../../../core/models/tag.model';

export type CategoryType = 'all' | 'exercice' | 'entrainement' | 'echauffement' | 'situation';
export type SortOrder = 'recent' | 'old';

export interface ContentItem {
  id: string;
  type: 'exercice' | 'entrainement' | 'echauffement' | 'situation';
  title: string;
  description?: string;
  createdAt: Date;
  tags?: Tag[];
  imageUrl?: string;
  
  duree?: number;
  nombreBlocs?: number;
  
  originalData: Exercice | Entrainement | Echauffement | SituationMatch;
}
