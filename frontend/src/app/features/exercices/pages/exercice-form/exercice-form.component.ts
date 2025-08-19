import { Component, OnInit, ElementRef, HostListener, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExerciceService } from '../../../../core/services/exercice.service';
import { TagService } from '../../../../core/services/tag.service';
import { Exercice } from '../../../../core/models/exercice.model';
import { Tag, TagCategory } from '../../../../core/models/tag.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Import du composant personnalisé de variables d'exercice
import { ExerciceVariablesComponent, ExerciceVariables } from '../../../../shared/components/exercice-variables/exercice-variables.component';

// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Composant de formulaire de création et édition d'exercices
 * Permet d'ajouter un nouvel exercice ou de modifier un exercice existant avec des tags associés
 * Fonctionne en deux modes : création et édition
 */
@Component({
  selector: 'app-exercice-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ExerciceVariablesComponent
  ],
  templateUrl: './exercice-form.component.html',
  styleUrls: ['./exercice-form.component.css']
})
export class ExerciceFormComponent implements OnInit {
  exerciceForm: FormGroup = this.formBuilder.group({
    nom: ['', Validators.required],
    description: ['', Validators.required],
    objectif: ['', Validators.required],
    imageUrl: [''],
    schemaUrl: [''],
    variables: [{ variablesPlus: [], variablesMinus: [] }],
    // Ajout de contrôles pour les autres catégories de tags pour assurer la détection des changements
    niveauTags: [''],
    tempsTags: [''], 
    formatTags: ['']
  });
  submitted = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  // Mode édition - peut être contrôlé depuis l'extérieur ou en interne
  @Input() editMode: boolean = false;
  @Input() exerciceToEdit: Exercice | null = null;
  @Input() ignoreRouteParams: boolean = false;
  exerciceId: string | null = null;
  
  // Référence au composant de variables pour migration si nécessaire
  @ViewChild(ExerciceVariablesComponent) variablesComponent?: ExerciceVariablesComponent;
  
  // Événements pour notifier le parent
  @Output() exerciceCreated = new EventEmitter<Exercice>();
  @Output() exerciceUpdated = new EventEmitter<Exercice>();
  @Output() formCancelled = new EventEmitter<void>();
  
  // Tableaux pour les tags sélectionnés
  selectedTravailSpecifiqueTags: Tag[] = [];
  selectedNiveauTags: Tag[] = [];
  selectedObjectifTag: Tag | null = null;
  selectedTempsTags: Tag[] = [];
  selectedFormatTags: Tag[] = [];
  
  // Listes des tags disponibles par catégorie
  objectifTags: Tag[] = [];
  travailSpecifiqueTags: Tag[] = [];
  niveauTags: Tag[] = [];
  tempsTags: Tag[] = [];
  formatTags: Tag[] = [];
  
  // Filtres pour l'autocomplétion
  travailSpecifiqueFilter: string = '';
  niveauFilter: string = '';
  tempsFilter: string = '';
  formatFilter: string = '';
  
  // Interface pour gérer l'affichage des options filtrées
  filteredTravailSpecifiqueTags: Tag[] = [];
  filteredNiveauTags: Tag[] = [];
  filteredTempsTags: Tag[] = [];
  filteredFormatTags: Tag[] = [];
  
  // État des dropdowns
  showTravailSpecifiqueDropdown: boolean = false;
  showNiveauDropdown: boolean = false;
  showTempsDropdown: boolean = false;
  showFormatDropdown: boolean = false;

  /**
   * Gestionnaire de clics sur le document pour fermer les dropdowns
   * @param event L'événement de clic
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Vérifier si le clic est en dehors des conteneurs d'autocomplete
    const travailSpecifiqueContainer = document.querySelector('#travailSpecifiqueSearch')?.closest('.autocomplete-container');
    // Variable container supprimé
    const niveauContainer = document.querySelector('#niveauSearch')?.closest('.autocomplete-container');
    const tempsContainer = document.querySelector('#tempsSearch')?.closest('.autocomplete-container');
    const formatContainer = document.querySelector('#formatSearch')?.closest('.autocomplete-container');
    
    // Fermer la dropdown des éléments si le clic est en dehors
    if (travailSpecifiqueContainer && !travailSpecifiqueContainer.contains(event.target as Node)) {
      this.showTravailSpecifiqueDropdown = false;
    }
    
    // Dropdown des variables supprimée
    
    // Fermer la dropdown des niveaux si le clic est en dehors
    if (niveauContainer && !niveauContainer.contains(event.target as Node)) {
      this.showNiveauDropdown = false;
    }
    
    // Fermer la dropdown des temps si le clic est en dehors
    if (tempsContainer && !tempsContainer.contains(event.target as Node)) {
      this.showTempsDropdown = false;
    }
    
    // Fermer la dropdown des formats si le clic est en dehors
    if (formatContainer && !formatContainer.contains(event.target as Node)) {
      this.showFormatDropdown = false;
    }
  }
  
  constructor(
    private formBuilder: FormBuilder,
    private exerciceService: ExerciceService,
    private tagService: TagService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialiser le formulaire
    this.initForm();
    
    // Charger les tags pour les autocompletes
    this.loadAllTags();
    
    // Vérifier si on est en mode édition
    if (this.exerciceToEdit) {
      // Mode intégré avec @Input
      this.exerciceId = this.exerciceToEdit.id as string;
      this.editMode = true;
      this.populateFormWithExercice(this.exerciceToEdit);
    } else if (!this.editMode && !this.ignoreRouteParams) {
      // Mode autonome, utiliser les paramètres de l'URL seulement si pas en mode modal
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.exerciceId = id as string;
          this.editMode = true;
          this.loadExercice(id);
        }
      });
    }
  }
  
  /**
   * Charge un exercice existant pour édition
   * @param id Identifiant de l'exercice à modifier
   */
  loadExercice(id: string): void {
    this.exerciceService.getExerciceById(id).subscribe({
      next: (exercice: any) => { // Type temporaire any pour éviter les erreurs de compilation
        if (!exercice) {
          this.errorMessage = 'Exercice non trouvé';
          // Rediriger vers la liste des exercices si l'exercice n'existe pas
          setTimeout(() => {
            this.router.navigate(['/exercices']);
          }, 2000);
          return;
        }
        
        this.populateFormWithExercice(exercice);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'exercice', err);
        this.errorMessage = 'Exercice non trouvé - Redirection vers la liste...';
        // Rediriger vers la liste des exercices en cas d'erreur 404
        setTimeout(() => {
          this.router.navigate(['/exercices']);
        }, 2000);
      }
    });
  }

  /**
   * Remplit le formulaire avec les données d'un exercice
   * @param exercice L'exercice à utiliser pour remplir le formulaire
   */
  populateFormWithExercice(exercice: any): void {
    console.log('Remplissage du formulaire avec exercice:', exercice);
    
    // Stocker une copie de l'exercice courant pour référence ultérieure
    this.exerciceService.setCurrentExercice(exercice);
    
    // Définir le mode édition et stocker l'ID
    this.editMode = true;
    this.exerciceId = exercice.id;
    
    // Réinitialiser les tableaux de tags sélectionnés pour éviter les doublons
    this.selectedTravailSpecifiqueTags = [];
    this.selectedNiveauTags = [];
    this.selectedObjectifTag = null;
    this.selectedTempsTags = [];
    this.selectedFormatTags = [];
    
    // Préparation des variables (traitement spécial pour garantir la persistance)
    let variablesPlus = [];
    let variablesMinus = [];
    
    // Vérifier si variablesPlus existe et traiter selon son type
    if (exercice.variablesPlus) {
      if (Array.isArray(exercice.variablesPlus)) {
        variablesPlus = [...exercice.variablesPlus];
      } else if (typeof exercice.variablesPlus === 'string') {
        // Convertir la chaîne en tableau si c'est une chaîne
        variablesPlus = exercice.variablesPlus
          .split('\n')
          .map((v: string) => v.trim())
          .filter((v: string) => v !== '');
      }
    }
    
    // Vérifier si variablesMinus existe et traiter selon son type
    if (exercice.variablesMinus) {
      if (Array.isArray(exercice.variablesMinus)) {
        variablesMinus = [...exercice.variablesMinus];
      } else if (typeof exercice.variablesMinus === 'string') {
        // Convertir la chaîne en tableau si c'est une chaîne
        variablesMinus = exercice.variablesMinus
          .split('\n')
          .map((v: string) => v.trim())
          .filter((v: string) => v !== '');
      }
    }
    
    // Remplir les valeurs du formulaire
    this.exerciceForm.patchValue({
      nom: exercice.nom || '',
      description: exercice.description || '',
      imageUrl: exercice.imageUrl || '',
      schemaUrl: exercice.schemaUrl || '',
      // Passage des variables pré-traitées au ControlValueAccessor
      variables: {
        variablesPlus: variablesPlus,
        variablesMinus: variablesMinus
      }
    });
    
    // Log pour débogage
    console.log('État initial du formulaire après chargement:', {
      nom: this.exerciceForm.get('nom')?.value,
      description: this.exerciceForm.get('description')?.value,
      variables: this.exerciceForm.get('variables')?.value
    });
    
    // Stocker l'ancien texte de variables pour migration ultérieure
    if (exercice.variablesText && (!exercice.variablesPlus && !exercice.variablesMinus)) {
      console.log('Migration des anciennes variables détectée:', exercice.variablesText);
      // On effectuera la migration après l'initialisation de la vue
      setTimeout(() => {
        if (this.variablesComponent) {
          this.variablesComponent.migrateOldVariables(exercice.variablesText);
        }
      });
    }
    
    // Récupérer et définir les tags associés à l'exercice
    if (exercice.exerciceTags) {
      exercice.exerciceTags.forEach((exerciceTag: any) => {
        const tag = exerciceTag.tag;
        if (tag) {
          // Déterminer la catégorie du tag et l'ajouter au tableau approprié
          switch (tag.category) {
            case 'travail_specifique':
              this.selectedTravailSpecifiqueTags.push(tag);
              break;
            case 'objectif':
              this.selectedObjectifTag = tag;
              // Mettre à jour le formulaire immédiatement avec la valeur du tag objectif
              this.exerciceForm.patchValue({
                objectif: tag.label
              });
              console.log('Tag objectif défini:', tag.label);
              break;
            case 'niveau':
              this.selectedNiveauTags.push(tag);
              break;
            case 'temps':
              this.selectedTempsTags.push(tag);
              break;
            case 'format':
              this.selectedFormatTags.push(tag);
              break;
            default:
              console.log(`Tag de catégorie inconnue: ${tag.category}`);
          }
        }
      });
    } else if (exercice.tagIds && exercice.tags) {
      // Si l'exercice vient avec des tags dans un format différent (mode intégré)
      exercice.tags.forEach((tag: Tag) => {
        switch (tag.category) {
          case 'travail_specifique':
            this.selectedTravailSpecifiqueTags.push(tag);
            break;
          case 'objectif':
            this.selectedObjectifTag = tag;
            // Mettre à jour le formulaire immédiatement avec la valeur du tag objectif
            this.exerciceForm.patchValue({
              objectif: tag.label
            });
            console.log('Tag objectif défini:', tag.label);
            break;
          case 'niveau':
            this.selectedNiveauTags.push(tag);
            break;
          case 'temps':
            this.selectedTempsTags.push(tag);
            break;
          case 'format':
            this.selectedFormatTags.push(tag);
            break;
          default:
            console.log(`Tag de catégorie inconnue: ${tag.category}`);
        }
      });
    }

    // Mettre à jour les listes filtrées en fonction des sélections
    this.filteredTravailSpecifiqueTags = this.travailSpecifiqueTags.filter(
      tag => !this.selectedTravailSpecifiqueTags.some(selected => selected.id === tag.id)
    );
    
    this.filteredNiveauTags = this.niveauTags.filter(
      tag => !this.selectedNiveauTags.some(selected => selected.id === tag.id)
    );
    
    this.filteredTempsTags = this.tempsTags.filter(
      tag => !this.selectedTempsTags.some(selected => selected.id === tag.id)
    );
    
    this.filteredFormatTags = this.formatTags.filter(
      tag => !this.selectedFormatTags.some(selected => selected.id === tag.id)
    );
    
    // Afficher l'état initial du formulaire après chargement
    console.log('État initial du formulaire après chargement:', {
      niveauTags: this.selectedNiveauTags.length,
      tempsTags: this.selectedTempsTags.length,
      formatTags: this.selectedFormatTags.length
    });
    
    // Synchroniser les tableaux de tags avec les contrôles du formulaire
    this.exerciceForm.patchValue({
      niveauTags: this.selectedNiveauTags.length > 0 ? this.selectedNiveauTags[0].id : '',
      tempsTags: this.selectedTempsTags.length > 0 ? this.selectedTempsTags[0].id : '',
      formatTags: this.selectedFormatTags.length > 0 ? this.selectedFormatTags[0].id : ''
    });
    
    // Vérifier spécifiquement les tags de format
    if (this.selectedFormatTags.length > 0) {
      console.log('Format tag synchronisé avec le formulaire:', 
        this.selectedFormatTags[0].label, 
        '- Valeur du contrôle:', 
        this.exerciceForm.get('formatTags')?.value);
    }
  }
  
  /**
   * Charge tous les tags depuis l'API et les organise par catégorie
   */
  loadAllTags(): void {
    this.tagService.getTags().subscribe({
      next: (tags) => {
        // Répartir les tags par catégorie
        this.objectifTags = tags.filter(tag => tag.category === 'objectif');
        this.travailSpecifiqueTags = tags.filter(tag => tag.category === 'travail_specifique');
        this.niveauTags = tags.filter(tag => tag.category === 'niveau');
        this.tempsTags = tags.filter(tag => tag.category === 'temps');
        this.formatTags = tags.filter(tag => tag.category === 'format');
        
        // Initialiser les filtres
        this.filteredTravailSpecifiqueTags = [...this.travailSpecifiqueTags];
        this.filteredNiveauTags = [...this.niveauTags];
        this.filteredTempsTags = [...this.tempsTags];
        this.filteredFormatTags = [...this.formatTags];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tags:', err);
        this.errorMessage = 'Impossible de charger les tags. Certaines fonctionnalités peuvent être limitées.';
      }
    });
  }

  /**
   * Initialiser le formulaire
   */
  initForm(): void {
    // Le formulaire est déjà initialisé dans la déclaration de la propriété
    // On pourrait ajouter d'autres initialisations ici si nécessaire
  }
  
  /**
   * Getter pour faciliter l'accès aux champs du formulaire dans le template
   */
  get f() { return this.exerciceForm.controls; }
  
  /**
   * Filtre les tags de travail spécifique selon la saisie utilisateur
   * @param filterValue Texte de recherche
   */
  filterTravailSpecifiqueTags(filterValue: string): void {
    const filter = filterValue.toLowerCase();
    this.filteredTravailSpecifiqueTags = this.travailSpecifiqueTags.filter(tag => 
      tag.label.toLowerCase().includes(filter)
    );
    
    // Afficher la dropdown quand l'utilisateur tape quelque chose
    this.showTravailSpecifiqueDropdown = true;
  }
  
  // Méthode filterVariableTags supprimée car la catégorie Variable n'existe plus
  
  /**
   * Filtre les tags de niveau selon la saisie utilisateur
   * @param filterValue Texte de recherche
   */
  filterNiveauTags(filterValue: string): void {
    this.filteredNiveauTags = this.niveauTags.filter(tag => 
      tag.label.toLowerCase().includes(filterValue.toLowerCase())
    );
  }
  
  /**
   * Filtre les tags de temps selon la saisie utilisateur
   * @param filterValue Texte de recherche
   */
  filterTempsTags(filterValue: string): void {
    this.filteredTempsTags = this.tempsTags.filter(tag => 
      tag.label.toLowerCase().includes(filterValue.toLowerCase())
    );
  }
  
  /**
   * Filtre les tags de format selon la saisie utilisateur
   * @param filterValue Texte de recherche
   */
  filterFormatTags(filterValue: string): void {
    this.filteredFormatTags = this.formatTags.filter(tag => 
      tag.label.toLowerCase().includes(filterValue.toLowerCase())
    );
  }
  
  /**
   * Sélectionne un tag de travail spécifique
   * @param tag Le tag à ajouter
   */
  selectTravailSpecifiqueTag(tag: Tag): void {
    // Ajouter le tag s'il n'est pas déjà présent
    if (!this.selectedTravailSpecifiqueTags.some(t => t.id === tag.id)) {
      this.selectedTravailSpecifiqueTags.push(tag);
    }
    
    // Réinitialiser le champ de recherche
    this.travailSpecifiqueFilter = '';
    this.filteredTravailSpecifiqueTags = [...this.travailSpecifiqueTags];
    
    // Fermer la dropdown après sélection
    this.showTravailSpecifiqueDropdown = false;
  }
  
  /**
   * Supprime un tag de travail spécifique
   * @param index L'index du tag à supprimer
   */
  removeTravailSpecifiqueTag(index: number): void {
    this.selectedTravailSpecifiqueTags.splice(index, 1);
  }
  
  // Méthode selectVariableTag supprimée car la catégorie Variable n'existe plus

  // Méthode removeVariableTag supprimée car la catégorie Variable n'existe plus
  
  /**
   * Vérifie si un tag de niveau est sélectionné
   * @param tag Le tag à vérifier
   */
  isNiveauTagSelected(tag: Tag): boolean {
    return this.selectedNiveauTags.some(t => t.id === tag.id);
  }

  /**
   * Toggle la sélection d'un tag de niveau (préenregistré uniquement)
   * @param tag Le tag à ajouter/retirer
   */
  toggleNiveauTag(tag: Tag): void {
    const index = this.selectedNiveauTags.findIndex(t => t.id === tag.id);
    
    if (index > -1) {
      // Retirer le tag s'il est déjà sélectionné
      this.selectedNiveauTags.splice(index, 1);
      console.log('Niveau tag retiré:', tag.label);
    } else {
      // Ajouter le tag s'il n'est pas sélectionné
      this.selectedNiveauTags.push(tag);
      console.log('Niveau tag ajouté:', tag.label);
    }
    
    // Mettre à jour le contrôle du formulaire
    this.exerciceForm.patchValue({
      niveauTags: this.selectedNiveauTags.map(t => t.id).join(',')
    });
  }

  /**
   * Supprime un tag de niveau
   * @param index L'index du tag à supprimer
   */
  removeNiveauTag(index: number): void {
    this.selectedNiveauTags.splice(index, 1);
    
    // Mettre à jour le contrôle du formulaire pour déclencher la détection de changement
    this.exerciceForm.patchValue({
      niveauTags: this.selectedNiveauTags.map(t => t.id).join(',') 
    });
    
    console.log('Niveau tag supprimé - Total restant:', this.selectedNiveauTags.length);
  }
  
  /**
   * Sélectionne un tag de temps
   * @param tag Le tag à ajouter
   */
  selectTempsTag(tag: Tag): void {
    // Ajouter le tag s'il n'est pas déjà présent
    if (!this.selectedTempsTags.some(t => t.id === tag.id)) {
      this.selectedTempsTags.push(tag);
      
      // Mettre à jour le contrôle du formulaire pour déclencher la détection de changement
      this.exerciceForm.patchValue({
        tempsTags: this.selectedTempsTags.map(t => t.id).join(',') // Format string pour simplicité
      });
      
      console.log('Temps tag ajouté:', tag.label, '- Total:', this.selectedTempsTags.length);
    }
    
    // Réinitialiser le champ de recherche
    this.tempsFilter = '';
    this.filteredTempsTags = [...this.tempsTags];
    
    // Fermer la dropdown après sélection
    this.showTempsDropdown = false;
  }

  /**
   * Supprime un tag de temps
   * @param index L'index du tag à supprimer
   */
  removeTempsTag(index: number): void {
    this.selectedTempsTags.splice(index, 1);
    
    // Mettre à jour le contrôle du formulaire pour déclencher la détection de changement
    this.exerciceForm.patchValue({
      tempsTags: this.selectedTempsTags.map(t => t.id).join(',') 
    });
    
    console.log('Temps tag supprimé - Total restant:', this.selectedTempsTags.length);
  }
  
  /**
   * Sélectionne un tag de format
   * @param tag Le tag à ajouter
   */
  selectFormatTag(tag: Tag): void {
    // Ajouter le tag s'il n'est pas déjà présent
    if (!this.selectedFormatTags.some(t => t.id === tag.id)) {
      this.selectedFormatTags.push(tag);
      
      // Mettre à jour le contrôle du formulaire pour déclencher la détection de changement
      this.exerciceForm.patchValue({
        formatTags: this.selectedFormatTags.map(t => t.id).join(',') // Format string pour simplicité
      });
      
      console.log('Format tag ajouté:', tag.label, '- Total:', this.selectedFormatTags.length);
    }
    
    // Réinitialiser le champ de recherche
    this.formatFilter = '';
    this.filteredFormatTags = [...this.formatTags];
    
    // Fermer la dropdown après sélection
    this.showFormatDropdown = false;
  }

  /**
   * Supprime un tag de format
   * @param index L'index du tag à supprimer
   */
  removeFormatTag(index: number): void {
    this.selectedFormatTags.splice(index, 1);
    
    // Mettre à jour le contrôle du formulaire pour déclencher la détection de changement
    this.exerciceForm.patchValue({
      formatTags: this.selectedFormatTags.map(t => t.id).join(',') 
    });
    
    console.log('Format tag supprimé - Total restant:', this.selectedFormatTags.length);
  }
  
  /**
   * Sélectionne un tag d'objectif
   * @param tag Le tag d'objectif à sélectionner
   */
  selectObjectifTag(tag: Tag): void {
    this.selectedObjectifTag = tag;
    // Mettre à jour le formulaire pour la compatibilité
    this.exerciceForm.patchValue({
      objectif: tag.label
    });
  }
  
  /**
   * Gère la soumission du formulaire (création ou modification)
   */
  onSubmit(): void {
    this.submitted = true;
    
    // Vérifier l'état global du formulaire pour le débogage
    console.log('Soumission du formulaire - état actuel:', {
      formStatus: this.exerciceForm.status,
      formErrors: this.exerciceForm.errors,
      editMode: this.editMode,
      exerciceId: this.exerciceId,
      currentExerciceInService: this.exerciceService.currentExercice ? 'présent' : 'absent'
    });
    
    // Forcer la synchronisation des tags avec le formulaire
    if (this.selectedFormatTags.length > 0) {
      this.exerciceForm.patchValue({
        formatTags: this.selectedFormatTags[0].id
      });
    }
    
    // Arrêter si le formulaire est invalide
    if (this.exerciceForm.invalid) {
      console.error('Formulaire invalide, champs requis manquants');
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    
    // Préparer les données pour l'API
    const formValues = this.exerciceForm.value;
    
    // Collecter les IDs de tags (peut contenir undefined pour objectif)
    const tagIdsWithUndefined = [
      this.selectedObjectifTag?.id,
      ...this.selectedTravailSpecifiqueTags.map(tag => tag.id),
      ...this.selectedNiveauTags.map(tag => tag.id),
      ...this.selectedTempsTags.map(tag => tag.id),
      ...this.selectedFormatTags.map(tag => tag.id)
    ];
    
    // Filtrer les éventuelles valeurs undefined
    const tagIds = tagIdsWithUndefined.filter((id): id is string => id !== undefined);
    
    // Récupérer les variables depuis le sous-formulaire variables
    const variablesFormValue = this.exerciceForm.get('variables')?.value || {};
    
    console.log('Valeurs du formulaire variables avant soumission:', variablesFormValue);
    
    // Extraire et nettoyer les variables du formulaire
    let variablesPlus: string[] = [];
    let variablesMinus: string[] = [];
    
    // 1. D'abord essayer de récupérer les valeurs depuis le formulaire
    if (variablesFormValue) {
      // Traiter variablesPlus
      if (variablesFormValue.variablesPlus) {
        if (Array.isArray(variablesFormValue.variablesPlus)) {
          variablesPlus = variablesFormValue.variablesPlus
            .filter((v: any) => v !== null && v !== undefined && (typeof v === 'string' ? v.trim() !== '' : true))
            .map((v: any) => String(v));
        } else if (typeof variablesFormValue.variablesPlus === 'string') {
          variablesPlus = variablesFormValue.variablesPlus
            .split('\n')
            .map((v: string) => v.trim())
            .filter((v: string) => v !== '');
        }
      }
      
      // Traiter variablesMinus
      if (variablesFormValue.variablesMinus) {
        if (Array.isArray(variablesFormValue.variablesMinus)) {
          variablesMinus = variablesFormValue.variablesMinus
            .filter((v: any) => v !== null && v !== undefined && (typeof v === 'string' ? v.trim() !== '' : true))
            .map((v: any) => String(v));
        } else if (typeof variablesFormValue.variablesMinus === 'string') {
          variablesMinus = variablesFormValue.variablesMinus
            .split('\n')
            .map((v: string) => v.trim())
            .filter((v: string) => v !== '');
        }
      }
    }
    
    // 2. Si nous sommes en mode édition et que le formulaire ne contient pas de variables,
    // mais qu'un exercice existe dans le service, utiliser ses valeurs
    if (this.editMode && this.exerciceService.currentExercice) {
      // Conserver les variables existantes si elles ne sont pas modifiées
      if ((!variablesPlus || variablesPlus.length === 0) && this.exerciceService.currentExercice.variablesPlus) {
        console.log('Préservation des variablesPlus existantes:', this.exerciceService.currentExercice.variablesPlus);
        
        if (Array.isArray(this.exerciceService.currentExercice.variablesPlus)) {
          variablesPlus = [...this.exerciceService.currentExercice.variablesPlus];
        } else if (typeof this.exerciceService.currentExercice.variablesPlus === 'string') {
          variablesPlus = this.exerciceService.currentExercice.variablesPlus
            .split('\n')
            .map((v: string) => v.trim())
            .filter((v: string) => v !== '');
        }
      }
      
      if ((!variablesMinus || variablesMinus.length === 0) && this.exerciceService.currentExercice.variablesMinus) {
        console.log('Préservation des variablesMinus existantes:', this.exerciceService.currentExercice.variablesMinus);
        
        if (Array.isArray(this.exerciceService.currentExercice.variablesMinus)) {
          variablesMinus = [...this.exerciceService.currentExercice.variablesMinus];
        } else if (typeof this.exerciceService.currentExercice.variablesMinus === 'string') {
          variablesMinus = this.exerciceService.currentExercice.variablesMinus
            .split('\n')
            .map((v: string) => v.trim())
            .filter((v: string) => v !== '');
        }
      }
    }

    console.log('Variables après conversion/vérification et préservation:', {
      variablesPlus,
      variablesMinus
    });
      
    // Créer l'objet exercice
    const exerciceData: any = {
      nom: formValues.nom,
      description: formValues.description || '', // S'assurer que description n'est jamais null/undefined
      objectif: this.selectedObjectifTag ? this.selectedObjectifTag.label : '',
      imageUrl: formValues.imageUrl || '',
      schemaUrl: formValues.schemaUrl || '',
      variablesPlus: variablesPlus,
      variablesMinus: variablesMinus,
      tags: [
        ...(this.selectedObjectifTag ? [this.selectedObjectifTag] : []),
        ...this.selectedTravailSpecifiqueTags,
        ...this.selectedNiveauTags,
        ...this.selectedTempsTags,
        ...this.selectedFormatTags
      ]
    };
    
    console.log('Données de l\'exercice à soumettre:', exerciceData);
    
    if (this.editMode && this.exerciceId) {
      // Mode édition
      this.updateExercice(this.exerciceId, exerciceData);
    } else {
      // Mode création
      this.createExercice(exerciceData);
    }
  }
  
  /**
   * Crée un nouvel exercice
   * @param exerciceData Les données de l'exercice à créer
   */
  createExercice(exerciceData: any): void {
    this.exerciceService.ajouterExercice(exerciceData).subscribe({
      next: (createdExercice: Exercice) => {
        console.log('Exercice créé avec succès:', createdExercice);
        this.successMessage = 'Exercice créé avec succès!';
        this.errorMessage = '';
        
        // Réinitialiser le formulaire
        this.resetForm();
        
        // Notifier le composant parent en mode intégré
        this.exerciceCreated.emit(createdExercice);
        
        // En mode autonome, rediriger vers la liste des exercices après un délai
        if (this.exerciceCreated.observers.length === 0) {
          setTimeout(() => {
            this.router.navigate(['/exercices']);
          }, 2000);
        }
      },
      error: (err: any) => {
        console.error('Erreur lors de la création de l\'exercice:', err);
        this.errorMessage = 'Erreur lors de la création de l\'exercice';
        this.successMessage = '';
      }
    });
  }
  
  /**
   * Met à jour un exercice existant
   * @param id L'identifiant de l'exercice à modifier
   * @param exerciceData Les nouvelles données de l'exercice
   */
  updateExercice(id: string, exerciceData: any): void {
    this.exerciceService.updateExercice(id, exerciceData).subscribe({
      next: (updatedExercice: Exercice) => {
        console.log('Exercice mis à jour avec succès:', updatedExercice);
        this.successMessage = 'Exercice mis à jour avec succès!';
        this.errorMessage = '';
        
        // Émettre l'événement de mise à jour
        this.exerciceUpdated.emit(updatedExercice);
        
        // En mode autonome, rediriger vers la liste des exercices après un délai
        if (this.exerciceUpdated.observers.length === 0) {
          setTimeout(() => {
            this.router.navigate(['/exercices']);
          }, 2000);
        }
      },
      error: (err: any) => {
        console.error('Erreur lors de la mise à jour de l\'exercice:', err);
        
        // Si l'exercice n'existe pas (404), rediriger vers la liste
        if (err.status === 404 || err.message?.includes('introuvable')) {
          this.errorMessage = 'Exercice non trouvé - Redirection vers la liste...';
          setTimeout(() => {
            this.router.navigate(['/exercices']);
          }, 2000);
        } else {
          this.errorMessage = 'Erreur lors de la mise à jour de l\'exercice';
        }
        
        this.successMessage = '';
      }
    });
  }

  /**
   * Réinitialise le formulaire et les sélections de tags
   */
  resetForm(): void {
    this.submitted = false;
    this.exerciceForm.reset();
    
    // Réinitialiser les tags sélectionnés
    this.selectedTravailSpecifiqueTags = [];
    this.selectedNiveauTags = [];
    this.selectedObjectifTag = null;
    this.selectedTempsTags = [];
    this.selectedFormatTags = [];
    
    // Réinitialiser les filtres
    this.travailSpecifiqueFilter = '';
    this.niveauFilter = '';
    this.tempsFilter = '';
    this.formatFilter = '';
    
    // Réinitialiser les listes filtrées
    this.filteredTravailSpecifiqueTags = [...this.travailSpecifiqueTags];
    this.filteredNiveauTags = [...this.niveauTags];
    this.filteredTempsTags = [...this.tempsTags];
    this.filteredFormatTags = [...this.formatTags];
    
    // Masquer toutes les dropdowns
    this.showTravailSpecifiqueDropdown = false;
    this.showNiveauDropdown = false;
    this.showTempsDropdown = false;
    this.showFormatDropdown = false;
  }
  

  
  /**
   * Annule l'édition et retourne à la liste des exercices ou notifie le parent
   */
  /**
   * Annule l'édition/création et émet un événement pour le composant parent
   */
  onCancel(): void {
    this.formCancelled.emit();
    
    // Si utilisé en mode autonome, rediriger vers la liste des exercices
    // Vérifier si quelqu'un écoute l'événement formCancelled
    if (this.formCancelled.observers.length === 0) {
      this.router.navigate(['/exercices']);
    }
  }
}