/**
 * Modèles TypeScript pour les échauffements
 */

export interface BlocEchauffement {
  id?: string;
  echauffementId: string;
  ordre: number;
  titre: string;
  repetitions?: string;
  temps?: string;
  informations?: string;
  fonctionnement?: string;
  notes?: string;
  createdAt?: Date;
}

export interface Echauffement {
  id?: string;
  nom: string;
  description?: string;
  imageUrl?: string;
  createdAt?: Date;
  blocs?: BlocEchauffement[];
}
