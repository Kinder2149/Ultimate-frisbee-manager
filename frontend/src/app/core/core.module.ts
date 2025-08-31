import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Import du module Material
import { MaterialModule } from './material/material.module';

// Import des services
import { ExerciceService } from './services/exercice.service';
import { TagService } from './services/tag.service';
import { CacheService } from './services/cache.service';
import { NotificationService } from './services/notification.service';
import { DataMappingService } from './services/data-mapping.service';
import { ApiUrlService } from './services/api-url.service';
import { TrainingSimpleService } from './services/training-simple.service';
import { EntrainementService } from './services/entrainement.service';
import { EchauffementService } from './services/echauffement.service';
import { SituationMatchService } from './services/situationmatch.service';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from './services/auth.service';

// Import des guards et intercepteurs
import { AuthGuard } from './guards/auth.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { BackendStatusInterceptor } from './interceptors/backend-status.interceptor';
import { StatusBubbleComponent } from './components/status-bubble/status-bubble.component';

/**
 * Module Core regroupant tous les services et modules partagés
 * Ce module doit être importé uniquement dans AppModule
 */
@NgModule({
  declarations: [StatusBubbleComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MaterialModule
  ],
  exports: [StatusBubbleComponent],
  providers: [
    ExerciceService,
    TagService,
    CacheService,
    NotificationService,
    DataMappingService,
    ApiUrlService,
    TrainingSimpleService,
    EntrainementService,
    EchauffementService,
    SituationMatchService,
    DashboardService,
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BackendStatusInterceptor,
      multi: true
    }
  ]
})
export class CoreModule { }