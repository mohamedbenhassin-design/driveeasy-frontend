import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { ApiError } from './models';
import { NotificationService } from './notification.service';

/** Compteur de requêtes HTTP en cours (barre de chargement globale). */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private pending = signal(0);
  readonly loading = computed(() => this.pending() > 0);
  start() { this.pending.update((n) => n + 1); }
  stop() { this.pending.update((n) => Math.max(0, n - 1)); }
}

/** Intercepteur : affiche la barre de chargement pendant chaque requête. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};

/** Extrait un message lisible d'une erreur HTTP renvoyée par la gateway / un microservice. */
export function messageErreur(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'API Gateway injoignable (http://localhost:8080). Le backend est-il démarré ?';
    const body = err.error as ApiError | null;
    if (body?.details) return `${body.message} : ${Object.values(body.details).join(', ')}`;
    if (body?.message) return body.message;
    if (err.status === 503) return 'Service momentanément indisponible (503). Réessayez dans quelques secondes.';
    return `Erreur ${err.status}`;
  }
  return 'Erreur inattendue';
}

/**
 * Intercepteur d'erreurs : chaque erreur HTTP est affichée sous forme de notification,
 * puis propagée au composant (qui peut réagir, ex: afficher l'erreur dans un formulaire).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  return next(req).pipe(
    catchError((err: unknown) => {
      notifications.error(messageErreur(err));
      return throwError(() => err);
    }),
  );
};
