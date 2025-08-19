import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Composants partagés
import { TagVisualizationComponent } from './tag-visualization/tag-visualization.component';
import { TagFilterComponent } from './tag-filter/tag-filter.component';
import { TagEditorComponent } from './tag-editor/tag-editor.component';
import { DragDropDirective } from './directives/drag-drop.directive';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    DragDropDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Composants standalone
    TagVisualizationComponent,
    TagFilterComponent,
    TagEditorComponent,
    // Angular Material
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatCardModule
  ],
  exports: [
    TagVisualizationComponent,
    TagFilterComponent,
    TagEditorComponent,
    DragDropDirective,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule
  ]
})
export class SharedTagsModule { }
