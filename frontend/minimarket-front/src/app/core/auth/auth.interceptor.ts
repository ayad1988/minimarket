import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Ajoute le jeton quand l'utilisateur est connecté, uniquement sur les appels qui en ont besoin:
 * admin, compte, commandes (pour les lier au compte) et écritures du catalogue. Le reste reste anonyme.
 */
const needsToken = (url: string, method: string) =>
  url.startsWith('/api/admin') || url.startsWith('/api/orders') || url.startsWith('/api/accounts/me') ||
  (url.startsWith('/api/catalog') && method !== 'GET');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!needsToken(req.url, req.method)) return next(req);
  const auth = inject(AuthService);
  const router = inject(Router);

  return from(auth.token()).pipe(
    switchMap((token) => next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req)
      .pipe(catchError((e: HttpErrorResponse) => {
        // jeton refusé alors qu'on se croyait connecté: session invalide, retour à la connexion
        if (e.status === 401 && token) {
          auth.clear();
          router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        }
        return throwError(() => e);
      }))),
  );
};
