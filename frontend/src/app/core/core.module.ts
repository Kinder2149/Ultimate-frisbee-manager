import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialModule } from './material/material.module';

// Importation des intercepteurs
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ErrorHandlerInterceptor } from './interceptors/error-handler.interceptor';

// Importation des services
import { ApiUrlService } from './services/api-url.service';
import { NotificationService } from './services/notification.service';

// Importation du composant de statistiques de cache
import { CacheStatsComponent } from './components/cache-stats/cache-stats.component';

/**
 * Module Core regroupant tous les services et modules partagés
 * Ce module doit être importé uniquement dans AppModule
 */
@NgModule({
  declarations: [
    CacheStatsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [
    // Exporte MaterialModule pour qu'il soit disponible dans toute l'application
    MaterialModule,
    // Exporte HttpClientModule pour les services
    HttpClientModule,
    // Exporte CommonModule pour les directives
    CommonModule,
    // Exporte le composant de statistiques du cache
    CacheStatsComponent
  ],
  providers: [
    // Configuration des intercepteurs HTTP
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlerInterceptor, multi: true },
    // Services explicitement fournis
    ApiUrlService,
    NotificationService
  ]
})
export class CoreModule { }