/**
 * Modèles TypeScript pour les échauffements
 */

export interface BlocEchauffement {
  id?: string;
  echauffementId?: string;
  ordre?: number;
  titre?: string;
  repetitions?: string;
  temps?: string;
  informations?: string;
  fonctionnement?: string;
  notes?: string;
  createdAt?: Date;
  [key: string]: any;
}

export interface Echauffement {
  id?: string;
  nom?: string;
  description?: string;
  createdAt?: Date;
  blocs?: BlocEchauffement[];
  [key: string]: any;
}

export interface CreateEchauffementRequest {
  nom: string;
  description: string;
  blocs: BlocEchauffement[];
}

export interface UpdateEchauffementRequest {
  nom: string;
  description: string;
  blocs: BlocEchauffement[];
}
