import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
// Définition des routes du module
const routes: Routes = [
  { path: 'management', component: TagManagementPageComponent },
  { path: '', redirectTo: 'management', pathMatch: 'full' }
];

// Module centralisé pour tous les imports Angular Material
import { MaterialModule } from '../../material.module';


// Components
import { TagRecommendationComponent } from './components/tag-recommendation/tag-recommendation.component';
import { TagMappingComponent } from './components/tag-mapping/tag-mapping.component';

// Modules partagés
import { SharedTagsModule } from './shared/shared.module';

// Pages

import { TagManagementPageComponent, TagCreateDialogComponent, TagEditDialogComponent } from './pages/tag-management/tag-management-page.component';

// Services
import { TagRecommendationService } from './services/tag-recommendation.service';


@NgModule({
  declarations: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Ajout pour permettre l'utilisation de composants Angular Material non reconnus
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes), // Utilisation de forChild pour les routes du module

    // Composants standalone
    TagRecommendationComponent,
    TagMappingComponent,
    TagManagementPageComponent,
    TagCreateDialogComponent,
    TagEditDialogComponent,
    
    SharedTagsModule,
    MaterialModule,
  ],
  providers: [
    TagRecommendationService,

  ],
  exports: [
    TagRecommendationComponent,
    TagMappingComponent,
    SharedTagsModule

  ]
})
export class TagsAdvancedModule { }
