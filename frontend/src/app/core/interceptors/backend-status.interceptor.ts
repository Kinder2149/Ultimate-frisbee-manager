import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { BackendStatusService } from '../services/backend-status.service';

@Injectable()
export class BackendStatusInterceptor implements HttpInterceptor {
  constructor(private backendStatus: BackendStatusService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          const status = err.status;
          // Erreurs typiques d'un backend "endormi"/cold start
          if (status === 0 || status === 502 || status === 503 || status === 504) {
            this.backendStatus.notifyNetworkError();
            this.backendStatus.startPolling();
          }
        }
        return throwError(() => err);
      })
    );
  }
}
