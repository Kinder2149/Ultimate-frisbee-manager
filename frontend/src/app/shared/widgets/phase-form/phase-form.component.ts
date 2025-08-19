import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Importation des modules Material nécessaires
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Importation des modèles
import { Phase, PhaseFormData, PhaseType } from '../../../core/models/training.model';

/**
 * Composant réutilisable pour les formulaires de phase
 * Ce widget peut être utilisé dans différentes vues pour ajouter ou modifier des phases
 */
@Component({
  selector: 'app-phase-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './phase-form.component.html',
  styleUrls: ['./phase-form.component.scss']
})
export class PhaseFormComponent implements OnInit {
  /**
   * Phase à éditer (null pour une nouvelle phase)
   */
  @Input() phase: Phase | null = null;
  
  /**
   * ID de l'entraînement parent (obligatoire)
   */
  @Input() entrainementId!: string;
  
  /**
   * Événement émis lors de la soumission du formulaire
   */
  @Output() formSubmit = new EventEmitter<{formData: PhaseFormData, isEditMode: boolean}>();
  
  /**
   * Événement émis lors de l'annulation
   */
  @Output() cancel = new EventEmitter<void>();
  
  /**
   * Formulaire pour la phase
   */
  phaseForm!: FormGroup;
  
  /**
   * Mode édition (true) ou création (false)
   */
  isEditMode: boolean = false;
  
  /**
   * Types de phase disponibles
   */
  phaseTypes = [
    { value: PhaseType.ECHAUFFEMENT, label: 'Échauffement' },
    { value: PhaseType.EXERCICE, label: 'Exercice' },
    { value: PhaseType.SITUATION, label: 'Situation' },
    { value: PhaseType.CONCLUSION, label: 'Conclusion' }
  ];
  
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // Détermine si on est en mode édition
    this.isEditMode = !!this.phase;
    
    // Crée le formulaire
    this.phaseForm = this.createForm();
    
    // Remplit le formulaire avec les données existantes si en mode édition
    if (this.isEditMode && this.phase) {
      this.populateForm(this.phase);
    }
  }
  
  /**
   * Crée le formulaire avec les validateurs appropriés
   */
  private createForm(): FormGroup {
    return this.fb.group({
      type: ['', [Validators.required]],
      titre: [''],
      duree: [null, [Validators.min(1)]],
      notes: [''],
      notesOrales: ['']
    });
  }
  
  /**
   * Remplit le formulaire avec les données de la phase existante
   * @param phase Phase existante à éditer
   */
  private populateForm(phase: Phase): void {
    this.phaseForm.patchValue({
      type: phase.type,
      titre: phase.titre || '',
      duree: phase.duree || null,
      notes: phase.notes || '',
      notesOrales: phase.notesOrales || ''
    });
  }
  
  /**
   * Gère la soumission du formulaire
   */
  onSubmit(): void {
    // Si le formulaire est invalide, ne rien faire
    if (this.phaseForm.invalid) return;
    
    // Récupérer les données du formulaire
    const formData: PhaseFormData = {
      type: this.phaseForm.get('type')?.value,
      titre: this.phaseForm.get('titre')?.value,
      duree: this.phaseForm.get('duree')?.value,
      notes: this.phaseForm.get('notes')?.value,
      notesOrales: this.phaseForm.get('notesOrales')?.value
    };
    
    // Émettre l'événement avec les données et le mode
    this.formSubmit.emit({
      formData,
      isEditMode: this.isEditMode
    });
  }
  
  /**
   * Gère l'annulation du formulaire
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
